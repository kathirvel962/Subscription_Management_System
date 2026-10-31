import { Request, Response } from 'express';
import { PlanService } from './planService.js';
import { SubscriptionPlanSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';

export class PlanController {
  static async getPlans(req: Request, res: Response): Promise<any> {
    try {
      const frequency = req.query.frequency as string;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;

      const plans = await PlanService.getPlans({ billingFrequency: frequency, isActive });
      return sendSuccess(res, plans, 'Subscription plans retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getPlanById(req: Request, res: Response): Promise<any> {
    try {
      const plan = await PlanService.getPlanById(req.params.id);
      return sendSuccess(res, plan, 'Plan details retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async createPlan(req: Request, res: Response): Promise<any> {
    try {
      const parsed = SubscriptionPlanSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const plan = await PlanService.createPlan(parsed.data as any);
      return sendSuccess(res, plan, 'Subscription plan created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async updatePlan(req: Request, res: Response): Promise<any> {
    try {
      const updated = await PlanService.updatePlan(req.params.id, req.body);
      return sendSuccess(res, updated, 'Subscription plan updated successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
