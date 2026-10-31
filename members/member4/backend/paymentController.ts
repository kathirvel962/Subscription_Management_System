import { Response } from 'express';
import { PaymentService } from './paymentService.js';
import { RecordPaymentSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';
import { AuthenticatedRequest } from '../../member1/backend/index.js';

export class PaymentController {
  static async getPayments(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : (req.query.customerId as string);
      const invoiceId = req.query.invoiceId as string;

      const payments = await PaymentService.getPayments({ customerId, invoiceId });
      return sendSuccess(res, payments, 'Payments retrieved successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getPaymentById(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : undefined;
      const payment = await PaymentService.getPaymentById(req.params.id, customerId);
      return sendSuccess(res, payment, 'Payment details retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async recordPayment(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const parsed = RecordPaymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const result = await PaymentService.recordPayment({
        ...parsed.data,
        recordedByUserId: req.user?.id,
      });

      return sendSuccess(res, result, 'Payment recorded successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
