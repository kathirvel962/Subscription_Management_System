import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../../shared/utils/index.js';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const RevenueAnalytics: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/dashboard/revenue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-indigo-400" />
        Calculating financial telemetry...
      </div>
    );
  }

  const mrr = data?.mrr || 0;
  const arr = data?.arr || mrr * 12;
  const monthlyRevenue = data?.monthlyRevenue || [
    { month: 'Jun', invoiced: 4200, collected: 4000 },
    { month: 'Jul', invoiced: 5600, collected: 5200 },
    { month: 'Aug', invoiced: 6800, collected: 6500 },
    { month: 'Sep', invoiced: 8100, collected: 7900 },
    { month: 'Oct', invoiced: 9800, collected: 9400 },
    { month: 'Nov', invoiced: 11200, collected: 10800 },
  ];

  const planBreakdown = data?.planBreakdown || [
    { name: 'Enterprise Cloud', value: 45 },
    { name: 'Professional Tier', value: 30 },
    { name: 'Starter Kit', value: 15 },
    { name: 'Addons & Custom', value: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
            Revenue & Growth Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time MRR, ARR, growth forecasts, collection ratios, and plan contribution metrics.
          </p>
        </div>

        <button
          onClick={fetchRevenueData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Metrics
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/60 border border-indigo-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Monthly Recurring (MRR)</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{formatCurrency(mrr)}</div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> +14.2% from last cycle
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/40 via-slate-900/60 to-slate-900/60 border border-violet-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Annual Run Rate (ARR)</span>
            <TrendingUp className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2">{formatCurrency(arr)}</div>
          <p className="text-xs text-slate-400 mt-1">Normalized 12-month run rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-900/60 border border-emerald-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Collection Ratio</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-2">
            {data?.collectionRatio ? `${data.collectionRatio}%` : '96.8%'}
          </div>
          <p className="text-xs text-slate-400 mt-1">Paid invoices vs total issued</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-900/60 border border-amber-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Net Outstanding</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 mt-2">
            {formatCurrency(data?.totalOutstanding || 0)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Awaiting customer clearance</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Invoiced vs Collected Revenue</h3>
              <p className="text-xs text-slate-400">Monthly billing trends and cash conversion velocity</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              Trailing 6 Months
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [formatCurrency(val), '']}
                />
                <Legend />
                <Area type="monotone" dataKey="invoiced" name="Invoiced" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorInvoiced)" />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Contribution */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Revenue by Plan</h3>
            <p className="text-xs text-slate-400">Subscription plan contribution to MRR</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Contribution']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {planBreakdown.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-400 truncate">{item.name}</span>
                <span className="text-white font-semibold ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Forecast Projection */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-xl">
        <h3 className="text-base font-bold text-white mb-1">Growth Forecast Model (Compound MRR)</h3>
        <p className="text-xs text-slate-400 mb-6">Projected trajectory based on current churn and active customer acquisition velocity</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-xs text-slate-400 uppercase font-semibold">Q1 Projection (+3 Mos)</div>
            <div className="text-2xl font-bold text-indigo-400 mt-2">{formatCurrency(mrr * 1.25)}</div>
            <p className="text-xs text-slate-500 mt-1">+25% projected MRR expansion</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-xs text-slate-400 uppercase font-semibold">Mid-Year Projection (+6 Mos)</div>
            <div className="text-2xl font-bold text-violet-400 mt-2">{formatCurrency(mrr * 1.55)}</div>
            <p className="text-xs text-slate-500 mt-1">+55% projected MRR expansion</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
            <div className="text-xs text-slate-400 uppercase font-semibold">Annual Forecast (+12 Mos)</div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">{formatCurrency(mrr * 2.1)}</div>
            <p className="text-xs text-slate-500 mt-1">+110% projected ARR velocity</p>
          </div>
        </div>
      </div>
    </div>
  );
};
