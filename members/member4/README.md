# Member 4: Automated Invoicing, Recurring Billing, Payments & Live Finance Dashboard

## Module Overview
Member 4 owns the financial engine and live analytics for **Brightloop Software**:
1. **Automated Recurring Billing**: Scheduled recurring billing cycle driven by `node-cron` with guaranteed idempotency via deterministic `billingPeriodKey`. Prevents duplicate invoicing.
2. **Invoices Lifecycle**: DRAFT -> CONFIRMED -> PARTIAL / PAID / CANCELLED. Dynamic tax, subtotal, and line item calculations.
3. **Payments Recording & Overpayment Prevention**: Exact balance accounting. Strictly rejects any payment amount higher than remaining invoice balance. Supports multiple payment gateways and offline channels (Bank Transfer, Credit Card, Auto Debit, Manual).
4. **PDF Invoice Generation**: Generates compliant downloadable PDF invoices using PDFKit, complete with corporate credentials, line items, and audit trails.
5. **Live Finance & Growth Dashboard**: Real-time aggregation of MRR, ARR, cash flow velocity, aging accounts receivable, and revenue projections.

## Folder Structure
```
members/member4/
├── backend/
│   ├── validation.ts              # Zod schemas for invoices and payments
│   ├── recurringBillingService.ts # Automated subscription billing cycle
│   ├── billingService.ts          # Manual billing cycle trigger
│   ├── billingController.ts       # Controller for trigger endpoint
│   ├── invoiceService.ts          # Invoicing logic and lifecycle transitions
│   ├── invoiceController.ts       # REST controller for invoices
│   ├── paymentService.ts          # Balance calculation & overpayment prevention
│   ├── paymentController.ts       # REST controller for payments
│   ├── dashboardService.ts        # Dynamic MRR, ARR, and telemetry calculations
│   ├── dashboardController.ts     # REST controller for financial dashboard
│   ├── pdfService.ts              # PDFKit document generator
│   ├── billingRoutes.ts           # /api/v1/billing
│   ├── invoiceRoutes.ts           # /api/v1/invoices
│   ├── paymentRoutes.ts           # /api/v1/payments
│   ├── dashboardRoutes.ts         # /api/v1/dashboard
│   └── index.ts                   # Unified member exports
├── frontend/
│   ├── FinanceDashboard.tsx       # Live executive financial KPIs and charts
│   ├── InvoicesPage.tsx           # Searchable invoice management and filters
│   ├── InvoiceDetailsPage.tsx     # Full itemized invoice sheet
│   ├── InvoicePDF.tsx             # Printable PDF preview view
│   ├── PaymentsPage.tsx           # Audit log of all financial transactions
│   ├── PaymentDetailsPage.tsx     # Digital receipt confirmation
│   ├── RevenueAnalytics.tsx       # MRR, ARR, and forecasting models
│   ├── OverdueInvoicesPage.tsx    # AR aging buckets and dunning notices
│   └── index.ts                   # Component export barrel
├── tests/
│   └── member4.test.ts            # Complete Vitest test suite
├── API_DOCUMENTATION.md           # REST endpoints reference
├── INTEGRATION.md                 # Cross-member contracts
└── README.md
```

## Running Tests
```bash
npx vitest run members/member4/tests/member4.test.ts
```
