# Brightloop Software — Unified Subscription Management System
> **Odoo Hackathon Solution** &bull; Production-Grade Modular Monolith Architecture

[![Tests](https://img.shields.io/badge/Vitest-27%2F27%20Passed-emerald.svg)](file:///d:/odoo_hack_full)
[![Build](https://img.shields.io/badge/Build-Client%20%2B%20Server%20Passing-indigo.svg)](file:///d:/odoo_hack_full)
[![Architecture](https://img.shields.io/badge/Structure-4--Member%20Decoupled-violet.svg)](file:///d:/odoo_hack_full/docs/ARCHITECTURE.md)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20Prisma%20%2B%20Dual--Mode%20Fallback-blue.svg)](file:///d:/odoo_hack_full/prisma/schema.prisma)

---

## 1. Executive Summary
**Brightloop Software** is a complete, enterprise-grade Subscription Management System architected for the Odoo Hackathon. It is built as a **Modular Monolith** engineered for seamless multi-developer collaboration across **four team members**, featuring an automated recurring billing engine, dynamic quotation workflows, multi-frequency subscription contracts, variant pricing rules (including the mandatory **+560 Odoo brand price modifier**), payment overpayment protection, compliant PDF invoice generation, and live executive telemetry (MRR, ARR, Cash Flow, Aging AR).

The application features a **Dual-Mode Resilient Database Layer**: it automatically connects to PostgreSQL via Prisma ORM when available, and gracefully falls back to a high-fidelity In-Memory Repository with zero configuration when Docker is offline, guaranteeing instantaneous evaluation on any machine.

---

## 2. Team Member Ownership & Architecture Manifest

```
odoo_hack_full/
├── members/
│   ├── member1/     # AUTHENTICATION, JWT, RBAC & USER MANAGEMENT
│   │   ├── backend/ # AuthService, UserController, AuthMiddleware, RoleMiddleware
│   │   ├── frontend/# LoginPage, RegisterPage, ProfilePage, UserManagementPage
│   │   └── tests/   # Vitest suite (7 unit/integration tests)
│   │
│   ├── member2/     # PRODUCTS, VARIANTS, PLANS, TAXES & DISCOUNTS
│   │   ├── backend/ # ProductService (+560 rule), PlanService, TaxService, DiscountService
│   │   ├── frontend/# ProductsPage, ProductVariantManager, PlansPage, TaxPage, DiscountPage
│   │   └── tests/   # Vitest suite (5 unit/integration tests)
│   │
│   ├── member3/     # QUOTATIONS & SUBSCRIPTION LIFECYCLE
│   │   ├── backend/ # QuotationTemplateService, QuotationService, SubscriptionService
│   │   ├── frontend/# QuotationsPage, SubscriptionsPage, SubscriptionTimeline
│   │   └── tests/   # Vitest suite (6 unit/integration tests)
│   │
│   └── member4/     # RECURRING BILLING, INVOICES, PAYMENTS & FINANCE INTELLIGENCE
│       ├── backend/ # RecurringBillingService, InvoiceService, PaymentService, PdfService, DashboardService
│       ├── frontend/# FinanceDashboard, InvoicesPage, InvoicePDF, PaymentsPage, RevenueAnalytics
│       └── tests/   # Vitest suite (9 unit/integration tests)
```

### Detailed Deliverables by Member:
* **Member 1 (Auth, Security & Identity)**:
  - Strong password policy enforcement (`Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol`).
  - Role-based Access Control (`ADMIN`, `STAFF`, `CUSTOMER`) with JWT verification.
  - Profile management, staff creation, password reset token lifecycle, and customer portal layout.
* **Member 2 (Catalog, Pricing & Tax Engine)**:
  - Software, service, physical, and add-on products with multi-variant management.
  - **Odoo Brand Variant Rule**: Automatically adds **560 USD** to base price when variant name contains "Odoo".
  - Flexible billing frequencies: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`.
  - Tax calculation engine and promotional discount coupon rules (min spend, usage limits, expiration dates).
* **Member 3 (Quotations & Subscription Lifecycle)**:
  - Quotation template engine with predefined line items and payment terms.
  - Quotation state machine: `DRAFT` -> `SENT` -> `CONFIRMED` -> `CONVERTED`.
  - Subscription contract lifecycle: `DRAFT` -> `QUOTATION` -> `CONFIRMED` -> `ACTIVE` -> `PAUSED` -> `CLOSED`.
  - Automatic renewal handling, pause/resume guards, and immutable audit timeline.
* **Member 4 (Automated Recurring Billing, Finance & Intelligence)**:
  - Automated recurring billing driven by `node-cron` with guaranteed idempotency via deterministic `billingPeriodKey` (`SUB-xxxx_YYYY-MM-DD`).
  - Strict overpayment prevention: payments exceeding invoice remaining balance are rejected.
  - Automated transition to `PAID` upon zero remaining balance.
  - Vectorized PDF invoice generation via PDFKit.
  - Live Executive Dashboard: MRR, ARR, collection ratios, and aging AR delinquency buckets (1-30, 31-60, 60+ days).

---

## 3. Quick Start & Demonstration

### Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+ or v10+)
- *(Optional)* Docker Desktop (if running containerized PostgreSQL)

### 1. Installation
```bash
git clone <repository-url>
cd odoo_hack_full
npm install
```

### 2. Run All Tests (27/27 Tests Passing)
```bash
npm test
```

### 3. Build Full Production Bundle (Client + Server)
```bash
npm run build
```

### 4. Launch Application
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:3000` (or `http://localhost:5000` in production)
- **API Health**: `http://localhost:5000/health`

---

## 4. Default Seed Accounts (1-Click Demo Logins Available)

| Role | Email | Password | Permissions & Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@brightloop.io` | `Admin@12345` | Full platform control, Staff & User Management, Financial Control |
| **Staff** | `staff@brightloop.io` | `Staff@12345` | Quotations, Subscriptions, Catalog, Manual Invoicing & Payments |
| **Customer** | `customer@acme.com` | `Customer@12345` | Customer Portal: My Invoices, Active Subscriptions, Receipts |
| **Customer 2** | `david@globex.org` | `Customer@12345` | Customer Portal: Account Contracts & Billing History |

---

## 5. REST API Contract Overview

Base URL: `/api/v1`

### Authentication (`/auth`)
- `POST /api/v1/auth/register` — Create new customer account with live password validation.
- `POST /api/v1/auth/login` — Authenticate and receive signed JWT.
- `GET /api/v1/auth/me` — Retrieve current authenticated user profile.
- `POST /api/v1/auth/forgot-password` — Generate secure password reset token.
- `POST /api/v1/auth/reset-password` — Complete password reset.

### Products & Plans (`/products`, `/plans`)
- `GET /api/v1/products` — List products with variants and pricing.
- `POST /api/v1/products` — Create product with variants (Applies +560 for Odoo Brand).
- `GET /api/v1/plans` — List active subscription plans.
- `POST /api/v1/plans` — Create subscription plan (Daily, Weekly, Monthly, Yearly).

### Subscriptions & Quotations (`/subscriptions`, `/quotations`)
- `GET /api/v1/subscriptions` — List subscriptions (filtered by customer/status).
- `POST /api/v1/subscriptions` — Create new subscription contract.
- `PATCH /api/v1/subscriptions/:id/status` — Lifecycle transition (`CONFIRMED`, `ACTIVE`, `CLOSED`).
- `POST /api/v1/subscriptions/:id/pause` — Pause active subscription.
- `POST /api/v1/subscriptions/:id/resume` — Resume paused subscription.
- `POST /api/v1/quotations` — Create quotation with dynamic calculations.
- `POST /api/v1/quotations/:id/confirm` — Convert quotation to active subscription.

### Invoices & Payments (`/invoices`, `/payments`, `/billing`)
- `GET /api/v1/invoices` — List invoices with balance and payment status.
- `GET /api/v1/invoices/:id` — Detailed itemized invoice.
- `GET /api/v1/invoices/:id/pdf` — Stream official PDF invoice document.
- `POST /api/v1/payments` — Record payment (with overpayment prevention).
- `POST /api/v1/billing/trigger` — Execute recurring billing cycle manually.

### Executive Financial Intelligence (`/dashboard`)
- `GET /api/v1/dashboard/overview` — Real-time MRR, ARR, cash collection, and active contracts.
- `GET /api/v1/dashboard/revenue` — 6-month trailing velocity and plan contribution breakdown.
- `GET /api/v1/dashboard/overdue` — Accounts receivable aging delinquency buckets.

---

## 6. Architecture & Quality Highlights
- **100% Typed**: End-to-end TypeScript with strict typing across shared models and member services.
- **Idempotency Guarantee**: Automated recurring billing prevents duplicate charges using deterministic `billingPeriodKey`.
- **Zero-Setup Local Verification**: Evaluators can run tests and boot the application without needing a local PostgreSQL instance installed, while full PostgreSQL + Docker Compose support is provided for production deployments.
- **Zero External UI Dependency**: Custom, state-of-the-art glassmorphic design system with vibrant dark theme, smooth micro-interactions, responsive charts, and accessible typography.
