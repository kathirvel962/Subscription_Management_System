// =============================================================================
// SHARED UTILITIES — BRIGHTLOOP SOFTWARE
// =============================================================================

import { BillingFrequency, DiscountType } from '../types/index.js';
import { PASSWORD_REGEX, ODOO_BRAND_MODIFIER } from '../constants/index.js';

/**
 * Validates password strength according to Brightloop business policy:
 * - More than 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one special character
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message?: string;
} {
  if (!password || password.length <= 8) {
    return {
      isValid: false,
      message: 'Password must be more than 8 characters long.',
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter.',
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter.',
    };
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character.',
    };
  }
  return { isValid: true };
}

/**
 * Calculates item line financial amounts dynamically:
 * subtotal = unitPrice * quantity
 * discount = calculated from percentage or fixed amount
 * tax = calculated based on (subtotal - discount)
 * total = subtotal - discount + tax
 */
export function calculateLineAmounts(params: {
  unitPrice: number;
  quantity: number;
  taxRate?: number; // e.g. 18 for 18%
  discountType?: DiscountType;
  discountValue?: number; // e.g. 10 for 10% or 500 for fixed
}): {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
} {
  const { unitPrice, quantity, taxRate = 0, discountType, discountValue = 0 } = params;
  const subtotal = Number((unitPrice * quantity).toFixed(2));

  let discountAmount = 0;
  if (discountType === 'PERCENTAGE') {
    discountAmount = Number(((subtotal * discountValue) / 100).toFixed(2));
  } else if (discountType === 'FIXED_AMOUNT') {
    discountAmount = Number(Math.min(subtotal, discountValue).toFixed(2));
  }

  const taxableAmount = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  const taxAmount = Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const total = Number((taxableAmount + taxAmount).toFixed(2));

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total,
  };
}

/**
 * Calculates variant product price dynamically:
 * Adds variant price modifier (e.g. +560 for Odoo brand) to base product price
 */
export function calculateVariantPrice(
  basePrice: number,
  variantName?: string | null,
  customModifier?: number
): number {
  let modifier = 0;
  if (customModifier !== undefined && customModifier !== null) {
    modifier = customModifier;
  } else if (variantName && /odoo/i.test(variantName)) {
    modifier = ODOO_BRAND_MODIFIER;
  }
  return Number((basePrice + modifier).toFixed(2));
}

/**
 * Calculates next recurring billing date based on frequency
 */
export function calculateNextBillingDate(fromDate: Date, frequency: BillingFrequency): Date {
  const next = new Date(fromDate);
  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'YEARLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
}

/**
 * Calculates billing period start and end dates
 */
export function calculateBillingPeriod(
  periodStart: Date,
  frequency: BillingFrequency
): { start: Date; end: Date } {
  const start = new Date(periodStart);
  const end = new Date(start);
  switch (frequency) {
    case 'DAILY':
      end.setDate(end.getDate() + 1);
      break;
    case 'WEEKLY':
      end.setDate(end.getDate() + 7);
      break;
    case 'MONTHLY':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'YEARLY':
      end.setFullYear(end.getFullYear() + 1);
      break;
  }
  // subtract 1 millisecond so end is 23:59:59.999 of preceding day
  end.setMilliseconds(end.getMilliseconds() - 1);
  return { start, end };
}

/**
 * Generates an idempotency billing period key (e.g., "SUB-2026-0001_2026-10")
 * Prevents accidental duplicate invoices for the same subscription period
 */
export function generateBillingPeriodKey(
  subscriptionNumber: string,
  periodDate: Date
): string {
  const year = periodDate.getFullYear();
  const month = String(periodDate.getMonth() + 1).padStart(2, '0');
  const day = String(periodDate.getDate()).padStart(2, '0');
  return `${subscriptionNumber}_${year}-${month}-${day}`;
}

/**
 * Format currency to INR or USD standard
 */
export function formatCurrency(amount: number | string, currency: string = 'INR'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'INR' ? 'INR' : 'USD',
    minimumFractionDigits: 2,
  }).format(num);
}
