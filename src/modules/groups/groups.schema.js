const { z } = require('zod');

const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100),
  mode: z.enum(['friends', 'family', 'flat', 'trip', 'event']),
  baseCurrency: z.string().default('INR'),
  description: z.string().optional()
});

const createInviteSchema = z.object({
  maxUses: z.number().int().min(1).max(100).default(10),
  expiryDays: z.number().int().min(1).max(30).default(7)
});

const addMemberSchema = z.object({
  displayName: z.string().min(1, 'Member name is required').max(100),
  phone: z.string().max(25).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal(''))
});

module.exports = {
  createGroupSchema,
  createInviteSchema,
  addMemberSchema
};

