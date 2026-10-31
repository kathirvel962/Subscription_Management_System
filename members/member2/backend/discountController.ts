import { Request, Response } from 'express';
import { DiscountService } from './discountService.js';
import { DiscountSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';

export class DiscountController {
  static async getDiscounts(req: Request, res: Response): Promise<any> {
    try {
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const discounts = await DiscountService.getDiscounts(isActive);
      return sendSuccess(res, discounts, 'Discount rules retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async createDiscount(req: Request, res: Response): Promise<any> {
    try {
      const parsed = DiscountSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const discount = await DiscountService.createDiscount(parsed.data as any);
      return sendSuccess(res, discount, 'Discount rule created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async updateDiscount(req: Request, res: Response): Promise<any> {
    try {
      const updated = await DiscountService.updateDiscount(req.params.id, req.body);
      return sendSuccess(res, updated, 'Discount rule updated.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async validateDiscount(req: Request, res: Response): Promise<any> {
    try {
      const { code, subtotal, totalQuantity } = req.body;
      if (!code) return sendError(res, 'Discount code is required.', 400);

      const result = await DiscountService.validateAndCalculate({
        code,
        subtotal: parseFloat(subtotal) || 0,
        totalQuantity: parseInt(totalQuantity, 10) || 1,
      });

      if (!result.isValid) {
        return sendError(res, result.reason || 'Discount invalid.', 400);
      }

      return sendSuccess(res, result, 'Discount is valid and applicable.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
