# MEMBER 2: PRODUCT, PLAN, TAX AND DISCOUNT MANAGEMENT MODULE
## Brightloop Software — Subscription Management System

### Overview
This module implements the complete catalog and pricing engine for Brightloop Software, including products, variants, subscription plans, percentage taxes, and eligibility-guarded discounts.

### Key Capabilities
1. **Product Management**:
   - Product types: Software, Service, Physical, Add-on.
   - Sales price, cost price, notes, and search/filtering.
2. **Dynamic Variant Pricing**:
   - Variants: Basic, Premium, Enterprise, and Odoo Brand.
   - **Odoo Brand Rule**: Automatically adds ₹560 to the base product price.
3. **Subscription Plans**:
   - Frequencies: Daily, Weekly, Monthly, Yearly.
   - Minimum seat quantities, validity windows (from/until date validation).
   - Lifecycle permissions: Early closure, Pause/resume, Renewals, Auto-close on expiry.
4. **Tax Management**:
   - Dynamic percentage-based tax rules applied to lines and invoices.
5. **Discount Rules**:
   - Percentage vs Fixed amount discounts.
   - Threshold checks: Minimum purchase amount, minimum item quantity, start/end date, maximum usage counters.
   - Rejection of exhausted or expired coupons.

### Directory Structure
```
members/member2/
  ├── backend/
  │   ├── productController.ts
  │   ├── productService.ts
  │   ├── productRoutes.ts
  │   ├── planController.ts
  │   ├── planService.ts
  │   ├── planRoutes.ts
  │   ├── taxController.ts
  │   ├── taxService.ts
  │   ├── taxRoutes.ts
  │   ├── discountController.ts
  │   ├── discountService.ts
  │   ├── discountRoutes.ts
  │   ├── validation.ts
  │   └── index.ts
  ├── frontend/
  │   ├── ProductsPage.tsx
  │   ├── ProductDetailsPage.tsx
  │   ├── ProductForm.tsx
  │   ├── ProductVariantManager.tsx
  │   ├── PlansPage.tsx
  │   ├── PlanForm.tsx
  │   ├── TaxManagementPage.tsx
  │   ├── DiscountManagementPage.tsx
  │   └── index.ts
  ├── tests/
  │   └── member2.test.ts
  ├── README.md
  ├── API_DOCUMENTATION.md
  └── INTEGRATION.md
```
