import { Request, Response } from 'express';
import { DashboardService } from './dashboardService.js';
import { InvoiceService } from './invoiceService.js';
import { sendSuccess, sendError } from '../../../server/src/utils/responseHelper.js';

export class DashboardController {
  static async getOverview(_req: Request, res: Response): Promise<any> {
    try {
      const overview = await DashboardService.getOverviewMetrics();
      return sendSuccess(res, overview, 'Dashboard overview metrics retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getRevenue(_req: Request, res: Response): Promise<any> {
    try {
      const overview = await DashboardService.getOverviewMetrics();
      return sendSuccess(res, overview.monthlyRevenue, 'Monthly revenue trends retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async getOverdueInvoices(_req: Request, res: Response): Promise<any> {
    try {
      const overdue = await InvoiceService.getOverdueInvoices();
      return sendSuccess(res, overdue, 'Overdue invoices retrieved.');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}
