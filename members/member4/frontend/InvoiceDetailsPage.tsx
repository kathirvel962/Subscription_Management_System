import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  ArrowLeft,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Printer,
  Calendar,
  Building,
  Mail,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

interface InvoiceDetailProps {
  invoiceId?: string;
}

export const InvoiceDetailsPage: React.FC<InvoiceDetailProps> = ({ invoiceId }) => {
  // Extract id from props or URL pathname
  const id = invoiceId || window.location.pathname.split('/').pop() || '';
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CREDIT_CARD' | 'MANUAL_OFFLINE' | 'AUTO_DEBIT'>('BANK_TRANSFER');
  const [paymentReference, setPaymentReference] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    if (id) fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/v1/invoices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setInvoice(res.data.data);
        setPaymentAmount(res.data.data.balanceAmount);
        setPaymentReference(`TXN-${Date.now().toString().slice(-6)}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/v1/invoices/${invoice.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      link.click();
    } catch (err) {
      alert('Failed to download invoice PDF.');
    }
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`/api/v1/invoices/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        fetchInvoiceDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error confirming invoice');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this invoice? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`/api/v1/invoices/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        fetchInvoiceDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error cancelling invoice');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoice) return;
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than zero');
      return;
    }
    if (paymentAmount > invoice.balanceAmount) {
      alert(`Payment cannot exceed balance of ${formatCurrency(invoice.balanceAmount)}`);
      return;
    }

    setSubmittingPayment(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('/api/v1/payments', {
        invoiceId: invoice.id,
        amount: Number(paymentAmount),
        paymentMethod,
        transactionReference: paymentReference,
        notes: `Direct portal payment for ${invoice.invoiceNumber}`,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setPaymentModalOpen(false);
        fetchInvoiceDetails();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment recording failed');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" /> Paid in Full
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-4 h-4" /> Partially Paid
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-4 h-4" /> Confirmed / Due
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <FileText className="w-4 h-4" /> Draft
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-4 h-4" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <Clock className="w-6 h-6 animate-spin mr-2 text-indigo-400" /> Loading invoice details...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Invoice Not Found</h3>
        <p className="text-sm text-slate-400 mb-4">{error || 'Could not locate invoice records.'}</p>
        <a href="/invoices" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Return to Invoices
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <a
            href="/invoices"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {invoice.invoiceNumber}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Billing Period: <span className="font-mono text-slate-300">{invoice.billingPeriodKey || 'Standard Period'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>

          {invoice.status === 'DRAFT' && (
            <button
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm Invoice
            </button>
          )}

          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && invoice.balanceAmount > 0 && (
            <button
              onClick={() => setPaymentModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-colors"
            >
              <CreditCard className="w-4 h-4" /> Record Payment
            </button>
          )}

          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>

      {/* Invoice Document Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Subtle Watermark for Paid Status */}
        {invoice.status === 'PAID' && (
          <div className="absolute right-12 top-28 rotate-12 pointer-events-none opacity-10 select-none">
            <span className="text-8xl font-black text-emerald-500 border-8 border-emerald-500 px-6 py-2 rounded-2xl uppercase tracking-widest">
              PAID
            </span>
          </div>
        )}

        {/* Brand & Dates Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-lg">
                B
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">Brightloop Software</h3>
                <p className="text-xs text-slate-400">Enterprise Cloud Solutions & Services</p>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400 space-y-1">
              <p>450 Innovation Parkway, Suite 800</p>
              <p>San Francisco, CA 94105, United States</p>
              <p className="font-mono text-slate-500">Tax ID: US-EIN-94-8219482</p>
            </div>
          </div>

          <div className="md:text-right space-y-2">
            <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Tax Invoice</div>
            <div className="text-2xl font-black text-white">{invoice.invoiceNumber}</div>
            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <p>
                <span className="text-slate-500">Issue Date:</span>{' '}
                <span className="font-semibold text-slate-300">
                  {new Date(invoice.issueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </p>
              <p>
                <span className="text-slate-500">Due Date:</span>{' '}
                <span className="font-semibold text-slate-300">
                  {new Date(invoice.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </p>
              {invoice.subscriptionId && (
                <p>
                  <span className="text-slate-500">Subscription:</span>{' '}
                  <a
                    href={`/subscriptions/${invoice.subscriptionId}`}
                    className="text-indigo-400 hover:underline font-mono"
                  >
                    {invoice.subscription?.subscriptionNumber || invoice.subscriptionId.slice(0, 8)}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Billed To Details */}
        <div className="py-6 border-b border-slate-800">
          <div className="text-xs uppercase font-semibold text-slate-500 tracking-wider mb-2">Billed To</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-base font-bold text-white">{invoice.customer?.name || 'Valued Customer'}</div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {invoice.customer?.email}
              </div>
            </div>
            <div className="text-xs text-slate-400">
              <p>{invoice.customer?.customerProfile?.companyName || 'Brightloop Client'}</p>
              <p>{invoice.customer?.customerProfile?.address || '100 Business Blvd, Suite 200'}</p>
              <p>{invoice.customer?.customerProfile?.city || 'Austin'}, {invoice.customer?.customerProfile?.state || 'TX'} {invoice.customer?.customerProfile?.zipCode || '78701'}</p>
            </div>
          </div>
        </div>

        {/* Invoice Line Items */}
        <div className="py-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/40 text-xs uppercase font-semibold text-slate-400">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Description</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Tax</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {(invoice.lines || []).map((line: any, idx: number) => (
                  <tr key={line.id || idx}>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {line.product?.name || line.description || 'Subscription Line Item'}
                      </div>
                      {line.variant && (
                        <div className="text-xs text-slate-400">
                          Variant: {line.variant.name} ({line.variant.sku})
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium">{line.quantity}</td>
                    <td className="py-3.5 px-4 text-right font-medium">{formatCurrency(line.unitPrice)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400">{formatCurrency(line.taxAmount || 0)}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">{formatCurrency(line.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col md:flex-row justify-between items-start pt-6 border-t border-slate-800 gap-6">
            <div className="text-xs text-slate-400 max-w-sm space-y-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Payment Instructions & Guarantee
              </div>
              <p>
                All software licenses and recurring subscriptions are governed by Brightloop Master Service Agreement. Please reference invoice number with wire transfer.
              </p>
            </div>

            <div className="w-full md:w-72 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-200">
                  {formatCurrency((invoice.totalAmount || 0) - (invoice.taxAmount || 0))}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax Total</span>
                <span className="font-semibold text-slate-200">{formatCurrency(invoice.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Due</span>
                <span className="text-indigo-400">{formatCurrency(invoice.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Paid to Date</span>
                <span className="font-semibold text-emerald-400">
                  {formatCurrency(invoice.paidAmount || ((invoice.totalAmount || 0) - (invoice.balanceAmount || 0)))}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800">
                <span className="text-white">Remaining Balance</span>
                <span className={invoice.balanceAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                  {formatCurrency(invoice.balanceAmount || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payments History Table */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-400" /> Payment History
          </h4>

          {(!invoice.payments || invoice.payments.length === 0) ? (
            <p className="text-xs text-slate-500 py-3 italic">
              No payments recorded against this invoice yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/40 font-semibold text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {invoice.payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 text-slate-400">{new Date(p.paymentDate || p.createdAt).toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-indigo-300">{p.transactionReference || p.id.slice(0, 8)}</td>
                      <td className="py-2.5 px-3">{p.paymentMethod}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {p.status || 'COMPLETED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Record Payment
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-semibold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 mt-4">
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-xs space-y-1">
                <div className="text-slate-400">Invoice: <span className="font-semibold text-white">{invoice.invoiceNumber}</span></div>
                <div className="text-slate-400">Total: <span className="font-semibold text-white">{formatCurrency(invoice.totalAmount)}</span></div>
                <div className="text-slate-400">Remaining Balance: <span className="font-semibold text-emerald-400">{formatCurrency(invoice.balanceAmount)}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={invoice.balanceAmount}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Overpayment prevention active: Max payable is {formatCurrency(invoice.balanceAmount)}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="BANK_TRANSFER">Bank Transfer / Wire</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="MANUAL_OFFLINE">Manual / Check</option>
                  <option value="AUTO_DEBIT">Automated Direct Debit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {submittingPayment ? 'Saving...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
