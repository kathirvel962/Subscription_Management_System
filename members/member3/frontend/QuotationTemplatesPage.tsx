import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Copy, Plus, X, Layers, Save, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

export const QuotationTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [planId, setPlanId] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [lines, setLines] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const [tmplRes, prodRes, planRes] = await Promise.all([
        axios.get('/api/v1/quotation-templates', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/products', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/plans', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (tmplRes.data.success) setTemplates(tmplRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (planRes.data.success) setPlans(planRes.data.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = () => {
    if (products.length === 0) return;
    const defaultProd = products[0];
    setLines([
      ...lines,
      {
        productId: defaultProd.id,
        variantId: null,
        quantity: 1,
        unitPrice: defaultProd.salesPrice,
      },
    ]);
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...lines];
    updated[index][field] = value;
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].unitPrice = prod.salesPrice;
        updated[index].variantId = null;
      }
    }
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError('Please add at least one product line to the template.');
      return;
    }
    setError(null);
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        '/api/v1/quotation-templates',
        {
          name,
          description,
          planId: planId || null,
          validityDays: Number(validityDays),
          lines,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setName('');
      setDescription('');
      setLines([]);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save template.');
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Copy className="w-6 h-6 text-indigo-600" /> Reusable Quotation Templates
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pre-configure standard product bundles and plans for rapid sales quote creation
          </p>
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            if (lines.length === 0 && products.length > 0) {
              setLines([{ productId: products[0].id, quantity: 1, unitPrice: products[0].salesPrice }]);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200">
            <Copy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-semibold">No quotation templates configured</p>
          </div>
        ) : (
          templates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description || 'General template'}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Default Plan:</span>
                    <span className="font-semibold text-slate-800">{t.plan?.name || 'Any Plan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Validity Period:</span>
                    <span className="font-semibold text-slate-800">{t.validityDays} Days</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Active Template
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">New Quotation Template</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Standard SaaS Onboarding"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Default Plan</label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="">-- None / Custom --</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Validity (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={validityDays}
                    onChange={(e) => setValidityDays(parseInt(e.target.value, 10) || 30)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Product Lines */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase text-slate-700">Product Lines</h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {lines.map((l, i) => (
                    <div key={i} className="flex gap-2 items-center text-xs">
                      <select
                        value={l.productId}
                        onChange={(e) => handleLineChange(i, 'productId', e.target.value)}
                        className="flex-1 p-1.5 border border-slate-300 rounded bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={l.quantity}
                        onChange={(e) => handleLineChange(i, 'quantity', parseInt(e.target.value, 10) || 1)}
                        className="w-16 p-1.5 border border-slate-300 rounded"
                        placeholder="Qty"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={l.unitPrice}
                        onChange={(e) => handleLineChange(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-24 p-1.5 border border-slate-300 rounded font-semibold"
                        placeholder="Price"
                      />
                      <button
                        type="button"
                        onClick={() => setLines(lines.filter((_, idx) => idx !== i))}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
