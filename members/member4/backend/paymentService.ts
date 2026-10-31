import { db } from '../../../server/src/config/db.js';
import { PaymentMethod } from '../../../shared/types/index.js';

export class PaymentService {
  static async getPayments(params?: { customerId?: string; invoiceId?: string }) {
    return db.payment.findMany({
      where: {
        customerId: params?.customerId,
        invoiceId: params?.invoiceId,
      },
    });
  }

  static async getPaymentById(id: string, customerId?: string) {
    const payment = await db.payment.findUnique({ where: { id } });
    if (!payment) throw new Error(`Payment ${id} not found.`);

    if (customerId && payment.customerId !== customerId) {
      throw new Error('Access denied. You do not own this payment record.');
    }

    return payment;
  }

  /**
   * Records a payment against an invoice with automatic balance calculation
   * and overpayment prevention
   */
  static async recordPayment(data: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentDate?: Date | string;
    notes?: string | null;
    recordedByUserId?: string | null;
  }) {
    const invoice = await db.invoice.findUnique({ where: { id: data.invoiceId } });
    if (!invoice) throw new Error(`Invoice ${data.invoiceId} not found.`);

    if (invoice.status === 'DRAFT') {
      throw new Error('Cannot record payment for an unconfirmed Draft invoice. Please confirm invoice first.');
    }

    if (invoice.status === 'CANCELLED') {
      throw new Error('Cannot record payment for a Cancelled invoice.');
    }

    const currentBalance = Number(invoice.balance);
    const paymentAmount = Number(data.amount);

    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    // Overpayment prevention
    if (paymentAmount > currentBalance) {
      throw new Error(
        `Overpayment rejected: payment amount (₹${paymentAmount}) exceeds invoice outstanding balance (₹${currentBalance}).`
      );
    }

    const count = (await db.payment.findMany()).length + 1;
    const paymentReference = `PAY-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    const newAmountPaid = Number((Number(invoice.amountPaid) + paymentAmount).toFixed(2));
    const newBalance = Number((Number(invoice.totalAmount) - newAmountPaid).toFixed(2));
    const newStatus = newBalance === 0 ? 'PAID' : (newAmountPaid > 0 ? 'PARTIAL' : 'CONFIRMED');

    // Execute in transaction
    const payment = await db.payment.create({
      data: {
        paymentReference,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        amount: paymentAmount,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        notes: data.notes || null,
        recordedByUserId: data.recordedByUserId || null,
      },
    });

    await db.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: newAmountPaid,
        balance: newBalance,
        status: newStatus,
      },
    });

    return {
      payment,
      updatedInvoice: await db.invoice.findUnique({ where: { id: invoice.id } }),
    };
  }
}
