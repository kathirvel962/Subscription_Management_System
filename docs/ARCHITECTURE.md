# ARCHITECTURE SPECIFICATION
## Unified Subscription Management System — Brightloop Software

### 1. Executive Summary
Brightloop Software requires an enterprise-grade, unified subscription management platform to manage the complete lifecycle of subscriptions:
- Authentication & Role-Based Access Control (RBAC: Admin, Staff, Customer)
- Catalog management (Products, Variants, Subscription Plans, Taxes, Discounts)
- Quotation lifecycle & Subscription state transitions
- Recurring automated billing, invoices, payments, and financial analytics
- Customer self-service portal

### 2. High-Level Architecture
The system adopts a **Modular Monolith** architecture. While four developers develop assigned modules independently in `members/member{1,2,3,4}/`, the application executes as a single, cohesive full-stack service sharing:
- One Vite React TypeScript frontend
- One Express.js REST API server
- One centralized PostgreSQL database managed by Prisma ORM
- One central authentication and session verification system
- One design system with Tailwind CSS and Lucide icons

```
+-------------------------------------------------------------------------+
|                              FRONTEND                                   |
|                (React 18 + Vite + Tailwind + TanStack Query)            |
|                                                                         |
|  +--------------------+ +--------------------+ +---------------------+  |
|  | Member 1 Frontend  | | Member 2 Frontend  | | Member 3 Frontend   |  |
|  | Auth & Users       | | Catalog & Plans    | | Quotes & Subs       |  |
|  +--------------------+ +--------------------+ +---------------------+  |
|  +-------------------------------------------------------------------+  |
|  | Member 4 Frontend (Billing, Invoices, Payments & Finance Dashboard) |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                    |
                                    | REST APIs (JSON, Bearer JWT)
                                    v
+-------------------------------------------------------------------------+
|                              BACKEND                                    |
|                       (Node.js + Express + TypeScript)                  |
|                                                                         |
|  +--------------------+ +--------------------+ +---------------------+  |
|  | Member 1 Backend   | | Member 2 Backend   | | Member 3 Backend    |  |
|  | Auth / User Svc    | | Catalog / Tax Svc  | | Quote / Sub Svc     |  |
|  +--------------------+ +--------------------+ +---------------------+  |
|  +--------------------+ +--------------------------------------------+  |
|  | Member 4 Backend   | | Jobs: Node-Cron Automated Recurring Engine |  |
|  | Billing / Fin Svc  | +--------------------------------------------+  |
|  +--------------------+                                                 |
+-------------------------------------------------------------------------+
                                    |
                                    | Prisma ORM
                                    v
+-------------------------------------------------------------------------+
|                             DATABASE                                    |
|                PostgreSQL 16 (Docker Compose / Local)                   |
|  Users, Customers, Products, Variants, Plans, Taxes, Discounts,         |
|  Quotes, Subscriptions, Invoices, Lines, Payments, Status History       |
+-------------------------------------------------------------------------+
```

### 3. Module Breakdown & Boundaries
1. **Member 1 (Auth & Users)**:
   - Owns `User`, `CustomerProfile`, `PasswordResetToken`
   - Handles JWT generation, verification, bcrypt password hashing, password strength validation, profile management, and staff account creation.
2. **Member 2 (Catalog, Plans, Taxes & Discounts)**:
   - Owns `Product`, `ProductVariant`, `SubscriptionPlan`, `Tax`, `Discount`, `DiscountUsage`
   - Handles dynamic variant pricing (e.g., Odoo brand adds +560.00 to base price), plan billing frequencies, tax calculation, and discount eligibility rules.
3. **Member 3 (Quotations & Subscriptions)**:
   - Owns `QuotationTemplate`, `Quotation`, `QuotationLine`, `Subscription`, `SubscriptionLine`, `SubscriptionStatusHistory`
   - Enforces lifecycle rules: Draft -> Quotation -> Confirmed -> Active -> Closed, pause, resume, early closure, and renewal.
4. **Member 4 (Billing, Invoices, Payments & Finance)**:
   - Owns `Invoice`, `InvoiceLine`, `Payment`
   - Executes node-cron recurring billing cycle, manual run triggers, idempotency duplicate prevention, partial/full payment tracking, PDF invoice generation, and live financial metric aggregation (MRR, ARR, growth trends, overdue invoice detection).

### 4. Cross-Cutting Concerns
- **Security**: Strict CORS, helmet-like security headers, rate limiting on `/auth`, bcrypt with 10 salt rounds, signed JWTs with expiration, and role-based middleware (`requireRole('ADMIN')`, `requireRole(['ADMIN', 'STAFF'])`).
- **Idempotency**: Invoices generate a deterministic `billingPeriodKey` (`${subNumber}_${year}-${month}-${day}`) with a database unique index, guaranteeing no double-billing.
- **Auditability**: Every subscription status change writes a record to `SubscriptionStatusHistory` capturing old status, new status, timestamp, author, and reason.
