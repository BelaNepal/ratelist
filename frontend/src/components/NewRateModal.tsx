import React, { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { submitRateChange } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface NewRateModalProps {
  product: Product | null;
  onClose: () => void;
  onSubmitted: () => void;
}

export const NewRateModal: React.FC<NewRateModalProps> = ({ product, onClose, onSubmitted }) => {
  const { userName } = useAuth();
  const [newRate, setNewRate] = useState<string>(product ? String(product.current_rate) : '');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRate || Number(newRate) <= 0) {
      setError('Please enter a valid positive rate');
      return;
    }
    if (!reason.trim()) {
      setError('Reason for rate update is required for audit trail');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await submitRateChange(product.id, Number(newRate), reason, userName);
      onSubmitted();
      onClose();
    } catch (err) {
      setError('Failed to submit rate change request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Submit Rate Change Request</h3>
              <p className="text-xs text-slate-400">Triggers manager approval workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Summary */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <div className="text-xs text-slate-400 font-mono font-bold">{product.code}</div>
            <div className="font-bold text-slate-900 text-sm">{product.name}</div>
            <div className="text-xs text-slate-500 mt-1">
              Category: {product.category} ({product.unit})
            </div>
          </div>

          {/* Rate Comparison Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Current Approved Rate
              </label>
              <div className="text-xl font-extrabold text-slate-700">
                Rs. {product.current_rate.toLocaleString()} <span className="text-xs font-normal">/ {product.unit}</span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-blue-500 p-3 bg-blue-50/50">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 block mb-1">
                New Proposed Rate
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-blue-900">Rs.</span>
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-base font-extrabold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Reason text input */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Reason for Rate Revision <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Raw material cement price increased by 5%, Supplier tariff update..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Warning Banner */}
          <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Once approved by an Approver/Admin, this rate will instantly update all future BOQ calculations and prefab costing engines.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
