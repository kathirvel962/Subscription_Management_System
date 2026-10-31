import { Response } from 'express';
import { SubscriptionService } from './subscriptionService.js';
import { CreateSubscriptionSchema, SubscriptionStatusTransitionSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';
import { AuthenticatedRequest } from '../../member1/backend/index.js';

export class SubscriptionController {
  static async getSubscriptions(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : (req.query.customerId as string);
      const status = req.query.status as string;

      const subscriptions = await SubscriptionService.getSubscriptions({ customerId, status });
      return sendSuccess(res, subscriptions, 'Subscriptions retrieved successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getSubscriptionById(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : undefined;
      const sub = await SubscriptionService.getSubscriptionById(req.params.id, customerId);
      return sendSuccess(res, sub, 'Subscription retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async createSubscription(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const parsed = CreateSubscriptionSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const subscription = await SubscriptionService.createSubscription(parsed.data as any);
      return sendSuccess(res, subscription, 'Subscription created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async transitionStatus(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const parsed = SubscriptionStatusTransitionSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const sub = await SubscriptionService.transitionStatus(
        req.params.id,
        parsed.data.status as any,
        req.user?.id,
        parsed.data.reason
      );
      return sendSuccess(res, sub, `Subscription status updated to ${parsed.data.status}.`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async pause(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const sub = await SubscriptionService.pauseSubscription(
        req.params.id,
        req.user?.id,
        req.body?.reason
      );
      return sendSuccess(res, sub, 'Subscription paused successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async resume(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const sub = await SubscriptionService.resumeSubscription(req.params.id, req.user?.id);
      return sendSuccess(res, sub, 'Subscription resumed successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async renew(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const sub = await SubscriptionService.renewSubscription(req.params.id, req.user?.id);
      return sendSuccess(res, sub, 'Subscription renewed successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async close(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const sub = await SubscriptionService.closeEarly(
        req.params.id,
        req.user?.id,
        req.body?.reason
      );
      return sendSuccess(res, sub, 'Subscription closed.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
