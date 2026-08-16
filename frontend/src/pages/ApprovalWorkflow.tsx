import React, { useEffect, useState } from 'react';
import { CheckSquare, AlertTriangle, CheckCircle2, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchApprovalRequests, approveRateRequest, rejectRateRequest } from '../services/api';
import { RateChangeRequest } from '../types';
import { useAuth } from '../context/AuthContext';

export const ApprovalWorkflow: React.FC = () => {
  const { role, canPerform } = useAuth();
  const [requests, setRequests] = useState<RateChangeRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string>('');

  const canApprove = canPerform('approveRateRequest');

  const loadRequests = () => {
    setLoading(true);
    fetchApprovalRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveRateRequest(id);
      setActionMessage('Rate change request approved! New rate is now active in Rate Master.');
      setTimeout(() => setActionMessage(''), 3000);
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectRateRequest(id);
      setActionMessage('Rate change request rejected.');
      setTimeout(() => setActionMessage(''), 3000);
      loadRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const processedRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sticky Section Header */}
      <div className="sticky top-0 z-20 -mt-6 -mx-6 px-6 pt-4 pb-4 md:-mt-8 md:-mx-8 md:px-8 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-[#ef7e2d]" /> Rate Approval Workflow
          </h1>
          <p className="text-xs text-slate-500">
            Prevents unauthorized price updates. New rates become active across BOQs only after manager approval.
          </p>
        </div>
      </div>


      {actionMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          {actionMessage}
        </div>
      )}

      {/* Role Notice */}
      {!canApprove && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <strong>Permission Notice:</strong> You are currently viewing as <em>{role}</em>. Switch role to <strong>Approver</strong> or <strong>Admin</strong> in the top header to approve or reject pending rate proposals.
          </div>
        </div>
      )}

      {/* Pending Queue Section (Matches Prompt Screen 10) */}
      <div className="space-y-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" /> Pending Approval Queue ({pendingRequests.length})
        </h2>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading queue...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 text-xs">
            No pending rate change requests. All master rates are approved.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRequests.map((req) => {
              const diffPct = (((req.new_rate - req.old_rate) / req.old_rate) * 100).toFixed(1);
              const isIncrease = req.new_rate > req.old_rate;

              return (
                <div
                  key={req.id}
                  className="rounded-2xl border-2 border-amber-400 bg-white p-6 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                        <AlertTriangle className="h-3 w-3 text-amber-600" /> ⚠ Rate Change Requires Approval
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{req.product_code}</span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">{req.product_name}</h3>

                    {/* Side-by-side Old Rate vs New Rate */}
                    <div className="my-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200">
                      <div>
                        <div className="text-[10px] font-extrabold uppercase text-slate-400">Old Rate</div>
                        <div className="text-base font-extrabold text-slate-600 mt-0.5">
                          Rs. {req.old_rate.toLocaleString()} <span className="text-[10px] font-normal">/ {req.unit}</span>
                        </div>
                      </div>

                      <div className="border-l border-slate-200 pl-3">
                        <div className="text-[10px] font-extrabold uppercase text-blue-600">New Proposed Rate</div>
                        <div className="text-base font-black text-blue-900 mt-0.5 flex items-center gap-1">
                          Rs. {req.new_rate.toLocaleString()}
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isIncrease ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {isIncrease ? `+${diffPct}%` : `${diffPct}%`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 space-y-1">
                      <div><strong>Reason:</strong> {req.reason}</div>
                      <div><strong>Requested by:</strong> {req.requested_by}</div>
                    </div>
                  </div>

                  {/* Approve / Reject Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      disabled={!canApprove}
                      onClick={() => handleReject(req.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-40 transition-colors"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                    <button
                      disabled={!canApprove}
                      onClick={() => handleApprove(req.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 disabled:opacity-40 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve Rate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History of Processed Requests */}
      <div className="pt-6 border-t border-slate-200">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
          Recently Processed Approvals
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Product</th>
                <th className="py-2.5 px-4">Rate Change</th>
                <th className="py-2.5 px-4">Requested By</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedRequests.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 px-4 font-bold text-slate-800">{r.product_name}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    Rs. {r.old_rate} → Rs. {r.new_rate} / {r.unit}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">{r.requested_by}</td>
                  <td className="py-2.5 px-4 font-bold">
                    {r.status === 'APPROVED' ? (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        ✓ APPROVED
                      </span>
                    ) : (
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px]">
                        ✕ REJECTED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
