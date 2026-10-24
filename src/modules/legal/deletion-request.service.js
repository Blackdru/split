const { query } = require('../../db/pool');
const { AppError } = require('../../middleware/error-handler');

class DeletionRequestService {
  /**
   * Normalize and validate email address
   */
  static normalizeEmail(email) {
    if (!email || typeof email !== 'string') return null;
    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed) ? trimmed : null;
  }

  /**
   * Normalize phone number
   */
  static normalizePhone(phone) {
    if (!phone || typeof phone !== 'string') return null;
    const cleaned = phone.trim().replace(/[^\d+]/g, '');
    return cleaned.length >= 8 && cleaned.length <= 25 ? cleaned : null;
  }

  /**
   * Create an account / data deletion request
   */
  static async createRequest({
    name,
    email,
    phone,
    requestType,
    deleteAccount,
    deleteData,
    reason,
    ipAddress,
    userAgent
  }) {
    // 1. Validate Name
    const cleanName = (name || '').trim();
    if (!cleanName || cleanName.length < 2) {
      throw new AppError('Please provide your full name (at least 2 characters).', 400);
    }
    if (cleanName.length > 150) {
      throw new AppError('Name cannot exceed 150 characters.', 400);
    }

    // 2. Validate Email
    const cleanEmail = this.normalizeEmail(email);
    if (!cleanEmail) {
      throw new AppError('Please provide a valid email / Gmail address.', 400);
    }

    // 3. Validate Phone / Mobile
    const cleanPhone = this.normalizePhone(phone);
    if (!cleanPhone) {
      throw new AppError('Please provide a valid mobile number (at least 8 digits).', 400);
    }

    // 4. Resolve request_type (either one or both)
    let resolvedType = (requestType || '').trim().toLowerCase();

    // Support boolean flags from form checkboxes if requestType not explicitly provided
    if (!resolvedType) {
      const isAccount = deleteAccount === true || deleteAccount === 'true' || deleteAccount === 'on' || deleteAccount === '1';
      const isData = deleteData === true || deleteData === 'true' || deleteData === 'on' || deleteData === '1';
      if (isAccount && isData) {
        resolvedType = 'both';
      } else if (isAccount) {
        resolvedType = 'account_deletion';
      } else if (isData) {
        resolvedType = 'data_deletion';
      }
    }

    // Map common aliases
    if (resolvedType === 'all' || resolvedType === 'account_and_data' || resolvedType === 'account_data') {
      resolvedType = 'both';
    } else if (resolvedType === 'account') {
      resolvedType = 'account_deletion';
    } else if (resolvedType === 'data') {
      resolvedType = 'data_deletion';
    }

    const validTypes = ['account_deletion', 'data_deletion', 'both'];
    if (!validTypes.includes(resolvedType)) {
      throw new AppError(
        'Please select a valid deletion request type: Account Deletion, Data Deletion, or Both.',
        400
      );
    }

    // 5. Clean optional reason
    const cleanReason = reason ? String(reason).trim().slice(0, 1000) : null;
    const cleanIp = ipAddress ? String(ipAddress).trim().slice(0, 100) : null;
    const cleanUa = userAgent ? String(userAgent).trim().slice(0, 500) : null;

    // 6. Insert into database
    const sql = `
      INSERT INTO account_deletion_requests (
        name,
        email,
        phone,
        request_type,
        reason,
        ip_address,
        user_agent,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING
        id,
        name,
        email,
        phone,
        request_type,
        status,
        created_at;
    `;

    const res = await query(sql, [
      cleanName,
      cleanEmail,
      cleanPhone,
      resolvedType,
      cleanReason,
      cleanIp,
      cleanUa
    ]);

    const row = res.rows[0];
    const ticketRef = `DEL-${row.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;

    return {
      id: row.id,
      ticketRef,
      name: row.name,
      email: row.email,
      phone: row.phone,
      requestType: row.request_type,
      status: row.status,
      createdAt: row.created_at
    };
  }

  /**
   * Fetch deletion request by ID or ticket reference
   */
  static async getRequestById(id) {
    const res = await query(
      `SELECT id, name, email, phone, request_type, status, created_at, processed_at
       FROM account_deletion_requests
       WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }
}

module.exports = DeletionRequestService;
