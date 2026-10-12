const { z } = require('zod');

const recordSettlementSchema = z.object({
  payeeUserId: z.string().uuid(),
  amountMinor: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  method: z.enum(['upi', 'cash', 'bank_transfer', 'other']).default('upi'),
  status: z.enum(['initiated', 'marked_sent']).default('marked_sent'),
  payeeVpa: z.string().optional(),
  notes: z.string().optional(),
  upiTxnRef: z.string().optional(),
  idempotencyKey: z.string().optional()
});

module.exports = {
  recordSettlementSchema
};
