import React from 'react';
import { Receipt } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InvoicesPlaceholder = () => {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isCustomer ? 'My Invoices' : 'Invoices & Billing'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isCustomer
            ? 'Download invoices, review due dates, and track payment receipts.'
            : 'Automated invoice generation from subscriptions, tax calculations, and status tracking.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-7 h-7" />
        </div>
        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Module Owner: Member 3
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-3 mb-2">
          Recurring Invoices & Tax Calculations
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
          Assigned to <strong>Member 3</strong> on branch <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">feature/subscriptions-invoices</code>.
        </p>

        <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-2">
          <p className="font-semibold text-slate-700">Specification & Integration Hooks:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>API: <code className="font-mono text-indigo-600">GET /api/invoices</code>, <code className="font-mono text-indigo-600">POST /api/invoices</code>, <code className="font-mono text-indigo-600">PATCH /api/invoices/:id/status</code></li>
            <li>Prevent duplicate billing: Unique billing period checks per subscription.</li>
            <li>Status lifecycle: Draft → Confirmed → Paid (or Cancelled).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvoicesPlaceholder;
