import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Play,
  FileText,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../../shared/utils/index.js';

export const FinanceDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggeringBilling, setTriggeringBilling] = useState(false);
  const [billingResult, setBillingResult] = useState<any>(null);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/dashboard/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualBillingRun = async () => {
    if (!window.confirm('Run manual recurring billing cycle for all due subscriptions right now?')) return;
    setTriggeringBilling(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('/api/v1/billing/trigger', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setBillingResult(res.data.data);
        fetchOverview();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to execute billing run.');
    } finally {
      setTriggeringBilling(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading financial dashboard...</div>;
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Dashboard Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-600" /> Executive Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time MRR, ARR, cash flow, and automated billing engine status
          </p>
        </div>

        <button
          onClick={handleManualBillingRun}
          disabled={triggeringBilling}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          {triggeringBilling ? 'Executing Billing Run...' : 'Run Billing Cycle Now'}
        </button>
      </div>

      {/* Manual Billing Result Notification Banner */}
      {billingResult && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-indigo-900 text-sm">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Billing Cycle Completed Successfully
            </span>
            <button
              onClick={() => setBillingResult(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              &times;
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 py-1 text-slate-700">
            <div>Processed: <strong>{billingResult.processedCount}</strong> active subs</div>
            <div>Invoices Generated: <strong>{billingResult.invoicesGeneratedCount}</strong></div>
            <div>Skipped (not due / duplicate): <strong>{billingResult.skippedCount}</strong></div>
          </div>
          {billingResult.details?.length > 0 && (
            <div className="bg-white p-2 border border-indigo-100 rounded text-slate-600 max-h-24 overflow-y-auto font-mono">
              {billingResult.details.map((d: string, i: number) => (
                <div key={i}>{d}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">MRR</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(data?.mrr || 0)}</div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> Monthly Recurring
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ARR</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(data?.arr || 0)}</div>
            <span className="text-[11px] text-slate-500 font-medium mt-1">Annual Run-rate</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Collected</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {formatCurrency(data?.totalRevenueCollected || 0)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1">Cash received</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overdue Invoices</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {formatCurrency(data?.overdueInvoicesAmount || 0)}
            </div>
            <span className="text-[11px] text-rose-600 font-semibold mt-1">
              {data?.overdueInvoicesCount || 0} invoices past due
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="text-center border-r border-slate-100 last:border-0">
          <p className="text-slate-400 font-medium">Active Subscriptions</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{data?.totalActiveSubscriptions || 0}</p>
        </div>
        <div className="text-center border-r border-slate-100 last:border-0">
          <p className="text-slate-400 font-medium">Customer Accounts</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{data?.totalCustomers || 0}</p>
        </div>
        <div className="text-center border-r border-slate-100 last:border-0">
          <p className="text-slate-400 font-medium">Paid Invoices</p>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">{data?.invoicesCount?.paid || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-slate-400 font-medium">Pending Invoices</p>
          <p className="text-lg font-bold text-amber-600 mt-0.5">{data?.invoicesCount?.pending || 0}</p>
        </div>
      </div>

      {/* Recharts Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Invoiced vs Collected Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Revenue & Invoicing Trends (₹)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="invoiced" name="Amount Invoiced" fill="#E0E7FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" name="Cash Collected" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Receipts Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Recent Daily Payment Inflows (₹)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.paymentTrends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => formatCurrency(val)}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="amount" name="Payment Amount" stroke="#10B981" fill="#D1FAE5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity: Payments & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Recent Payment Receipts
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {data?.recentPayments?.map((p: any) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900">{p.paymentReference}</span>
                  <span className="ml-2 text-slate-500 font-medium">({p.paymentMethod})</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(p.paymentDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 text-sm">{formatCurrency(p.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Subscriptions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" /> Recent Subscriptions Added
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {data?.recentSubscriptions?.map((s: any) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-slate-900">{s.subscriptionNumber}</span>
                  <span className="ml-2 text-slate-500">{s.billingFrequency}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Started: {new Date(s.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{formatCurrency(s.totalAmount)}</span>
                  <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
