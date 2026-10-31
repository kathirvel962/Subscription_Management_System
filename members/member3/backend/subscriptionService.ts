import { db } from '../../../server/src/config/db.js';
import {
  SubscriptionStatus,
  BillingFrequency,
} from '../../../shared/types/index.js';
import {
  calculateLineAmounts,
  calculateNextBillingDate,
} from '../../../shared/utils/index.js';
import { DiscountService } from '../../member2/backend/discountService.js';

export class SubscriptionService {
  static async getSubscriptions(params?: { customerId?: string; status?: string }) {
    return db.subscription.findMany({
      where: {
        customerId: params?.customerId,
        status: params?.status,
      },
    });
  }

  static async getSubscriptionById(id: string, customerId?: string) {
    const sub = await db.subscription.findUnique({ where: { id } });
    if (!sub) throw new Error(`Subscription ${id} not found.`);

    if (customerId && sub.customerId !== customerId) {
      throw new Error('Access denied. You do not own this subscription.');
    }

    return sub;
  }

  static async createSubscription(data: {
    customerId: string;
    planId: string;
    quotationId?: string | null;
    startDate?: Date | string;
    expiryDate?: Date | string | null;
    paymentTerms?: string | null;
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
    if (!customer) throw new Error(`Customer ${data.customerId} not found.`);

    const plan = await db.subscriptionPlan.findUnique({ where: { id: data.planId } });
    if (!plan) throw new Error(`Plan ${data.planId} not found.`);

    // Line amount calculations
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
        description: line.description || 'Subscription Line',
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxId: line.taxId || null,
        taxAmount: amounts.taxAmount,
        discountAmount: amounts.discountAmount,
        total: amounts.total,
      });
    }

    // Discounts
    let discountAmount = 0;
    if (data.discountCode) {
      const disc = await DiscountService.validateAndCalculate({
        code: data.discountCode,
        subtotal,
      });
      if (disc.isValid) {
        discountAmount = disc.discountAmount;
      }
    }

    const totalAmount = Number((subtotal - discountAmount + taxAmount).toFixed(2));
    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const nextBillingDate = calculateNextBillingDate(startDate, plan.billingFrequency as BillingFrequency);

    const count = (await db.subscription.findMany()).length + 1;
    const subscriptionNumber = `SUB-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const subscription = await db.subscription.create({
      data: {
        subscriptionNumber,
        customerId: data.customerId,
        planId: data.planId,
        quotationId: data.quotationId || null,
        status: 'DRAFT',
        startDate,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        billingFrequency: plan.billingFrequency,
        nextBillingDate,
        autoClose: plan.autoClose,
        earlyClosureAllowed: plan.earlyClosureAllowed,
        pauseAllowed: plan.pauseAllowed,
        renewalAllowed: plan.renewalAllowed,
        paymentTerms: data.paymentTerms || 'Net 15',
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        notes: data.notes || null,
      },
    });

    // Save line items
    for (const pl of processedLines) {
      await db.subscriptionLine.create({
        data: {
          subscriptionId: subscription.id,
          ...pl,
        },
      });
    }

    // Initial status history
    await db.subscriptionStatusHistory.create({
      data: {
        subscriptionId: subscription.id,
        previousStatus: 'DRAFT',
        newStatus: 'DRAFT',
        changeReason: 'Subscription initialized in Draft status.',
      },
    });

    return this.getSubscriptionById(subscription.id);
  }

  /**
   * Enforces business status transitions with audit logging
   * DRAFT -> QUOTATION -> CONFIRMED -> ACTIVE -> CLOSED
   */
  static async transitionStatus(
    subscriptionId: string,
    newStatus: SubscriptionStatus,
    userId?: string,
    reason?: string
  ) {
    const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new Error(`Subscription ${subscriptionId} not found.`);

    const currentStatus = sub.status as SubscriptionStatus;

    if (currentStatus === newStatus) {
      return sub;
    }

    // Validation of lifecycle state machines
    if (currentStatus === 'CLOSED' && newStatus !== 'DRAFT') {
      throw new Error('A closed subscription cannot be transitioned. A renewal record must be created.');
    }

    if (newStatus === 'ACTIVE' && currentStatus === 'DRAFT') {
      throw new Error('A draft subscription must first be Confirmed before activation.');
    }

    await db.subscription.update({
      where: { id: subscriptionId },
      data: { status: newStatus },
    });

    await db.subscriptionStatusHistory.create({
      data: {
        subscriptionId,
        previousStatus: currentStatus,
        newStatus,
        changedByUserId: userId || null,
        changeReason: reason || `Transitioned from ${currentStatus} to ${newStatus}.`,
      },
    });

    return this.getSubscriptionById(subscriptionId);
  }

  /**
   * Pauses an active subscription (must be permitted by the plan)
   */
  static async pauseSubscription(subscriptionId: string, userId?: string, reason?: string) {
    const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new Error('Subscription not found.');

    if (sub.status !== 'ACTIVE') {
      throw new Error(`Cannot pause subscription in ${sub.status} status. Only Active subscriptions can be paused.`);
    }

    if (!sub.pauseAllowed) {
      throw new Error('This subscription plan policy does not allow pausing.');
    }

    return this.transitionStatus(subscriptionId, 'PAUSED', userId, reason || 'Subscription paused by staff/customer.');
  }

  /**
   * Resumes a paused subscription back to active
   */
  static async resumeSubscription(subscriptionId: string, userId?: string) {
    const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new Error('Subscription not found.');

    if (sub.status !== 'PAUSED') {
      throw new Error(`Cannot resume subscription in ${sub.status} status. Only Paused subscriptions can be resumed.`);
    }

    return this.transitionStatus(subscriptionId, 'ACTIVE', userId, 'Subscription resumed.');
  }

  /**
   * Closes subscription early (must be permitted by the plan)
   */
  static async closeEarly(subscriptionId: string, userId?: string, reason?: string) {
    const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new Error('Subscription not found.');

    if (sub.status === 'CLOSED') {
      throw new Error('Subscription is already closed.');
    }

    if (!sub.earlyClosureAllowed) {
      throw new Error('This subscription plan policy does not permit early closure.');
    }

    return this.transitionStatus(subscriptionId, 'CLOSED', userId, reason || 'Subscription closed early.');
  }

  /**
   * Renews an active or expired subscription
   */
  static async renewSubscription(subscriptionId: string, userId?: string) {
    const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new Error('Subscription not found.');

    if (!sub.renewalAllowed) {
      throw new Error('This subscription plan policy does not permit renewals.');
    }

    // Extend expiry date by 1 year or 1 period
    const currentExpiry = sub.expiryDate ? new Date(sub.expiryDate) : new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);

    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        expiryDate: newExpiry,
      },
    });

    await db.subscriptionStatusHistory.create({
      data: {
        subscriptionId,
        previousStatus: sub.status,
        newStatus: 'ACTIVE',
        changedByUserId: userId || null,
        changeReason: `Subscription renewed until ${newExpiry.toLocaleDateString()}.`,
      },
    });

    return this.getSubscriptionById(subscriptionId);
  }

  /**
   * Scans and auto-closes expired subscriptions where autoClose == true
   */
  static async autoCloseExpiredSubscriptions(): Promise<number> {
    const now = new Date();
    const subs = await db.subscription.findMany();
    let closedCount = 0;

    for (const sub of subs) {
      if (
        sub.autoClose &&
        sub.status === 'ACTIVE' &&
        sub.expiryDate &&
        now > new Date(sub.expiryDate)
      ) {
        await this.transitionStatus(
          sub.id,
          'CLOSED',
          undefined,
          'Automatically closed on expiration according to plan policy.'
        );
        closedCount++;
      }
    }

    return closedCount;
  }
}
