import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  ArrowLeft,
  Calendar,
  Building,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SubscriptionTimeline } from './SubscriptionTimeline.js';
import { formatCurrency } from '../../../shared/utils/index.js';

export const SubscriptionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('STAFF');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setUserRole(JSON.parse(user).role);
    if (id) fetchSubscription(id);
  }, [id]);

  const fetchSubscription = async (subId: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/v1/subscriptions/${subId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSub(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    if (!window.confirm('Pause this active subscription?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/api/v1/subscriptions/${id}/pause`, { reason: 'Paused via details page' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscription(id!);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to pause');
    }
  };

  const handleResume = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/api/v1/subscriptions/${id}/resume`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscription(id!);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to resume');
    }
  };

  const handleRenew = async () => {
    if (!window.confirm('Renew subscription for another billing cycle?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/api/v1/subscriptions/${id}/renew`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscription(id!);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to renew');
    }
  };

  const handleClose = async () => {
    if (!window.confirm('Close subscription contract?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/api/v1/subscriptions/${id}/close`, { reason: 'Closed from details page' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscription(id!);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">Loading subscription details...</div>;
  if (!sub) {
    return (
      <div className="p-12 text-center">
        <p className="font-bold text-slate-700">Subscription not found</p>
        <Link to="/subscriptions" className="text-indigo-600 text-sm mt-2 inline-block">
          &larr; Back to subscriptions
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
      case 'PAUSED':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'CLOSED':
        return 'bg-slate-500/20 text-slate-300 border-slate-400/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <Link
        to={userRole === 'CUSTOMER' ? '/portal/subscriptions' : '/subscriptions'}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Subscriptions
      </Link>

      {/* Main Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black font-mono tracking-tight">{sub.subscriptionNumber}</h1>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusBadge(
                sub.status
              )}`}
            >
              {sub.status}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {sub.customer?.companyName || 'Individual Customer'} &bull; Plan: {sub.plan?.name} (
            {sub.billingFrequency})
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400">Recurring Total</span>
            <div className="text-2xl font-black text-indigo-400">{formatCurrency(sub.totalAmount)}</div>
          </div>

          {userRole !== 'CUSTOMER' && (
            <div className="flex items-center gap-2">
              {sub.status === 'ACTIVE' && (
                <button
                  onClick={handlePause}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause
                </button>
              )}
              {sub.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Resume
                </button>
              )}
              {sub.status === 'ACTIVE' && (
                <button
                  onClick={handleRenew}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Renew
                </button>
              )}
              {sub.status !== 'CLOSED' && (
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Close Early
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Line Items & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscribed Product Lines */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" /> Subscribed Product Items
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Description</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Unit Price</th>
                    <th className="px-3 py-2.5 text-right">Tax</th>
                    <th className="px-3 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {sub.lines?.map((line: any, idx: number) => (
                    <tr key={line.id || idx}>
                      <td className="px-3 py-3 font-semibold text-slate-800">
                        {line.description || 'Subscription Line'}
                      </td>
                      <td className="px-3 py-3 text-center">{line.quantity}</td>
                      <td className="px-3 py-3 text-right">{formatCurrency(line.unitPrice)}</td>
                      <td className="px-3 py-3 text-right text-slate-500">{formatCurrency(line.taxAmount)}</td>
                      <td className="px-3 py-3 text-right font-bold text-indigo-600">
                        {formatCurrency(line.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Related Invoices */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Invoices Generated for this Subscription
            </h3>
            {sub.invoices && sub.invoices.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                {sub.invoices.map((inv: any) => (
                  <div key={inv.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{inv.invoiceNumber}</span>
                      <span className="ml-2 text-slate-400">
                        Date: {new Date(inv.invoiceDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800">{formatCurrency(inv.totalAmount)}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                      <Link
                        to={`/invoices/${inv.id}`}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No invoices generated yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Key Details & Lifecycle Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Agreement Parameters</h3>
            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Terms:</span>
                <span className="font-semibold text-slate-900">{sub.paymentTerms || 'Net 15'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Start Date:</span>
                <span className="font-semibold text-slate-900">
                  {new Date(sub.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Next Billing Date:</span>
                <span className="font-semibold text-indigo-600">
                  {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expiry Date:</span>
                <span className="font-semibold text-slate-900">
                  {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'Auto-renewing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Auto-Close Policy:</span>
                <span className="font-semibold text-slate-900">
                  {sub.autoClose ? 'Yes (closes upon expiry)' : 'No (manual close)'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Change Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" /> Status Change Timeline
            </h3>
            <SubscriptionTimeline events={sub.statusHistory || []} />
          </div>
        </div>
      </div>
    </div>
  );
};
