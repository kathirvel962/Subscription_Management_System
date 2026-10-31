import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Repeat,
  Receipt,
  CreditCard,
  Package,
  CalendarDays,
  Percent,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  // Role-specific stats
  const adminStats = [
    { title: 'Total Customers', value: '1,420', change: '+12%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Active Subscriptions', value: '890', change: '+8%', icon: Repeat, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Unpaid Invoices', value: '24', change: '-4%', icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Monthly Revenue', value: '₹4,85,200', change: '+18%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' }
  ];

  const staffStats = [
    { title: 'Open Quotations', value: '18', change: '5 due today', icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Active Subscriptions', value: '890', change: 'Operational', icon: Repeat, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending Invoices', value: '14', change: 'Requires review', icon: Receipt, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Managed Customers', value: '412', change: 'Assigned', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' }
  ];

  const customerStats = [
    { title: 'My Active Plans', value: '2', change: 'Renews in 18d', icon: Repeat, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Pending Invoices', value: '0', change: 'All cleared', icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Paid (YTD)', value: '₹48,000', change: 'Yearly billing', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Account Status', value: 'Good Standing', change: 'Verified', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  const currentStats = role === 'admin' ? adminStats : role === 'staff' ? staffStats : customerStats;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#172554] to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium mb-3 backdrop-blur-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SubscriptIQ Foundation Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="mt-1 text-sm text-blue-200 max-w-xl">
            {role === 'admin'
              ? 'Comprehensive administrative oversight across products, plans, billing, and team users.'
              : role === 'staff'
              ? 'Operational management for customer quotes, subscriptions, and recurring billing.'
              : 'Customer Self-Service Portal. Manage your Brightloop software subscriptions, renewals, and payments.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {role === 'admin' && (
            <Link
              to="/customers"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              Manage Users & Staff
            </Link>
          )}
          {role === 'customer' && (
            <Link
              to="/subscriptions"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              View My Subscriptions
            </Link>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
                <span className="text-xs font-medium text-slate-500">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Roadmap & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Team Architecture & Module Integrations
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Odoo Hackathon – SubscriptIQ 4-Member Division Architecture
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                M1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Member 1 (You) – Foundation, Auth & Integration</h3>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">Active & Ready</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  JWT authentication, RBAC, User APIs, Responsive Layout, Shared Axios, and Git coordination.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                M2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Member 2 – Product & Plan Management</h3>
                  <span className="text-[10px] font-medium text-slate-500">feature/products-plans</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Products, variants (e.g. Odoo brand +560), pricing, Plan models (daily, weekly, monthly, yearly).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                M3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Member 3 – Subscriptions & Invoicing</h3>
                  <span className="text-[10px] font-medium text-slate-500">feature/subscriptions-invoices</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Quotation workflow, subscription lifecycle (Draft → Active → Closed), and automated invoice generation.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                M4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900">Member 4 – Payments, Discounts & Analytics</h3>
                  <span className="text-[10px] font-medium text-slate-500">feature/payments-analytics</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Payment recording (partial, full), discount rules (fixed/percentage), and finance revenue analytics.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">Quick Links</h2>
            <p className="text-xs text-slate-500 mb-4">Direct module endpoints</p>

            <div className="space-y-2">
              <Link
                to="/products"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>Browse Products & Variants</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/plans"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  <span>Subscription Plans</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/subscriptions"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Repeat className="w-4 h-4 text-indigo-600" />
                  <span>Subscriptions & Quotes</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              <Link
                to="/invoices"
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  <span>Invoices & Billing</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>

              {role === 'admin' && (
                <Link
                  to="/discounts"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Percent className="w-4 h-4 text-indigo-600" />
                    <span>Admin Discount Rules</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="text-[11px] text-slate-400">
              API Base: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">/api</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
