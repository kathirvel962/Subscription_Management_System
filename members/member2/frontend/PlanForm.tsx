import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, X, Save, AlertCircle } from 'lucide-react';

interface PlanFormProps {
  initialPlan?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PlanForm: React.FC<PlanFormProps> = ({ initialPlan, onSuccess, onCancel }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState(initialPlan?.name || '');
  const [description, setDescription] = useState(initialPlan?.description || '');
  const [productId, setProductId] = useState(initialPlan?.productId || '');
  const [billingFrequency, setBillingFrequency] = useState(initialPlan?.billingFrequency || 'MONTHLY');
  const [minQuantity, setMinQuantity] = useState<number>(initialPlan?.minQuantity || 1);
  const [basePrice, setBasePrice] = useState<number>(initialPlan?.basePrice || 1000);
  const [availableFrom, setAvailableFrom] = useState(
    initialPlan?.availableFrom ? new Date(initialPlan.availableFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [availableUntil, setAvailableUntil] = useState(
    initialPlan?.availableUntil ? new Date(initialPlan.availableUntil).toISOString().split('T')[0] : ''
  );
  const [autoClose, setAutoClose] = useState(initialPlan?.autoClose ?? false);
  const [earlyClosureAllowed, setEarlyClosureAllowed] = useState(initialPlan?.earlyClosureAllowed ?? true);
  const [pauseAllowed, setPauseAllowed] = useState(initialPlan?.pauseAllowed ?? true);
  const [renewalAllowed, setRenewalAllowed] = useState(initialPlan?.renewalAllowed ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProducts(res.data.data);
        if (!productId && res.data.data.length > 0) {
          setProductId(res.data.data[0].id);
          setBasePrice(res.data.data[0].salesPrice);
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleProductSelect = (id: string) => {
    setProductId(id);
    const prod = products.find((p) => p.id === id);
    if (prod) {
      setBasePrice(prod.salesPrice);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (availableUntil && new Date(availableUntil) <= new Date(availableFrom)) {
      setError('Available until date must be after available from date.');
      return;
    }
    setError(null);
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        name,
        description,
        productId,
        billingFrequency,
        minQuantity: Number(minQuantity),
        basePrice: Number(basePrice),
        availableFrom,
        availableUntil: availableUntil || null,
        autoClose,
        earlyClosureAllowed,
        pauseAllowed,
        renewalAllowed,
      };

      if (initialPlan?.id) {
        await axios.patch(`/api/v1/plans/${initialPlan.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/v1/plans', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save subscription plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {initialPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Plan Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Monthly Professional Plan"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Related Product *</label>
              <select
                required
                value={productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Base: ₹{p.salesPrice})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Billing Frequency *</label>
              <select
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Base Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Min Quantity</label>
              <input
                type="number"
                min="1"
                value={minQuantity}
                onChange={(e) => setMinQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Available From *</label>
              <input
                type="date"
                required
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Available Until (Optional)</label>
              <input
                type="date"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Plan Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="Terms, tier features, or billing policies"
            />
          </div>

          {/* Business Rules Toggles */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Plan Lifecycle Permissions</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={earlyClosureAllowed}
                  onChange={(e) => setEarlyClosureAllowed(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-medium text-slate-700">Allow Early Closure</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pauseAllowed}
                  onChange={(e) => setPauseAllowed(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-medium text-slate-700">Allow Pause / Resume</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={renewalAllowed}
                  onChange={(e) => setRenewalAllowed(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-medium text-slate-700">Allow Renewals</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoClose}
                  onChange={(e) => setAutoClose(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="font-medium text-slate-700">Auto-Close on Expiry</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
