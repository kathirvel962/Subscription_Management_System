# Member 4: Integration Contracts

## Collaborating with Member 1 (Auth & Users)
- Invoices and payments link to Member 1's `User` model via `customerId`.
- All routes utilize `authMiddleware` to identify the caller (`req.user`).
- When a customer logs into the customer portal, `InvoiceController.getInvoices` filters invoices matching `req.user.id` when role is `CUSTOMER`.

## Collaborating with Member 2 (Products & Plans)
- Recurring billing evaluates subscription lines tied to Member 2's `Product` and `ProductVariant` models.
- Any line item with variant containing "Odoo" includes the +560 price modifier from `shared/utils/index.js`.
- Invoices calculate applicable tax lines matching active tax definitions.

## Collaborating with Member 3 (Quotations & Subscriptions)
- When Member 3 confirms a quotation or starts a subscription, Member 4's `RecurringBillingService` tracks the `nextBillingDate`.
- Invoices carry `subscriptionId` and deterministic `billingPeriodKey` (`SUB-xxxx_YYYY-MM-DD`).
- Paused subscriptions (`status === 'PAUSED'`) or expired subscriptions are excluded from billing cycles.

## Error Handling & Idempotency Rules
1. **Double Billing Prevention**: Invoices enforce uniqueness on `billingPeriodKey`. If recurring billing executes multiple times in the same day, existing invoices are skipped gracefully.
2. **Overpayment Prevention**: `PaymentService.recordPayment` calculates `remainingBalance = invoice.totalAmount - (sum of previous payments)`. If `amount > remainingBalance`, transaction is rejected with `OVERPAYMENT_REJECTED`.
