import React from 'react';

const STATUS_CONFIGS = {
  // Subscription statuses
  draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  quotation: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  confirmed: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  paused: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },

  // Invoice & Payment statuses
  paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  unpaid: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  overdue: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
  partial: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },

  // User Roles
  admin: { bg: 'bg-navy-50 bg-blue-900/10', text: 'text-blue-950 font-semibold', border: 'border-blue-900/20' },
  staff: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  customer: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },

  // Generic
  true: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Active' },
  false: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Inactive' }
};

const StatusBadge = ({ status, label }) => {
  const normalizedKey = String(status || '').toLowerCase();
  const config = STATUS_CONFIGS[normalizedKey] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200'
  };

  const displayText = label || config.label || (status ? String(status).charAt(0).toUpperCase() + String(status).slice(1) : 'Unknown');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {displayText}
    </span>
  );
};

export default StatusBadge;
