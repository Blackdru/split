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
}

module.exports = GroupsService;
