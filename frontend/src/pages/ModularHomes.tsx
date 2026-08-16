import React, { useEffect, useState } from 'react';
import { Home, Layers, Calculator, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { fetchModularTemplates } from '../services/api';
import { ModularHomeTemplate } from '../types';

interface ModularHomesProps {
  onNavigateToBOQ: () => void;
}

export const ModularHomes: React.FC<ModularHomesProps> = ({ onNavigateToBOQ }) => {
  const [templates, setTemplates] = useState<ModularHomeTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchModularTemplates()
      .then((res) => {
        setTemplates(res);
        if (res.length > 0) setSelectedId(res[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-300">
      {/* Sticky Section Header (0px Gap Flush under Navbar) */}
      <div className="sticky top-0 z-20 -mt-6 -mx-6 px-6 pt-4 pb-4 md:-mt-8 md:-mx-8 md:px-8 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Home className="h-6 w-6 text-[#ef7e2d]" /> Modular Prefab Home Rate System
            </h1>
            <p className="text-xs text-slate-500">
              Componentized costing system — Prefab prices update automatically when raw steel or panel rates change
            </p>
          </div>
        </div>
      </div>

      {/* Main Page Content Body */}
      <div className="p-6 space-y-6">



      {/* Concept Alert Banner */}
      <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 p-4 text-xs text-emerald-950 flex items-start gap-3 shadow-sm">
        <Zap className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-extrabold text-sm">⭐ Dynamic Component Cost Rollup Engine</div>
          <p className="mt-1 leading-relaxed text-emerald-800">
            We don't store <em>"2 Bedroom House = Rs. 3,500,000"</em>. Instead, the model stores precise component quantities (Steel + Panels + Doors + Roofing + Labor). When steel or cement prices change in the Rate Master, your prefab house costing updates automatically!
          </p>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedId(t.id)}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition-all ${
              selectedId === t.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="h-4 w-4 text-blue-400" />
            <span>{t.model_name}</span>
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">
              {t.total_area_sqft} sq.ft
            </span>
          </button>
        ))}
      </div>

      {/* Component Rate Breakdown Card */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          Calculating component rates...
        </div>
      ) : activeTemplate ? (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                Prefab Model Breakdown
              </span>
              <h2 className="text-xl font-extrabold mt-1">{activeTemplate.model_name}</h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span>🛏 {activeTemplate.bedrooms} Bedrooms</span>
                <span>🚿 {activeTemplate.bathrooms} Bathrooms</span>
                <span>📐 {activeTemplate.total_area_sqft} sq.ft Floor Area</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium">Calculated Direct Material & Labor Cost</span>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                Rs. {(activeTemplate.calculated_total || 0).toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1">
                <RefreshCw className="h-3 w-3 text-emerald-400" /> Auto-syncs with Rate Master
              </p>
            </div>
          </div>

          {/* Detailed Component Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900 uppercase tracking-wider bg-slate-50 flex items-center justify-between">
              <span>Itemized Sub-Components & Rates</span>
              <span className="text-[10px] text-slate-500 font-normal">Formula: Qty × Live Rate = Total</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Component Item</th>
                  <th className="py-3 px-4 text-center">Unit</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Live Rate</th>
                  <th className="py-3 px-4 text-right">Calculated Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activeTemplate.components.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{comp.name}</td>
                    <td className="py-3 px-4 text-center text-slate-600 font-semibold">{comp.unit}</td>
                    <td className="py-3 px-4 text-center font-bold text-blue-600 bg-blue-50/50">
                      {comp.qty.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700">
                      Rs. {(comp.current_rate || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      Rs. {(comp.amount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-extrabold">
                <tr>
                  <td colSpan={4} className="py-4 px-4 text-right uppercase tracking-wider">
                    Total Component Cost:
                  </td>
                  <td className="py-4 px-4 text-right text-base text-emerald-400">
                    Rs. {(activeTemplate.calculated_total || 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onNavigateToBOQ}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
            >
              Export Component List to BOQ Builder <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
};

