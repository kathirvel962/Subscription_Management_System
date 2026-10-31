// =============================================================================
// SHARED TYPES & ENUMS — BRIGHTLOOP SOFTWARE
// =============================================================================

export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export type ProductType = 'SOFTWARE' | 'SERVICE' | 'PHYSICAL' | 'ADD_ON';

export type BillingFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type DiscountApplicability = 'WHOLE_SUBSCRIPTION' | 'SPECIFIC_PRODUCTS';

export type QuotationStatus = 'DRAFT' | 'SENT' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED';

export type SubscriptionStatus = 'DRAFT' | 'QUOTATION' | 'CONFIRMED' | 'ACTIVE' | 'PAUSED' | 'CLOSED';

export type InvoiceStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'UPI' | 'CARD' | 'OTHER';

// -----------------------------------------------------------------------------
// Standard API Envelope
// -----------------------------------------------------------------------------

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// -----------------------------------------------------------------------------
// Auth & User DTOs
// -----------------------------------------------------------------------------

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfileSummary {
  id: string;
  userId: string;
  companyName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  taxId?: string | null;
  notes?: string | null;
}

export interface AuthSession {
  user: UserSummary;
  customerProfile?: CustomerProfileSummary | null;
  token: string;
}

// -----------------------------------------------------------------------------
// Financial / Calculations Types
// -----------------------------------------------------------------------------

export interface PriceCalculationResult {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}
