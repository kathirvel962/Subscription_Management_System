import { describe, it, expect } from 'vitest';
import { InvoiceService } from '../backend/invoiceService.js';
import { PaymentService } from '../backend/paymentService.js';
import { RecurringBillingService } from '../backend/recurringBillingService.js';
import { DashboardService } from '../backend/dashboardService.js';
import { PdfService } from '../backend/pdfService.js';
import { UserService } from '../../member1/backend/userService.js';
import { SubscriptionService } from '../../member3/backend/subscriptionService.js';
import { PlanService } from '../../member2/backend/planService.js';

describe('MEMBER 4: Invoicing, Recurring Billing, Payments & Finance Dashboard Tests', () => {
  let customerId: string;
  let subscriptionId: string;
  let invoiceId: string;

  it('sets up customer and active subscription for billing tests', async () => {
    const customers = await UserService.getCustomers();
    expect(customers.length).toBeGreaterThan(0);
    customerId = customers[0].id;

    const plans = await PlanService.getPlans();
    expect(plans.length).toBeGreaterThan(0);
    const plan = plans[0];

    const sub = await SubscriptionService.createSubscription({
      customerId,
      planId: plan.id,
      startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago (due for billing)
      expiryDate: new Date(Date.now() + 330 * 24 * 60 * 60 * 1000),
      lines: [
        {
          productId: plan.productId,
          quantity: 1,
          unitPrice: 1500,
        },
      ],
    });

    // Enforce proper lifecycle state machine: DRAFT -> CONFIRMED -> ACTIVE
    await SubscriptionService.transitionStatus(sub.id, 'CONFIRMED');
    const activeSub = await SubscriptionService.transitionStatus(sub.id, 'ACTIVE');
    expect(activeSub.status).toBe('ACTIVE');
    subscriptionId = sub.id;
  });

  it('creates an invoice directly with lines and calculates balance correctly', async () => {
    const invoice = await InvoiceService.createInvoice({
      customerId,
      subscriptionId,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      lines: [
        {
          description: 'Cloud Infrastructure Plan',
          quantity: 2,
          unitPrice: 1000,
        },
      ],
    });

    expect(invoice).toBeDefined();
    expect(invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    expect(Number(invoice.totalAmount)).toBe(2000);
    expect(Number(invoice.balanceAmount)).toBe(2000);
    expect(invoice.status).toBe('DRAFT');
    invoiceId = invoice.id;
  });

  it('confirms the invoice transitioning from DRAFT to CONFIRMED', async () => {
    const confirmed = await InvoiceService.confirmInvoice(invoiceId);
    expect(confirmed.status).toBe('CONFIRMED');
  });

  it('records a partial payment and updates balanceAmount and status to PARTIAL', async () => {
    const { payment } = await PaymentService.recordPayment({
      invoiceId,
      amount: 800,
      paymentMethod: 'BANK_TRANSFER',
      transactionReference: 'TXN-PARTIAL-001',
    });

    expect(payment).toBeDefined();
    expect(Number(payment.amount)).toBe(800);

    const updatedInv = await InvoiceService.getInvoiceById(invoiceId);
    expect(Number(updatedInv?.balanceAmount)).toBe(1200);
    expect(updatedInv?.status).toBe('PARTIAL');
  });

  it('prevents overpayment when amount exceeds remaining balance', async () => {
    await expect(
      PaymentService.recordPayment({
        invoiceId,
        amount: 5000, // Balance is only 1200
        paymentMethod: 'CREDIT_CARD',
        transactionReference: 'TXN-OVERPAY-001',
      })
    ).rejects.toThrow(/Overpayment rejected/i);
  });

  it('records final payment and transitions invoice status to PAID', async () => {
    const payment = await PaymentService.recordPayment({
      invoiceId,
      amount: 1200,
      paymentMethod: 'CREDIT_CARD',
      transactionReference: 'TXN-FINAL-001',
    });

    expect(payment).toBeDefined();

    const updatedInv = await InvoiceService.getInvoiceById(invoiceId);
    expect(Number(updatedInv?.balanceAmount)).toBe(0);
    expect(updatedInv?.status).toBe('PAID');
  });

  it('executes recurring billing cycle with idempotency guarantee', async () => {
    const result1 = await RecurringBillingService.executeRecurringBillingCycle();
    expect(result1).toBeDefined();
    expect(typeof result1.processedCount).toBe('number');

    // Second immediate run should NOT generate duplicate invoices for the same period
    const result2 = await RecurringBillingService.executeRecurringBillingCycle();
    expect(result2.invoices.length).toBe(0);
  });

  it('generates a valid downloadable PDF invoice document buffer', async () => {
    const pdfBuffer = await PdfService.generateInvoicePdfBuffer(invoiceId);
    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(100);
  });

  it('computes live dashboard metrics including MRR, ARR, and collection ratios', async () => {
    const overview = await DashboardService.getOverview();
    expect(overview).toBeDefined();
    expect(typeof overview.mrr).toBe('number');
    expect(typeof overview.arr).toBe('number');
    expect(typeof overview.totalRevenueCollected).toBe('number');
    expect(overview.arr).toBe(overview.mrr * 12);
  });
});
