import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Plus, CheckCircle, Clock, X, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

export const DiscountManagementPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: 10,
    minPurchaseAmount: 1000,
    minQuantity: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    maxUsageCount: 100,
    applicableTo: 'WHOLE_SUBSCRIPTION',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/discounts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setDiscounts(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        '/api/v1/discounts',
        {
          ...form,
          value: Number(form.value),
          minPurchaseAmount: form.minPurchaseAmount ? Number(form.minPurchaseAmount) : null,
          minQuantity: form.minQuantity ? Number(form.minQuantity) : null,
          maxUsageCount: form.maxUsageCount ? Number(form.maxUsageCount) : null,
          endDate: form.endDate || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setForm({
        code: '',
        description: '',
        type: 'PERCENTAGE',
        value: 10,
        minPurchaseAmount: 1000,
        minQuantity: 1,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        maxUsageCount: 100,
        applicableTo: 'WHOLE_SUBSCRIPTION',
        isActive: true,
      });
      fetchDiscounts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create discount rule.');
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-indigo-600" /> Discount Rules & Coupons
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create percentage or fixed discounts with min purchase thresholds, usage limits, and validity windows
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Discount Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading discount rules...</div>
        ) : discounts.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No discount rules configured</p>
          </div>
        ) : (
          discounts.map((d) => {
            const isExhausted = d.maxUsageCount && d.currentUsageCount >= d.maxUsageCount;
            const isExpired = d.endDate && new Date() > new Date(d.endDate);

            return (
              <div
                key={d.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold tracking-wider px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {d.code}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isExhausted || isExpired || !d.isActive
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isExhausted ? 'Exhausted' : isExpired ? 'Expired' : d.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900">
                      {d.type === 'PERCENTAGE' ? `${d.value}% OFF` : `₹${d.value} OFF`}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{d.description || 'Promotional coupon'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Min Purchase:</span>
                      <span className="font-semibold">{d.minPurchaseAmount ? formatCurrency(d.minPurchaseAmount) : 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Usage Progress:</span>
                      <span className="font-semibold">
                        {d.currentUsageCount} / {d.maxUsageCount || 'Unlimited'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scope:</span>
                      <span className="font-semibold">{d.applicableTo === 'WHOLE_SUBSCRIPTION' ? 'Whole Subscription' : 'Specific Products'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Starts: {new Date(d.startDate).toLocaleDateString()}</span>
                  <span>Ends: {d.endDate ? new Date(d.endDate).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Create Discount Rule</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER25"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Discount Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Value {form.type === 'PERCENTAGE' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Min Purchase (₹)</label>
                  <input
                    type="number"
                    value={form.minPurchaseAmount}
                    onChange={(e) => setForm({ ...form, minPurchaseAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">End Date (Expiry)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Max Usages Allowed</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxUsageCount}
                  onChange={(e) => setForm({ ...form, maxUsageCount: parseInt(e.target.value, 10) || 100 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Terms and eligibility"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow"
                >
                  Save Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
