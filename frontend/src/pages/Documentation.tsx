import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Database,
  ShieldCheck,
  Calculator,
  Workflow,
  CheckCircle2,
  Layers,
  ArrowRight,
  Code2,
  Lock,
  Globe,
  Sliders,
  DollarSign,
  FileCheck,
  Terminal,
  Cpu,
  Server
} from 'lucide-react';

export const Documentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'scenarios' | 'boq_engine' | 'db_api'>('architecture');

  return (
    <div className="min-h-full pb-12 animate-in fade-in duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-4 md:px-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <BookOpen className="h-6 w-6 text-[#ef7e2d]" /> System Architecture & Operational Manuals
            </h1>
            <p className="text-xs text-slate-500">
              Interactive technical documentation, PostgreSQL database schemas, rate governance workflows & visual diagrams
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Database Active: <code className="font-mono text-emerald-900 bg-white px-1.5 py-0.5 rounded border border-emerald-200">bela_rate_db</code>
          </div>
        </div>

        {/* Documentation Tab Bar */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto border-t border-slate-200/60 pt-3">
          {[
            { id: 'architecture', label: '1. Architecture & Diagrams', icon: Workflow },
            { id: 'scenarios', label: '2. Rate Governance & Scenarios', icon: ShieldCheck },
            { id: 'boq_engine', label: '3. BOQ Costing & Nepali Formatter', icon: Calculator },
            { id: 'db_api', label: '4. PostgreSQL Schema & API Reference', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-[#ef7e2d]' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* TAB 1: ARCHITECTURE & DIAGRAMS */}
        {activeTab === 'architecture' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Executive Overview Banner */}
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#ef7e2d] bg-[#ef7e2d]/10 px-3 py-1 rounded-full border border-[#ef7e2d]/20">
                  Enterprise Architecture
                </span>
                <span className="text-xs font-mono text-slate-400">PostgreSQL Pool (Port 5432)</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                Bela EcoPanels Rate & Costing Engine System Architecture
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                Built with a high-resilience multi-layer architecture. Fronted by Vite React with real-time South Asian currency digit conversion, powered by Node Express, and connected to PostgreSQL database <code className="text-amber-400 font-mono">bela_rate_db</code> with zero-downtime SQL schema fallback.
              </p>
            </div>

            {/* Visual System Flowchart Diagram */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Workflow className="h-5 w-5 text-[#ef7e2d]" /> End-to-End System Flowchart & Data Architecture
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Step 1 */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">LAYER 1</span>
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Vite React SPA Frontend</h4>
                  <p className="text-xs text-slate-600">
                    Language & Digit Mode Toggle (Roman ↔ Devanagari numerals), Product Master, Eco Panels Rate Cards, BOQ Builder & PDF Export Engine.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">LAYER 2</span>
                    <Server className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Node.js Express Controller</h4>
                  <p className="text-xs text-slate-600">
                    REST API Controller layer handling JWT authentication, rate change requests, BOM calculations, category sync, and live Bela API integration.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">LAYER 3</span>
                    <Database className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">PostgreSQL Enterprise DB</h4>
                  <p className="text-xs text-slate-600">
                    Persistent Database <code className="font-mono text-emerald-900 font-bold">bela_rate_db</code> storing projects, BOQ item files, categories, and custom schema columns.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded">LAYER 4</span>
                    <ShieldCheck className="h-5 w-5 text-amber-600" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">Audit Lineage & Locks</h4>
                  <p className="text-xs text-slate-600">
                    Rate versions are append-only. Old rates are locked in historical snapshots so past BOQs and submitted quotations remain 100% immutable.
                  </p>
                </div>
              </div>
            </div>

            {/* Architecture Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-blue-600" /> Zero-Downtime SQL Fallback Strategy
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If the PostgreSQL connection is undergoing maintenance, the backend automatically falls back to an enterprise in-memory store while maintaining full API contract compatibility. Upon reconnection, SQL tables are synced automatically.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Globe className="h-5 w-5 text-emerald-600" /> Live Bela EcoPanels Official API Sync
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Periodically connects to <code className="text-emerald-700 font-mono">belaecopanels.com/api/products</code> to pull official product titles, thickness dimensions, and product image previews into the rate master repository.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RATE GOVERNANCE & SCENARIOS */}
        {activeTab === 'scenarios' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#ef7e2d]" /> Real-World Rate Governance Scenarios
              </h3>

              <div className="space-y-6 divide-y divide-slate-100">
                {/* Scenario 1 */}
                <div className="pt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                      SCENARIO A
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      Estimator Proposes Rate Increase for EPS 75mm Panel
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Context:</strong> Raw material EPS bead resin cost rises by 8%. Sales Estimator clicks <em>"Request Rate Change"</em> on product EP-075 to propose raising rate from NPR 2,150 to NPR 2,300/m².
                  </p>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs font-mono text-slate-700 space-y-1">
                    <div>1. Estimator fills reason: "Raw material cost surge at factory"</div>
                    <div>2. Request enters <strong>PENDING_APPROVAL</strong> queue in Approval Workflow page.</div>
                    <div>3. Rate Manager reviews audit diff, clicks <strong>APPROVE</strong>.</div>
                    <div>4. System creates new Rate Version <code className="text-blue-700 font-bold">rv_eps75_v5</code> and locks historical snapshot.</div>
                  </div>
                </div>

                {/* Scenario 2 */}
                <div className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      SCENARIO B
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-base">
                      Creating & Saving a Target Group BOQ File to PostgreSQL
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <strong>Context:</strong> Commercial manager creates a new Target Group <em>"Pokhara Mountain Resort - Deluxe Villa"</em>.
                  </p>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs font-mono text-slate-700 space-y-1">
                    <div>1. User selects target group or clicks "Create New Target Group".</div>
                    <div>2. User edits line item quantities, custom descriptions, and labor/transport overheads.</div>
                    <div>3. Clicking <strong>Save Target Group BOQ</strong> triggers POST /api/boq with save_mode: 'overwrite' or 'copy'.</div>
                    <div>4. Data is stored in PostgreSQL table <code className="text-emerald-700 font-bold">boqs</code> and reloaded instantly on future visits.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BOQ ENGINE & NEPALI FORMATTER */}
        {activeTab === 'boq_engine' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-[#ef7e2d]" /> BOQ Costing Formulae & Devanagari Numerals
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" /> BOQ Total Price Formula
                  </h4>
                  <div className="font-mono text-xs text-slate-800 space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                    <div>Direct Materials = ∑ (Qty × Unit Approved Rate)</div>
                    <div>Total Direct Cost = Direct Materials + Labor + Freight + Erection</div>
                    <div>Overhead Amount = Total Direct Cost × Overhead %</div>
                    <div>Profit Margin = (Total Direct + Overhead) × Profit %</div>
                    <div className="font-bold text-emerald-700 pt-1 border-t border-slate-200">Selling Price = Total Direct + Overhead + Profit</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" /> South Asian Lakhs/Crores Grouping
                  </h4>
                  <div className="font-mono text-xs text-slate-800 space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                    <div>Standard Western: 1,234,567.00</div>
                    <div>South Asian Grouping: 12,34,567.00</div>
                    <div>Devanagari Digits: १२,३४,५६७.००</div>
                    <div className="font-bold text-blue-700 pt-1 border-t border-slate-200">Written Words: Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven Rupees Only</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: POSTGRESQL SCHEMA & API REFERENCE */}
        {activeTab === 'db_api' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-[#ef7e2d]" /> PostgreSQL <code className="text-emerald-700 font-mono">bela_rate_db</code> Schema & API Endpoints
              </h3>

              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-sm">Key REST API Endpoints:</h4>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-900 text-slate-200 font-mono text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">HTTP Method</th>
                        <th className="p-3">Endpoint URL</th>
                        <th className="p-3">Description & Parameters</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">GET</td>
                        <td className="p-3 text-blue-300">/api/categories</td>
                        <td className="p-3 text-slate-400">Fetches all persistent categories (merged with product categories)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-amber-400 font-bold">POST</td>
                        <td className="p-3 text-blue-300">/api/categories</td>
                        <td className="p-3 text-slate-400">Inserts new category into PostgreSQL database categories table</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">GET</td>
                        <td className="p-3 text-blue-300">/api/schema-columns</td>
                        <td className="p-3 text-slate-400">Fetches custom user-defined table column rules</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-amber-400 font-bold">POST</td>
                        <td className="p-3 text-blue-300">/api/schema-columns</td>
                        <td className="p-3 text-slate-400">Creates new dynamic custom table field rule in PostgreSQL column_schemas</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-amber-400 font-bold">POST</td>
                        <td className="p-3 text-blue-300">/api/boq</td>
                        <td className="p-3 text-slate-400">Persists Target Group BOQ structure (save_mode: 'overwrite' | 'copy')</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
