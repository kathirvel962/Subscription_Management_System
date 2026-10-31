import React from 'react';
import { CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PaymentsPlaceholder = () => {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isCustomer ? 'Payment History' : 'Payment Records'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isCustomer
            ? 'Review receipts and verified settlement transactions.'
            : 'Record incoming payments, link to invoices, and reconcile partial or full payments.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs text-center max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-7 h-7" />
        </div>
        <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Module Owner: Member 4
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-3 mb-2">
          Payments & Settlement Reconciliation
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
          Assigned to <strong>Member 4</strong> on branch <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono">feature/payments-analytics</code>.
        </p>

        <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-2">
          <p className="font-semibold text-slate-700">Specification & Integration Hooks:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>API: <code className="font-mono text-indigo-600">GET /api/payments</code>, <code className="font-mono text-indigo-600">POST /api/payments</code></li>
            <li>Supported methods: Cash, Bank transfer, Card, Other.</li>
            <li>Validation: Prevent overpayment, compute outstanding amount dynamically.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPlaceholder;
