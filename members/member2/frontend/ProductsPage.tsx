import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Search, Filter, Layers, Sparkles, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { ProductForm } from './ProductForm.js';
import { formatCurrency } from '../../../shared/utils/index.js';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, [typeFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/products', {
        params: { search: search || undefined, type: typeFilter || undefined, isActive: true },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (err: any) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this product?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/v1/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (err: any) {
      alert('Failed to archive product.');
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" /> Products & Variants Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage software packages, add-ons, services, and dynamic brand variant pricing
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or notes..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-300 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Product Types</option>
            <option value="SOFTWARE">Software</option>
            <option value="SERVICE">Service</option>
            <option value="PHYSICAL">Physical</option>
            <option value="ADD_ON">Add-on</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading catalog...</div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No products found</p>
          <p className="text-slate-400 text-sm mt-1">Get started by adding your first product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const hasOdoo = p.variants?.some((v: any) => /odoo/i.test(v.name));
            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {p.type}
                    </span>
                    {hasOdoo && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Sparkles className="w-3 h-3 text-amber-600" /> Odoo Brand (+560)
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-2">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.notes || 'No description provided.'}</p>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Base Price:</span>
                      <div className="text-xl font-extrabold text-indigo-600">
                        {formatCurrency(p.salesPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Cost:</span>
                      <div className="text-xs font-semibold text-slate-600">
                        {formatCurrency(p.costPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Variants pill list */}
                  {p.variants && p.variants.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Available Variants ({p.variants.length}):
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.variants.map((v: any) => (
                          <span
                            key={v.id || v.name}
                            className={`px-2 py-0.5 rounded text-xs font-medium border ${
                              /odoo/i.test(v.name)
                                ? 'bg-amber-50 text-amber-900 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {v.name} (+{formatCurrency(v.priceModifier)})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setShowModal(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                      title="Archive Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1">
                    Details &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <ProductForm
          initialProduct={editingProduct}
          onSuccess={() => {
            setShowModal(false);
            fetchProducts();
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
