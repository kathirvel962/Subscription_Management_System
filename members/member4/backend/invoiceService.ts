import { db } from '../../../server/src/config/db.js';
import { calculateLineAmounts } from '../../../shared/utils/index.js';

export class InvoiceService {
  static async getInvoices(params?: {
    customerId?: string;
    subscriptionId?: string;
    status?: string;
    search?: string;
  }) {
    let invoices = await db.invoice.findMany({
      where: {
        customerId: params?.customerId,
        subscriptionId: params?.subscriptionId,
        status: params?.status,
      },
    });

    if (params?.search) {
      const q = params.search.toLowerCase();
      invoices = invoices.filter(
        (inv: any) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customer?.companyName?.toLowerCase().includes(q)
      );
    }

    return invoices.map((inv: any) => ({
      ...inv,
      balanceAmount: Number(inv.balance),
      paidAmount: Number(inv.amountPaid),
    }));
  }

  static async getInvoiceById(id: string, customerId?: string) {
    const invoice = await db.invoice.findUnique({ where: { id } });
    if (!invoice) throw new Error(`Invoice ${id} not found.`);

    if (customerId && invoice.customerId !== customerId) {
      throw new Error('Access denied. You do not own this invoice.');
    }

    return {
      ...invoice,
      balanceAmount: Number(invoice.balance),
      paidAmount: Number(invoice.amountPaid),
    };
  }

  static async createInvoice(data: {
    customerId: string;
    subscriptionId?: string | null;
    dueDate: Date | string;
    notes?: string | null;
    lines: Array<{
      productId?: string | null;
      description: string;
      quantity: number;
      unitPrice: number;
      taxId?: string | null;
    }>;
  }) {
    let subtotal = 0;
    let taxAmount = 0;
    const processedLines: any[] = [];

    for (const line of data.lines) {
      let taxRate = 0;
      if (line.taxId) {
        const tax = await db.tax.findUnique({ where: { id: line.taxId } });
        if (tax && tax.isActive) taxRate = Number(tax.rate);
      }

      const amounts = calculateLineAmounts({
        unitPrice: line.unitPrice,
        quantity: line.quantity,
        taxRate,
      });

      subtotal += amounts.subtotal;
      taxAmount += amounts.taxAmount;

      processedLines.push({
        productId: line.productId || null,
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxId: line.taxId || null,
        taxAmount: amounts.taxAmount,
        discountAmount: 0,
        total: amounts.total,
      });
    }

    const totalAmount = Number((subtotal + taxAmount).toFixed(2));
    const invCount = (await db.invoice.findMany()).length + 1;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount).padStart(4, '0')}`;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        customerId: data.customerId,
        subscriptionId: data.subscriptionId || null,
        status: 'DRAFT',
        invoiceDate: new Date(),
        dueDate: new Date(data.dueDate),
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        amountPaid: 0,
        balance: totalAmount,
        notes: data.notes || null,
      },
    });

    for (const pl of processedLines) {
      await db.invoiceLine.create({
        data: {
          invoiceId: invoice.id,
          ...pl,
        },
      });
    }

    return this.getInvoiceById(invoice.id);
  }

  static async confirmInvoice(id: string) {
    const inv = await db.invoice.findUnique({ where: { id } });
    if (!inv) throw new Error('Invoice not found.');

    if (inv.status !== 'DRAFT') {
      throw new Error(`Cannot confirm invoice in ${inv.status} status.`);
    }

    await db.invoice.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });

    return this.getInvoiceById(id);
  }

  static async cancelInvoice(id: string) {
    const inv = await db.invoice.findUnique({ where: { id } });
    if (!inv) throw new Error('Invoice not found.');

    if (inv.status === 'PAID') {
      throw new Error('Cannot cancel a fully paid invoice.');
    }

    if (inv.amountPaid > 0) {
      throw new Error('Cannot cancel an invoice with partial payments recorded. Void payments first.');
    }

    await db.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return this.getInvoiceById(id);
  }

  static async getOverdueInvoices(customerId?: string) {
    const now = new Date();
    const invoices = await db.invoice.findMany({
      where: { customerId },
    });

    return invoices.filter(
      (inv: any) =>
        inv.status !== 'PAID' &&
        inv.status !== 'CANCELLED' &&
        inv.balance > 0 &&
        new Date(inv.dueDate) < now
    );
  }
}
