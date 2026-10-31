import { db } from '../../../server/src/config/db.js';
import {
  calculateNextBillingDate,
  calculateBillingPeriod,
  generateBillingPeriodKey,
} from '../../../shared/utils/index.js';
import { BillingFrequency } from '../../../shared/types/index.js';
import { logger } from '../../../server/src/utils/logger.js';

export interface BillingCycleResult {
  executionTimestamp: Date;
  processedCount: number;
  invoicesGeneratedCount: number;
  skippedCount: number;
  invoices: any[];
  details: string[];
}

export class RecurringBillingService {
  /**
   * Executes recurring billing run for all due subscriptions
   * Can be triggered by node-cron or manually via API for demonstration
   */
  static async executeRecurringBillingCycle(referenceDate: Date = new Date()): Promise<BillingCycleResult> {
    logger.info(`Starting recurring billing cycle run as of ${referenceDate.toISOString()}...`);

    const activeSubscriptions = await db.subscription.findMany({
      where: { status: 'ACTIVE' },
    });

    const generatedInvoices: any[] = [];
    const details: string[] = [];
    let skippedCount = 0;

    for (const sub of activeSubscriptions) {
      // 1. Expiration check
      if (sub.expiryDate && new Date(sub.expiryDate) < referenceDate) {
        details.push(`Skipped ${sub.subscriptionNumber}: Subscription has expired.`);
        skippedCount++;
        continue;
      }

      // 2. Due date check
      if (sub.nextBillingDate && new Date(sub.nextBillingDate) > referenceDate) {
        details.push(`Skipped ${sub.subscriptionNumber}: Next billing date (${new Date(sub.nextBillingDate).toLocaleDateString()}) is in the future.`);
        skippedCount++;
        continue;
      }

      const billingDate = sub.nextBillingDate ? new Date(sub.nextBillingDate) : referenceDate;
      const period = calculateBillingPeriod(billingDate, sub.billingFrequency as BillingFrequency);
      const periodKey = generateBillingPeriodKey(sub.subscriptionNumber, period.start);

      // 3. Idempotency duplicate check
      const existingInvoice = await db.invoice.findUnique({
        where: { billingPeriodKey: periodKey },
      });

      if (existingInvoice) {
        details.push(`Skipped ${sub.subscriptionNumber}: Invoice for period key ${periodKey} already generated.`);
        skippedCount++;
        continue;
      }

      // 4. Generate Invoice from Subscription data
      const invCount = (await db.invoice.findMany()).length + 1;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount).padStart(4, '0')}`;
      const dueDate = new Date(billingDate);
      dueDate.setDate(dueDate.getDate() + 15); // Net 15 standard

      const invoice = await db.invoice.create({
        data: {
          invoiceNumber,
          subscriptionId: sub.id,
          customerId: sub.customerId,
          status: 'CONFIRMED',
          invoiceDate: billingDate,
          dueDate,
          billingPeriodStart: period.start,
          billingPeriodEnd: period.end,
          billingPeriodKey: periodKey,
          subtotal: sub.subtotal,
          taxAmount: sub.taxAmount,
          discountAmount: sub.discountAmount,
          totalAmount: sub.totalAmount,
          amountPaid: 0,
          balance: sub.totalAmount,
          notes: `Automated recurring invoice for period ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}.`,
        },
      });

      // Populate Invoice Lines from Subscription Lines
      if (sub.lines && sub.lines.length > 0) {
        for (const line of sub.lines) {
          await db.invoiceLine.create({
            data: {
              invoiceId: invoice.id,
              productId: line.productId,
              description: line.description || 'Subscription Line',
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxId: line.taxId,
              taxAmount: line.taxAmount,
              discountAmount: line.discountAmount,
              total: line.total,
            },
          });
        }
      }

      // 5. Advance subscription nextBillingDate
      const nextDate = calculateNextBillingDate(billingDate, sub.billingFrequency as BillingFrequency);
      await db.subscription.update({
        where: { id: sub.id },
        data: { nextBillingDate: nextDate },
      });

      generatedInvoices.push(invoice);
      details.push(`Generated ${invoiceNumber} for ${sub.subscriptionNumber} (${sub.customer?.companyName || 'Customer'}) - Total: ₹${sub.totalAmount}`);
    }

    logger.info(`Recurring billing cycle finished. Generated: ${generatedInvoices.length}, Skipped: ${skippedCount}`);

    return {
      executionTimestamp: new Date(),
      processedCount: activeSubscriptions.length,
      invoicesGeneratedCount: generatedInvoices.length,
      skippedCount,
      invoices: generatedInvoices,
      details,
    };
  }
}
