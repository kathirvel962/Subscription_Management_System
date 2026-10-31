import { z } from 'zod';

export const ProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  type: z.enum(['SOFTWARE', 'SERVICE', 'PHYSICAL', 'ADD_ON']).default('SOFTWARE'),
  salesPrice: z.number().min(0, 'Sales price cannot be negative'),
  costPrice: z.number().min(0, 'Cost price cannot be negative').default(0),
  notes: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, 'Variant name is required'),
        priceModifier: z.number().default(0),
        sku: z.string().optional().nullable(),
        isActive: z.boolean().default(true),
      })
    )
    .optional(),
});

export const ProductVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  priceModifier: z.number(),
  sku: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const SubscriptionPlanSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  description: z.string().optional().nullable(),
  productId: z.string().min(1, 'Product ID is required'),
  billingFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  minQuantity: z.number().int().min(1).default(1),
  basePrice: z.number().min(0, 'Base price cannot be negative'),
  availableFrom: z.string().or(z.date()).default(() => new Date().toISOString()),
  availableUntil: z.string().or(z.date()).optional().nullable(),
  autoClose: z.boolean().default(false),
  earlyClosureAllowed: z.boolean().default(true),
  pauseAllowed: z.boolean().default(true),
  renewalAllowed: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const TaxSchema = z.object({
  name: z.string().min(2, 'Tax name is required'),
  rate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100%'),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const DiscountSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
  description: z.string().optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().min(0, 'Discount value must be positive'),
  minPurchaseAmount: z.number().optional().nullable(),
  minQuantity: z.number().int().optional().nullable(),
  startDate: z.string().or(z.date()).default(() => new Date().toISOString()),
  endDate: z.string().or(z.date()).optional().nullable(),
  maxUsageCount: z.number().int().optional().nullable(),
  applicableTo: z.enum(['WHOLE_SUBSCRIPTION', 'SPECIFIC_PRODUCTS']).default('WHOLE_SUBSCRIPTION'),
  applicableProductIds: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});
