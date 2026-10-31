import { z } from 'zod';

export const CreateInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  subscriptionId: z.string().optional().nullable(),
  dueDate: z.string().or(z.date()),
  notes: z.string().optional().nullable(),
  lines: z
    .array(
      z.object({
        productId: z.string().optional().nullable(),
        description: z.string().min(1, 'Description is required'),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
        taxId: z.string().optional().nullable(),
      })
    )
    .min(1, 'At least one invoice line is required'),
});

export const RecordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'OTHER']),
  paymentDate: z.string().or(z.date()).default(() => new Date().toISOString()),
  notes: z.string().optional().nullable(),
});
