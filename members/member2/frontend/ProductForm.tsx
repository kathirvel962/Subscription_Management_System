import React, { useState } from 'react';
import axios from 'axios';
import { Package, X, CheckCircle, Save } from 'lucide-react';
import { ProductVariantManager } from './ProductVariantManager.js';

interface ProductFormProps {
  initialProduct?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [type, setType] = useState(initialProduct?.type || 'SOFTWARE');
  const [salesPrice, setSalesPrice] = useState<number>(initialProduct?.salesPrice || 1000);
  const [costPrice, setCostPrice] = useState<number>(initialProduct?.costPrice || 300);
  const [notes, setNotes] = useState(initialProduct?.notes || '');
  const [variants, setVariants] = useState<any[]>(initialProduct?.variants || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddVariant = (newVariant: { name: string; priceModifier: number; sku?: string }) => {
    setVariants([...variants, newVariant]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      if (initialProduct?.id) {
        // Edit product
        await axios.patch(
          `/api/v1/products/${initialProduct.id}`,
          { name, type, salesPrice, costPrice, notes },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new product with variants
        await axios.post(
          '/api/v1/products',
          { name, type, salesPrice, costPrice, notes, variants },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialProduct ? 'Edit Product' : 'Create New Product'}
            </h2>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Software Package"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Product Type *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="SOFTWARE">Software</option>
                <option value="SERVICE">Service</option>
                <option value="PHYSICAL">Physical Product</option>
                <option value="ADD_ON">Add-on Module</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Sales Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={salesPrice}
                onChange={(e) => setSalesPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes / Description</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="Product details, license terms, or internal notes"
            />
          </div>

          {/* Variant Manager */}
          <ProductVariantManager
            basePrice={salesPrice}
            variants={variants}
            onAddVariant={handleAddVariant}
          />

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
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
