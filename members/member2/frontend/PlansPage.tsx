import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Plus, Filter, CheckCircle2, XCircle, Clock, Edit3 } from 'lucide-react';
import { PlanForm } from './PlanForm.js';
import { formatCurrency } from '../../../shared/utils/index.js';

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
  }, [frequencyFilter]);

  const fetchPlans = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('/api/v1/plans', {
        params: { frequency: frequencyFilter || undefined, isActive: true },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" /> Subscription Plans
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure recurring billing frequencies, min seat quantities, and lifecycle rules
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Filter className="w-4 h-4 text-slate-400 mr-1" />
        {['', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].map((freq) => (
          <button
            key={freq}
            onClick={() => setFrequencyFilter(freq)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              frequencyFilter === freq
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {freq === '' ? 'All Frequencies' : freq}
          </button>
        ))}
      </div>

      {/* Plans List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading plans...</div>
      ) : plans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold">No subscription plans found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {plan.billingFrequency}
                  </span>
                  <button
                    onClick={() => {
                      setEditingPlan(plan);
                      setShowModal(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Edit Plan"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-2">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {plan.description || 'Standard recurring plan'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Recurring Price:</span>
                      <div className="text-2xl font-black text-slate-900">
                        {formatCurrency(plan.basePrice)}
                        <span className="text-xs font-medium text-slate-500 ml-1">
                          /{plan.billingFrequency.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Min Quantity:</span>
                      <div className="text-sm font-bold text-slate-700">
                        {plan.minQuantity} {plan.minQuantity === 1 ? 'seat' : 'seats'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Permissions */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    {plan.pauseAllowed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span>Pause allowed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {plan.earlyClosureAllowed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span>Early closure</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {plan.renewalAllowed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span>Renewals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {plan.autoClose ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>{plan.autoClose ? 'Auto-close on' : 'Manual close'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                <span>Available from: {new Date(plan.availableFrom).toLocaleDateString()}</span>
                {plan.availableUntil && (
                  <span>Until: {new Date(plan.availableUntil).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PlanForm
          initialPlan={editingPlan}
          onSuccess={() => {
            setShowModal(false);
            fetchPlans();
          }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
