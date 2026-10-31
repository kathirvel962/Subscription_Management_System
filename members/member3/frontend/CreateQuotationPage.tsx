import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FileCheck, Plus, Trash2, ArrowLeft, Save, Sparkles, Tag } from 'lucide-react';
import { formatCurrency, calculateLineAmounts } from '../../../shared/utils/index.js';

export const CreateQuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [custRes, planRes, prodRes, taxRes, tmplRes] = await Promise.all([
        axios.get('/api/v1/users/customers', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/plans', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/products', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/taxes', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/v1/quotation-templates', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (custRes.data.success) {
        setCustomers(custRes.data.data);
        if (custRes.data.data.length > 0) setSelectedCustomerId(custRes.data.data[0].id);
      }
      if (planRes.data.success) {
        setPlans(planRes.data.data);
        if (planRes.data.data.length > 0) setSelectedPlanId(planRes.data.data[0].id);
      }
      if (prodRes.data.success) {
        setProducts(prodRes.data.data);
        if (prodRes.data.data.length > 0) {
          const first = prodRes.data.data[0];
          setLines([
            {
              productId: first.id,
              variantId: first.variants?.[0]?.id || null,
              description: first.name,
              quantity: 1,
              unitPrice: first.salesPrice,
              taxId: taxRes.data.data?.[0]?.id || null,
            },
          ]);
        }
      }
      if (taxRes.data.success) setTaxes(taxRes.data.data);
      if (tmplRes.data.success) setTemplates(tmplRes.data.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const applyTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;
    if (tmpl.planId) setSelectedPlanId(tmpl.planId);
    if (tmpl.validityDays) setValidityDays(tmpl.validityDays);
    if (tmpl.lines && tmpl.lines.length > 0) {
      setLines(
        tmpl.lines.map((l: any) => {
          const prod = products.find((p) => p.id === l.productId);
          return {
            productId: l.productId,
            variantId: l.variantId || null,
            description: prod?.name || 'Line Item',
            quantity: l.quantity || 1,
            unitPrice: l.unitPrice,
            taxId: taxes[0]?.id || null,
          };
        })
      );
    }
  };

  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    const updated = [...lines];
    updated[index].productId = prodId;
    updated[index].variantId = prod.variants?.[0]?.id || null;
    updated[index].description = prod.name;
    const modifier = prod.variants?.[0]?.priceModifier ? Number(prod.variants[0].priceModifier) : 0;
    updated[index].unitPrice = Number(prod.salesPrice) + modifier;
    setLines(updated);
  };

  const handleVariantChange = (index: number, variantId: string) => {
    const updated = [...lines];
    const prod = products.find((p) => p.id === updated[index].productId);
    updated[index].variantId = variantId || null;
    if (prod) {
      const variant = prod.variants?.find((v: any) => v.id === variantId);
      const modifier = variant ? Number(variant.priceModifier) : 0;
      updated[index].unitPrice = Number(prod.salesPrice) + modifier;
      if (variant && /odoo/i.test(variant.name)) {
        updated[index].description = `${prod.name} (Odoo Brand Edition)`;
      } else {
        updated[index].description = variant ? `${prod.name} (${variant.name})` : prod.name;
      }
    }
    setLines(updated);
  };

  const addLine = () => {
    if (products.length === 0) return;
    const first = products[0];
    setLines([
      ...lines,
      {
        productId: first.id,
        variantId: first.variants?.[0]?.id || null,
        description: first.name,
        quantity: 1,
        unitPrice: first.salesPrice,
        taxId: taxes[0]?.id || null,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // Dynamic calculations
  let subtotal = 0;
  let taxAmount = 0;
  lines.forEach((l) => {
    const tax = taxes.find((t) => t.id === l.taxId);
    const taxRate = tax ? Number(tax.rate) : 0;
    const amounts = calculateLineAmounts({
      unitPrice: Number(l.unitPrice) || 0,
      quantity: Number(l.quantity) || 1,
      taxRate,
    });
    subtotal += amounts.subtotal;
    taxAmount += amounts.taxAmount;
  });

  const discountAmount = discountApplied ? discountApplied.discountAmount : 0;
  const totalAmount = Number((subtotal - discountAmount + taxAmount).toFixed(2));

  const validateDiscount = async () => {
    if (!discountCode.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        '/api/v1/discounts/validate',
        { code: discountCode, subtotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setDiscountApplied(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Invalid discount coupon');
      setDiscountApplied(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) {
      setError('At least one product line is required.');
      return;
    }
    setError(null);
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post(
        '/api/v1/quotations',
        {
          customerId: selectedCustomerId,
          planId: selectedPlanId,
          validityDays: Number(validityDays),
          discountCode: discountApplied ? discountCode : undefined,
          notes,
          lines,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        navigate('/quotations');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate quotation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      <Link to="/quotations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to Quotations
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" /> Create Customer Quotation
            </h1>
            <p className="text-xs text-slate-300 mt-1">Configure plan, variants, taxes, and dynamic totals</p>
          </div>

          {templates.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Prefill Template:</span>
              <select
                onChange={(e) => applyTemplate(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Choose Template --</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

          {/* Customer & Plan Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Customer / Company *</label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.user?.name} ({c.user?.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Subscription Plan *</label>
              <select
                required
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.billingFrequency} - ₹{p.basePrice})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Validity (Days)</label>
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

          {/* Product Lines Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Quotation Product Lines</h3>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product Line
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Product</th>
                    <th className="px-3 py-2.5 text-left">Variant</th>
                    <th className="px-3 py-2.5 text-left">Tax Rule</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Unit Price</th>
                    <th className="px-3 py-2.5 text-right">Line Total</th>
                    <th className="px-3 py-2.5 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {lines.map((l, idx) => {
                    const currentProd = products.find((p) => p.id === l.productId);
                    const lineSub = (Number(l.unitPrice) || 0) * (Number(l.quantity) || 1);
                    return (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <select
                            value={l.productId}
                            onChange={(e) => handleProductChange(idx, e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded bg-white font-medium"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={l.variantId || ''}
                            onChange={(e) => handleVariantChange(idx, e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded bg-white"
                          >
                            <option value="">No Variant</option>
                            {currentProd?.variants?.map((v: any) => (
                              <option key={v.id} value={v.id}>
                                {v.name} (+₹{v.priceModifier})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={l.taxId || ''}
                            onChange={(e) => {
                              const updated = [...lines];
                              updated[idx].taxId = e.target.value || null;
                              setLines(updated);
                            }}
                            className="w-full p-1.5 border border-slate-200 rounded bg-white"
                          >
                            <option value="">No Tax</option>
                            {taxes.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.rate}%)
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={l.quantity}
                            onChange={(e) => {
                              const updated = [...lines];
                              updated[idx].quantity = parseInt(e.target.value, 10) || 1;
                              setLines(updated);
                            }}
                            className="w-16 p-1.5 border border-slate-200 rounded text-center"
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            step="0.01"
                            value={l.unitPrice}
                            onChange={(e) => {
                              const updated = [...lines];
                              updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                              setLines(updated);
                            }}
                            className="w-24 p-1.5 border border-slate-200 rounded text-right font-semibold"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          {formatCurrency(lineSub)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            disabled={lines.length <= 1}
                            className="text-slate-400 hover:text-red-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Discount & Totals Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Coupon / Discount Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  placeholder="e.g. STARTUP20"
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={validateDiscount}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
                >
                  Apply
                </button>
              </div>
              {discountApplied && (
                <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Coupon "{discountApplied.discount?.code}" applied (-{formatCurrency(discountAmount)})
                </p>
              )}

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Customer requirements or terms"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Financial Summary Card */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Taxes:</span>
                <span className="font-semibold">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-extrabold text-slate-900 text-base">Total Amount:</span>
                <span className="font-black text-2xl text-indigo-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/quotations"
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating...' : 'Generate Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
