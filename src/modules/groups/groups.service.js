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
      `SELECT g.id, g.name, g.mode, g.base_currency, g.description, g.status, gm.role, g.created_at,
              COUNT(DISTINCT m.user_id)::int AS member_count
       FROM groups g
       JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = $1 AND gm.status = 'active'
       LEFT JOIN group_members m ON m.group_id = g.id AND m.status = 'active'
       WHERE g.status != 'closed'
       GROUP BY g.id, gm.role
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
      `SELECT u.id, u.display_name, u.email_normalized, u.phone_e164, u.avatar_url, gm.role, gm.joined_at
       FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = $1 AND gm.status = 'active'`,
      [groupId]
    );

    return {
      group: groupRes.rows[0],
      userRole: membership.rows[0].role,
      members: membersRes.rows
    };
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
