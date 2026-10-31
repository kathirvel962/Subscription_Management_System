import { Request, Response } from 'express';
import { TaxService } from './taxService.js';
import { TaxSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';

export class TaxController {
  static async getTaxes(req: Request, res: Response): Promise<any> {
    try {
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const taxes = await TaxService.getTaxes(isActive);
      return sendSuccess(res, taxes, 'Tax rules retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async createTax(req: Request, res: Response): Promise<any> {
    try {
      const parsed = TaxSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const tax = await TaxService.createTax(parsed.data);
      return sendSuccess(res, tax, 'Tax rule created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async updateTax(req: Request, res: Response): Promise<any> {
    try {
      const updated = await TaxService.updateTax(req.params.id, req.body);
      return sendSuccess(res, updated, 'Tax rule updated.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
