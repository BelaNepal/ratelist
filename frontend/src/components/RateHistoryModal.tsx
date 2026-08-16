import React, { useEffect, useState } from 'react';
import { X, History, TrendingUp, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { fetchRateHistory } from '../services/api';
import { Product, RateVersion } from '../types';
import { formatModernTimestamp } from '../utils/formatters';


interface RateHistoryModalProps {
  productId: string | null;
  onClose: () => void;
}

export const RateHistoryModal: React.FC<RateHistoryModalProps> = ({ productId, onClose }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [versions, setVersions] = useState<RateVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (productId) {
      setLoading(true);
      fetchRateHistory(productId)
        .then((res) => {
          setProduct(res.product);
          setVersions(res.versions);
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Rate Audit & History Lineage</h3>
              <p className="text-xs text-slate-400">Immutable version tracking for price transparency</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-slate-400 text-sm">
              Loading rate version lineage...
            </div>
          ) : product ? (
            <div className="space-y-6">
              {/* Product Info Banner */}
              <div className="flex flex-wrap items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {product.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-lg">{product.name}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Spec: {product.specification} ({product.thickness})
                  </p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <div className="text-xs text-slate-400 font-medium">Current Approved Rate</div>
                  <div className="text-2xl font-extrabold text-slate-900">
                    Rs. {product.current_rate.toLocaleString()} <span className="text-xs font-semibold text-slate-500">/ {product.unit}</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Quote Card */}
              <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50/60 p-4 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  Why rate versioning is crucial:
                </div>
                If a customer asks: <em>"Why was this quotation Rs. 1,850 last month but Rs. 1,920 now?"</em> — you can point to the exact version snapshot active on that quotation date below.
              </div>

              {/* Version History Table / List */}
              <div>
                <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Rate Version Timeline
                </h5>

                <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                  {versions.map((ver, idx) => {
                    const isActive = ver.status === 'ACTIVE';

                    return (
                      <div key={ver.id} className="relative pl-6">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white ${
                            isActive ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-400'
                          }`}
                        />

                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-extrabold text-slate-900">
                                Rs. {ver.rate.toLocaleString()}
                              </span>
                              <span className="text-xs text-slate-500">/ {product.unit}</span>
                              {isActive ? (
                                <span className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  <CheckCircle className="h-3 w-3" /> ACTIVE NOW
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                  <Clock className="h-3 w-3" /> ARCHIVED
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-blue-500" />
                              {formatModernTimestamp(ver.effective_date).full}
                            </span>
                          </div>


                          <div className="mt-2 text-xs text-slate-600">
                            <strong>Reason:</strong> {ver.reason || 'Regular Rate Update'}
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                            <span>Requested by: <strong>{ver.created_by}</strong></span>
                            {ver.approved_by && <span>Approved by: <strong>{ver.approved_by}</strong></span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-center py-6">Product details unavailable.</div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end bg-slate-50 border-t border-slate-100 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
