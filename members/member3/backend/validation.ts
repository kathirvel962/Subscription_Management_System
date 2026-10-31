import { z } from 'zod';

export const QuotationTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  description: z.string().optional().nullable(),
  planId: z.string().optional().nullable(),
  validityDays: z.number().int().min(1).default(30),
  isActive: z.boolean().default(true),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product is required'),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().min(1).default(1),
        unitPrice: z.number().min(0),
      })
    )
    .min(1, 'At least one product line is required'),
});

export const QuotationLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  variantId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  taxId: z.string().optional().nullable(),
  discountCode: z.string().optional().nullable(),
});

export const CreateQuotationSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  planId: z.string().min(1, 'Subscription plan is required'),
  validityDays: z.number().int().min(1).default(30),
  notes: z.string().optional().nullable(),
  discountCode: z.string().optional().nullable(),
  lines: z.array(QuotationLineSchema).min(1, 'At least one product line is required'),
});

export const SubscriptionLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  variantId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  taxId: z.string().optional().nullable(),
});

export const CreateSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  planId: z.string().min(1, 'Subscription plan is required'),
  quotationId: z.string().optional().nullable(),
  startDate: z.string().or(z.date()).default(() => new Date().toISOString()),
  expiryDate: z.string().or(z.date()).optional().nullable(),
  paymentTerms: z.string().default('Net 15'),
  notes: z.string().optional().nullable(),
  discountCode: z.string().optional().nullable(),
  lines: z.array(SubscriptionLineSchema).min(1, 'At least one product line is required'),
});

export const SubscriptionStatusTransitionSchema = z.object({
  status: z.enum(['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'PAUSED', 'CLOSED']),
  reason: z.string().optional(),
});
