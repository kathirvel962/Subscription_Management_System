import { Response } from 'express';
import { InvoiceService } from './invoiceService.js';
import { PdfService } from './pdfService.js';
import { CreateInvoiceSchema } from './validation.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';
import { AuthenticatedRequest } from '../../member1/backend/index.js';

export class InvoiceController {
  static async getInvoices(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : (req.query.customerId as string);
      const subscriptionId = req.query.subscriptionId as string;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const invoices = await InvoiceService.getInvoices({ customerId, subscriptionId, status, search });
      return sendSuccess(res, invoices, 'Invoices retrieved successfully.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getInvoiceById(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : undefined;
      const invoice = await InvoiceService.getInvoiceById(req.params.id, customerId);
      return sendSuccess(res, invoice, 'Invoice details retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async createInvoice(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const parsed = CreateInvoiceSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.errors[0].message, 400);
      }

      const invoice = await InvoiceService.createInvoice(parsed.data as any);
      return sendSuccess(res, invoice, 'Invoice created successfully.', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async confirmInvoice(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const invoice = await InvoiceService.confirmInvoice(req.params.id);
      return sendSuccess(res, invoice, 'Invoice confirmed.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async cancelInvoice(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const invoice = await InvoiceService.cancelInvoice(req.params.id);
      return sendSuccess(res, invoice, 'Invoice cancelled.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getInvoicePdf(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : undefined;
      const invoice = await InvoiceService.getInvoiceById(req.params.id, customerId);
      await PdfService.generateInvoicePdf(invoice, res);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  static async getOverdueInvoices(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const customerId =
        req.user?.role === 'CUSTOMER' ? req.user.customerProfileId || undefined : undefined;
      const invoices = await InvoiceService.getOverdueInvoices(customerId);
      return sendSuccess(res, invoices, 'Overdue invoices retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
