import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

interface PaymentItem {
  id: string;
  invoiceId: string;
  invoice?: {
    invoiceNumber: string;
    totalAmount: number;
    customer?: { name: string; email: string };
  };
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'CREDIT_CARD' | 'MANUAL_OFFLINE' | 'AUTO_DEBIT';
  paymentDate: string;
  transactionReference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  notes?: string;
}

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPayments(res.data.data.payments || res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">Credit Card</span>;
      case 'BANK_TRANSFER':
        return <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">Bank Transfer</span>;
      case 'AUTO_DEBIT':
        return <span className="px-2 py-0.5 rounded text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Auto Debit</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-slate-500/10 text-slate-400 border border-slate-500/20">Manual</span>;
    }
  };

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    const ref = (p.transactionReference || '').toLowerCase();
    const invNum = (p.invoice?.invoiceNumber || '').toLowerCase();
    const custName = (p.invoice?.customer?.name || '').toLowerCase();
    const matchesSearch = ref.includes(term) || invNum.includes(term) || custName.includes(term);
    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-emerald-400" />
            Payments & Collections
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete audit trail of all transactions, bank transfers, credit card charges, and settlement confirmations.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Received</span>
            <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><DollarSign className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(totalCollected)}</div>
          <p className="text-xs text-slate-500 mt-1">{payments.length} transactions processed</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Average Settlement</span>
            <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><ArrowUpRight className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(payments.length > 0 ? totalCollected / payments.length : 0)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Per transaction average</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Security & Compliance</span>
            <span className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-blue-400 mt-2">100%</div>
          <p className="text-xs text-slate-500 mt-1">PCI-DSS & Audit compliant</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transaction reference, invoice number, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {['ALL', 'BANK_TRANSFER', 'CREDIT_CARD', 'AUTO_DEBIT', 'MANUAL_OFFLINE'].map((method) => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                methodFilter === method
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {method.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-400" />
                    Loading payment records...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      {p.transactionReference || p.id.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.invoice ? (
                        <a
                          href={`/invoices/${p.invoiceId}`}
                          className="font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {p.invoice.invoiceNumber}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="font-mono text-slate-500">{p.invoiceId.slice(0, 8)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {p.invoice?.customer?.name || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(p.paymentDate).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">{getMethodBadge(p.paymentMethod)}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/payments/${p.id}`}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                      >
                        Receipt
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
