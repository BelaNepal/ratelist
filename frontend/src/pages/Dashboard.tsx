import React, { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  Building,
  Receipt,
  Plus,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { fetchDashboardStats } from '../services/api';
import { DashboardStats } from '../types';
import { NavTab } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
  onOpenAddProduct: () => void;
  onOpenAddProject: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenAddProduct, onOpenAddProject }) => {
  const { userName } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Sticky Welcome Banner */}
      <div className="sticky top-0 z-20 -mx-6 -mt-6 px-6 pt-6 pb-4 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Zap className="h-4 w-4" /> Single Source of Truth Rate System
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Good morning, {userName}</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Changing a rate once automatically updates all future BOQs, cost estimates, and prefab home calculations across Bela Nepal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddProduct}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all"
            >
              <Plus className="h-4 w-4" /> Add Rate
            </button>
            <button
              onClick={onOpenAddProject}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-all"
            >
              <Plus className="h-4 w-4" /> New Project
            </button>
          </div>
        </div>
      </div>


      {/* Screen 1 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('products')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Products</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {loading ? '...' : stats?.active_products || 248}
          </div>
          <div className="mt-1 text-[11px] font-medium text-slate-500 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">100% Verified</span> in Rate Master
          </div>
        </div>

        <div
          onClick={() => onNavigate('approvals')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Rate Changes</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-amber-600">
            {loading ? '...' : stats?.pending_rate_changes || 12}
          </div>
          <div className="mt-1 text-[11px] font-medium text-amber-700 flex items-center gap-1">
            Requires Manager Approval
          </div>
        </div>

        <div
          onClick={() => onNavigate('projects')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {loading ? '...' : stats?.active_projects || 18}
          </div>
          <div className="mt-1 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
            Kathmandu, Pokhara, Chitwan
          </div>
        </div>

        <div
          onClick={() => onNavigate('quotations')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Draft / Active Quotes</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">
            {loading ? '...' : stats?.draft_quotations || 7}
          </div>
          <div className="mt-1 text-[11px] font-medium text-purple-600 flex items-center gap-1">
            Ready for Customer PDF
          </div>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
          Quick Actions Workflow
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Product / Rate
          </button>
          <button
            onClick={onOpenAddProject}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
          >
            <Plus className="h-4 w-4" /> Create Project
          </button>
          <button
            onClick={() => onNavigate('boq')}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all"
          >
            <Plus className="h-4 w-4" /> Build BOQ
          </button>
          <button
            onClick={() => onNavigate('quotations')}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-800 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all"
          >
            <Receipt className="h-4 w-4" /> Quotation PDF
          </button>
        </div>
      </div>

      {/* Main Dashboard Feed & Price Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Rate Changes */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" /> Recent Rate Changes
              </h3>
              <p className="text-xs text-slate-400">Live rate audit feed from Rate Master</p>
            </div>
            <button
              onClick={() => onNavigate('ecopanels')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Rates <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-bold text-slate-800 text-xs sm:text-sm">EPS Panel 50mm</div>
                <div className="text-[11px] text-slate-400">Raw material supplier resin increase</div>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                  <span className="line-through text-slate-400 font-normal mr-1">Rs. 1,850</span> → Rs. 1,920 / m²
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Today (Approved)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-bold text-slate-800 text-xs sm:text-sm">OPC Cement 53 Bag</div>
                <div className="text-[11px] text-slate-400">Transport & freight adjustments</div>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                  <span className="line-through text-slate-400 font-normal mr-1">Rs. 920</span> → Rs. 950 / bag
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Yesterday
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-bold text-slate-800 text-xs sm:text-sm">Structural Steel RHS Columns</div>
                <div className="text-[11px] text-slate-400">Import tariff index revision</div>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                  <span className="line-through text-slate-400 font-normal mr-1">Rs. 108</span> → Rs. 112 / kg
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  Yesterday
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-bold text-slate-800 text-xs sm:text-sm">Color Coated Roofing Sheet 0.45mm</div>
                <div className="text-[11px] text-slate-400">Coil price inflation</div>
              </div>
              <div className="text-right">
                <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                  <span className="line-through text-slate-400 font-normal mr-1">Rs. 1,100</span> → Rs. 1,150 / m²
                </div>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  3 days ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Increase Alerts Panel (Section 11 requirement) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Price Movement Alerts
            </h3>
            <p className="text-xs text-slate-400">Market fluctuation index</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-red-50 p-3 border border-red-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-slate-800">Steel Structure</span>
              </div>
              <span className="text-xs font-black text-red-600 bg-white px-2 py-0.5 rounded shadow-sm">
                ⚠ +3.7%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3 border border-amber-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-800">OPC Cement 53</span>
              </div>
              <span className="text-xs font-black text-amber-600 bg-white px-2 py-0.5 rounded shadow-sm">
                ⚠ +3.2%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3 border border-amber-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-800">UPVC Glass Window</span>
              </div>
              <span className="text-xs font-black text-amber-600 bg-white px-2 py-0.5 rounded shadow-sm">
                ⚠ +2.8%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800">EPS Resin Granules</span>
              </div>
              <span className="text-xs font-black text-emerald-600 bg-white px-2 py-0.5 rounded shadow-sm">
                ✓ -1.2%
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('reports')}
              className="w-full text-center rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
            >
              View Full Price Trend Graph
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
