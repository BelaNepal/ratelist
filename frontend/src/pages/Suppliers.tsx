import React, { useEffect, useState } from 'react';
import { Truck, CheckCircle2, Award, ArrowDownRight, Phone, Plus, Search, Edit3, Trash2, MapPin, Tag, Calendar, Save, XCircle, AlertCircle, RefreshCw, Layers, DollarSign } from 'lucide-react';
import { fetchSuppliers, createSupplierApi, updateSupplierApi, deleteSupplierApi, addSupplierRateApi, deleteSupplierRateApi } from '../services/api';
import { Supplier, SupplierRate } from '../types';
import { useAuth } from '../context/AuthContext';

export const Suppliers: React.FC = () => {
  const { canPerform } = useAuth();
  const canManageSuppliers = canPerform('addProduct') || canPerform('submitRateRequest');

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rates, setRates] = useState<SupplierRate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [rateModalSupplierId, setRateModalSupplierId] = useState<string | null>(null);

  // Form State - New / Edit Supplier
  const [supName, setSupName] = useState('');
  const [supContactPerson, setSupContactPerson] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supLocation, setSupLocation] = useState('');
  const [supCategory, setSupCategory] = useState('Raw Materials');
  const [supStatus, setSupStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Form State - New Material Rate
  const [matName, setMatName] = useState('');
  const [purchaseRate, setPurchaseRate] = useState<number | ''>('');
  const [matUnit, setMatUnit] = useState('kg');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = () => {
    setLoading(true);
    fetchSuppliers()
      .then((res) => {
        setSuppliers(res.suppliers || []);
        setRates(res.rates || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;
    try {
      const res = await createSupplierApi({
        name: supName,
        contact_person: supContactPerson,
        phone: supPhone,
        location: supLocation,
        category: supCategory,
        status: supStatus
      });
      if (res.success) {
        setToastMessage(`✅ Supplier partner "${supName}" registered in PostgreSQL DB!`);
        setTimeout(() => setToastMessage(null), 4000);
        setShowAddSupplierModal(false);
        resetSupplierForm();
        loadData();
      }
    } catch (err: any) {
      alert('Error creating supplier: ' + err.message);
    }
  };

  const handleUpdateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier || !supName) return;
    try {
      const res = await updateSupplierApi(editingSupplier.id, {
        name: supName,
        contact_person: supContactPerson,
        phone: supPhone,
        location: supLocation,
        category: supCategory,
        status: supStatus
      });
      if (res.success) {
        setToastMessage(`✅ Supplier "${supName}" updated successfully!`);
        setTimeout(() => setToastMessage(null), 4000);
        setEditingSupplier(null);
        resetSupplierForm();
        loadData();
      }
    } catch (err: any) {
      alert('Error updating supplier: ' + err.message);
    }
  };

  const handleDeleteSupplier = async (sup: Supplier) => {
    if (window.confirm(`Are you sure you want to delete vendor "${sup.name}" and all associated rate lines?`)) {
      try {
        const res = await deleteSupplierApi(sup.id);
        if (res.success) {
          setToastMessage(`Supplier "${sup.name}" removed.`);
          setTimeout(() => setToastMessage(null), 4000);
          loadData();
        }
      } catch (err: any) {
        alert('Error deleting supplier: ' + err.message);
      }
    }
  };

  const handleAddRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateModalSupplierId || !matName || purchaseRate === '') return;
    try {
      const targetSup = suppliers.find((s) => s.id === rateModalSupplierId);
      const res = await addSupplierRateApi(rateModalSupplierId, {
        material_name: matName,
        purchase_rate: Number(purchaseRate),
        unit: matUnit,
        effective_date: effectiveDate,
        supplier_name: targetSup?.name
      });
      if (res.success) {
        setToastMessage(`✅ Added purchase price line "${matName}" for vendor!`);
        setTimeout(() => setToastMessage(null), 4000);
        setRateModalSupplierId(null);
        setMatName('');
        setPurchaseRate('');
        loadData();
      }
    } catch (err: any) {
      alert('Error adding rate entry: ' + err.message);
    }
  };

  const handleDeleteRate = async (rateId: string, matNameStr: string) => {
    if (window.confirm(`Delete rate line "${matNameStr}"?`)) {
      try {
        const res = await deleteSupplierRateApi(rateId);
        if (res.success) {
          loadData();
        }
      } catch (err: any) {
        alert('Error deleting rate line: ' + err.message);
      }
    }
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setSupName(sup.name);
    setSupContactPerson(sup.contact_person || '');
    setSupPhone(sup.phone || '');
    setSupLocation(sup.location || '');
    setSupCategory(sup.category || 'Raw Materials');
    setSupStatus(sup.status || 'ACTIVE');
  };

  const resetSupplierForm = () => {
    setSupName('');
    setSupContactPerson('');
    setSupPhone('');
    setSupLocation('');
    setSupCategory('Raw Materials');
    setSupStatus('ACTIVE');
  };

  // Group rates by material name for comparison
  const groupedRates: Record<string, SupplierRate[]> = {};
  rates.forEach((r) => {
    if (!groupedRates[r.material_name]) groupedRates[r.material_name] = [];
    groupedRates[r.material_name].push(r);
  });

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contact_person && s.contact_person.toLowerCase().includes(search.toLowerCase())) ||
      (s.location && s.location.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Sticky Section Header */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 md:px-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Truck className="h-6 w-6 text-[#ef7e2d]" /> Supplier Rate Management & Vendor Vault
            </h1>
            <p className="text-xs text-slate-500">
              PostgreSQL persistent vendor catalog, raw material purchase rates & price comparison.
            </p>
          </div>

          {canManageSuppliers && (
            <button
              onClick={() => {
                resetSupplierForm();
                setShowAddSupplierModal(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-[#ef7e2d] hover:bg-[#ef7e2d]/90 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Add Supplier Partner</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Page Content Body */}
      <div className="p-6 md:p-8 space-y-6">

      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Registered Vendors</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{suppliers.length}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-extrabold text-emerald-600">Active Partners</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {suppliers.filter((s) => s.status === 'ACTIVE').length}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-extrabold text-purple-600">Material Price Lines</span>
          <div className="text-2xl font-black text-purple-600 mt-1">{rates.length}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-extrabold text-slate-400">Database Vault</span>
          <div className="text-xs font-bold text-slate-800 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            PostgreSQL DB Persisted
          </div>
        </div>
      </div>

      {/* SECTION 1: Supplier Rate Comparison Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-amber-500" />
            Material Procurement Price Comparison
          </h2>
          <span className="text-[10px] text-slate-400 font-semibold">Highlights lowest procurement price</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading PostgreSQL supplier rates...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedRates).map(([material, matRates]) => {
              const sorted = [...matRates].sort((a, b) => a.purchase_rate - b.purchase_rate);
              const bestRate = sorted[0];

              return (
                <div key={material} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{material}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {matRates.length} {matRates.length === 1 ? 'Vendor Offer' : 'Vendor Offers'}
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] font-extrabold border border-emerald-200 flex items-center gap-1">
                        <Award className="h-3 w-3 text-emerald-600" /> Best Price Leader
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      {sorted.map((r, idx) => {
                        const isBest = idx === 0;
                        return (
                          <div
                            key={r.id || idx}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                              isBest
                                ? 'bg-emerald-50/60 border-emerald-300 font-bold'
                                : 'bg-slate-50/70 border-slate-200 text-slate-600'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900">{r.supplier_name}</div>
                              <div className="text-[10px] text-slate-400">Effective Date: {r.effective_date}</div>
                            </div>

                            <div className="text-right">
                              <div className={`text-sm font-black ${isBest ? 'text-emerald-700' : 'text-slate-800'}`}>
                                Rs. {Number(r.purchase_rate).toLocaleString()} / {r.unit}
                              </div>
                              {isBest && (
                                <span className="text-[9px] font-extrabold uppercase text-emerald-600">Lowest Offer</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Supplier Vendor Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" /> Supplier Vendor Directory
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor name, location, contact..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[50vh] rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-wider sticky top-0 z-20 shadow-md">
              <tr>
                <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Vendor Partner</th>
                <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Contact Person</th>
                <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Phone / Mobile</th>
                <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Location</th>
                <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Material Category</th>
                <th className="py-3 px-4 text-center bg-slate-900 sticky top-0 z-20">Status</th>
                {canManageSuppliers && <th className="py-3 px-4 text-right bg-slate-900 sticky top-0 z-20">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSuppliers.map((s) => {
                const supRates = rates.filter((r) => r.supplier_id === s.id);
                return (
                  <React.Fragment key={s.id}>
                    <tr className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {s.name}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {supRates.length} {supRates.length === 1 ? 'Rate Entry' : 'Rate Entries'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{s.contact_person || 'N/A'}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{s.phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-slate-600">{s.location || 'Nepal'}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">{s.category}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                          {s.status}
                        </span>
                      </td>
                      {canManageSuppliers && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setRateModalSupplierId(s.id)}
                              className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Add Purchase Price Line"
                            >
                              <Plus className="h-3 w-3" /> Rate Line
                            </button>

                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Edit Supplier Details"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteSupplier(s)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Supplier"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Rate Line Items Accordion for Supplier */}
                    {supRates.length > 0 && (
                      <tr className="bg-slate-50/60 border-b border-slate-200">
                        <td colSpan={canManageSuppliers ? 7 : 6} className="py-2.5 px-8">
                          <div className="space-y-1">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              Vendor Material Price Lines:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {supRates.map((r) => (
                                <div key={r.id} className="p-2 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between">
                                  <div>
                                    <div className="font-bold text-slate-800">{r.material_name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      Rs. {Number(r.purchase_rate).toLocaleString()} / {r.unit}
                                    </div>
                                  </div>
                                  {canManageSuppliers && (
                                    <button
                                      onClick={() => handleDeleteRate(r.id, r.material_name)}
                                      className="p-1 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                                      title="Delete Rate Entry"
                                    >
                                      <XCircle className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {(showAddSupplierModal || editingSupplier) && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                {editingSupplier ? 'Edit Supplier Details' : 'Add New Supplier Partner'}
              </h3>
              <button
                onClick={() => {
                  setShowAddSupplierModal(false);
                  setEditingSupplier(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={editingSupplier ? handleUpdateSupplier : handleCreateSupplier} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Company Name</label>
                <input
                  type="text"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  placeholder="e.g. Shivam Cement Pvt Ltd"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={supContactPerson}
                    onChange={(e) => setSupContactPerson(e.target.value)}
                    placeholder="e.g. Ramesh Adhikari"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    placeholder="+977-9851023456"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location / Factory City</label>
                <input
                  type="text"
                  value={supLocation}
                  onChange={(e) => setSupLocation(e.target.value)}
                  placeholder="e.g. Hetauda Industrial Estate"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={supCategory}
                    onChange={(e) => setSupCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Raw Materials">Raw Materials</option>
                    <option value="Cement & Binding Materials">Cement & Binding</option>
                    <option value="Steel & Metal Framing">Steel & Framing</option>
                    <option value="Polystyrene & Raw Resins">Polystyrene & Resins</option>
                    <option value="Wire Mesh & Fasteners">Wire Mesh & Fasteners</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={supStatus}
                    onChange={(e) => setSupStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSupplierModal(false);
                    setEditingSupplier(null);
                  }}
                  className="py-2 px-4 rounded-xl border text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingSupplier ? 'Update Vendor' : 'Save Supplier Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Material Rate Line Modal */}
      {rateModalSupplierId && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                Add Vendor Purchase Rate Entry
              </h3>
              <button onClick={() => setRateModalSupplierId(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Material Name</label>
                <input
                  type="text"
                  value={matName}
                  onChange={(e) => setMatName(e.target.value)}
                  placeholder="e.g. OPC 53 Grade Cement"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Rate (Rs.)</label>
                  <input
                    type="number"
                    value={purchaseRate}
                    onChange={(e) => setPurchaseRate(e.target.value ? Number(e.target.value) : '')}
                    placeholder="750"
                    required
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-bold outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={matUnit}
                    onChange={(e) => setMatUnit(e.target.value)}
                    placeholder="Bag (50kg)"
                    required
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs outline-none focus:border-purple-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Effective Date</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRateModalSupplierId(null)}
                  className="py-2 px-3 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Rate Line
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
