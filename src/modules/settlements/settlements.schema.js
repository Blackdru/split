const { z } = require('zod');

const recordSettlementSchema = z.object({
  payerUserId: z.string().uuid().optional().nullable(),
  payeeUserId: z.string().uuid(),
  amountMinor: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
  method: z.enum(['upi', 'cash', 'bank_transfer', 'other']).default('upi'),
  status: z.enum(['initiated', 'marked_sent', 'acknowledged']).default('marked_sent'),
  payeeVpa: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  upiTxnRef: z.string().optional().nullable(),
  idempotencyKey: z.string().optional().nullable()
});

module.exports = {
  recordSettlementSchema
};
