const crypto = require('crypto');
const { query, withTransaction } = require('../../db/pool');
const { AppError } = require('../../middleware/error-handler');

class GroupsService {
  /**
   * Create a new group with a chosen Hisaab mode
   */
  static async createGroup(userId, { name, mode, baseCurrency = 'INR', description = '' }) {
    return withTransaction(async (client) => {
      // 1. Insert group
      const groupRes = await client.query(
        `INSERT INTO groups (name, mode, base_currency, description, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, mode, base_currency, description, created_by, status, created_at`,
        [name, mode, baseCurrency, description, userId]
      );
      const group = groupRes.rows[0];

      // 2. Add creator as owner member
      await client.query(
        `INSERT INTO group_members (group_id, user_id, role, status)
         VALUES ($1, $2, 'owner', 'active')`,
        [group.id, userId]
      );

      return group;
    });
  }

  /**
   * List all groups the user is a member of
   */
  static async getUserGroups(userId) {
    const res = await query(
      `SELECT g.id, g.name, g.mode, g.base_currency, g.description, g.status,
              COALESCE(MAX(gm.role), CASE WHEN g.created_by = $1 THEN 'owner' ELSE 'member' END) AS role,
              g.created_at,
              COUNT(DISTINCT m.user_id)::int AS member_count
       FROM groups g
       LEFT JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = $1 AND gm.status = 'active'
       LEFT JOIN group_members m ON m.group_id = g.id AND m.status = 'active'
       WHERE g.status != 'closed'
         AND (gm.user_id = $1 OR g.created_by = $1)
       GROUP BY g.id, g.name, g.mode, g.base_currency, g.description, g.status, g.created_by, g.created_at, g.updated_at
       ORDER BY g.updated_at DESC`,
      [userId]
    );
    return res.rows;
  }

  /**
   * Get single group details with members
   */
  static async getGroupDetails(groupId, userId) {
    // Check user membership
    const membership = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
      [groupId, userId]
    );

    if (membership.rows.length === 0) {
      throw new AppError('Forbidden: You are not a member of this group.', 403);
    }

    const groupRes = await query(`SELECT * FROM groups WHERE id = $1`, [groupId]);
    if (groupRes.rows.length === 0) {
      throw new AppError('Group not found.', 404);
    }

    const membersRes = await query(
      `SELECT u.id, u.display_name, u.email_normalized, u.phone_e164, u.avatar_url, COALESCE(u.is_manual, false) AS is_manual, gm.role, gm.joined_at
       FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = $1 AND gm.status = 'active'
       ORDER BY gm.joined_at ASC`,
      [groupId]
    );

    return {
      group: groupRes.rows[0],
      userRole: membership.rows[0].role,
      members: membersRes.rows
    };
  }

  /**
   * Add a member manually to the group (registers a non-app offline profile or links existing registered user)
   */
  static async addMember(groupId, callerUserId, { displayName, phone = null, email = null }) {
    // 1. Check caller membership
    const callerMem = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
      [groupId, callerUserId]
    );

    if (callerMem.rows.length === 0) {
      throw new AppError('Forbidden: You are not a member of this group.', 403);
    }

    const cleanName = displayName ? displayName.trim() : '';
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null;
    const cleanPhone = phone && phone.trim() ? phone.trim() : null;

    if (!cleanName) {
      throw new AppError('Member name is required.', 400);
    }

    return withTransaction(async (client) => {
      let targetUser = null;

      // 2. Check if a user with this email or phone already exists
      if (cleanEmail) {
        const existingEmail = await client.query(
          `SELECT id, display_name, email_normalized, phone_e164, avatar_url, COALESCE(is_manual, false) AS is_manual
           FROM users WHERE email_normalized = $1`,
          [cleanEmail]
        );
        if (existingEmail.rows.length > 0) {
          targetUser = existingEmail.rows[0];
        }
      }

      if (!targetUser && cleanPhone) {
        const existingPhone = await client.query(
          `SELECT id, display_name, email_normalized, phone_e164, avatar_url, COALESCE(is_manual, false) AS is_manual
           FROM users WHERE phone_e164 = $1`,
          [cleanPhone]
        );
        if (existingPhone.rows.length > 0) {
          targetUser = existingPhone.rows[0];
        }
      }

      // 3. If user exists, add them to group (or reactivate)
      if (targetUser) {
        const existingMem = await client.query(
          `SELECT role, status FROM group_members WHERE group_id = $1 AND user_id = $2`,
          [groupId, targetUser.id]
        );

        if (existingMem.rows.length > 0) {
          if (existingMem.rows[0].status === 'active') {
            throw new AppError(`"${targetUser.display_name}" is already a member of this group.`, 409);
          }
          await client.query(
            `UPDATE group_members SET status = 'active', joined_at = CURRENT_TIMESTAMP
             WHERE group_id = $1 AND user_id = $2`,
            [groupId, targetUser.id]
          );
        } else {
          await client.query(
            `INSERT INTO group_members (group_id, user_id, role, status)
             VALUES ($1, $2, 'member', 'active')`,
            [groupId, targetUser.id]
          );
        }

        return {
          id: targetUser.id,
          displayName: targetUser.display_name,
          email: targetUser.email_normalized,
          phone: targetUser.phone_e164,
          isManual: targetUser.is_manual,
          role: 'member',
          message: `Added ${targetUser.display_name} to the group.`
        };
      }

      // 4. Create new manual/offline user profile (does not need app or password)
      const placeholderHash = crypto.randomBytes(32).toString('hex');
      const insertUserRes = await client.query(
        `INSERT INTO users (display_name, email_normalized, phone_e164, password_hash, is_manual, created_by_user_id)
         VALUES ($1, $2, $3, $4, true, $5)
         RETURNING id, display_name, email_normalized, phone_e164, avatar_url, is_manual, created_at`,
        [cleanName, cleanEmail, cleanPhone, placeholderHash, callerUserId]
      );
      const newUser = insertUserRes.rows[0];

      await client.query(
        `INSERT INTO group_members (group_id, user_id, role, status)
         VALUES ($1, $2, 'member', 'active')`,
        [groupId, newUser.id]
      );

      return {
        id: newUser.id,
        displayName: newUser.display_name,
        email: newUser.email_normalized,
        phone: newUser.phone_e164,
        isManual: true,
        role: 'member',
        message: `Added ${newUser.display_name} as a manual member.`
      };
    });
  }

  /**
   * Remove a member from group (or mark left if historical debts exist)
   */
  static async removeMember(groupId, callerUserId, memberId) {
    return withTransaction(async (client) => {
      const callerMem = await client.query(
        `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
        [groupId, callerUserId]
      );
      if (callerMem.rows.length === 0) {
        throw new AppError('Forbidden: You are not a member of this group.', 403);
      }

      const targetMem = await client.query(
        `SELECT gm.role, gm.status, u.display_name, COALESCE(u.is_manual, false) AS is_manual
         FROM group_members gm
         JOIN users u ON u.id = gm.user_id
         WHERE gm.group_id = $1 AND gm.user_id = $2`,
        [groupId, memberId]
      );
      if (targetMem.rows.length === 0) {
        throw new AppError('Member not found in this group.', 404);
      }

      const isOwnerOrAdmin = ['owner', 'admin'].includes(callerMem.rows[0].role);
      const isSelf = callerUserId === memberId;
      const isManual = targetMem.rows[0].is_manual;

      if (!isOwnerOrAdmin && !isSelf && !isManual) {
        throw new AppError('Only group owners or admins can remove other members.', 403);
      }

      // Check if target is in expenses
      const hasExpenses = await client.query(
        `SELECT 1 FROM expense_splits es
         JOIN expenses e ON e.id = es.expense_id
         WHERE e.group_id = $1 AND es.user_id = $2 AND e.status = 'active'
         UNION
         SELECT 1 FROM expense_payers ep
         JOIN expenses e ON e.id = ep.expense_id
         WHERE e.group_id = $1 AND ep.user_id = $2 AND e.status = 'active'
         LIMIT 1`,
        [groupId, memberId]
      );

      if (hasExpenses.rows.length > 0) {
        await client.query(
          `UPDATE group_members SET status = 'left', left_at = CURRENT_TIMESTAMP
           WHERE group_id = $1 AND user_id = $2`,
          [groupId, memberId]
        );
        return { message: `${targetMem.rows[0].display_name} has expense history and was marked as left.` };
      }

      await client.query(
        `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [groupId, memberId]
      );

      return { message: `${targetMem.rows[0].display_name} was removed from the group.` };
    });
  }

  /**
   * Create shareable group invitation token
   */
  static async createInvitation(groupId, userId, maxUses = 10, expiryDays = 7) {
    // Check permission (owner or admin)
    const memRes = await query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = 'active'`,
      [groupId, userId]
    );

    if (memRes.rows.length === 0 || !['owner', 'admin'].includes(memRes.rows[0].role)) {
      throw new AppError('Forbidden: Only group owners or admins can generate invite links.', 403);
    }

    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    await query(
      `INSERT INTO group_invitations (group_id, created_by, token_hash, max_uses, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [groupId, userId, tokenHash, maxUses, expiresAt]
    );

    const baseUrl = process.env.APP_BASE_URL || 'https://split.udhaar.store';
    return {
      invitationToken: rawToken,
      inviteUrl: `${baseUrl}/join/${rawToken}`,
      expiresAt
    };
  }

  /**
   * Accept an invitation and join the group
   */
  static async acceptInvitation(userId, rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    return withTransaction(async (client) => {
      const invRes = await client.query(
        `SELECT id, group_id, max_uses, uses_count, expires_at, revoked_at
         FROM group_invitations
         WHERE token_hash = $1`,
        [tokenHash]
      );

      if (invRes.rows.length === 0) {
        throw new AppError('Invalid invitation link.', 404);
      }

      const invite = invRes.rows[0];

      if (invite.revoked_at !== null) {
        throw new AppError('This invitation has been revoked.', 410);
      }
      if (new Date(invite.expires_at) < new Date()) {
        throw new AppError('This invitation has expired.', 410);
      }
      if (invite.uses_count >= invite.max_uses) {
        throw new AppError('This invitation has reached its maximum uses.', 410);
      }

      // Check if user is already a member
      const existingMember = await client.query(
        `SELECT role, status FROM group_members WHERE group_id = $1 AND user_id = $2`,
        [invite.group_id, userId]
      );

      if (existingMember.rows.length > 0) {
        if (existingMember.rows[0].status === 'active') {
          return { groupId: invite.group_id, message: 'You are already a member of this group.' };
        }
        // Reactivate
        await client.query(
          `UPDATE group_members SET status = 'active', joined_at = CURRENT_TIMESTAMP WHERE group_id = $1 AND user_id = $2`,
          [invite.group_id, userId]
        );
      } else {
        await client.query(
          `INSERT INTO group_members (group_id, user_id, role, status) VALUES ($1, $2, 'member', 'active')`,
          [invite.group_id, userId]
        );
      }

      // Increment invitation uses
      await client.query(
        `UPDATE group_invitations SET uses_count = uses_count + 1 WHERE id = $1`,
        [invite.id]
      );

      return { groupId: invite.group_id, message: 'Successfully joined group.' };
    });
  }

  /**
   * Public preview of an invitation token for landing page and pre-join checks
   */
  static async getInvitationPreview(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
      return { valid: false, error: 'Invalid or missing invitation token.' };
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const invRes = await query(
      `SELECT gi.id, gi.group_id, gi.max_uses, gi.uses_count, gi.expires_at, gi.revoked_at,
              g.name AS group_name, g.mode AS group_mode, g.description AS group_description,
              u.display_name AS inviter_name, u.avatar_url AS inviter_avatar,
              (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'active')::int AS member_count
       FROM group_invitations gi
       JOIN groups g ON g.id = gi.group_id
       JOIN users u ON u.id = gi.created_by
       WHERE gi.token_hash = $1`,
      [tokenHash]
    );

    if (invRes.rows.length === 0) {
      return { valid: false, error: 'This invitation link does not exist or has expired.' };
    }

    const invite = invRes.rows[0];

    if (invite.revoked_at !== null) {
      return { valid: false, error: 'This invitation link has been revoked by the admin.' };
    }
    if (new Date(invite.expires_at) < new Date()) {
      return { valid: false, error: 'This invitation link has expired.' };
    }
    if (invite.uses_count >= invite.max_uses) {
      return { valid: false, error: 'This invitation link has reached its maximum member limit.' };
    }

    return {
      valid: true,
      token: rawToken,
      group: {
        id: invite.group_id,
        name: invite.group_name,
        mode: invite.group_mode,
        description: invite.group_description || '',
        memberCount: invite.member_count
      },
      inviter: {
        name: invite.inviter_name,
        avatarUrl: invite.inviter_avatar
      },
      expiresAt: invite.expires_at
    };
  }

  /**
   * Get user home screen metrics:
   * - todaySpent: user share of expenses today
   * - monthSpent: user share of expenses this month
   * - youGet: total net receivables from all groups
   * - youPay: total net payables to all groups
   */
  static async getUserDashboardSummary(userId) {
    const MoneyService = require('../../services/money');

    // 1. Spending today and this month
    const spendingRes = await query(
      `SELECT 
         COALESCE(SUM(CASE WHEN e.expense_date = CURRENT_DATE THEN es.share_minor ELSE 0 END), 0)::bigint AS today_spent_minor,
         COALESCE(SUM(CASE WHEN e.expense_date >= date_trunc('month', CURRENT_DATE) THEN es.share_minor ELSE 0 END), 0)::bigint AS month_spent_minor
       FROM expense_splits es
       JOIN expenses e ON e.id = es.expense_id
       WHERE es.user_id = $1 AND e.status = 'active' AND e.deleted_at IS NULL`,
      [userId]
    );

    // 2. You get and You pay across all active groups
    const balancesRes = await query(
      `WITH user_groups AS (
         SELECT gm.group_id
         FROM group_members gm
         JOIN groups g ON g.id = gm.group_id
         WHERE gm.user_id = $1 AND gm.status = 'active' AND g.status = 'active'
       ),
       group_paid AS (
         SELECT e.group_id, COALESCE(SUM(ep.amount_minor), 0) AS total_paid
         FROM expense_payers ep
         JOIN expenses e ON e.id = ep.expense_id
         WHERE ep.user_id = $1 
           AND e.status = 'active' 
           AND e.expense_type = 'shared' 
           AND e.deleted_at IS NULL
           AND e.group_id IN (SELECT group_id FROM user_groups)
         GROUP BY e.group_id
       ),
       group_shares AS (
         SELECT e.group_id, COALESCE(SUM(es.share_minor), 0) AS total_shares
         FROM expense_splits es
         JOIN expenses e ON e.id = es.expense_id
         WHERE es.user_id = $1 
           AND e.status = 'active' 
           AND e.expense_type = 'shared' 
           AND e.deleted_at IS NULL
           AND e.group_id IN (SELECT group_id FROM user_groups)
         GROUP BY e.group_id
       ),
       group_settlements_paid AS (
         SELECT group_id, COALESCE(SUM(amount_minor), 0) AS total_settled_paid
         FROM settlements
         WHERE payer_user_id = $1 
           AND status IN ('marked_sent', 'acknowledged')
           AND group_id IN (SELECT group_id FROM user_groups)
         GROUP BY group_id
       ),
       group_settlements_received AS (
         SELECT group_id, COALESCE(SUM(amount_minor), 0) AS total_settled_received
         FROM settlements
         WHERE payee_user_id = $1 
           AND status IN ('marked_sent', 'acknowledged')
           AND group_id IN (SELECT group_id FROM user_groups)
         GROUP BY group_id
       ),
       group_net AS (
         SELECT 
           ug.group_id,
           (
             COALESCE(gp.total_paid, 0) 
             - COALESCE(gs.total_shares, 0)
             + COALESCE(gsp.total_settled_paid, 0)
             - COALESCE(gsr.total_settled_received, 0)
           ) AS net_minor
         FROM user_groups ug
         LEFT JOIN group_paid gp ON gp.group_id = ug.group_id
         LEFT JOIN group_shares gs ON gs.group_id = ug.group_id
         LEFT JOIN group_settlements_paid gsp ON gsp.group_id = ug.group_id
         LEFT JOIN group_settlements_received gsr ON gsr.group_id = ug.group_id
       )
       SELECT 
         COALESCE(SUM(CASE WHEN net_minor > 0 THEN net_minor ELSE 0 END), 0)::bigint AS you_get_minor,
         COALESCE(SUM(CASE WHEN net_minor < 0 THEN -net_minor ELSE 0 END), 0)::bigint AS you_pay_minor
       FROM group_net`,
      [userId]
    );

    const spending = spendingRes.rows[0];
    const balances = balancesRes.rows[0];

    const todaySpentMinor = BigInt(spending.today_spent_minor);
    const monthSpentMinor = BigInt(spending.month_spent_minor);
    const youGetMinor = BigInt(balances.you_get_minor);
    const youPayMinor = BigInt(balances.you_pay_minor);
    const netMinor = youGetMinor - youPayMinor;

    return {
      todaySpent: {
        minor: todaySpentMinor.toString(),
        formatted: MoneyService.formatINR(todaySpentMinor)
      },
      monthSpent: {
        minor: monthSpentMinor.toString(),
        formatted: MoneyService.formatINR(monthSpentMinor)
      },
      youGet: {
        minor: youGetMinor.toString(),
        formatted: MoneyService.formatINR(youGetMinor)
      },
      youPay: {
        minor: youPayMinor.toString(),
        formatted: MoneyService.formatINR(youPayMinor)
      },
      netBalance: {
        minor: netMinor.toString(),
        formatted: MoneyService.formatINR(netMinor)
      }
    };
  }

  /**
   * Get all user transactions (expenses and settlements, both spent and received)
   */
  static async getUserTransactions(userId, options = {}) {
    const MoneyService = require('../../services/money');
    const limit = Math.min(parseInt(options.limit || '100', 10), 200);

    const res = await query(
      `WITH user_expenses AS (
         SELECT 
           e.id,
           'expense'::text AS txn_type,
           e.description AS title,
           g.id AS group_id,
           g.name AS group_name,
           e.category,
           e.expense_date,
           e.created_at,
           e.total_minor,
           COALESCE(ep.amount_minor, 0) AS user_paid_minor,
           COALESCE(es.share_minor, 0) AS user_share_minor,
           payer_user.display_name AS payer_name,
           CASE 
             WHEN COALESCE(ep.amount_minor, 0) > 0 THEN 'spent'
             ELSE 'received'
           END AS direction,
           'completed'::text AS status
         FROM expenses e
         JOIN groups g ON g.id = e.group_id
         LEFT JOIN expense_payers ep ON ep.expense_id = e.id AND ep.user_id = $1
         LEFT JOIN expense_splits es ON es.expense_id = e.id AND es.user_id = $1
         LEFT JOIN LATERAL (
           SELECT u.display_name 
           FROM expense_payers ep2 
           JOIN users u ON u.id = ep2.user_id 
           WHERE ep2.expense_id = e.id 
           LIMIT 1
         ) payer_user ON true
         WHERE e.status = 'active' 
           AND e.deleted_at IS NULL
           AND (ep.user_id IS NOT NULL OR es.user_id IS NOT NULL)
       ),
       user_settlements AS (
         SELECT
           s.id,
           'settlement'::text AS txn_type,
           CASE 
             WHEN s.payer_user_id = $1 THEN 'Settlement to ' || payee_u.display_name
             ELSE 'Settlement from ' || payer_u.display_name
           END AS title,
           g.id AS group_id,
           g.name AS group_name,
           'settlement'::text AS category,
           s.created_at::date AS expense_date,
           s.created_at,
           s.amount_minor AS total_minor,
           CASE WHEN s.payer_user_id = $1 THEN s.amount_minor ELSE 0 END AS user_paid_minor,
           CASE WHEN s.payee_user_id = $1 THEN s.amount_minor ELSE 0 END AS user_share_minor,
           payer_u.display_name AS payer_name,
           CASE 
             WHEN s.payer_user_id = $1 THEN 'spent'
             ELSE 'received'
           END AS direction,
           s.status::text AS status
         FROM settlements s
         JOIN groups g ON g.id = s.group_id
         JOIN users payer_u ON payer_u.id = s.payer_user_id
         JOIN users payee_u ON payee_u.id = s.payee_user_id
         WHERE (s.payer_user_id = $1 OR s.payee_user_id = $1)
           AND s.status != 'cancelled'
       ),
       combined AS (
         SELECT * FROM user_expenses
         UNION ALL
         SELECT * FROM user_settlements
       )
       SELECT * FROM combined
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return res.rows.map((row) => {
      const totalMinor = BigInt(row.total_minor);
      const userPaidMinor = BigInt(row.user_paid_minor);
      const userShareMinor = BigInt(row.user_share_minor);

      let effectiveMinor = userPaidMinor > 0n ? userPaidMinor : userShareMinor;
      if (effectiveMinor === 0n) effectiveMinor = totalMinor;

      return {
        id: row.id,
        type: row.txn_type,
        direction: row.direction,
        title: row.title,
        groupName: row.group_name,
        groupId: row.group_id,
        category: row.category,
        date: row.expense_date,
        createdAt: row.created_at,
        payerName: row.payer_name,
        status: row.status,
        totalAmount: {
          minor: totalMinor.toString(),
          formatted: MoneyService.formatINR(totalMinor)
        },
        userPaid: {
          minor: userPaidMinor.toString(),
          formatted: MoneyService.formatINR(userPaidMinor)
        },
        userShare: {
          minor: userShareMinor.toString(),
          formatted: MoneyService.formatINR(userShareMinor)
        },
        amount: {
          minor: effectiveMinor.toString(),
          formatted: MoneyService.formatINR(effectiveMinor)
        }
      };
    });
  }
}

module.exports = GroupsService;
