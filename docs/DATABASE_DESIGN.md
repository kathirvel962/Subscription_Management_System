# DATABASE DESIGN DOCUMENTATION
## Brightloop Subscription Management System

### 1. Database Engine & ORM
- **Engine**: PostgreSQL 16 (Local / Docker Compose)
- **ORM**: Prisma ORM (Client v6)
- **Schema File**: `prisma/schema.prisma`

### 2. Entity Relationship Overview
```
       +--------------------+
       |        User        |
       +--------------------+
                 | 1:1
                 v
       +--------------------+
       |  CustomerProfile   |
       +--------------------+
            |            |
       1:N  |            | 1:N
            v            v
+---------------+    +---------------+
|   Quotation   |    |  Subscription |<---+
+---------------+    +---------------+    |
        |                    |            |
    1:N |                1:N |        1:N |
        v                    v            |
+---------------+    +---------------+    |
| QuotationLine |    |SubscriptionLin|    |
+---------------+    +---------------+    |
                             |            |
                             | 1:N        |
                             v            |
                     +---------------+    |
                     |    Invoice    |----+
                     +---------------+
                             |
                             | 1:N
                             v
                     +---------------+
                     |    Payment    |
                     +---------------+
```

### 3. Key Constraints & Data Integrity Principles
1. **Financial Values**:
   - Stored as PostgreSQL `DECIMAL(10, 2)` (and `DECIMAL(5, 2)` for tax rates).
   - No floating-point inaccuracies.
2. **Idempotent Billing Protection**:
   - `Invoice` has a unique constraint on `billingPeriodKey` (`SUB-xxxx_YYYY-MM-DD`).
   - If the cron job or staff runs the billing cycle multiple times on the same day, Prisma rejects duplicate insertion via `P2002` constraint, preventing duplicate charges.
3. **Audit History**:
   - `SubscriptionStatusHistory` records every status transition with timestamps and user identifiers.
4. **Referential Integrity**:
   - Foreign keys enforce cascade deletes on child lines (e.g., `SubscriptionLine` on `Subscription`), while preserving parent records on business transactions (`RESTRICT` on `Invoice -> CustomerProfile`).
5. **Indexes**:
   - Unique indexes on `User.email`, `Subscription.subscriptionNumber`, `Invoice.invoiceNumber`, `Invoice.billingPeriodKey`, `Payment.paymentReference`, `Discount.code`.
   - Performance indexes on frequently filtered fields: `Invoice.status`, `Invoice.dueDate`, `Subscription.status`, `Subscription.nextBillingDate`, `Product.isActive`.
