import { describe, it, expect } from 'vitest';
import { QuotationService } from '../backend/quotationService.js';
import { SubscriptionService } from '../backend/subscriptionService.js';
import { ProductService } from '../../member2/backend/productService.js';
import { PlanService } from '../../member2/backend/planService.js';
import { UserService } from '../../member1/backend/userService.js';

describe('MEMBER 3: Quotation & Subscription Lifecycle Tests', () => {
  let customerId: string;
  let planId: string;
  let productId: string;
  let subscriptionId: string;

  it('sets up customer and plan for quotation tests', async () => {
    const customers = await UserService.getCustomers();
    expect(customers.length).toBeGreaterThan(0);
    customerId = customers[0].id;

    const plans = await PlanService.getPlans();
    expect(plans.length).toBeGreaterThan(0);
    planId = plans[0].id;
    productId = plans[0].productId;
  });

  it('creates quotation and calculates totals dynamically', async () => {
    const quo = await QuotationService.createQuotation({
      customerId,
      planId,
      validityDays: 14,
      lines: [
        {
          productId,
          quantity: 2,
          unitPrice: 1200,
        },
      ],
    });

    expect(quo).toBeDefined();
    expect(quo.quotationNumber).toMatch(/^QUO-\d{4}-\d{4}$/);
    expect(quo.status).toBe('DRAFT');
    expect(Number(quo.subtotal)).toBe(2400); // 2 * 1200
  });

  it('creates subscription and transitions through valid lifecycle states', async () => {
    const sub = await SubscriptionService.createSubscription({
      customerId,
      planId,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      lines: [
        {
          productId,
          quantity: 1,
          unitPrice: 1200,
        },
      ],
    });

    expect(sub).toBeDefined();
    expect(sub.subscriptionNumber).toMatch(/^SUB-\d{4}-\d{4}$/);
    expect(sub.status).toBe('DRAFT');
    subscriptionId = sub.id;

    // Transition: DRAFT -> CONFIRMED
    const confirmed = await SubscriptionService.transitionStatus(sub.id, 'CONFIRMED');
    expect(confirmed.status).toBe('CONFIRMED');

    // Transition: CONFIRMED -> ACTIVE
    const active = await SubscriptionService.transitionStatus(sub.id, 'ACTIVE');
    expect(active.status).toBe('ACTIVE');
  });

  it('pauses and resumes subscription with status history audit', async () => {
    const paused = await SubscriptionService.pauseSubscription(subscriptionId, undefined, 'Customer request');
    expect(paused.status).toBe('PAUSED');

    const resumed = await SubscriptionService.resumeSubscription(subscriptionId);
    expect(resumed.status).toBe('ACTIVE');

    // Check history audit
    const subWithHistory = await SubscriptionService.getSubscriptionById(subscriptionId);
    expect(subWithHistory.statusHistory.length).toBeGreaterThan(2);
  });

  it('renews subscription and updates expiry date', async () => {
    const renewed = await SubscriptionService.renewSubscription(subscriptionId);
    expect(renewed.status).toBe('ACTIVE');
    expect(new Date(renewed.expiryDate).getTime()).toBeGreaterThan(Date.now());
  });

  it('closes subscription early', async () => {
    const closed = await SubscriptionService.closeEarly(subscriptionId, undefined, 'Early closure test');
    expect(closed.status).toBe('CLOSED');

    // Closed subscription cannot transition directly without renewal
    await expect(
      SubscriptionService.transitionStatus(subscriptionId, 'ACTIVE')
    ).rejects.toThrow(/closed subscription cannot be transitioned/i);
  });
});
