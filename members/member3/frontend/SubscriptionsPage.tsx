import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Plus,
  Play,
  Pause,
  RotateCcw,
  XCircle,
  Eye,
  Filter,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [userRole, setUserRole] = useState('STAFF');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setUserRole(JSON.parse(user).role);
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/subscriptions', {
        params: { status: statusFilter || undefined },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setSubscriptions(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (id: string) => {
    if (!window.confirm('Pause this active subscription? No recurring invoices will be billed while paused.')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/api/v1/subscriptions/${id}/pause`, { reason: 'Paused via management table' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to pause subscription.');
    }
  };

  const handleResume = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/api/v1/subscriptions/${id}/resume`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to resume subscription.');
    }
  };

  const handleRenew = async (id: string) => {
    if (!window.confirm('Renew this subscription for another full billing cycle?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/api/v1/subscriptions/${id}/renew`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to renew subscription.');
    }
  };

  const handleClose = async (id: string) => {
    if (!window.confirm('Are you sure you want to close this subscription early?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`/api/v1/subscriptions/${id}/close`, { reason: 'Closed early by staff request.' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubscriptions();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to close subscription.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PAUSED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CLOSED':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'DRAFT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" /> Subscriptions Lifecycle
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage contract activations, pause/resume cycles, renewals, and automatic closures
          </p>
        </div>
        {userRole !== 'CUSTOMER' && (
          <Link
            to="/subscriptions/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Subscription
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {['', 'ACTIVE', 'CONFIRMED', 'PAUSED', 'CLOSED', 'DRAFT'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === s
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {s === '' ? 'All Statuses' : s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
            <tr>
              <th className="px-6 py-3.5">Subscription #</th>
              <th className="px-6 py-3.5">Customer</th>
              <th className="px-6 py-3.5">Plan / Frequency</th>
              <th className="px-6 py-3.5">Next Billing</th>
              <th className="px-6 py-3.5 text-right">Recurring Total</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Loading subscriptions...
                </td>
              </tr>
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No subscriptions found.
                </td>
              </tr>
            ) : (
              subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">
                    <Link to={`/subscriptions/${sub.id}`} className="hover:text-indigo-600">
                      {sub.subscriptionNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {sub.customer?.companyName || 'Individual Customer'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="font-medium text-slate-900">{sub.plan?.name}</span>
                    <span className="ml-2 text-xs font-mono text-slate-400">({sub.billingFrequency})</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-indigo-600">
                    {formatCurrency(sub.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(
                        sub.status
                      )}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/subscriptions/${sub.id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      {userRole !== 'CUSTOMER' && sub.status === 'ACTIVE' && (
                        <button
                          onClick={() => handlePause(sub.id)}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                          title="Pause Subscription"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}

                      {userRole !== 'CUSTOMER' && sub.status === 'PAUSED' && (
                        <button
                          onClick={() => handleResume(sub.id)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Resume Subscription"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}

                      {userRole !== 'CUSTOMER' && sub.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRenew(sub.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Renew Contract"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}

                      {userRole !== 'CUSTOMER' && sub.status !== 'CLOSED' && (
                        <button
                          onClick={() => handleClose(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Close Early"
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
  );
};
