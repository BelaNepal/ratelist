import React, { useEffect, useState } from 'react';
import { Calculator, Cpu, Factory, Sliders, ArrowRight, Save, Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchBOMCalculation, saveBOMApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CostingEngine: React.FC = () => {
  const { canPerform } = useAuth();
  const canSaveBOM = canPerform('saveBOM');
  // Direct Costing Engine Simulator State
  const [materialCost, setMaterialCost] = useState<number>(2450000);
  const [labourCost, setLabourCost] = useState<number>(350000);
  const [transportCost, setTransportCost] = useState<number>(120000);
  const [installationCost, setInstallationCost] = useState<number>(180000);
  const [overheadPct, setOverheadPct] = useState<number>(5);
  const [profitPct, setProfitPct] = useState<number>(12);

  // BOM State
  const [selectedProductId, setSelectedProductId] = useState<string>('prod_eps_50');
  const [bomData, setBomData] = useState<any>(null);
  const [loadingBom, setLoadingBom] = useState<boolean>(true);
  const [savingBom, setSavingBom] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const loadBOM = (pid: string) => {
    setLoadingBom(true);
    fetchBOMCalculation(pid)
      .then((data) => {
        setBomData(data);
      })
      .finally(() => setLoadingBom(false));
  };

  useEffect(() => {
    loadBOM(selectedProductId);
  }, [selectedProductId]);

  // Live BOM Recalculation math
  const handleMaterialChange = (index: number, field: string, value: any) => {
    if (!bomData) return;
    const updatedMaterials = [...bomData.materials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };

    recalculateLocalBOM({ ...bomData, materials: updatedMaterials });
  };

  const handleAddMaterialRow = () => {
    if (!bomData) return;
    const newMaterial = {
      id: 'mat_' + Math.random().toString(36).substring(2, 7),
      material_name: 'New Raw Ingredient',
      qty_per_m2: 1.0,
      unit: 'kg',
      unit_cost: 100
    };
    recalculateLocalBOM({ ...bomData, materials: [...bomData.materials, newMaterial] });
  };

  const handleDeleteMaterialRow = (index: number) => {
    if (!bomData) return;
    const updated = bomData.materials.filter((_: any, i: number) => i !== index);
    recalculateLocalBOM({ ...bomData, materials: updated });
  };

  const handleSliderChange = (field: string, val: number) => {
    if (!bomData) return;
    recalculateLocalBOM({ ...bomData, [field]: val });
  };

  const recalculateLocalBOM = (data: any) => {
    const materialsWithTotals = data.materials.map((m: any) => {
      const qty = Number(m.qty_per_m2) || 0;
      const cost = Number(m.unit_cost) || 0;
      return { ...m, total: Math.round(qty * cost) };
    });

    const raw_materials_cost = materialsWithTotals.reduce((sum: number, m: any) => sum + m.total, 0);
    const labor_cost = Number(data.labor_cost_per_unit) || 0;
    const factory_overhead_pct = Number(data.factory_overhead_percent) || 0;
    const profit_pct = Number(data.profit_margin_percent) || 0;

    const factory_overhead = Math.round((raw_materials_cost + labor_cost) * (factory_overhead_pct / 100));
    const total_factory_cost = raw_materials_cost + labor_cost + factory_overhead;
    const profit_margin = Math.round(total_factory_cost * (profit_pct / 100));
    const suggested_selling_rate = total_factory_cost + profit_margin;

    setBomData({
      ...data,
      materials: materialsWithTotals,
      raw_materials_cost,
      labor_cost,
      factory_overhead,
      total_factory_cost,
      profit_margin,
      suggested_selling_rate
    });
  };

  const handleSaveBOMToDatabase = async () => {
    if (!bomData) return;
    setSavingBom(true);
    setSaveToast(null);
    try {
      const res = await saveBOMApi(bomData);
      if (res.success && res.bom) {
        setBomData(res.bom);
        setSaveToast(`✅ Manufacturing BOM saved to PostgreSQL database!`);
        setTimeout(() => setSaveToast(null), 4000);
      }
    } catch (err: any) {
      alert('Error saving BOM: ' + err.message);
    } finally {
      setSavingBom(false);
    }
  };

  const directCost = materialCost + labourCost + transportCost + installationCost;
  const overheadAmount = Math.round((directCost * overheadPct) / 100);
  const totalCost = directCost + overheadAmount;
  const profitAmount = Math.round((totalCost * profitPct) / 100);
  const sellingPrice = totalCost + profitAmount;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-left">
      {/* Sticky Section Header */}
      <div className="sticky top-0 z-20 -mt-6 -mx-6 px-6 pt-4 pb-4 md:-mt-8 md:-mx-8 md:px-8 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-[#ef7e2d]" /> Costing Engine & Raw Material BOM
            </h1>
            <p className="text-xs text-slate-500">
              Interactive project margin simulator & persistent PostgreSQL manufacturing BOM calculator.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Select Product:</span>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#ef7e2d] cursor-pointer shadow-2xs"
            >
              <option value="prod_eps_50">EPS Panel 50mm</option>
              <option value="prod_eps_75">EPS Panel 75mm</option>
              <option value="prod_eps_100">EPS Panel 100mm</option>
            </select>
          </div>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* SECTION 1: Internal Costing Breakdown Engine */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-600" /> Project Costing & Margin Simulator
            </h2>
            <p className="text-xs text-slate-400">Direct Cost + Overhead + Margin = Selling Price</p>
          </div>
          <span className="rounded bg-blue-50 text-blue-700 px-3 py-1 font-mono text-xs font-bold border border-blue-200">
            Live Math Engine
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Inputs & Sliders */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              1. Direct Cost Inputs (Rs.)
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-700 flex justify-between mb-1">
                <span>Material Cost</span>
                <span className="font-mono text-blue-600">Rs. {materialCost.toLocaleString()}</span>
              </label>
              <input
                type="number"
                value={materialCost}
                onChange={(e) => setMaterialCost(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Labour Cost</label>
                <input
                  type="number"
                  value={labourCost}
                  onChange={(e) => setLabourCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Transportation</label>
                <input
                  type="number"
                  value={transportCost}
                  onChange={(e) => setTransportCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Installation</label>
                <input
                  type="number"
                  value={installationCost}
                  onChange={(e) => setInstallationCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>

            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pt-2">
              2. Overhead & Profit Multipliers (%)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Overhead Rate</span>
                  <span className="text-blue-600">{overheadPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={overheadPct}
                  onChange={(e) => setOverheadPct(Number(e.target.value))}
                  className="w-full cursor-pointer accent-blue-600"
                />
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Profit Margin</span>
                  <span className="text-emerald-600">{profitPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={profitPct}
                  onChange={(e) => setProfitPct(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Right Summary Table */}
          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                Cost & Selling Price Breakdown
              </span>

              <div className="mt-4 space-y-2 text-xs font-medium border-b border-slate-800 pb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Material Cost</span>
                  <span>Rs. {materialCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Labour Cost</span>
                  <span>Rs. {labourCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transportation</span>
                  <span>Rs. {transportCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Installation</span>
                  <span>Rs. {installationCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between font-extrabold text-sm text-slate-200">
                <span>Direct Cost</span>
                <span>Rs. {directCost.toLocaleString()}</span>
              </div>

              <div className="mt-3 space-y-2 text-xs font-medium border-b border-slate-800 pb-4">
                <div className="flex justify-between text-amber-400">
                  <span>Overhead ({overheadPct}%)</span>
                  <span>Rs. {overheadAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-3 flex justify-between font-extrabold text-sm text-slate-200">
                <span>Total Cost</span>
                <span>Rs. {totalCost.toLocaleString()}</span>
              </div>

              <div className="mt-3 flex justify-between text-xs font-bold text-emerald-400">
                <span>Profit Margin ({profitPct}%)</span>
                <span>Rs. {profitAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 border-t-2 border-slate-800 pt-4">
              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Final Selling Price</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                Rs. {sellingPrice.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Persistent Manufacturing BOM Engine (PostgreSQL DB Persisted) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div>
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <Factory className="h-5 w-5 text-purple-600" /> Persistent Manufacturing BOM Engine
            </h2>
            <p className="text-xs text-slate-400">
              Interactive Raw Materials Recipe → Factory Labor & Overhead → PostgreSQL Database Rollup
            </p>
          </div>

          {canSaveBOM && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddMaterialRow}
                className="py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4 text-purple-600" />
                <span>Add Ingredient</span>
              </button>

              <button
                type="button"
                onClick={handleSaveBOMToDatabase}
                disabled={savingBom}
                className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{savingBom ? 'Saving to DB...' : 'Save BOM to Database'}</span>
              </button>
            </div>
          )}
        </div>

        {loadingBom ? (
          <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
            <span>Loading PostgreSQL BOM recipe...</span>
          </div>
        ) : bomData ? (
          <div className="space-y-6">
            {/* Raw Material Recipe Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Raw Material Ingredient</th>
                    <th className="py-3 px-4 text-center">Qty / m² Panel</th>
                    <th className="py-3 px-4 text-center">Unit</th>
                    <th className="py-3 px-4 text-right">Supplier Unit Cost (Rs.)</th>
                    <th className="py-3 px-4 text-right">Material Subtotal (Rs.)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {bomData.materials.map((m: any, idx: number) => (
                    <tr key={m.id || idx} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={m.material_name}
                          onChange={(e) => handleMaterialChange(idx, 'material_name', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800 outline-none focus:border-purple-500"
                        />
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="number"
                          step="0.05"
                          value={m.qty_per_m2}
                          onChange={(e) => handleMaterialChange(idx, 'qty_per_m2', Number(e.target.value))}
                          className="w-20 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-mono text-center font-bold outline-none focus:border-purple-500"
                        />
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="text"
                          value={m.unit}
                          onChange={(e) => handleMaterialChange(idx, 'unit', e.target.value)}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-center font-semibold outline-none focus:border-purple-500"
                        />
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <input
                          type="number"
                          value={m.unit_cost}
                          onChange={(e) => handleMaterialChange(idx, 'unit_cost', Number(e.target.value))}
                          className="w-28 bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold text-right outline-none focus:border-purple-500"
                        />
                      </td>

                      <td className="py-2.5 px-4 text-right font-black text-slate-900">
                        Rs. {(m.total || 0).toLocaleString()}
                      </td>

                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteMaterialRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove Raw Material Row"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right uppercase text-[10px] text-slate-500">
                      Subtotal Raw Material Cost:
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-slate-900 font-black">
                      Rs. {(bomData.raw_materials_cost || 0).toLocaleString()} / m²
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Editable Factory Overhead & Labor Multipliers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Labor Cost / m² (Rs.)
                </label>
                <input
                  type="number"
                  value={bomData.labor_cost_per_unit}
                  onChange={(e) => handleSliderChange('labor_cost_per_unit', Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex justify-between mb-1">
                  <span>Factory Overhead Rate</span>
                  <span className="text-purple-600 font-bold">{bomData.factory_overhead_percent}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={bomData.factory_overhead_percent}
                  onChange={(e) => handleSliderChange('factory_overhead_percent', Number(e.target.value))}
                  className="w-full cursor-pointer accent-purple-600 mt-2"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 flex justify-between mb-1">
                  <span>Profit Margin Rate</span>
                  <span className="text-emerald-600 font-bold">{bomData.profit_margin_percent}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={bomData.profit_margin_percent}
                  onChange={(e) => handleSliderChange('profit_margin_percent', Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-600 mt-2"
                />
              </div>
            </div>

            {/* Manufacturing Cost Flow Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Raw Materials</span>
                <div className="text-lg font-black text-slate-900 mt-1">
                  Rs. {(bomData.raw_materials_cost || 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Factory Labor + OH</span>
                <div className="text-lg font-black text-slate-900 mt-1">
                  Rs. {((bomData.labor_cost || 0) + (bomData.factory_overhead || 0)).toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Production Cost / m²</span>
                <div className="text-lg font-black text-purple-900 mt-1">
                  Rs. {(bomData.total_factory_cost || 0).toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-300 shadow-sm">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Suggested Selling Rate</span>
                <div className="text-xl font-black text-emerald-900 mt-1">
                  Rs. {(bomData.suggested_selling_rate || 0).toLocaleString()} / m²
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
};
