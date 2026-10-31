import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { db } from '../../../server/src/config/db.js';

export class PdfService {
  /**
   * Generates a PDF Buffer for an invoice (either by ID or object)
   */
  static async generateInvoicePdfBuffer(invoiceOrId: any): Promise<Buffer> {
    let invoice = invoiceOrId;
    if (typeof invoiceOrId === 'string') {
      invoice = await db.invoice.findUnique({
        where: { id: invoiceOrId },
        include: {
          customer: { include: { customerProfile: true } },
          lines: true,
          subscription: true,
        },
      });
      if (!invoice) throw new Error(`Invoice ${invoiceOrId} not found.`);
    }

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        // 1. Header & Company Brand
        doc
          .fillColor('#4338CA')
          .fontSize(22)
          .font('Helvetica-Bold')
          .text('BRIGHTLOOP SOFTWARE', 50, 45);

        doc
          .fillColor('#64748B')
          .fontSize(9)
          .font('Helvetica')
          .text('Unified Subscription & Billing Engine', 50, 72)
          .text('100 Tech Park, Outer Ring Road, Bengaluru 560103', 50, 85)
          .text('support@brightloop.io | +91 98765 43210', 50, 98);

        // 2. Invoice Title & Meta Badge
        doc
          .fillColor('#0F172A')
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('TAX INVOICE', 380, 45, { align: 'right' });

        doc
          .fillColor(invoice.status === 'PAID' ? '#059669' : '#D97706')
          .fontSize(10)
          .text(`STATUS: ${invoice.status}`, 380, 70, { align: 'right' });

        doc
          .fillColor('#475569')
          .fontSize(9)
          .font('Helvetica')
          .text(`Invoice Number: ${invoice.invoiceNumber}`, 380, 85, { align: 'right' })
          .text(`Invoice Date: ${new Date(invoice.invoiceDate || invoice.createdAt || new Date()).toLocaleDateString()}`, 380, 98, { align: 'right' })
          .text(`Due Date: ${new Date(invoice.dueDate || new Date()).toLocaleDateString()}`, 380, 111, { align: 'right' });

        doc.moveTo(50, 130).lineTo(550, 130).strokeColor('#E2E8F0').stroke();

        // 3. Bill To Information
        doc
          .fillColor('#475569')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('BILL TO:', 50, 145);

        const customer = invoice.customer;
        doc
          .fillColor('#0F172A')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(customer?.companyName || customer?.name || 'Valued Customer', 50, 160);

        doc
          .fillColor('#334155')
          .fontSize(9)
          .font('Helvetica')
          .text(customer?.address || customer?.customerProfile?.address || 'Address on file', 50, 175)
          .text(`${customer?.city || customer?.customerProfile?.city || ''} ${customer?.state || customer?.customerProfile?.state || ''} ${customer?.zipCode || customer?.customerProfile?.zipCode || ''}`, 50, 188)
          .text(`GST / Tax ID: ${customer?.taxId || customer?.customerProfile?.taxId || 'N/A'}`, 50, 201);

        if (invoice.subscription) {
          doc
            .fillColor('#475569')
            .fontSize(9)
            .text(`Subscription Contract: ${invoice.subscription.subscriptionNumber}`, 380, 160, { align: 'right' })
            .text(`Billing Cycle: ${invoice.subscription.billingFrequency || 'MONTHLY'}`, 380, 175, { align: 'right' });
        }

        // 4. Line Items Table Header
        const tableTop = 230;
        doc
          .rect(50, tableTop, 500, 22)
          .fillColor('#F1F5F9')
          .fill();

        doc
          .fillColor('#334155')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('Item & Description', 60, tableTop + 6)
          .text('Qty', 330, tableTop + 6, { align: 'center', width: 40 })
          .text('Unit Price', 380, tableTop + 6, { align: 'right', width: 70 })
          .text('Total', 470, tableTop + 6, { align: 'right', width: 70 });

        // 5. Line Items Rows
        let y = tableTop + 28;
        const lines = invoice.lines || [];

        for (const line of lines) {
          doc
            .fillColor('#1E293B')
            .fontSize(9)
            .font('Helvetica')
            .text(line.description || 'Subscription Line Item', 60, y)
            .text(String(line.quantity), 330, y, { align: 'center', width: 40 })
            .text(`USD ${Number(line.unitPrice).toFixed(2)}`, 380, y, { align: 'right', width: 70 })
            .text(`USD ${Number(line.total || line.totalAmount).toFixed(2)}`, 470, y, { align: 'right', width: 70 });

          y += 20;
        }

        doc.moveTo(50, y).lineTo(550, y).strokeColor('#E2E8F0').stroke();
        y += 15;

        // 6. Summary Totals
        const rightMargin = 420;
        doc
          .fillColor('#475569')
          .fontSize(9)
          .font('Helvetica')
          .text('Subtotal:', rightMargin, y)
          .text(`USD ${Number(invoice.subtotal || invoice.totalAmount).toFixed(2)}`, 470, y, { align: 'right', width: 70 });
        y += 16;

        if (Number(invoice.discountAmount) > 0) {
          doc
            .fillColor('#059669')
            .text('Discount Applied:', rightMargin, y)
            .text(`-USD ${Number(invoice.discountAmount).toFixed(2)}`, 470, y, { align: 'right', width: 70 });
          y += 16;
        }

        doc
          .fillColor('#475569')
          .text('Taxes:', rightMargin, y)
          .text(`USD ${Number(invoice.taxAmount || 0).toFixed(2)}`, 470, y, { align: 'right', width: 70 });
        y += 16;

        doc.moveTo(rightMargin, y).lineTo(550, y).strokeColor('#CBD5E1').stroke();
        y += 8;

        doc
          .fillColor('#0F172A')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Total Invoiced:', rightMargin, y)
          .text(`USD ${Number(invoice.totalAmount).toFixed(2)}`, 470, y, { align: 'right', width: 70 });
        y += 18;

        doc
          .fillColor('#059669')
          .fontSize(9)
          .font('Helvetica')
          .text('Amount Paid:', rightMargin, y)
          .text(`USD ${Number(invoice.amountPaid || (invoice.totalAmount - (invoice.balance ?? invoice.balanceAmount))).toFixed(2)}`, 470, y, { align: 'right', width: 70 });
        y += 16;

        doc
          .fillColor(Number(invoice.balance ?? invoice.balanceAmount) > 0 ? '#DC2626' : '#059669')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Balance Due:', rightMargin, y)
          .text(`USD ${Number(invoice.balance ?? invoice.balanceAmount).toFixed(2)}`, 470, y, { align: 'right', width: 70 });

        // 7. Footer
        doc
          .fillColor('#94A3B8')
          .fontSize(8)
          .font('Helvetica')
          .text(
            'Thank you for partnering with Brightloop Software. Payment terms: Net 15 days from invoice issuance.',
            50,
            720,
            { align: 'center', width: 500 }
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates and streams PDF response to Express client
   */
  static async generateInvoicePdf(invoice: any, res: Response) {
    const buffer = await this.generateInvoicePdfBuffer(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${invoice.invoiceNumber || 'Invoice'}.pdf"`
    );
    res.send(buffer);
  }
}
