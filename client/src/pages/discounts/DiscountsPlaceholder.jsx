import React from 'react';
import { Percent, ShieldAlert } from 'lucide-react';

const DiscountsPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discount Rules & Coupons</h1>
        <p className="text-xs text-slate-500 mt-1">
          Admin-only discount rules: percentage or fixed amount discounts with eligibility rules.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Percent className="w-7 h-7" />
        </div>
        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Module Owner: Member 4
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-3 mb-2">
          Promotional Discounts Engine
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
          Assigned to <strong>Member 4</strong> on branch <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">feature/payments-analytics</code>.
        </p>

        <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-2">
          <p className="font-semibold text-slate-700">Specification & Integration Hooks:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>API: <code className="font-mono text-indigo-600">GET /api/discounts</code>, <code className="font-mono text-indigo-600">POST /api/discounts</code>, <code className="font-mono text-indigo-600">PUT /api/discounts/:id</code></li>
            <li>Types: Fixed amount, Percentage.</li>
            <li>Eligibility checks: Minimum purchase, min quantity, date range, max usage limits.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DiscountsPlaceholder;
