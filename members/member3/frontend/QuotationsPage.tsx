import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FileCheck, Plus, CheckCircle2, Clock, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('STAFF');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) setUserRole(JSON.parse(user).role);
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/quotations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setQuotations(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmQuotation = async (id: string) => {
    if (!window.confirm('Convert this quotation into an Active/Confirmed Subscription?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`/api/v1/quotations/${id}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert('Quotation successfully converted to Subscription!');
        fetchQuotations();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to confirm quotation.');
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-indigo-600" /> Sales Quotations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Build proposals from templates, calculate taxes & discounts, and convert to subscriptions
          </p>
        </div>
        {userRole !== 'CUSTOMER' && (
          <div className="flex items-center gap-2">
            <Link
              to="/quotation-templates"
              className="px-3.5 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Templates
            </Link>
            <Link
              to="/quotations/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" /> New Quotation
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider text-left">
            <tr>
              <th className="px-6 py-3.5">Quotation #</th>
              <th className="px-6 py-3.5">Customer / Company</th>
              <th className="px-6 py-3.5">Plan</th>
              <th className="px-6 py-3.5">Valid Until</th>
              <th className="px-6 py-3.5 text-right">Total Amount</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Loading quotations...
                </td>
              </tr>
            ) : quotations.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No quotations created yet.
                </td>
              </tr>
            ) : (
              quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{q.quotationNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {q.customer?.companyName || 'Individual Customer'}
                    </div>
                    <div className="text-xs text-slate-400">{q.customer?.city || 'India'}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{q.plan?.name || 'Standard Plan'}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(q.validityDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-slate-900">
                    {formatCurrency(q.totalAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        q.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {q.status === 'DRAFT' && (
                      <button
                        onClick={() => handleConfirmQuotation(q.id)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Convert to Sub
                      </button>
                    )}
                    {q.status === 'CONFIRMED' && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Subscribed
                      </span>
                    )}
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
