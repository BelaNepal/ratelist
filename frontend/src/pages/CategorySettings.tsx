import React, { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  FolderTree,
  Table,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Save,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Database,
  Layers,
  Home,
  Receipt,
  Truck,
  History,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  X,
  Code,
  FileText,
  Sliders
} from 'lucide-react';
import { fetchProducts } from '../services/api';
import { Product } from '../types';

export type SqlDataType =
  | 'VARCHAR'
  | 'DECIMAL'
  | 'INTEGER'
  | 'BOOLEAN'
  | 'ENUM'
  | 'TEXT'
  | 'JSONB'
  | 'DATE';

export type RoleAccessRight =
  | 'All Roles'
  | 'Rate Manager & Admin'
  | 'Admin Only'
  | 'Estimator & Admin';

export interface ColumnRule {
  key: string;
  label: string;
  type: SqlDataType;
  accessRole: RoleAccessRight;
  visible: boolean;
  required: boolean;
  desc: string;
  isCustom?: boolean;
}

export interface TableSchema {
  id: string;
  tableName: string;
  displayName: string;
  icon: React.ElementType;
  recordCount: number;
  columns: ColumnRule[];
}

export const CategorySettings: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveMessage, setSaveMessage] = useState<string>('');

  // Selected Table State
  const [selectedTableId, setSelectedTableId] = useState<string>('products');

  // Add Custom Column Modal State
  const [showAddColumnModal, setShowAddColumnModal] = useState<boolean>(false);
  const [newColKey, setNewColKey] = useState<string>('');
  const [newColLabel, setNewColLabel] = useState<string>('');
  const [newColType, setNewColType] = useState<SqlDataType>('VARCHAR');
  const [newColRole, setNewColRole] = useState<RoleAccessRight>('All Roles');
  const [newColDesc, setNewColDesc] = useState<string>('');
  const [newColRequired, setNewColRequired] = useState<boolean>(false);

  // Edit Column Modal State
  const [editingColumn, setEditingColumn] = useState<ColumnRule | null>(null);
  const [editColLabel, setEditColLabel] = useState<string>('');
  const [editColType, setEditColType] = useState<SqlDataType>('VARCHAR');
  const [editColRole, setEditColRole] = useState<RoleAccessRight>('All Roles');
  const [editColDesc, setEditColDesc] = useState<string>('');
  const [editColVisible, setEditColVisible] = useState<boolean>(true);

  // Category State
  const [categories, setCategories] = useState([
    { id: 'cat_1', name: 'Eco Panels', code: 'ECO', status: 'Active', vatRate: 13, isDefault: true },
    { id: 'cat_2', name: 'Modular Components', code: 'MOD', status: 'Active', vatRate: 13, isDefault: false },
    { id: 'cat_3', name: 'Accessories', code: 'ACC', status: 'Active', vatRate: 13, isDefault: false },
    { id: 'cat_4', name: 'Services', code: 'SRV', status: 'Active', vatRate: 13, isDefault: false },
    { id: 'cat_5', name: 'Raw Materials', code: 'RAW', status: 'Active', vatRate: 13, isDefault: false }
  ]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');

  // Table Schemas Database Map (Universal Scalable Schema Engine)
  const [tableSchemas, setTableSchemas] = useState<Record<string, TableSchema>>({
    products: {
      id: 'products',
      tableName: 'public.products',
      displayName: 'Product Master Catalog',
      icon: Layers,
      recordCount: 215,
      columns: [
        { key: 'code', label: 'Product Code', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Unique SKU identifier (e.g. EP-050)' },
        { key: 'name', label: 'Product Specification Name', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Full architectural trade title' },
        { key: 'category', label: 'Category Group', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Eco Panels, Modular, Accessories' },
        { key: 'subcategory', label: 'Subcategory Type', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: false, desc: 'Wall Panel, Roof Panel, Floor' },
        { key: 'specification', label: 'Technical Spec Details', type: 'TEXT', accessRole: 'All Roles', visible: true, required: false, desc: 'Core density, CSB board thickness' },
        { key: 'thickness', label: 'Thickness / Size', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: false, desc: '50mm, 75mm, 100mm, 150mm' },
        { key: 'unit', label: 'Base Unit', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'm², sq.ft, kg, pc' },
        { key: 'current_rate', label: 'Approved Rate (NPR)', type: 'DECIMAL', accessRole: 'Rate Manager & Admin', visible: true, required: true, desc: 'Approved baseline catalog rate' },
        { key: 'status', label: 'Publication Status', type: 'ENUM', accessRole: 'All Roles', visible: true, required: false, desc: 'Active vs Inactive listing' },
        { key: 'density', label: 'EPS Core Density (kg/m³)', type: 'DECIMAL', accessRole: 'Admin Only', visible: false, required: false, desc: 'Internal engineering metric' }
      ]
    },
    eco_panels: {
      id: 'eco_panels',
      tableName: 'public.eco_panels_rate',
      displayName: 'Eco Panels Rate Sheet',
      icon: Layers,
      recordCount: 140,
      columns: [
        { key: 'code', label: 'Panel Code', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Panel code' },
        { key: 'name', label: 'Panel Description', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'EPS Sandwich Wall Panel' },
        { key: 'unit', label: 'Billing Unit', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'sq.ft or m²' },
        { key: 'current_rate', label: 'Rate (NPR)', type: 'DECIMAL', accessRole: 'Rate Manager & Admin', visible: true, required: true, desc: 'Approved unit rate' },
        { key: 'facings', label: 'Board Facing Thickness', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: false, desc: '4.5mm CSB facing' }
      ]
    },
    modular_homes: {
      id: 'modular_homes',
      tableName: 'public.modular_templates',
      displayName: 'Modular Prefab Homes Catalog',
      icon: Home,
      recordCount: 6,
      columns: [
        { key: 'id', label: 'Template ID', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Primary key' },
        { key: 'name', label: 'Prefab Model Name', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Bela Villa, Studio 1BHK' },
        { key: 'sqft', label: 'Built-up Area (Sq.Ft)', type: 'INTEGER', accessRole: 'All Roles', visible: true, required: true, desc: 'Total floor area' },
        { key: 'base_price', label: 'Base Budget NPR', type: 'DECIMAL', accessRole: 'Estimator & Admin', visible: true, required: true, desc: 'Calculated component cost' },
        { key: 'erection_days', label: 'Completion Days', type: 'INTEGER', accessRole: 'All Roles', visible: true, required: false, desc: 'Installation timeframe' }
      ]
    },
    quotations: {
      id: 'quotations',
      tableName: 'public.quotations',
      displayName: 'Quotation Register & Proposals',
      icon: Receipt,
      recordCount: 12,
      columns: [
        { key: 'quote_no', label: 'Quotation Number', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'QT-2026-00452' },
        { key: 'client_name', label: 'Customer / Developer', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Client account' },
        { key: 'project_name', label: 'Project Title & Location', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Site location' },
        { key: 'total_npr', label: 'Quoted Total (NPR)', type: 'DECIMAL', accessRole: 'All Roles', visible: true, required: true, desc: 'Net invoice amount' },
        { key: 'discount_pct', label: 'Approved Discount %', type: 'DECIMAL', accessRole: 'Admin Only', visible: true, required: false, desc: 'Executive concession' },
        { key: 'status', label: 'Approval Status', type: 'ENUM', accessRole: 'All Roles', visible: true, required: true, desc: 'Draft vs Sent' }
      ]
    },
    suppliers: {
      id: 'suppliers',
      tableName: 'public.supplier_rates',
      displayName: 'Supplier Procurement Matrix',
      icon: Truck,
      recordCount: 16,
      columns: [
        { key: 'supplier_name', label: 'Supplier / Manufacturer', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Arghakhanchi, Panchakanya' },
        { key: 'material_name', label: 'Raw Material Name', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Structural Steel RHS, EPS Core' },
        { key: 'unit_rate', label: 'Procurement Rate (NPR)', type: 'DECIMAL', accessRole: 'Rate Manager & Admin', visible: true, required: true, desc: 'Factory purchase price' },
        { key: 'lead_time', label: 'Delivery Lead Time', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: false, desc: 'Fulfillment speed' }
      ]
    },
    rate_versions: {
      id: 'rate_versions',
      tableName: 'public.rate_versions',
      displayName: 'Rate History & Lineage Log',
      icon: History,
      recordCount: 340,
      columns: [
        { key: 'id', label: 'Version ID', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Audit revision tag' },
        { key: 'product_id', label: 'Product ID', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Foreign key link' },
        { key: 'rate', label: 'Rate Snapshot (NPR)', type: 'DECIMAL', accessRole: 'All Roles', visible: true, required: true, desc: 'Historical price' },
        { key: 'effective_date', label: 'Effective Date', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: true, desc: 'Approval timestamp' },
        { key: 'approved_by', label: 'Approver Name', type: 'VARCHAR', accessRole: 'All Roles', visible: true, required: false, desc: 'Manager digital signature' }
      ]
    }
  });

  useEffect(() => {
    fetchProducts('All')
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  const selectedTable = tableSchemas[selectedTableId];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      code: newCatCode.trim().toUpperCase() || newCatName.substring(0, 3).toUpperCase(),
      status: 'Active',
      vatRate: 13,
      isDefault: false
    };

    setCategories((prev) => [...prev, newCat]);
    setNewCatName('');
    setNewCatCode('');
    setSaveMessage(`Created category "${newCat.name}" successfully`);
    setTimeout(() => setSaveMessage(''), 4000);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (window.confirm(`Delete category "${name}"? Existing products will remain preserved.`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSaveMessage(`Category "${name}" removed`);
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  const toggleColumnVisibility = (tableId: string, colKey: string) => {
    setTableSchemas((prev) => {
      const targetTable = prev[tableId];
      if (!targetTable) return prev;

      const updatedCols = targetTable.columns.map((col) =>
        col.key === colKey && !col.required ? { ...col, visible: !col.visible } : col
      );

      return {
        ...prev,
        [tableId]: { ...targetTable, columns: updatedCols }
      };
    });
  };

  const changeColumnRole = (tableId: string, colKey: string, newRole: RoleAccessRight) => {
    setTableSchemas((prev) => {
      const targetTable = prev[tableId];
      if (!targetTable) return prev;

      const updatedCols = targetTable.columns.map((col) =>
        col.key === colKey ? { ...col, accessRole: newRole } : col
      );

      return {
        ...prev,
        [tableId]: { ...targetTable, columns: updatedCols }
      };
    });
  };

  // ADD COLUMN HANDLER
  const handleCreateCustomColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColLabel.trim()) return;

    const formattedKey =
      newColKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') ||
      newColLabel.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    if (selectedTable.columns.some((c) => c.key === formattedKey)) {
      alert(`Column key "${formattedKey}" already exists in table ${selectedTable.tableName}!`);
      return;
    }

    const newColumnObj: ColumnRule = {
      key: formattedKey,
      label: newColLabel.trim(),
      type: newColType,
      accessRole: newColRole,
      visible: true,
      required: newColRequired,
      desc: newColDesc.trim() || `Custom field ${newColLabel}`,
      isCustom: true
    };

    setTableSchemas((prev) => {
      const targetTable = prev[selectedTableId];
      return {
        ...prev,
        [selectedTableId]: {
          ...targetTable,
          columns: [...targetTable.columns, newColumnObj]
        }
      };
    });

    setShowAddColumnModal(false);
    setNewColKey('');
    setNewColLabel('');
    setNewColDesc('');
    setNewColRequired(false);

    setSaveMessage(
      `Added column "${newColumnObj.label}" (${newColumnObj.key}) to table ${selectedTable.tableName}!`
    );
    setTimeout(() => setSaveMessage(''), 4000);
  };

  // OPEN EDIT COLUMN MODAL
  const handleOpenEditColumn = (col: ColumnRule) => {
    setEditingColumn(col);
    setEditColLabel(col.label);
    setEditColType(col.type);
    setEditColRole(col.accessRole);
    setEditColDesc(col.desc);
    setEditColVisible(col.visible);
  };

  // SAVE EDITED COLUMN HANDLER
  const handleSaveEditedColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColumn || !editColLabel.trim()) return;

    setTableSchemas((prev) => {
      const targetTable = prev[selectedTableId];
      const updatedCols = targetTable.columns.map((c) => {
        if (c.key === editingColumn.key) {
          return {
            ...c,
            label: editColLabel.trim(),
            type: editColType,
            accessRole: editColRole,
            desc: editColDesc.trim(),
            visible: c.required ? true : editColVisible
          };
        }
        return c;
      });

      return {
        ...prev,
        [selectedTableId]: { ...targetTable, columns: updatedCols }
      };
    });

    setSaveMessage(`Updated column "${editColLabel}" (${editingColumn.key}) in ${selectedTable.tableName}!`);
    setEditingColumn(null);
    setTimeout(() => setSaveMessage(''), 4000);
  };

  // DELETE / REMOVE COLUMN HANDLER
  const handleDeleteColumn = (colKey: string, colLabel: string, isRequired: boolean) => {
    if (isRequired) {
      alert(`System required column "${colLabel}" cannot be deleted as core application functions rely on it.`);
      return;
    }

    if (window.confirm(`Remove column "${colLabel}" (${colKey}) from table ${selectedTable.tableName}?`)) {
      setTableSchemas((prev) => {
        const targetTable = prev[selectedTableId];
        return {
          ...prev,
          [selectedTableId]: {
            ...targetTable,
            columns: targetTable.columns.filter((c) => c.key !== colKey)
          }
        };
      });

      setSaveMessage(`Removed column "${colLabel}" from table ${selectedTable.tableName}`);
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  const handleSaveSettings = () => {
    setSaveMessage(`Saved column schema & access rules for table "${selectedTable.displayName}"!`);
    setTimeout(() => setSaveMessage(''), 4000);
  };

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-300">
      {/* Sticky Section Header (0px Gap Flush under Navbar) */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-4 md:px-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="h-6 w-6 text-[#ef7e2d]" /> Category & Database Schema Manager
            </h1>
            <p className="text-xs text-slate-500">
              Manage product categories, select database tables, and Add / Edit / Remove column schema rules
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 rounded-xl bg-[#ef7e2d] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#ef7e2d]/90 shadow-md shadow-[#ef7e2d]/20 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save Schema Changes
          </button>
        </div>
      </div>

      {/* Main Page Body */}
      <div className="p-6 md:p-8 space-y-6">
        {saveMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* SECTION 1: Category Management Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-blue-600" /> Master Product Categories Table
              </h2>
              <p className="text-xs text-slate-400">Configure catalog categories and tax attributes</p>
            </div>

            {/* Quick Add Category Form */}
            <form onSubmit={handleAddCategory} className="flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="New Category Name (e.g. Solar Prefab)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Code (e.g. SLR)"
                value={newCatCode}
                onChange={(e) => setNewCatCode(e.target.value)}
                className="w-24 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Category
              </button>
            </form>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-[40vh] rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider sticky top-0 z-20 shadow-md">
                <tr>
                  <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Code</th>
                  <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Category Name</th>
                  <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Product Count</th>
                  <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">VAT Rate</th>
                  <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Status</th>
                  <th className="py-3 px-4 text-right bg-slate-900 sticky top-0 z-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {categories.map((c) => {
                  const count = products.filter((p) => p.category === c.name).length;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 bg-blue-50/40">{c.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-extrabold text-slate-700">{count} products</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{c.vatRate}% VAT</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold text-[10px]">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: Interactive Database Tables & Column Access Manager */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" /> System Database Tables Registry
              </h2>
              <p className="text-xs text-slate-500">Click any table below to inspect schema, configure access rights, or Add / Edit / Remove columns</p>
            </div>
          </div>

          {/* Table Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(tableSchemas).map((t) => {
              const IconComp = t.icon;
              const isSelected = t.id === selectedTableId;

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTableId(t.id)}
                  className={`rounded-2xl border p-5 text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                      }`}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {t.recordCount} Records
                    </span>
                  </div>

                  <div className="font-mono text-[10px] text-blue-600 font-bold uppercase tracking-wider">{t.tableName}</div>
                  <h3 className="font-extrabold text-slate-900 text-base mt-0.5">{t.displayName}</h3>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                    <span>{t.columns.length} schema columns</span> •{' '}
                    <span className="text-emerald-600 font-bold">{t.columns.filter((c) => c.visible).length} visible</span>
                  </div>

                  {isSelected && (
                    <div className="absolute top-0 right-0 h-16 w-16 overflow-hidden pointer-events-none">
                      <div className="bg-blue-600 text-white font-bold text-[9px] text-center py-1 rotate-45 translate-x-4 translate-y-2 shadow-xs">
                        ACTIVE
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* DYNAMIC COLUMNS ACCESS & VISIBILITY MANAGER FOR SELECTED TABLE */}
          {selectedTable && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6 mt-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white font-mono text-xs font-black px-2.5 py-0.5 rounded">
                      {selectedTable.tableName}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-lg">{selectedTable.displayName} Columns</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Configure visibility status, SQL data types, role access permissions, and custom column attributes</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-xl bg-slate-100 text-slate-700 px-3.5 py-2 font-mono text-xs font-bold border border-slate-200">
                    {selectedTable.columns.filter((c) => c.visible).length} / {selectedTable.columns.length} Columns Visible
                  </span>

                  {/* PROMINENT ADD CUSTOM COLUMN BUTTON FOR ALL TABLES */}
                  <button
                    onClick={() => setShowAddColumnModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add Column to {selectedTable.displayName}
                  </button>
                </div>
              </div>

              {/* Columns Schema Table with Full Add / Edit / Remove Controls */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Field Key</th>
                      <th className="py-3.5 px-4">Column Display Label</th>
                      <th className="py-3.5 px-4">SQL Type</th>
                      <th className="py-3.5 px-4">Role Access Rights</th>
                      <th className="py-3.5 px-4">Visibility</th>
                      <th className="py-3.5 px-4">Requirement</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedTable.columns.map((col) => (
                      <tr key={col.key} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600 bg-blue-50/30">
                          {col.key}
                          {col.isCustom && (
                            <span className="ml-2 rounded bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.5">
                              CUSTOM
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{col.label}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{col.desc}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {col.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            value={col.accessRole}
                            onChange={(e) => changeColumnRole(selectedTable.id, col.key, e.target.value as RoleAccessRight)}
                            className="rounded-lg border border-slate-300 p-1.5 text-xs font-bold outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="All Roles">All Roles (Public Read)</option>
                            <option value="Rate Manager & Admin">Rate Manager & Admin</option>
                            <option value="Estimator & Admin">Estimator & Admin</option>
                            <option value="Admin Only">Admin Only (Restricted)</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleColumnVisibility(selectedTable.id, col.key)}
                            disabled={col.required}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              col.visible
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            } ${col.required ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {col.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                            {col.visible ? 'Visible' : 'Hidden'}
                          </button>
                        </td>
                        <td className="py-3.5 px-4">
                          {col.required ? (
                            <span className="rounded bg-red-50 text-red-700 px-2 py-0.5 text-[10px] font-bold border border-red-200">
                              SYSTEM REQUIRED
                            </span>
                          ) : (
                            <span className="rounded bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                              OPTIONAL
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* EDIT COLUMN BUTTON */}
                            <button
                              onClick={() => handleOpenEditColumn(col)}
                              className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold uppercase text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs"
                              title="Edit Column Properties"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> EDIT
                            </button>

                            {/* DELETE / REMOVE COLUMN BUTTON */}
                            {!col.required && (
                              <button
                                onClick={() => handleDeleteColumn(col.key, col.label, col.required)}
                                className="flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                                title="Remove Column from Table"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADD CUSTOM COLUMN MODAL DIALOG */}
      {showAddColumnModal && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">
                  Add Custom Column to <span className="text-emerald-400">{selectedTable.tableName}</span>
                </h3>
              </div>
              <button
                onClick={() => setShowAddColumnModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomColumn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Column Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Steel Yield Strength (MPa), Warranty Years"
                  value={newColLabel}
                  onChange={(e) => setNewColLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Database Field Key (Database Name)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Auto-generated (e.g. steel_yield_strength)"
                    value={newColKey}
                    onChange={(e) => setNewColKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono font-bold outline-none focus:border-blue-500 bg-slate-50"
                  />
                  <Code className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave blank to auto-format from display name into SQL <code className="font-mono text-blue-600">snake_case</code>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    SQL Data Type
                  </label>
                  <select
                    value={newColType}
                    onChange={(e) => setNewColType(e.target.value as SqlDataType)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="VARCHAR">VARCHAR (Text String)</option>
                    <option value="DECIMAL">DECIMAL (Currency / Float)</option>
                    <option value="INTEGER">INTEGER (Whole Number)</option>
                    <option value="BOOLEAN">BOOLEAN (Yes / No)</option>
                    <option value="TEXT">TEXT (Long Specification)</option>
                    <option value="DATE">DATE (Timestamp)</option>
                    <option value="JSONB">JSONB (Structured JSON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Role Access Rights
                  </label>
                  <select
                    value={newColRole}
                    onChange={(e) => setNewColRole(e.target.value as RoleAccessRight)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="All Roles">All Roles (Public Read)</option>
                    <option value="Rate Manager & Admin">Rate Manager & Admin</option>
                    <option value="Estimator & Admin">Estimator & Admin</option>
                    <option value="Admin Only">Admin Only (Restricted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Field Description / Tooltip
                </label>
                <input
                  type="text"
                  placeholder="Help text for engineering or pricing teams"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="colReq"
                  checked={newColRequired}
                  onChange={(e) => setNewColRequired(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="colReq" className="text-xs font-bold text-slate-700">
                  Mark as System Required Column (Cannot be hidden)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddColumnModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Column to {selectedTable.tableName}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COLUMN MODAL DIALOG */}
      {editingColumn && selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-blue-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-300" />
                <h3 className="font-extrabold text-base">
                  Edit Column <span className="text-blue-300 font-mono">{editingColumn.key}</span>
                </h3>
              </div>
              <button
                onClick={() => setEditingColumn(null)}
                className="rounded-lg p-1 text-slate-300 hover:bg-blue-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedColumn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Field Key (Read-Only)
                </label>
                <input
                  type="text"
                  disabled
                  value={editingColumn.key}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono font-bold text-slate-500 bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Column Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editColLabel}
                  onChange={(e) => setEditColLabel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    SQL Data Type
                  </label>
                  <select
                    value={editColType}
                    onChange={(e) => setEditColType(e.target.value as SqlDataType)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="VARCHAR">VARCHAR (Text String)</option>
                    <option value="DECIMAL">DECIMAL (Currency / Float)</option>
                    <option value="INTEGER">INTEGER (Whole Number)</option>
                    <option value="BOOLEAN">BOOLEAN (Yes / No)</option>
                    <option value="TEXT">TEXT (Long Specification)</option>
                    <option value="DATE">DATE (Timestamp)</option>
                    <option value="JSONB">JSONB (Structured JSON)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Role Access Rights
                  </label>
                  <select
                    value={editColRole}
                    onChange={(e) => setEditColRole(e.target.value as RoleAccessRight)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="All Roles">All Roles (Public Read)</option>
                    <option value="Rate Manager & Admin">Rate Manager & Admin</option>
                    <option value="Estimator & Admin">Estimator & Admin</option>
                    <option value="Admin Only">Admin Only (Restricted)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Field Description / Tooltip
                </label>
                <input
                  type="text"
                  value={editColDesc}
                  onChange={(e) => setEditColDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="colVis"
                  disabled={editingColumn.required}
                  checked={editColVisible}
                  onChange={(e) => setEditColVisible(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="colVis" className="text-xs font-bold text-slate-700">
                  Visible in Table View
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingColumn(null)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                >
                  <Save className="h-4 w-4" /> Save Column Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
