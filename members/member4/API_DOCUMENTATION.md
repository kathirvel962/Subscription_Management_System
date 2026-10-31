# Member 4: REST API Documentation

Base Path: `/api/v1`

All endpoints require `Authorization: Bearer <JWT>`. Staff/Admin restricted endpoints enforce `requireStaffOrAdmin` middleware.

---

### Invoices (`/invoices`)

#### `GET /api/v1/invoices`
List invoices with optional filters (`status`, `customerId`, `page`, `limit`).

#### `GET /api/v1/invoices/overdue`
Retrieve overdue invoices with days delinquent calculated relative to current date.
*Role: STAFF or ADMIN*

#### `POST /api/v1/invoices`
Manually create an invoice.
*Role: STAFF or ADMIN*
```json
{
  "customerId": "uuid",
  "subscriptionId": "uuid",
  "issueDate": "2026-10-31T00:00:00.000Z",
  "dueDate": "2026-11-14T00:00:00.000Z",
  "lines": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 1200,
      "taxAmount": 240,
      "totalAmount": 2640
    }
  ]
}
```

#### `GET /api/v1/invoices/:id`
Retrieve detailed invoice with lines, customer profile, and payment history.

#### `POST /api/v1/invoices/:id/confirm`
Transition invoice from `DRAFT` to `CONFIRMED`.

#### `POST /api/v1/invoices/:id/cancel`
Cancel an unpaid invoice.

#### `GET /api/v1/invoices/:id/pdf`
Stream binary PDF invoice document generated via PDFKit.
Response: `Content-Type: application/pdf`.

---

### Payments (`/payments`)

#### `GET /api/v1/payments`
List recorded payment transactions.

#### `GET /api/v1/payments/:id`
Get transaction receipt details.

#### `POST /api/v1/payments`
Record payment against an invoice.
*Role: STAFF or ADMIN*
```json
{
  "invoiceId": "uuid",
  "amount": 1200.00,
  "paymentMethod": "BANK_TRANSFER",
  "transactionReference": "TXN-982142",
  "notes": "Remittance wire received"
}
```
*Validation:* Returns `400 Bad Request` if `amount > balanceAmount`. Automatically transitions invoice status to `PAID` when balance reaches `0`.

---

### Automated Billing (`/billing`)

#### `POST /api/v1/billing/trigger`
Manually triggers recurring billing cycle across all active subscriptions.
*Role: STAFF or ADMIN*
```json
{
  "success": true,
  "data": {
    "processedCount": 5,
    "generatedInvoices": ["INV-2026-0004"]
  }
}
```

---

### Dashboard & Analytics (`/dashboard`)

#### `GET /api/v1/dashboard/overview`
High-level executive metrics:
- Active subscriptions count
- Current MRR (Monthly Recurring Revenue)
- Current ARR (Annualized Run Rate = MRR * 12)
- Total revenue collected
- Total outstanding balance
- Trailing 6 months revenue timeline
- Overdue accounts count

#### `GET /api/v1/dashboard/revenue`
Deep-dive revenue telemetry, plan revenue breakdowns, and compound growth projections.

#### `GET /api/v1/dashboard/overdue`
Summary of accounts receivable aging buckets (1-30, 31-60, 60+ days).
