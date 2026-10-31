import { db } from '../../../server/src/config/db.js';
import { DiscountType, DiscountApplicability } from '../../../shared/types/index.js';

export class DiscountService {
  static async getDiscounts(isActive?: boolean) {
    return db.discount.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
    });
  }

  static async getDiscountById(id: string) {
    const discount = await db.discount.findUnique({ where: { id } });
    if (!discount) throw new Error(`Discount ${id} not found.`);
    return discount;
  }

  static async getDiscountByCode(code: string) {
    const discount = await db.discount.findUnique({ where: { code: code.toUpperCase().trim() } });
    if (!discount) throw new Error(`Discount code "${code}" not found.`);
    return discount;
  }

  static async createDiscount(data: {
    code: string;
    description?: string | null;
    type: DiscountType;
    value: number;
    minPurchaseAmount?: number | null;
    minQuantity?: number | null;
    startDate?: Date | string;
    endDate?: Date | string | null;
    maxUsageCount?: number | null;
    applicableTo?: DiscountApplicability;
    applicableProductIds?: string[];
    isActive?: boolean;
  }) {
    const code = data.code.toUpperCase().trim();
    const existing = await db.discount.findUnique({ where: { code } });
    if (existing) {
      throw new Error(`Discount code "${code}" already exists.`);
    }

    if (data.type === 'PERCENTAGE' && (data.value <= 0 || data.value > 100)) {
      throw new Error('Percentage discount value must be between 0% and 100%.');
    }

    const start = data.startDate ? new Date(data.startDate) : new Date();
    let end: Date | null = null;
    if (data.endDate) {
      end = new Date(data.endDate);
      if (end <= start) {
        throw new Error('End date must be after start date.');
      }
    }

    return db.discount.create({
      data: {
        code,
        description: data.description || null,
        type: data.type,
        value: data.value,
        minPurchaseAmount: data.minPurchaseAmount || null,
        minQuantity: data.minQuantity || null,
        startDate: start,
        endDate: end,
        maxUsageCount: data.maxUsageCount || null,
        currentUsageCount: 0,
        applicableTo: data.applicableTo || 'WHOLE_SUBSCRIPTION',
        isActive: data.isActive ?? true,
      },
    });
  }

  static async updateDiscount(id: string, data: any) {
    const discount = await db.discount.findUnique({ where: { id } });
    if (!discount) throw new Error('Discount not found.');

    return db.discount.update({
      where: { id },
      data,
    });
  }

  /**
   * Validates discount eligibility and calculates the applicable discount amount
   */
  static async validateAndCalculate(params: {
    code: string;
    subtotal: number;
    totalQuantity?: number;
    productIds?: string[];
  }): Promise<{
    isValid: boolean;
    discount?: any;
    discountAmount: number;
    reason?: string;
  }> {
    const discount = await db.discount.findUnique({
      where: { code: params.code.toUpperCase().trim() },
    });

    if (!discount || !discount.isActive) {
      return { isValid: false, discountAmount: 0, reason: 'Discount code is invalid or inactive.' };
    }

    const now = new Date();
    if (now < new Date(discount.startDate)) {
      return { isValid: false, discountAmount: 0, reason: 'Discount is not yet active.' };
    }

    if (discount.endDate && now > new Date(discount.endDate)) {
      return { isValid: false, discountAmount: 0, reason: 'Discount code has expired.' };
    }

    if (discount.maxUsageCount && discount.currentUsageCount >= discount.maxUsageCount) {
      return { isValid: false, discountAmount: 0, reason: 'Discount code usage limit reached.' };
    }

    if (discount.minPurchaseAmount && params.subtotal < Number(discount.minPurchaseAmount)) {
      return {
        isValid: false,
        discountAmount: 0,
        reason: `Minimum purchase amount of ₹${discount.minPurchaseAmount} required.`,
      };
    }

    if (discount.minQuantity && (params.totalQuantity || 0) < discount.minQuantity) {
      return {
        isValid: false,
        discountAmount: 0,
        reason: `Minimum quantity of ${discount.minQuantity} items required.`,
      };
    }

    // Calculate amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = Number(((params.subtotal * Number(discount.value)) / 100).toFixed(2));
    } else {
      discountAmount = Number(Math.min(params.subtotal, Number(discount.value)).toFixed(2));
    }

    return {
      isValid: true,
      discount,
      discountAmount,
    };
  }

  /**
   * Increments discount usage count
   */
  static async recordUsage(discountId: string, customerId: string, subscriptionId?: string, invoiceId?: string) {
    const discount = await db.discount.findUnique({ where: { id: discountId } });
    if (discount) {
      await db.discount.update({
        where: { id: discountId },
        data: { currentUsageCount: discount.currentUsageCount + 1 },
      });
    }
  }
}
