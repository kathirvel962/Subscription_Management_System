import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FileText,
  Search,
  Filter,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  Plus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: { name: string; email: string };
  subscriptionId?: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  balanceAmount: number;
  paidAmount: number;
  status: 'DRAFT' | 'CONFIRMED' | 'PAID' | 'PARTIAL' | 'CANCELLED';
  lines?: any[];
}

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CREDIT_CARD' | 'MANUAL_OFFLINE' | 'AUTO_DEBIT'>('BANK_TRANSFER');
  const [paymentReference, setPaymentReference] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const url = statusFilter === 'ALL'
        ? '/api/v1/invoices'
        : `/api/v1/invoices?status=${statusFilter}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setInvoices(res.data.data.invoices || res.data.data || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`/api/v1/invoices/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setActionMessage({ text: 'Invoice confirmed successfully!', type: 'success' });
        fetchInvoices();
      }
    } catch (err: any) {
      setActionMessage({ text: err.response?.data?.message || 'Failed to confirm invoice', type: 'error' });
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this invoice?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`/api/v1/invoices/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setActionMessage({ text: 'Invoice cancelled.', type: 'success' });
        fetchInvoices();
      }
    } catch (err: any) {
      setActionMessage({ text: err.response?.data?.message || 'Failed to cancel invoice', type: 'error' });
    }
  };

  const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/v1/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice-${invoiceNumber}.pdf`;
      link.click();
    } catch (err: any) {
      alert('Could not download PDF.');
    }
  };

  const openPaymentModal = (invoice: InvoiceItem) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.balanceAmount);
    setPaymentReference(`REF-${Date.now().toString().slice(-6)}`);
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (paymentAmount <= 0) {
      alert('Payment amount must be greater than zero');
      return;
    }
    if (paymentAmount > selectedInvoice.balanceAmount) {
      alert(`Cannot overpay! Maximum allowed is ${formatCurrency(selectedInvoice.balanceAmount)}`);
      return;
    }

    setSubmittingPayment(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('/api/v1/payments', {
        invoiceId: selectedInvoice.id,
        amount: Number(paymentAmount),
        paymentMethod,
        transactionReference: paymentReference,
        notes: `Recorded via portal for ${selectedInvoice.invoiceNumber}`,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setActionMessage({ text: `Payment of ${formatCurrency(paymentAmount)} recorded successfully!`, type: 'success' });
        setPaymentModalOpen(false);
        fetchInvoices();
      }
    } catch (err: any) {
      setActionMessage({ text: err.response?.data?.message || 'Payment recording failed', type: 'error' });
    } finally {
      setSubmittingPayment(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const term = searchTerm.toLowerCase();
    const invNum = inv.invoiceNumber.toLowerCase();
    const custName = (inv.customer?.name || '').toLowerCase();
    const custEmail = (inv.customer?.email || '').toLowerCase();
    return invNum.includes(term) || custName.includes(term) || custEmail.includes(term);
  });

  const getStatusBadge = (status: InvoiceItem['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-3.5 h-3.5" /> Partial
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> Due / Confirmed
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <FileText className="w-3.5 h-3.5" /> Draft
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Summary figures
  const totalInvoiced = invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((acc, curr) => acc + (curr.paidAmount || (curr.totalAmount - curr.balanceAmount) || 0), 0);
  const totalOutstanding = invoices.reduce((acc, curr) => acc + (curr.status !== 'CANCELLED' ? (curr.balanceAmount || 0) : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-400" />
            Invoices Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage billing, monitor payment status, record payments, and download certified tax invoices.
          </p>
        </div>

        <button
          onClick={fetchInvoices}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs underline hover:opacity-80">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Invoiced</span>
            <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><FileText className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{formatCurrency(totalInvoiced)}</div>
          <p className="text-xs text-slate-500 mt-1">{invoices.length} invoices generated</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Collected Revenue</span>
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(totalPaid)}</div>
          <p className="text-xs text-slate-500 mt-1">Successfully cleared payments</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Outstanding Balance</span>
            <span className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><AlertCircle className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{formatCurrency(totalOutstanding)}</div>
          <p className="text-xs text-slate-500 mt-1">Pending customer settlement</p>
        </div>
      </div>

      {/* Controls: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, customer name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['ALL', 'CONFIRMED', 'PARTIAL', 'PAID', 'DRAFT', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="overflow-hidden bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <a href={`/invoices/${inv.id}`} className="hover:text-indigo-300 underline-offset-2 hover:underline">
                        {inv.invoiceNumber}
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{inv.customer?.name || 'Customer'}</div>
                      <div className="text-xs text-slate-400">{inv.customer?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={inv.balanceAmount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                        {formatCurrency(inv.balanceAmount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(inv.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/invoices/${inv.id}`}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {inv.status === 'DRAFT' && (
                          <button
                            onClick={() => handleConfirm(inv.id)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold border border-indigo-500/30 transition-colors"
                            title="Confirm Invoice"
                          >
                            Confirm
                          </button>
                        )}

                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.balanceAmount > 0 && (
                          <button
                            onClick={() => openPaymentModal(inv)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay
                          </button>
                        )}

                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleCancel(inv.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Cancel Invoice"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6">
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
                <div className="text-slate-400">Invoice: <span className="font-semibold text-white">{selectedInvoice.invoiceNumber}</span></div>
                <div className="text-slate-400">Total: <span className="font-semibold text-white">{formatCurrency(selectedInvoice.totalAmount)}</span></div>
                <div className="text-slate-400">Remaining Balance: <span className="font-semibold text-emerald-400">{formatCurrency(selectedInvoice.balanceAmount)}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount to Pay (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedInvoice.balanceAmount}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Overpayment prevention active: Max payable is {formatCurrency(selectedInvoice.balanceAmount)}.
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
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="MANUAL_OFFLINE">Manual / Cash / Check</option>
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
                  placeholder="e.g. TXN-948271"
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
                  {submittingPayment ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
