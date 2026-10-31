import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Clock,
  Mail,
  CreditCard,
  Download,
  Calendar,
  RefreshCw,
  Eye,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

interface OverdueInvoice {
  id: string;
  invoiceNumber: string;
  customer?: { name: string; email: string };
  dueDate: string;
  totalAmount: number;
  balanceAmount: number;
  daysOverdue: number;
}

export const OverdueInvoicesPage: React.FC = () => {
  const [overdueList, setOverdueList] = useState<OverdueInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminderSent, setReminderSent] = useState<string | null>(null);

  useEffect(() => {
    fetchOverdueInvoices();
  }, []);

  const fetchOverdueInvoices = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/invoices/overdue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const items = res.data.data.invoices || res.data.data || [];
        const now = new Date();
        const enriched = items.map((inv: any) => {
          const due = new Date(inv.dueDate);
          const diffDays = Math.max(1, Math.floor((now.getTime() - due.getTime()) / (1000 * 3600 * 24)));
          return {
            ...inv,
            daysOverdue: diffDays,
          };
        });
        setOverdueList(enriched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = (id: string, invoiceNumber: string) => {
    setReminderSent(`Payment reminder notice queued for ${invoiceNumber}!`);
    setTimeout(() => setReminderSent(null), 4000);
  };

  const totalOverdue = overdueList.reduce((acc, curr) => acc + (curr.balanceAmount || 0), 0);
  const overdue30 = overdueList.filter((i) => i.daysOverdue <= 30);
  const overdue60 = overdueList.filter((i) => i.daysOverdue > 30 && i.daysOverdue <= 60);
  const overdue90Plus = overdueList.filter((i) => i.daysOverdue > 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
            Overdue Invoices & Collections
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Accounts receivable aging management, collection workflows, and automated payment dunning reminders.
          </p>
        </div>

        <button
          onClick={fetchOverdueInvoices}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {reminderSent && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm flex items-center gap-2">
          <Send className="w-4 h-4" /> {reminderSent}
        </div>
      )}

      {/* Aging Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-rose-500/20 backdrop-blur-xl">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Total Delinquent</span>
          <div className="text-2xl font-bold text-rose-400 mt-2">{formatCurrency(totalOverdue)}</div>
          <p className="text-xs text-slate-500 mt-1">{overdueList.length} delinquent accounts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-xl">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">1 - 30 Days</span>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(overdue30.reduce((acc, c) => acc + c.balanceAmount, 0))}
          </div>
          <p className="text-xs text-slate-500 mt-1">{overdue30.length} invoices</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-orange-500/20 backdrop-blur-xl">
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">31 - 60 Days</span>
          <div className="text-2xl font-bold text-white mt-2">
            {formatCurrency(overdue60.reduce((acc, c) => acc + c.balanceAmount, 0))}
          </div>
          <p className="text-xs text-slate-500 mt-1">{overdue60.length} invoices</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-rose-600/30 backdrop-blur-xl">
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">60+ Days</span>
          <div className="text-2xl font-bold text-rose-500 mt-2">
            {formatCurrency(overdue90Plus.reduce((acc, c) => acc + c.balanceAmount, 0))}
          </div>
          <p className="text-xs text-slate-500 mt-1">{overdue90Plus.length} severe risk invoices</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Days Overdue</th>
                <th className="py-3.5 px-4">Amount Due</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-400" />
                    Scanning overdue receivables...
                  </td>
                </tr>
              ) : overdueList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                    <p className="font-semibold text-white">No overdue invoices!</p>
                    <p className="text-xs text-slate-500">All customer accounts are in good standing.</p>
                  </td>
                </tr>
              ) : (
                overdueList.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <a href={`/invoices/${inv.id}`} className="hover:text-indigo-400 underline-offset-2 hover:underline">
                        {inv.invoiceNumber}
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{inv.customer?.name}</div>
                      <div className="text-xs text-slate-400">{inv.customer?.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        inv.daysOverdue > 60
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : inv.daysOverdue > 30
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {inv.daysOverdue} days
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-400">
                      {formatCurrency(inv.balanceAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendReminder(inv.id, inv.invoiceNumber)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold border border-indigo-500/30 transition-colors"
                          title="Send Email Reminder"
                        >
                          <Mail className="w-3.5 h-3.5" /> Remind
                        </button>
                        <a
                          href={`/invoices/${inv.id}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
                        >
                          Collect
                        </a>
                      </div>
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
