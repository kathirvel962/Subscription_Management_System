import { Request, Response } from 'express';
import { QuotationTemplateService } from './quotationTemplateService.js';
import { QuotationTemplateSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';

export class QuotationTemplateController {
  static async getTemplates(_req: Request, res: Response): Promise<any> {
    try {
      const templates = await QuotationTemplateService.getTemplates();
      return sendSuccess(res, templates, 'Quotation templates retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getTemplateById(req: Request, res: Response): Promise<any> {
    try {
      const template = await QuotationTemplateService.getTemplateById(req.params.id);
      return sendSuccess(res, template, 'Template details retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async createTemplate(req: Request, res: Response): Promise<any> {
    try {
      const parsed = QuotationTemplateSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const template = await QuotationTemplateService.createTemplate(parsed.data as any);
      return sendSuccess(res, template, 'Quotation template created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
