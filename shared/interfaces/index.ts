// =============================================================================
// SHARED INTERFACES — DATA CONTRACTS
// =============================================================================

import {
  Role,
  ProductType,
  BillingFrequency,
  DiscountType,
  DiscountApplicability,
  QuotationStatus,
  SubscriptionStatus,
  InvoiceStatus,
  PaymentMethod,
} from '../types/index.js';

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICustomerProfile {
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
  user?: IUser;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IProductVariant {
  id: string;
  productId: string;
  name: string;
  priceModifier: number;
  sku?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IProduct {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes?: string | null;
  isActive: boolean;
  variants?: IProductVariant[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ISubscriptionPlan {
  id: string;
  name: string;
  description?: string | null;
  productId: string;
  product?: IProduct;
  billingFrequency: BillingFrequency;
  minQuantity: number;
  basePrice: number;
  availableFrom: Date | string;
  availableUntil?: Date | string | null;
  autoClose: boolean;
  earlyClosureAllowed: boolean;
  pauseAllowed: boolean;
  renewalAllowed: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ITax {
  id: string;
  name: string;
  rate: number;
  description?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IDiscount {
  id: string;
  code: string;
  description?: string | null;
  type: DiscountType;
  value: number;
  minPurchaseAmount?: number | null;
  minQuantity?: number | null;
  startDate: Date | string;
  endDate?: Date | string | null;
  maxUsageCount?: number | null;
  currentUsageCount: number;
  applicableTo: DiscountApplicability;
  isActive: boolean;
  applicableProductIds?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IQuotationLine {
  id?: string;
  productId: string;
  product?: IProduct;
  variantId?: string | null;
  variant?: IProductVariant | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxId?: string | null;
  tax?: ITax | null;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface IQuotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer?: ICustomerProfile;
  planId: string;
  plan?: ISubscriptionPlan;
  status: QuotationStatus;
  validityDate: Date | string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string | null;
  lines: IQuotationLine[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ISubscriptionLine {
  id?: string;
  productId: string;
  product?: IProduct;
  variantId?: string | null;
  variant?: IProductVariant | null;
  description?: string | null;
  quantity: number;
  unitPrice: number;
  taxId?: string | null;
  tax?: ITax | null;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface ISubscription {
  id: string;
  subscriptionNumber: string;
  customerId: string;
  customer?: ICustomerProfile;
  planId: string;
  plan?: ISubscriptionPlan;
  quotationId?: string | null;
  status: SubscriptionStatus;
  startDate: Date | string;
  expiryDate?: Date | string | null;
  billingFrequency: BillingFrequency;
  nextBillingDate?: Date | string | null;
  autoClose: boolean;
  earlyClosureAllowed: boolean;
  pauseAllowed: boolean;
  renewalAllowed: boolean;
  paymentTerms?: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string | null;
  lines: ISubscriptionLine[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IInvoiceLine {
  id?: string;
  productId?: string | null;
  product?: IProduct | null;
  description: string;
  quantity: number;
  unitPrice: number;
  taxId?: string | null;
  tax?: ITax | null;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export interface IInvoice {
  id: string;
  invoiceNumber: string;
  subscriptionId?: string | null;
  subscription?: ISubscription | null;
  customerId: string;
  customer?: ICustomerProfile;
  status: InvoiceStatus;
  invoiceDate: Date | string;
  dueDate: Date | string;
  billingPeriodStart?: Date | string | null;
  billingPeriodEnd?: Date | string | null;
  billingPeriodKey?: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  notes?: string | null;
  lines: IInvoiceLine[];
  payments?: IPayment[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IPayment {
  id: string;
  paymentReference: string;
  invoiceId: string;
  invoice?: IInvoice;
  customerId: string;
  customer?: ICustomerProfile;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date | string;
  notes?: string | null;
  recordedByUserId?: string | null;
  recordedByUser?: IUser | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IDashboardOverview {
  totalActiveSubscriptions: number;
  totalCustomers: number;
  totalRevenueCollected: number;
  totalOutstandingPayments: number;
  overdueInvoicesCount: number;
  overdueInvoicesAmount: number;
  mrr: number;
  arr: number;
  invoicesCount: {
    total: number;
    paid: number;
    pending: number;
    draft: number;
    cancelled: number;
  };
  subscriptionGrowth: {
    date: string;
    activeCount: number;
    newCount: number;
  }[];
  monthlyRevenue: {
    month: string;
    revenue: number;
    invoiced: number;
  }[];
  paymentTrends: {
    date: string;
    amount: number;
  }[];
  recentPayments: IPayment[];
  recentSubscriptions: ISubscription[];
}
