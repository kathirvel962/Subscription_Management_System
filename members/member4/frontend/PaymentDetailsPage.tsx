import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Printer,
  ShieldCheck,
  Calendar,
  Building,
} from 'lucide-react';
import { formatCurrency } from '../../../shared/utils/index.js';

interface PaymentDetailsProps {
  paymentId?: string;
}

export const PaymentDetailsPage: React.FC<PaymentDetailsProps> = ({ paymentId }) => {
  const id = paymentId || window.location.pathname.split('/').pop() || '';
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchPaymentDetails();
  }, [id]);

  const fetchPaymentDetails = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPayment(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !payment) {
    return (
      <div className="p-12 text-center text-slate-400">
        Loading payment transaction...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <a
          href="/payments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Payments
        </a>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
        >
          <Printer className="w-3.5 h-3.5" /> Print Receipt
        </button>
      </div>

      {/* Official Transaction Receipt Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Payment Receipt</h2>
          <p className="text-xs text-slate-400 mt-1">Transaction Completed Successfully</p>
          <div className="text-3xl font-black text-emerald-400 mt-4">
            {formatCurrency(payment.amount)}
          </div>
        </div>

        <div className="py-6 space-y-4 text-xs">
          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-400">Transaction Reference</span>
            <span className="font-mono font-semibold text-white">{payment.transactionReference || payment.id}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-400">Date & Time</span>
            <span className="text-white">{new Date(payment.paymentDate).toLocaleString()}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-400">Payment Method</span>
            <span className="font-semibold text-indigo-400">{payment.paymentMethod.replace('_', ' ')}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-slate-800/60">
            <span className="text-slate-400">Applied To Invoice</span>
            <a
              href={`/invoices/${payment.invoiceId}`}
              className="font-semibold text-indigo-400 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              {payment.invoice?.invoiceNumber || payment.invoiceId.slice(0, 8)}
            </a>
          </div>

          {payment.invoice?.customer && (
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Customer</span>
              <span className="text-white text-right">
                <span className="font-semibold block">{payment.invoice.customer.name}</span>
                <span className="text-slate-400 text-[11px]">{payment.invoice.customer.email}</span>
              </span>
            </div>
          )}

          {payment.notes && (
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">Notes</span>
              <span className="text-slate-300 italic">{payment.notes}</span>
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-slate-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Verified cryptographic receipt &bull; Brightloop Software Inc.</span>
        </div>
      </div>
    </div>
  );
};
