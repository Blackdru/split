const { query, withTransaction } = require('../../db/pool');
const MoneyService = require('../../services/money');
const DebtSimplificationService = require('../../services/debt-simplification');
const { AppError } = require('../../middleware/error-handler');

class ExpensesService {
  /**
   * Create an expense with split and payer calculation
   */
  static async createExpense(userId, groupId, data) {
    const {
      description,
      totalMinor,
      expenseDate = new Date(),
      category = 'general',
      currency = 'INR',
      expenseType = 'shared', // 'shared' or 'family_contribution'
      notes = '',
      payers = [{ userId, amountMinor: totalMinor }], // default single payer
      splitMethod = 'equal',
      splitParticipants = [], // userIds for equal split, or { userId, percentage/shares/shareMinor }
      idempotencyKey = null
    } = data;

    const total = BigInt(totalMinor);
    if (total <= 0n) {
      throw new AppError('Expense total must be greater than zero.', 400);
    }

    // 1. Check idempotency if key provided
    if (idempotencyKey) {
      const existingKey = await query(
        `SELECT response_body FROM idempotency_keys WHERE scope = 'create_expense' AND key = $1`,
        [idempotencyKey]
      );
      if (existingKey.rows.length > 0) {
        return existingKey.rows[0].response_body;
      }
    }

    // 2. Validate membership
    const memberCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
      [groupId, userId]
    );
    if (memberCheck.rows.length === 0) {
      throw new AppError('Forbidden: You are not a member of this group.', 403);
    }

    // 3. Validate payers sum
    MoneyService.validatePayers(total, payers);

    // 4. Calculate shares based on method and expenseType
    let calculatedSplits = [];
    if (expenseType === 'family_contribution') {
      // Family contribution-only records: do not create debt between members
      calculatedSplits = payers.map((p) => ({
        userId: p.userId,
        shareMinor: BigInt(p.amountMinor),
        splitMethod: 'custom'
      }));
    } else {
      switch (splitMethod) {
        case 'equal': {
          const userIds = Array.isArray(splitParticipants) && typeof splitParticipants[0] === 'string'
            ? splitParticipants
            : splitParticipants.map((p) => p.userId);
          const rawSplits = MoneyService.calculateEqualSplit(total, userIds);
          calculatedSplits = rawSplits.map((s) => ({
            userId: s.userId,
            shareMinor: s.shareMinor,
            splitMethod: 'equal'
          }));
          break;
        }
        case 'percentage': {
          const rawSplits = MoneyService.calculatePercentageSplit(total, splitParticipants);
          calculatedSplits = rawSplits.map((s) => ({
            userId: s.userId,
            shareMinor: s.shareMinor,
            splitMethod: 'percentage'
          }));
          break;
        }
        case 'shares': {
          const rawSplits = MoneyService.calculateSharesSplit(total, splitParticipants);
          calculatedSplits = rawSplits.map((s) => ({
            userId: s.userId,
            shareMinor: s.shareMinor,
            splitMethod: 'shares'
          }));
          break;
        }
        case 'exact': {
          MoneyService.validateExactSplit(total, splitParticipants);
          calculatedSplits = splitParticipants.map((s) => ({
            userId: s.userId,
            shareMinor: BigInt(s.shareMinor),
            splitMethod: 'exact'
          }));
          break;
        }
        default:
          throw new AppError(`Unsupported split method: ${splitMethod}`, 400);
      }
    }

    // 5. Execute atomic database transaction
    const savedExpense = await withTransaction(async (client) => {
      // Insert expense
      const expRes = await client.query(
        `INSERT INTO expenses (group_id, created_by, description, category, expense_date, currency, total_minor, expense_type, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, group_id, created_by, description, category, expense_date, currency, total_minor, expense_type, notes, status, created_at`,
        [groupId, userId, description, category, expenseDate, currency, total.toString(), expenseType, notes]
      );
      const expense = expRes.rows[0];

      // Insert payers
      for (const p of payers) {
        await client.query(
          `INSERT INTO expense_payers (expense_id, user_id, amount_minor)
           VALUES ($1, $2, $3)`,
          [expense.id, p.userId, BigInt(p.amountMinor).toString()]
        );
      }

      // Insert splits
      for (const s of calculatedSplits) {
        await client.query(
          `INSERT INTO expense_splits (expense_id, user_id, share_minor, split_method)
           VALUES ($1, $2, $3, $4)`,
          [expense.id, s.userId, s.shareMinor.toString(), s.splitMethod]
        );
      }

      // Record audit event
      await client.query(
        `INSERT INTO expense_audit_events (group_id, actor_user_id, entity_type, entity_id, action, metadata)
         VALUES ($1, $2, 'expense', $3, 'create', $4)`,
        [groupId, userId, expense.id, JSON.stringify({ description, totalMinor: total.toString(), splitMethod })]
      );

      // Return composite result
      return {
        ...expense,
        payers,
        splits: calculatedSplits.map((s) => ({
          userId: s.userId,
          shareMinor: s.shareMinor.toString(),
          splitMethod: s.splitMethod
        }))
      };
    });

    // 6. Record idempotency if applicable
    if (idempotencyKey) {
      await query(
        `INSERT INTO idempotency_keys (scope, key, user_id, request_hash, response_code, response_body)
         VALUES ('create_expense', $1, $2, 'hash', 201, $3)
         ON CONFLICT (scope, key) DO NOTHING`,
        [idempotencyKey, userId, JSON.stringify(savedExpense)]
      );
    }

    return savedExpense;
  }

  /**
   * List expenses for a group
   */
  static async getGroupExpenses(groupId, userId) {
    // Check membership
    const memberCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
      [groupId, userId]
    );
    if (memberCheck.rows.length === 0) {
      throw new AppError('Forbidden: Not a group member.', 403);
    }

    const expRes = await query(
      `SELECT e.*, u.display_name as creator_name
       FROM expenses e
       JOIN users u ON u.id = e.created_by
       WHERE e.group_id = $1 AND e.deleted_at IS NULL
       ORDER BY e.expense_date DESC, e.created_at DESC`,
      [groupId]
    );

    const expenseIds = expRes.rows.map((e) => e.id);
    if (expenseIds.length === 0) return [];

    // Fetch payers & splits
    const payersRes = await query(
      `SELECT ep.*, u.display_name FROM expense_payers ep
       JOIN users u ON u.id = ep.user_id
       WHERE ep.expense_id = ANY($1::uuid[])`,
      [expenseIds]
    );

    const splitsRes = await query(
      `SELECT es.*, u.display_name FROM expense_splits es
       JOIN users u ON u.id = es.user_id
       WHERE es.expense_id = ANY($1::uuid[])`,
      [expenseIds]
    );

    const payersByExpense = {};
    for (const p of payersRes.rows) {
      if (!payersByExpense[p.expense_id]) payersByExpense[p.expense_id] = [];
      payersByExpense[p.expense_id].push(p);
    }

    const splitsByExpense = {};
    for (const s of splitsRes.rows) {
      if (!splitsByExpense[s.expense_id]) splitsByExpense[s.expense_id] = [];
      splitsByExpense[s.expense_id].push(s);
    }

    return expRes.rows.map((e) => ({
      ...e,
      payers: payersByExpense[e.id] || [],
      splits: splitsByExpense[e.id] || []
    }));
  }

  /**
   * Calculate group net balances and suggested simplified settlements
   */
  static async getGroupBalances(groupId, userId) {
    // Check membership
    const memberCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
      [groupId, userId]
    );
    if (memberCheck.rows.length === 0) {
      throw new AppError('Forbidden: Not a group member.', 403);
    }

    // Get all active members
    const membersRes = await query(
      `SELECT u.id, u.display_name, u.email_normalized, u.phone_e164, u.avatar_url
       FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = $1 AND gm.status = 'active'`,
      [groupId]
    );

    const netBalances = {};
    const memberMap = {};
    for (const m of membersRes.rows) {
      netBalances[m.id] = 0n;
      memberMap[m.id] = m;
    }

    // Sum paid per user for active shared expenses
    const paidRes = await query(
      `SELECT ep.user_id, COALESCE(SUM(ep.amount_minor), 0) AS total_paid
       FROM expense_payers ep
       JOIN expenses e ON e.id = ep.expense_id
       WHERE e.group_id = $1 AND e.status = 'active' AND e.expense_type = 'shared' AND e.deleted_at IS NULL
       GROUP BY ep.user_id`,
      [groupId]
    );
    for (const row of paidRes.rows) {
      if (netBalances[row.user_id] !== undefined) {
        netBalances[row.user_id] += BigInt(row.total_paid);
      }
    }

    // Subtract shares per user for active shared expenses
    const sharesRes = await query(
      `SELECT es.user_id, COALESCE(SUM(es.share_minor), 0) AS total_shares
       FROM expense_splits es
       JOIN expenses e ON e.id = es.expense_id
       WHERE e.group_id = $1 AND e.status = 'active' AND e.expense_type = 'shared' AND e.deleted_at IS NULL
       GROUP BY es.user_id`,
      [groupId]
    );
    for (const row of sharesRes.rows) {
      if (netBalances[row.user_id] !== undefined) {
        netBalances[row.user_id] -= BigInt(row.total_shares);
      }
    }

    // Factor in acknowledged or marked_sent settlements
    const settlementsRes = await query(
      `SELECT payer_user_id, payee_user_id, amount_minor, status
       FROM settlements
       WHERE group_id = $1 AND status IN ('marked_sent', 'acknowledged')`,
      [groupId]
    );

    for (const s of settlementsRes.rows) {
      const amt = BigInt(s.amount_minor);
      // Payer paid settlement -> their debt is reduced (balance increases towards 0)
      if (netBalances[s.payer_user_id] !== undefined) {
        netBalances[s.payer_user_id] += amt;
      }
      // Payee received settlement -> their credit is reduced (balance decreases towards 0)
      if (netBalances[s.payee_user_id] !== undefined) {
        netBalances[s.payee_user_id] -= amt;
      }
    }

    // Format individual member balances
    const memberBalances = Object.entries(netBalances).map(([memberId, bal]) => ({
      user: memberMap[memberId],
      netMinor: bal.toString(),
      netFormatted: MoneyService.formatINR(bal),
      status: bal > 0n ? 'owed' : (bal < 0n ? 'owes' : 'settled')
    }));

    // Generate simplified settlement plan
    const simplified = DebtSimplificationService.simplifyDebts(netBalances);
    const suggestedSettlements = simplified.map((s) => ({
      fromUser: memberMap[s.from],
      toUser: memberMap[s.to],
      amountMinor: s.amountMinor.toString(),
      amountFormatted: MoneyService.formatINR(s.amountMinor)
    }));

    return {
      memberBalances,
      suggestedSettlements
    };
  }
}

module.exports = ExpensesService;
