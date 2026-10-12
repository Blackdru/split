const { z } = require('zod');

const createExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(255),
  totalMinor: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  expenseDate: z.string().optional(),
  category: z.string().default('general'),
  currency: z.string().default('INR'),
  expenseType: z.enum(['shared', 'family_contribution', 'reversal']).default('shared'),
  notes: z.string().optional(),
  payers: z.array(
    z.object({
      userId: z.string().uuid(),
      amountMinor: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)])
    })
  ).optional(),
  splitMethod: z.enum(['equal', 'percentage', 'shares', 'exact', 'custom']).default('equal'),
  splitParticipants: z.array(z.any()),
  idempotencyKey: z.string().optional()
});

module.exports = {
  createExpenseSchema
};
