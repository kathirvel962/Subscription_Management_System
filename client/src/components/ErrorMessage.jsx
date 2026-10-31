import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ message, errors, onDismiss }) => {
  if (!message && (!errors || errors.length === 0)) return null;

  return (
    <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        {message && <p className="font-medium">{message}</p>}
        {Array.isArray(errors) && errors.length > 0 && (
          <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs text-rose-700">
            {errors.map((err, i) => (
              <li key={i}>{typeof err === 'string' ? err : err.msg || JSON.stringify(err)}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
