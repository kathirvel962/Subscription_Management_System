import { Response } from 'express';
import { QuotationService } from './quotationService.js';
import { CreateQuotationSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';
import { AuthenticatedRequest } from '../../member1/backend/index.js';

export class QuotationController {
  static async getQuotations(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : (req.query.customerId as string);
      const status = req.query.status as string;

      const quotations = await QuotationService.getQuotations({ customerId, status });
      return sendSuccess(res, quotations, 'Quotations retrieved successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getQuotationById(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : undefined;
      const quotation = await QuotationService.getQuotationById(req.params.id, customerId);
      return sendSuccess(res, quotation, 'Quotation retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async createQuotation(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const parsed = CreateQuotationSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const quotation = await QuotationService.createQuotation(parsed.data as any);
      return sendSuccess(res, quotation, 'Quotation created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async confirmQuotation(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : undefined;
      const result = await QuotationService.confirmQuotation(req.params.id, req.user?.id, customerId);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
