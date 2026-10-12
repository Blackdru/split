const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuidv4 = crypto.randomUUID;
const { query, withTransaction } = require('../../db/pool');
const config = require('../../config/env');
const { AppError } = require('../../middleware/error-handler');

class AuthService {
  /**
   * Hash a token using SHA-256 for secure database storage
   */
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate access and refresh token pair
   */
  static generateTokens(user, familyId = uuidv4()) {
    const payload = {
      id: user.id,
      email: user.email_normalized,
      displayName: user.display_name
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    // Refresh token valid for 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return {
      accessToken,
      rawRefreshToken,
      tokenHash,
      familyId,
      expiresAt
    };
  }

  /**
   * Register a new user
   */
  static async register({ displayName, email, phone, password, preferredCurrency = 'INR' }) {
    const emailNormalized = email ? email.trim().toLowerCase() : null;
    const phoneE164 = phone ? phone.trim() : null;

    if (!emailNormalized && !phoneE164) {
      throw new AppError('Either email or phone is required to register.', 400);
    }

    // Check duplicate
    if (emailNormalized) {
      const existing = await query('SELECT id FROM users WHERE email_normalized = $1', [emailNormalized]);
      if (existing.rows.length > 0) {
        throw new AppError('An account with this email already exists.', 409);
      }
    }
    if (phoneE164) {
      const existingPhone = await query('SELECT id FROM users WHERE phone_e164 = $1', [phoneE164]);
      if (existingPhone.rows.length > 0) {
        throw new AppError('An account with this phone number already exists.', 409);
      }
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1
    });

    // Insert user with raw parameterized SQL
    const insertResult = await query(
      `INSERT INTO users (display_name, email_normalized, phone_e164, password_hash, preferred_currency)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, display_name, email_normalized, phone_e164, preferred_currency, created_at`,
      [displayName, emailNormalized, phoneE164, passwordHash, preferredCurrency]
    );

    const newUser = insertResult.rows[0];

    // Issue initial tokens
    const { accessToken, rawRefreshToken, tokenHash, familyId, expiresAt } = this.generateTokens(newUser);

    await query(
      `INSERT INTO auth_refresh_tokens (user_id, token_hash, family_id, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [newUser.id, tokenHash, familyId, expiresAt]
    );

    return {
      user: {
        id: newUser.id,
        displayName: newUser.display_name,
        email: newUser.email_normalized,
        phone: newUser.phone_e164,
        preferredCurrency: newUser.preferred_currency
      },
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken
      }
    };
  }

  /**
   * Log in with email/phone and password
   */
  static async login({ identifier, password, deviceInfo = 'mobile' }) {
    const cleanId = identifier.trim().toLowerCase();

    // Query user by email or phone
    const userRes = await query(
      `SELECT id, display_name, email_normalized, phone_e164, password_hash, preferred_currency, status
       FROM users
       WHERE (email_normalized = $1 OR phone_e164 = $1) AND deleted_at IS NULL`,
      [cleanId]
    );

    if (userRes.rows.length === 0) {
      // Use generic error message to prevent enumeration
      throw new AppError('Invalid credentials.', 401);
    }

    const user = userRes.rows[0];
    if (user.status !== 'active') {
      throw new AppError('Account is inactive or suspended.', 403);
    }

    const passwordValid = await argon2.verify(user.password_hash, password);
    if (!passwordValid) {
      throw new AppError('Invalid credentials.', 401);
    }

    // Generate tokens
    const familyId = uuidv4();
    const { accessToken, rawRefreshToken, tokenHash, expiresAt } = this.generateTokens(user, familyId);

    await query(
      `INSERT INTO auth_refresh_tokens (user_id, token_hash, family_id, device_info, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, tokenHash, familyId, deviceInfo, expiresAt]
    );

    return {
      user: {
        id: user.id,
        displayName: user.display_name,
        email: user.email_normalized,
        phone: user.phone_e164,
        preferredCurrency: user.preferred_currency
      },
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken
      }
    };
  }

  /**
   * Rotate refresh token and issue new token pair
   */
  static async refresh(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new AppError('Refresh token required.', 400);
    }

    const tokenHash = this.hashToken(rawRefreshToken);

    return withTransaction(async (client) => {
      // Find token record
      const tokenRes = await client.query(
        `SELECT id, user_id, family_id, expires_at, revoked_at
         FROM auth_refresh_tokens
         WHERE token_hash = $1`,
        [tokenHash]
      );

      if (tokenRes.rows.length === 0) {
        throw new AppError('Invalid refresh token.', 401);
      }

      const tokenRecord = tokenRes.rows[0];

      // Detect Reuse: If token has already been revoked, revoke entire family!
      if (tokenRecord.revoked_at !== null) {
        await client.query(
          `UPDATE auth_refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE family_id = $1`,
          [tokenRecord.family_id]
        );
        throw new AppError('Refresh token reuse detected. All sessions in this family revoked.', 401);
      }

      // Check expiry
      if (new Date(tokenRecord.expires_at) < new Date()) {
        throw new AppError('Refresh token expired.', 401);
      }

      // Revoke the used refresh token
      await client.query(
        `UPDATE auth_refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [tokenRecord.id]
      );

      // Fetch user
      const userRes = await client.query(
        `SELECT id, display_name, email_normalized, phone_e164, preferred_currency FROM users WHERE id = $1`,
        [tokenRecord.user_id]
      );

      const user = userRes.rows[0];

      // Issue new token in same family
      const { accessToken, rawRefreshToken: newRawRefresh, tokenHash: newTokenHash, expiresAt } =
        AuthService.generateTokens(user, tokenRecord.family_id);

      await client.query(
        `INSERT INTO auth_refresh_tokens (user_id, token_hash, family_id, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [user.id, newTokenHash, tokenRecord.family_id, expiresAt]
      );

      return {
        accessToken,
        refreshToken: newRawRefresh
      };
    });
  }

  /**
   * Revoke current refresh token on logout
   */
  static async logout(rawRefreshToken) {
    if (!rawRefreshToken) return;
    const tokenHash = this.hashToken(rawRefreshToken);
    await query(
      `UPDATE auth_refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = $1`,
      [tokenHash]
    );
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  static async logoutAll(userId) {
    await query(
      `UPDATE auth_refresh_tokens SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
      [userId]
    );
  }

  /**
   * Get user profile by ID
   */
  static async getProfile(userId) {
    const res = await query(
      `SELECT id, display_name, email_normalized, phone_e164, preferred_currency, created_at
       FROM users
       WHERE id = $1 AND status = 'active'`,
      [userId]
    );
    if (res.rows.length === 0) {
      throw new AppError('User not found.', 404);
    }
    const u = res.rows[0];
    return {
      id: u.id,
      displayName: u.display_name,
      email: u.email_normalized,
      phone: u.phone_e164,
      preferredCurrency: u.preferred_currency,
      createdAt: u.created_at
    };
  }
}

module.exports = AuthService;
