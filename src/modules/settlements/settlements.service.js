const { query, withTransaction } = require('../../db/pool');
const MoneyService = require('../../services/money');
const { AppError } = require('../../middleware/error-handler');

class SettlementsService {
  /**
   * Generate standard NPCI UPI payment deep link URL
   */
  static generateUpiUri({ payeeVpa, payeeName, amountMinor, note = 'Hisaab settlement' }) {
    if (!payeeVpa) return null;
    const amountRupees = MoneyService.paiseToRupees(amountMinor);
    const params = new URLSearchParams({
      pa: payeeVpa.trim(),
      pn: payeeName.trim(),
      am: amountRupees,
      cu: 'INR',
      tn: note.slice(0, 50)
    });
    return `upi://pay?${params.toString()}`;
  }

  /**
   * Record a settlement payment initiation or manual record
   */
  static async recordSettlement(userId, groupId, data) {
    const {
      payerUserId = userId,
      payeeUserId,
      amountMinor,
      method = 'upi',
      status = 'marked_sent', // 'initiated', 'marked_sent', or 'acknowledged'
      payeeVpa = null,
      notes = '',
      upiTxnRef = null,
      idempotencyKey = null
    } = data;

    const actualPayerId = payerUserId || userId;
    const total = BigInt(amountMinor);
    if (total <= 0n) {
      throw new AppError('Settlement amount must be greater than zero.', 400);
    }

    if (actualPayerId === payeeUserId) {
      throw new AppError('Payer and payee cannot be the same user.', 400);
    }

    // 1. Check idempotency
    if (idempotencyKey) {
      const existing = await query(
        `SELECT response_body FROM idempotency_keys WHERE scope = 'settlement' AND key = $1`,
        [idempotencyKey]
      );
      if (existing.rows.length > 0) {
        return existing.rows[0].response_body;
      }
    }

    // 2. Validate caller and both parties are members of the group
    const callerCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
      [groupId, userId]
    );
    if (callerCheck.rows.length === 0) {
      throw new AppError('Forbidden: You are not a member of this group.', 403);
    }

    const membersRes = await query(
      `SELECT user_id, role FROM group_members
       WHERE group_id = $1 AND user_id IN ($2, $3) AND status = 'active'`,
      [groupId, actualPayerId, payeeUserId]
    );

    if (membersRes.rows.length < 2) {
      throw new AppError('Both parties must be active members of the group.', 403);
    }

    // 3. Get payee name for UPI intent
    const payeeRes = await query(`SELECT display_name FROM users WHERE id = $1`, [payeeUserId]);
    const payeeName = payeeRes.rows[0]?.display_name || 'Member';

    // 4. Generate UPI intent URL
    const upiUri = this.generateUpiUri({
      payeeVpa,
      payeeName,
      amountMinor: total,
      note: `Hisaab settlement: ${notes || 'Group repayment'}`
    });

    // 5. Insert settlement
    const settlement = await withTransaction(async (client) => {
      const res = await client.query(
        `INSERT INTO settlements (group_id, payer_user_id, payee_user_id, amount_minor, status, method, upi_txn_ref, idempotency_key, created_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [groupId, actualPayerId, payeeUserId, total.toString(), status, method, upiTxnRef, idempotencyKey, userId, notes]
      );

      // Audit event
      await client.query(
        `INSERT INTO expense_audit_events (group_id, actor_user_id, entity_type, entity_id, action, metadata)
         VALUES ($1, $2, 'settlement', $3, 'create', $4)`,
        [groupId, userId, res.rows[0].id, JSON.stringify({ amountMinor: total.toString(), method, status, payerUserId: actualPayerId, payeeUserId })]
      );

      return res.rows[0];
    });

    const responseData = {
      ...settlement,
      amountFormatted: MoneyService.formatINR(total),
      upiUri
    };

    if (idempotencyKey) {
      await query(
        `INSERT INTO idempotency_keys (scope, key, user_id, request_hash, response_code, response_body)
         VALUES ('settlement', $1, $2, 'hash', 201, $3)
         ON CONFLICT (scope, key) DO NOTHING`,
        [idempotencyKey, userId, JSON.stringify(responseData)]
      );
    }

    return responseData;
  }

  /**
   * Payee confirms and acknowledges receipt of settlement funds
   */
  static async acknowledgeSettlement(settlementId, userId) {
    const setRes = await query(`SELECT * FROM settlements WHERE id = $1`, [settlementId]);
    if (setRes.rows.length === 0) {
      throw new AppError('Settlement not found.', 404);
    }

    const settlement = setRes.rows[0];

    // Only the payee can confirm receipt
    if (settlement.payee_user_id !== userId) {
      throw new AppError('Only the recipient (payee) can acknowledge receipt of payment.', 403);
    }

    if (settlement.status === 'acknowledged') {
      return settlement;
    }

    const updated = await withTransaction(async (client) => {
      const res = await client.query(
        `UPDATE settlements
         SET status = 'acknowledged', acknowledged_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [settlementId]
      );

      // Audit event
      await client.query(
        `INSERT INTO expense_audit_events (group_id, actor_user_id, entity_type, entity_id, action, metadata)
         VALUES ($1, $2, 'settlement', $3, 'acknowledge', $4)`,
        [settlement.group_id, userId, settlementId, JSON.stringify({ status: 'acknowledged' })]
      );

      return res.rows[0];
    });

    return updated;
  }

  /**
   * List settlements for a group
   */
  static async getGroupSettlements(groupId, userId) {
    // Check membership
    const memberCheck = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
      [groupId, userId]
    );
    if (memberCheck.rows.length === 0) {
      throw new AppError('Forbidden: Not a group member.', 403);
    }

    const res = await query(
      `SELECT s.*,
              p.display_name AS payer_name,
              r.display_name AS payee_name
       FROM settlements s
       JOIN users p ON p.id = s.payer_user_id
       JOIN users r ON r.id = s.payee_user_id
       WHERE s.group_id = $1
       ORDER BY s.created_at DESC`,
      [groupId]
    );

    return res.rows.map((row) => ({
      ...row,
      amountFormatted: MoneyService.formatINR(BigInt(row.amount_minor))
    }));
  }
}

module.exports = SettlementsService;
