// =============================================================================
// SHARED CONSTANTS — BRIGHTLOOP SOFTWARE
// =============================================================================

export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
} as const;

export const BILLING_FREQUENCIES = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
} as const;

export const ODOO_BRAND_MODIFIER = 560.00;

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{9,}$/;

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be more than 8 characters, contain at least one uppercase letter, one lowercase letter, and one special character.';

export const DEFAULT_PAGE_LIMIT = 10;
export const MAX_PAGE_LIMIT = 100;

export const SUBSCRIPTION_STATUS_FLOW = {
  DRAFT: ['QUOTATION', 'CONFIRMED', 'CLOSED'],
  QUOTATION: ['CONFIRMED', 'CLOSED'],
  CONFIRMED: ['ACTIVE', 'CLOSED'],
  ACTIVE: ['PAUSED', 'CLOSED'],
  PAUSED: ['ACTIVE', 'CLOSED'],
  CLOSED: ['DRAFT'], // renewal creates a new active/confirmed record or draft
} as const;

export const INVOICE_STATUS_FLOW = {
  DRAFT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PAID', 'CANCELLED'],
  PAID: [],
  CANCELLED: [],
} as const;

export const MRR_MULTIPLIERS = {
  DAILY: 30,
  WEEKLY: 4.3333,
  MONTHLY: 1,
  YEARLY: 1 / 12,
} as const;
