const { z } = require('zod');

const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number format (E.164 recommended)').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  preferredCurrency: z.string().default('INR')
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required'
});

const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
  deviceInfo: z.string().optional()
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};
