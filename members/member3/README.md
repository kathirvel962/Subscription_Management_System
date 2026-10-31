# MEMBER 3: QUOTATION AND SUBSCRIPTION MANAGEMENT MODULE
## Brightloop Software — Subscription Management System

### Overview
This module governs the complete sales quotation lifecycle and subscription state machine for Brightloop Software, from template creation to active contract renewals and closures.

### Key Capabilities
1. **Quotation Templates**: Reusable commercial templates with default plans, preconfigured product lines, and validity periods.
2. **Quotation Lifecycle**:
   - Customer selection, products, variants, taxes, and dynamic discounts.
   - Quotation confirmation directly converts a quote into a live subscription contract.
3. **Subscription Lifecycle State Machine**:
   - Valid flow: `DRAFT` &rarr; `QUOTATION` &rarr; `CONFIRMED` &rarr; `ACTIVE` &rarr; `CLOSED`.
   - Rejection of invalid transitions (e.g. draft cannot be marked paid, closed cannot be reactivated without renewal).
4. **Pause and Resume Operations**:
   - Pausing active subscriptions halts automated recurring invoice generation.
   - Plan-level permission enforcement (`pauseAllowed`).
5. **Contract Renewal & Early Closure**:
   - Automatic expiration date recalculation upon renewal.
   - Immediate early closure enforcement according to plan permissions.
6. **Audit Trail & Timeline**:
   - Every status transition writes to `SubscriptionStatusHistory` recording the author, timestamp, previous status, and rationale.

### Directory Structure
```
members/member3/
  ├── backend/
  │   ├── quotationTemplateController.ts
  │   ├── quotationTemplateService.ts
  │   ├── quotationTemplateRoutes.ts
  │   ├── quotationController.ts
  │   ├── quotationService.ts
  │   ├── quotationRoutes.ts
  │   ├── subscriptionController.ts
  │   ├── subscriptionService.ts
  │   ├── subscriptionRoutes.ts
  │   ├── validation.ts
  │   └── index.ts
  ├── frontend/
  │   ├── QuotationsPage.tsx
  │   ├── QuotationTemplatesPage.tsx
  │   ├── CreateQuotationPage.tsx
  │   ├── SubscriptionsPage.tsx
  │   ├── CreateSubscriptionPage.tsx
  │   ├── SubscriptionDetailsPage.tsx
  │   ├── SubscriptionTimeline.tsx
  │   └── index.ts
  ├── tests/
  │   └── member3.test.ts
  ├── README.md
  ├── API_DOCUMENTATION.md
  └── INTEGRATION.md
```
