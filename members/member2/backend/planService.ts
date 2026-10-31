import { db } from '../../../server/src/config/db.js';
import { BillingFrequency } from '../../../shared/types/index.js';

export class PlanService {
  static async getPlans(params?: { billingFrequency?: string; isActive?: boolean }) {
    let plans = await db.subscriptionPlan.findMany({
      where: params?.isActive !== undefined ? { isActive: params.isActive } : undefined,
    });

    if (params?.billingFrequency) {
      plans = plans.filter((p: any) => p.billingFrequency === params.billingFrequency);
    }

    return plans;
  }

  static async getPlanById(id: string) {
    const plan = await db.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new Error(`Subscription plan ${id} not found.`);
    return plan;
  }

  static async createPlan(data: {
    name: string;
    description?: string | null;
    productId: string;
    billingFrequency: BillingFrequency;
    minQuantity?: number;
    basePrice: number;
    availableFrom?: Date | string;
    availableUntil?: Date | string | null;
    autoClose?: boolean;
    earlyClosureAllowed?: boolean;
    pauseAllowed?: boolean;
    renewalAllowed?: boolean;
    isActive?: boolean;
  }) {
    // Validate product exists
    const product = await db.product.findUnique({ where: { id: data.productId } });
    if (!product) throw new Error(`Product ${data.productId} does not exist.`);

    // Date validation
    const from = data.availableFrom ? new Date(data.availableFrom) : new Date();
    let until: Date | null = null;
    if (data.availableUntil) {
      until = new Date(data.availableUntil);
      if (until <= from) {
        throw new Error('Available until date must be after available from date.');
      }
    }

    const created = await db.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description || null,
        productId: data.productId,
        billingFrequency: data.billingFrequency,
        minQuantity: data.minQuantity || 1,
        basePrice: data.basePrice,
        availableFrom: from,
        availableUntil: until,
        autoClose: data.autoClose ?? false,
        earlyClosureAllowed: data.earlyClosureAllowed ?? true,
        pauseAllowed: data.pauseAllowed ?? true,
        renewalAllowed: data.renewalAllowed ?? true,
        isActive: data.isActive ?? true,
      },
    });

    return this.getPlanById(created.id);
  }

  static async updatePlan(id: string, data: any) {
    const plan = await db.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) throw new Error('Plan not found.');

    if (data.availableUntil && data.availableFrom) {
      if (new Date(data.availableUntil) <= new Date(data.availableFrom)) {
        throw new Error('Available until date must be after available from date.');
      }
    }

    const updated = await db.subscriptionPlan.update({
      where: { id },
      data,
    });
    return this.getPlanById(updated.id);
  }
}
