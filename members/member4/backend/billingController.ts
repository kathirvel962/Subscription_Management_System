import { Request, Response } from 'express';
import { BillingService } from './billingService.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';

export class BillingController {
  static async trigger(req: Request, res: Response): Promise<any> {
    try {
      const referenceDate = req.body?.referenceDate as string;
      const result = await BillingService.triggerBillingCycle(referenceDate);
      return sendSuccess(
        res,
        result,
        `Billing run completed: ${result.invoicesGeneratedCount} invoices generated, ${result.skippedCount} skipped.`
      );
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
