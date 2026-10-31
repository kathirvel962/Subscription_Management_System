import { db } from '../../../server/src/config/db.js';
import { calculateLineAmounts } from '../../../shared/utils/index.js';
import { DiscountService } from '../../member2/backend/discountService.js';
import { TaxService } from '../../member2/backend/taxService.js';
import { SubscriptionService } from './subscriptionService.js';

export class QuotationService {
  static async getQuotations(params?: { customerId?: string; status?: string }) {
    return db.quotation.findMany({
      where: {
        customerId: params?.customerId,
        status: params?.status,
      },
    });
  }

  static async getQuotationById(id: string, customerId?: string) {
    const quo = await db.quotation.findUnique({ where: { id } });
    if (!quo) throw new Error(`Quotation ${id} not found.`);

    if (customerId && quo.customerId !== customerId) {
      throw new Error('Access denied. You do not own this quotation.');
    }

    return quo;
  }

  static async createQuotation(data: {
    customerId: string;
    planId: string;
    validityDays?: number;
    notes?: string | null;
    discountCode?: string | null;
    lines: Array<{
      productId: string;
      variantId?: string | null;
      description?: string | null;
      quantity: number;
      unitPrice: number;
      taxId?: string | null;
    }>;
  }) {
    const customer = await db.customerProfile.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new Error(`Customer profile ${data.customerId} not found.`);

    const plan = await db.subscriptionPlan.findUnique({ where: { id: data.planId } });
    if (!plan) throw new Error(`Subscription plan ${data.planId} not found.`);

    // Calculate line amounts
    let subtotal = 0;
    let taxAmount = 0;
    const processedLines: any[] = [];

    for (const line of data.lines) {
      let taxRate = 0;
      if (line.taxId) {
        const tax = await db.tax.findUnique({ where: { id: line.taxId } });
        if (tax && tax.isActive) taxRate = Number(tax.rate);
      }

      const amounts = calculateLineAmounts({
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        taxRate,
      });

      subtotal += amounts.subtotal;
      taxAmount += amounts.taxAmount;

      processedLines.push({
        productId: line.productId,
        variantId: line.variantId || null,
        description: line.description || 'Quotation item line',
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxId: line.taxId || null,
        taxAmount: amounts.taxAmount,
        discountAmount: amounts.discountAmount,
        total: amounts.total,
      });
    }

    // Apply global discount if provided
    let discountAmount = 0;
    if (data.discountCode) {
      const discResult = await DiscountService.validateAndCalculate({
        code: data.discountCode,
        subtotal,
      });
      if (discResult.isValid) {
        discountAmount = discResult.discountAmount;
      }
    }

    const totalAmount = Number((subtotal - discountAmount + taxAmount).toFixed(2));
    const validityDays = data.validityDays || 30;
    const validityDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    const count = (await db.quotation.findMany()).length + 1;
    const quotationNumber = `QUO-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const quotation = await db.quotation.create({
      data: {
        quotationNumber,
        customerId: data.customerId,
        planId: data.planId,
        status: 'DRAFT',
        validityDate,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        notes: data.notes || null,
        lines: processedLines,
      },
    });

    return quotation;
  }

  /**
   * Turns a confirmed quotation into a real subscription!
   */
  static async confirmQuotation(id: string, userId?: string, customerId?: string) {
    const quo = await this.getQuotationById(id, customerId);

    if (quo.status === 'CONFIRMED') {
      throw new Error('Quotation has already been confirmed.');
    }

    if (new Date() > new Date(quo.validityDate)) {
      throw new Error('Cannot confirm expired quotation.');
    }

    // 1. Mark quotation CONFIRMED
    await db.quotation.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });

    // 2. Convert to Subscription
    const subscription = await SubscriptionService.createSubscription({
      customerId: quo.customerId,
      planId: quo.planId,
      quotationId: quo.id,
      notes: `Generated from Quotation ${quo.quotationNumber}. ${quo.notes || ''}`,
      lines: quo.lines?.map((l: any) => ({
        productId: l.productId,
        variantId: l.variantId,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        taxId: l.taxId,
      })) || [],
    });

    // Transition directly to CONFIRMED
    await SubscriptionService.transitionStatus(
      subscription.id,
      'CONFIRMED',
      userId,
      `Quotation ${quo.quotationNumber} confirmed by user.`
    );

    return {
      message: 'Quotation confirmed and converted to subscription.',
      quotation: await this.getQuotationById(id),
      subscription: await SubscriptionService.getSubscriptionById(subscription.id),
    };
  }
}
