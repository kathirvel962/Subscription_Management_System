import React, { useState } from 'react';
import { Layers, Plus, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

interface Variant {
  id?: string;
  name: string;
  priceModifier: number;
  sku?: string | null;
  isActive?: boolean;
}

interface ProductVariantManagerProps {
  basePrice: number;
  variants: Variant[];
  onAddVariant: (variant: { name: string; priceModifier: number; sku?: string }) => void;
  readOnly?: boolean;
}

export const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  basePrice,
  variants,
  onAddVariant,
  readOnly = false,
}) => {
  const [name, setName] = useState('');
  const [modifier, setModifier] = useState<number>(0);
  const [sku, setSku] = useState('');

  const handleNameChange = (val: string) => {
    setName(val);
    // Auto-detect Odoo brand: automatically prefill +560 modifier!
    if (/odoo/i.test(val)) {
      setModifier(560);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddVariant({
      name: name.trim(),
      priceModifier: Number(modifier),
      sku: sku.trim() || undefined,
    });
    setName('');
    setModifier(0);
    setSku('');
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" /> Product Variants & Dynamic Pricing
        </h3>
        <span className="text-xs text-slate-500 font-medium">Base Price: {formatCurrency(basePrice)}</span>
      </div>

      {/* Existing Variants Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
            <tr>
              <th className="px-3 py-2 text-left">Variant Name</th>
              <th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2 text-right">Price Modifier</th>
              <th className="px-3 py-2 text-right">Final Selling Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {variants.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-slate-400">
                  No variants added yet.
                </td>
              </tr>
            ) : (
              variants.map((v, i) => {
                const finalPrice = basePrice + Number(v.priceModifier);
                const isOdoo = /odoo/i.test(v.name);
                return (
                  <tr key={i} className={isOdoo ? 'bg-amber-50/50' : ''}>
                    <td className="px-3 py-2 font-medium text-slate-900 flex items-center gap-1.5">
                      {v.name}
                      {isOdoo && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Sparkles className="w-2.5 h-2.5" /> +560 Odoo Rule
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-500 font-mono">{v.sku || '—'}</td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-700">
                      {v.priceModifier >= 0 ? `+${formatCurrency(v.priceModifier)}` : formatCurrency(v.priceModifier)}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-indigo-600">
                      {formatCurrency(finalPrice)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Variant Form */}
      {!readOnly && (
        <form onSubmit={handleAdd} className="pt-2 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-700 mb-2">Add New Variant:</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2">
              <input
                type="text"
                placeholder='e.g. "Odoo Brand" or "Enterprise"'
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Modifier (e.g. 560)"
                value={modifier}
                onChange={(e) => setModifier(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setName('Odoo Brand');
                setModifier(560);
                setSku('BL-ODOO-MOD');
              }}
              className="text-[11px] text-indigo-700 font-semibold hover:underline"
            >
              + Quick Add "Odoo Brand (+560)"
            </button>
            <button
              type="button"
              onClick={() => {
                setName('Enterprise Edition');
                setModifier(1200);
                setSku('BL-ENT-MOD');
              }}
              className="text-[11px] text-indigo-700 font-semibold hover:underline"
            >
              + Quick Add "Enterprise (+1200)"
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
