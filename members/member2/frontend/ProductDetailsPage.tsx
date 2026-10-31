import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ArrowLeft, Layers, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (prodId: string) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/v1/products/${prodId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProduct(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="p-12 text-center">
        <p className="text-slate-600 font-bold">Product not found</p>
        <Link to="/products" className="text-indigo-600 text-sm mt-2 inline-block">
          &larr; Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {product.type}
            </span>
            <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Base Sales Price</span>
            <div className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(product.salesPrice)}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Description & Notes</h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {product.notes || 'No notes available for this product.'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-indigo-600" /> Configured Product Variants
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Variant</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-right">Price Modifier</th>
                    <th className="px-4 py-3 text-right">Effective Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {product.variants?.map((v: any) => {
                    const isOdoo = /odoo/i.test(v.name);
                    const effective = Number(product.salesPrice) + Number(v.priceModifier);
                    return (
                      <tr key={v.id || v.name} className={isOdoo ? 'bg-amber-50/40' : ''}>
                        <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                          {v.name}
                          {isOdoo && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                              <Sparkles className="w-3 h-3" /> +560 Odoo Rule
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{v.sku || '—'}</td>
                        <td className="px-4 py-3 text-right text-slate-700 font-medium">
                          +{formatCurrency(v.priceModifier)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-600">
                          {formatCurrency(effective)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
