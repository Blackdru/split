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

module.exports = {
  createGroupSchema,
  createInviteSchema
};
