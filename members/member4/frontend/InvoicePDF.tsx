import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Printer, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

interface InvoicePDFProps {
  invoiceId?: string;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoiceId }) => {
  const id = invoiceId || window.location.pathname.split('/').pop() || '';
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/v1/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setInvoice(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDirectPdf = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/v1/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${invoice?.invoiceNumber || id}.pdf`;
      link.click();
    } catch (err) {
      alert('Could not download PDF.');
    }
  };

  if (loading || !invoice) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading invoice preview...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Control Action Bar (Hidden when printing) */}
      <div className="print:hidden flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <a
          href={`/invoices/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoice
        </a>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Document
          </button>
          <button
            onClick={handleDownloadDirectPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF Binary
          </button>
        </div>
      </div>

      {/* Clean Paper-Style Sheet for Preview and Print */}
      <div className="bg-white text-slate-900 p-10 md:p-14 rounded-2xl shadow-2xl print:shadow-none print:m-0 print:p-0 print:rounded-none">
        <div className="flex justify-between items-start border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-indigo-700">BRIGHTLOOP SOFTWARE</h1>
            <p className="text-xs text-slate-500 mt-1">Enterprise Subscription & Cloud Platforms</p>
            <div className="text-xs text-slate-600 mt-3 space-y-0.5">
              <p>450 Innovation Parkway, Suite 800</p>
              <p>San Francisco, CA 94105, USA</p>
              <p>billing@brightloop.io | +1 (800) 555-LOOP</p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-800">TAX INVOICE</h2>
            <div className="text-sm font-black text-indigo-600 mt-1">{invoice.invoiceNumber}</div>
            <div className="text-xs text-slate-600 mt-3 space-y-0.5">
              <p><span className="text-slate-400">Issue Date:</span> {new Date(invoice.issueDate).toLocaleDateString()}</p>
              <p><span className="text-slate-400">Payment Due:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
              <p><span className="text-slate-400">Status:</span> <strong className="text-indigo-700">{invoice.status}</strong></p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="py-6 border-b border-slate-200">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">Invoice To:</div>
          <div className="text-sm font-bold text-slate-900">{invoice.customer?.name}</div>
          <div className="text-xs text-slate-600">{invoice.customer?.email}</div>
          <div className="text-xs text-slate-600 mt-1">
            {invoice.customer?.customerProfile?.companyName || 'Brightloop Valued Customer'}<br />
            {invoice.customer?.customerProfile?.address || '100 Commercial Way'}<br />
            {invoice.customer?.customerProfile?.city || 'Austin'}, {invoice.customer?.customerProfile?.state || 'TX'} {invoice.customer?.customerProfile?.zipCode || '78701'}
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-300 font-bold text-slate-700 uppercase">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price</th>
                <th className="py-2.5 text-right">Tax</th>
                <th className="py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {(invoice.lines || []).map((line: any, idx: number) => (
                <tr key={line.id || idx}>
                  <td className="py-3">
                    <span className="font-semibold text-slate-900">{line.product?.name || line.description}</span>
                    {line.variant && <span className="text-slate-500 block text-[11px]">Variant: {line.variant.name}</span>}
                  </td>
                  <td className="py-3 text-center">{line.quantity}</td>
                  <td className="py-3 text-right">{formatCurrency(line.unitPrice)}</td>
                  <td className="py-3 text-right text-slate-500">{formatCurrency(line.taxAmount || 0)}</td>
                  <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(line.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end pt-6 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency((invoice.totalAmount || 0) - (invoice.taxAmount || 0))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax:</span>
                <span>{formatCurrency(invoice.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-slate-300 pt-2">
                <span>Total:</span>
                <span className="text-indigo-700">{formatCurrency(invoice.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid:</span>
                <span className="text-emerald-600 font-semibold">
                  {formatCurrency(invoice.paidAmount || ((invoice.totalAmount || 0) - (invoice.balanceAmount || 0)))}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-slate-200 pt-2 text-slate-900">
                <span>Balance Due:</span>
                <span className={invoice.balanceAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                  {formatCurrency(invoice.balanceAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">Thank you for your business!</p>
          <p>Wire transfer details: Silicon Valley Bank, Account: 0984-2918-4491, Routing: 121000358.</p>
          <p>Please indicate invoice number {invoice.invoiceNumber} on all remittance advice.</p>
        </div>
      </div>
    </div>
  );
};
