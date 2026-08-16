import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Home,
  Building,
  Layers,
  HelpCircle,
  FileText,
  FolderPlus,
  X,
  User,
  Ruler,
  Tag,
  Copy,
  Database,
  ArrowRight,
  Download
} from 'lucide-react';
import { fetchProducts, fetchProjects, createProject, saveBOQ, fetchBOQ } from '../services/api';
import { Product, Project, BOQItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { numberToWordsSouthAsian } from '../utils/nepaliFormatters';




import { useAuth } from '../context/AuthContext';

interface BOQBuilderProps {
  onSavedBOQ: () => void;
}

export const BOQBuilder: React.FC<BOQBuilderProps> = ({ onSavedBOQ }) => {
  const { formatCurrency, formatNumber } = useLanguage();
  const { canPerform } = useAuth();
  const canSaveBOQ = canPerform('saveBOQ');
  const canCreateProject = canPerform('createProject');
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [areaSqft, setAreaSqft] = useState<number>(2400);

  // New Target Group / Project Modal State
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);
  const [newProjName, setNewProjName] = useState<string>('');
  const [newProjCustomer, setNewProjCustomer] = useState<string>('');
  const [newProjArea, setNewProjArea] = useState<number>(2400);
  const [newProjCategory, setNewProjCategory] = useState<string>('Modular Residential');

  // Save Options Dialog Modal State (Overwrite vs Create Copy)
  const [showSaveOptionsModal, setShowSaveOptionsModal] = useState<boolean>(false);
  const [saveMode, setSaveMode] = useState<'overwrite' | 'copy'>('overwrite');
  const [copyTitle, setCopyTitle] = useState<string>('');

  // STANDARD PRE-FILLED BOQ TEMPLATES
  const standardVillaTemplate: BOQItem[] = [
    { product_id: 'prod_eps_75', product_code: 'EP-075', product_name: 'EPS Sandwich Wall Panel 75mm (1200x2440)', unit: 'm²', unit_rate: 2150, qty: 850, amount: 1827500 },
    { product_id: 'prod_steel_struct', product_code: 'MOD-STL', product_name: 'Structural Steel RHS Columns & Trusses', unit: 'kg', unit_rate: 112, qty: 4200, amount: 470400 },
    { product_id: 'prod_roof_100', product_code: 'EP-100R', product_name: 'EPS Insulated Roof Panel 100mm (Corrugated)', unit: 'm²', unit_rate: 1650, qty: 260, amount: 429000 },
    { product_id: 'prod_window_upvc', product_code: 'MOD-WIN', product_name: 'UPVC Sliding Window with 5mm Glass', unit: 'pcs', unit_rate: 12400, qty: 12, amount: 148800 },
    { product_id: 'prod_door_upvc', product_code: 'MOD-DOR', product_name: 'Flush Timber Door with WPC Frame (3x7 ft)', unit: 'pcs', unit_rate: 18500, qty: 8, amount: 148000 },
    { product_id: 'prod_screws', product_code: 'ACC-SCR', product_name: 'Self-Drilling Fastener Screws 100mm', unit: 'pcs', unit_rate: 15, qty: 1500, amount: 22500 },
    { product_id: 'prod_sealant', product_code: 'ACC-SLT', product_name: 'Weatherproof Polyurethane Joint Sealant', unit: 'tube', unit_rate: 650, qty: 45, amount: 29250 },
    { product_id: 'prod_primer', product_code: 'ACC-PNT', product_name: 'Base Coat Primer & Water Sealant Paint', unit: 'liter', unit_rate: 480, qty: 120, amount: 57600 },
    { product_id: 'prod_crane', product_code: 'SRV-CRN', product_name: 'Erection Crane & Site Heavy Transport', unit: 'job', unit_rate: 150000, qty: 1, amount: 150000 },
    { product_id: 'prod_anchors', product_code: 'ACC-ANC', product_name: 'Foundation High-Tensile Anchor Bolt Sets', unit: 'set', unit_rate: 1200, qty: 48, amount: 57600 }
  ];

  const compactCottageTemplate: BOQItem[] = [
    { product_id: 'prod_eps_50', product_code: 'EP-050', product_name: 'EPS Sandwich Wall Panel 50mm (1200x2440)', unit: 'm²', unit_rate: 1920, qty: 420, amount: 806400 },
    { product_id: 'prod_steel_struct', product_code: 'MOD-STL', product_name: 'Light Gauge Steel Framing System', unit: 'kg', unit_rate: 112, qty: 1800, amount: 201600 },
    { product_id: 'prod_roofing_cgi', product_code: 'MOD-ROOF', product_name: 'Color Coated CGI Sheet 0.45mm', unit: 'm²', unit_rate: 1150, qty: 140, amount: 161000 },
    { product_id: 'prod_window_upvc', product_code: 'MOD-WIN', product_name: 'UPVC Sliding Window (4x4 ft)', unit: 'pcs', unit_rate: 12400, qty: 6, amount: 74400 },
    { product_id: 'prod_door_upvc', product_code: 'MOD-DOR', product_name: 'Flush Door with WPC Frame', unit: 'pcs', unit_rate: 18500, qty: 4, amount: 74000 },
    { product_id: 'prod_sealant', product_code: 'ACC-SLT', product_name: 'Polyurethane Joint Sealant', unit: 'tube', unit_rate: 650, qty: 25, amount: 16250 }
  ];

  const warehouseTemplate: BOQItem[] = [
    { product_id: 'prod_eps_150', product_code: 'EP-150', product_name: 'EPS Heavy Industrial Sandwich Panel 150mm', unit: 'm²', unit_rate: 2850, qty: 1400, amount: 3990000 },
    { product_id: 'prod_steel_struct', product_code: 'MOD-STL', product_name: 'Heavy I-Beam Columns & Truss Framework', unit: 'kg', unit_rate: 115, qty: 12500, amount: 1437500 },
    { product_id: 'prod_roof_100', product_code: 'EP-100R', product_name: 'EPS Insulated Roof Panel 100mm', unit: 'm²', unit_rate: 1650, qty: 850, amount: 1402500 },
    { product_id: 'prod_shutter', product_code: 'ACC-SHT', product_name: 'Motorized Rolling Shutter Gate (12x12 ft)', unit: 'pcs', unit_rate: 85000, qty: 4, amount: 340000 },
    { product_id: 'prod_crane', product_code: 'SRV-CRN', product_name: 'Mobile Crane & Heavy Lifting Rigging', unit: 'job', unit_rate: 250000, qty: 1, amount: 250000 }
  ];

  // Active BOQ Line Items State
  const [items, setItems] = useState<BOQItem[]>(standardVillaTemplate);

  // Overhead & Profit controls
  const [overheadPct, setOverheadPct] = useState<number>(5);
  const [profitPct, setProfitPct] = useState<number>(12);
  const [laborCost, setLaborCost] = useState<number>(350000);
  const [transportCost, setTransportCost] = useState<number>(120000);
  const [installationCost, setInstallationCost] = useState<number>(180000);

  // Search autocomplete state for adding item
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [loadingBOQ, setLoadingBOQ] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [saveMessageText, setSaveMessageText] = useState<string>('');
  const [showTemplateMenu, setShowTemplateMenu] = useState<boolean>(false);

  // Fetch Projects List on Mount
  useEffect(() => {
    fetchProjects().then((prjs) => {
      setProjects(prjs);
      if (prjs.length > 0) setSelectedProjectId(prjs[0].id);
    });
    fetchProducts().then(setAllProducts);
  }, []);

  // PERSISTENT DB LOAD: Whenever selectedProjectId changes, load that Target Group's saved BOQ file from DB!
  useEffect(() => {
    if (selectedProjectId) {
      setLoadingBOQ(true);
      fetchBOQ(selectedProjectId)
        .then((boqData) => {
          if (boqData) {
            setItems(boqData.items && boqData.items.length > 0 ? boqData.items : standardVillaTemplate);
            if (boqData.area_sqft) setAreaSqft(boqData.area_sqft);
            if (boqData.overhead_percent !== undefined) setOverheadPct(boqData.overhead_percent);
            if (boqData.profit_percent !== undefined) setProfitPct(boqData.profit_percent);
            if (boqData.labor_cost !== undefined) setLaborCost(boqData.labor_cost);
            if (boqData.transport_cost !== undefined) setTransportCost(boqData.transport_cost);
            if (boqData.installation_cost !== undefined) setInstallationCost(boqData.installation_cost);
          }
        })
        .finally(() => setLoadingBOQ(false));
    }
  }, [selectedProjectId]);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || {
    id: 'prj_default',
    name: 'Kathmandu Residence Modular Villa',
    customer_name: 'ABC Construction & Builders',
    area_sqft: 2400
  };

  // Math calculations
  const itemsSubtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const directCostTotal = itemsSubtotal + laborCost + transportCost + installationCost;
  const overheadAmount = Math.round((directCostTotal * overheadPct) / 100);
  const totalCost = directCostTotal + overheadAmount;
  const profitAmount = Math.round((totalCost * profitPct) / 100);
  const sellingPrice = totalCost + profitAmount;

  // Filter autocomplete search
  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectProduct = (prod: Product) => {
    const newItem: BOQItem = {
      product_id: prod.id,
      product_code: prod.code,
      product_name: prod.name,
      unit: prod.unit,
      unit_rate: prod.current_rate,
      qty: 1,
      amount: prod.current_rate * 1
    };
    setItems([...items, newItem]);
    setSearchQuery('');
    setShowDropdown(false);
  };

  // Add Blank Custom Line Item (All Columns Editable)
  const handleAddCustomBlankRow = () => {
    const newBlankItem: BOQItem = {
      product_id: `custom_${Date.now()}`,
      product_code: `CUST-${items.length + 1}`,
      product_name: 'New Custom Line Item Description',
      unit: 'm²',
      unit_rate: 1000,
      qty: 1,
      amount: 1000
    };
    setItems([...items, newBlankItem]);
  };

  // Update item field across ALL columns
  const handleUpdateItem = (idx: number, field: keyof BOQItem, val: any) => {
    const updated = [...items];
    const target = { ...updated[idx], [field]: val };

    if (field === 'qty' || field === 'unit_rate') {
      const q = field === 'qty' ? Number(val) || 0 : target.qty;
      const r = field === 'unit_rate' ? Number(val) || 0 : target.unit_rate;
      target.qty = q;
      target.unit_rate = r;
      target.amount = q * r;
    }

    updated[idx] = target;
    setItems(updated);
  };

  // Remove Item
  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Load Preset Template
  const handleLoadTemplate = (tpl: BOQItem[], tplName: string) => {
    setItems([...tpl]);
    setShowTemplateMenu(false);
  };

  // CREATE NEW TARGET GROUP / PROJECT HANDLER (PERSISTENT DB API)
  const handleCreateTargetGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;


    setSaving(true);
    try {
      // 1. Create Target Group in PostgreSQL DB backend (POST /api/projects)
      const savedProj = await createProject({
        name: newProjName.trim(),
        customer_name: newProjCustomer.trim() || 'General Client',
        location: 'Kathmandu, Nepal',
        building_type: newProjCategory,
        area_sqft: newProjArea || 2400,
        floors: 2,
        bedrooms: 3,
        bathrooms: 2,
        status: 'Active',
        assigned_staff: 'Sales Engineer',
        created_date: new Date().toISOString().split('T')[0]
      });

      // 2. Persistently initialize BOQ data in DB for this exact Target Group
      await saveBOQ({
        project_id: savedProj.id,
        project_name: savedProj.name,
        customer_name: savedProj.customer_name,
        area_sqft: savedProj.area_sqft,
        items,
        overhead_percent: overheadPct,
        profit_percent: profitPct,
        labor_cost: laborCost,
        transport_cost: transportCost,
        installation_cost: installationCost,
        save_mode: 'overwrite'
      });

      // 3. Reload fresh Projects list from backend DB & select new Target Group
      const freshPrjs = await fetchProjects();
      setProjects(freshPrjs);
      setSelectedProjectId(savedProj.id);
      setAreaSqft(savedProj.area_sqft);

      setShowNewProjectModal(false);
      setNewProjName('');
      setNewProjCustomer('');
      setNewProjArea(2400);

      setSaveMessageText(`Created & saved Target Group "${savedProj.name}" persistently in PostgreSQL DB!`);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      onSavedBOQ();
    } catch (err) {
      console.error(err);
      alert('Failed to save target group to database');
    } finally {
      setSaving(false);
    }
  };

  // EXPORT BOQ AS CSV WITH MEANINGFUL FILENAME
  const handleExportCSV = () => {
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `BELA_BOQ_${sanitize(activeProject.name)}_${sanitize(activeProject.customer_name)}_${dateStr}.csv`;

    const headers = ['#', 'Item Code', 'Item Description', 'Unit', 'Unit Rate (NPR)', 'Quantity', 'Subtotal (NPR)'];
    const rows = items.map((item, idx) => [
      idx + 1,
      item.product_code || '',
      `"${(item.product_name || '').replace(/"/g, '""')}"`,
      item.unit,
      item.unit_rate,
      item.qty,
      item.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
      '',
      `"Materials Subtotal",,,,,,${itemsSubtotal}`,
      `"Direct Cost",,,,,,${directCostTotal}`,
      `"Overhead (${overheadPct}%)",,,,,,${overheadAmount}`,
      `"Target Profit (${profitPct}%)",,,,,,${profitAmount}`,
      `"Total Calculated Selling Price (NPR)",,,,,,${sellingPrice}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // DOWNLOAD BOQ AS PDF WITH MEANINGFUL FILENAME
  const handleDownloadPDF = () => {
    const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const originalTitle = document.title;
    const meaningfulName = `BELA_BOQ_${sanitize(activeProject.name)}_${sanitize(activeProject.customer_name)}_${dateStr}`;

    document.title = meaningfulName;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };


  // OPEN SAVE OPTIONS MODAL (OVERWRITE vs CREATE COPY)
  const handleOpenSaveDialog = () => {
    setCopyTitle(`[Copy] ${activeProject.name} Rev B`);
    setShowSaveOptionsModal(true);
  };

  // CONFIRM & EXECUTE SAVE (OVERWRITE OR CREATE COPY)
  const handleConfirmSaveBOQ = async () => {
    setSaving(true);
    try {
      const res = await saveBOQ({
        project_id: selectedProjectId || 'prj_001',
        project_name: activeProject.name,
        customer_name: activeProject.customer_name,
        area_sqft: areaSqft,
        items,
        overhead_percent: overheadPct,
        profit_percent: profitPct,
        labor_cost: laborCost,
        transport_cost: transportCost,
        installation_cost: installationCost,
        save_mode: saveMode,
        copy_title: copyTitle
      });

      // If created copy, refresh projects list and set active project to newly created copy ID
      if (saveMode === 'copy' && res.project_id) {
        const freshProjects = await fetchProjects();
        setProjects(freshProjects);
        setSelectedProjectId(res.project_id);
      }

      setShowSaveOptionsModal(false);
      setSaveMessageText(res.message || 'Saved BOQ to PostgreSQL database!');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      onSavedBOQ();
    } catch (err) {
      console.error(err);
      alert('Failed to save BOQ to database');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* Sticky Section Header (0px Gap Flush under Navbar) */}
      <div className="sticky top-0 z-20 -mt-6 -mx-6 px-6 pt-4 pb-4 md:-mt-8 md:-mx-8 md:px-8 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-[#ef7e2d]" /> Interactive BOQ Builder & Target Group Engine
            </h1>
            <p className="text-xs text-slate-500">
              Persistent PostgreSQL storage: Select any Target Group to reload, edit all columns, and overwrite or fork new copies
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* PRE-FILLED TEMPLATE POPUP SELECTOR */}
            <div className="relative">
              <button
                onClick={() => setShowTemplateMenu(!showTemplateMenu)}
                className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-600" /> Pre-Fill Template ({items.length} Items)
              </button>

              {showTemplateMenu && (
                <div className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                    Select Standard Pre-Filled BOQ Template
                  </div>

                  <button
                    onClick={() => handleLoadTemplate(standardVillaTemplate, '2-Story Villa')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-3"
                  >
                    <Building className="h-4 w-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">2-Story Modular Villa</div>
                      <div className="text-[10px] text-slate-500">Standard 10-Item Full Prefab Bill</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadTemplate(compactCottageTemplate, 'Single Story Cottage')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-3"
                  >
                    <Home className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Single Story Prefab Cottage</div>
                      <div className="text-[10px] text-slate-500">Compact 6-Item Residential Bill</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleLoadTemplate(warehouseTemplate, 'Industrial Warehouse')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50 transition-colors flex items-center gap-3"
                  >
                    <Layers className="h-4 w-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Industrial Warehouse Structure</div>
                      <div className="text-[10px] text-slate-500">Heavy Steel & EPS 150mm Bill</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => handleLoadTemplate([], 'Blank BOQ')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2 font-bold text-xs"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" /> Clear All / Start Blank BOQ
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* EXPORT CSV & PDF WITH MEANINGFUL FILENAMES */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
              title="Export BOQ Excel / CSV with meaningful filename"
            >
              <Download className="h-4 w-4 text-emerald-600" /> Export CSV
            </button>

            {/* SAVE BOQ & GENERATE QUOTATION BUTTON */}
            {canSaveBOQ && (
              <button
                onClick={handleOpenSaveDialog}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save BOQ Options'}
              </button>
            )}
          </div>
        </div>
      </div>


      {savedSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveMessageText || 'BOQ Saved successfully! Rate snapshots locked & Quotation proposal generated in Quotations tab!'}</span>
        </div>
      )}

      {/* TARGET GROUP & PROJECT SELECTOR BAR WITH "+ CREATE NEW TARGET GROUP" BUTTON */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Target Group / Project File
              </label>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(true)}
                className="text-[10px] font-extrabold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <FolderPlus className="h-3 w-3" /> + New Target Group
              </button>
            </div>

            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 min-w-64"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.customer_name})
                  </option>
                ))}
              </select>
              {loadingBOQ && (
                <span className="ml-2 text-[10px] font-bold text-blue-600 animate-pulse">
                  Loading DB File...
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Building Area (sq.ft)
            </label>
            <input
              type="number"
              value={areaSqft}
              onChange={(e) => setAreaSqft(Number(e.target.value))}
              className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="text-slate-400 font-semibold">Client / Target Account</div>
            <div className="font-extrabold text-slate-900 text-sm">{activeProject.customer_name}</div>
          </div>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 text-blue-600" /> Create Target Group
          </button>
        </div>
      </div>

      {/* Autocomplete Search & Quick Add Editable Row Bar */}
      <div className="relative rounded-2xl border-2 border-blue-400/80 bg-blue-50/60 p-4 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-blue-950 flex items-center gap-2">
            <Search className="h-4 w-4 text-blue-600" />
            Instant Catalog Autocomplete (Or add fully editable custom row below)
          </label>

          <button
            onClick={handleAddCustomBlankRow}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" /> + Add Blank Row (All Columns Editable)
          </button>
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Start typing product name or code to add line item with live rate..."
          className="w-full rounded-xl border border-blue-300 bg-white p-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
        />

        {/* Search Results Dropdown */}
        {showDropdown && filteredProducts.length > 0 && (
          <div className="absolute left-4 right-4 top-24 z-30 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl divide-y divide-slate-100">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleSelectProduct(p)}
                className="flex items-center justify-between p-3 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-blue-600 mr-2">{p.code}</span>
                  <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                  <div className="text-[10px] text-slate-400">{p.specification}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900">
                    NPR {p.current_rate.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400"> / {p.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive BOQ Sheet Table with FULLY EDITABLE COLUMNS */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="p-4 border-b border-slate-100 font-bold text-xs text-slate-900 uppercase tracking-wider bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-blue-600" />
            <span>
              Target Group BOQ: <strong className="text-blue-900">{activeProject.name}</strong> ({items.length} Line Items)
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
            PostgreSQL DB Synced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">#</th>
                <th className="py-3.5 px-3 w-28">Item Code</th>
                <th className="py-3.5 px-4">Item Description</th>
                <th className="py-3.5 px-3 text-center w-28">Unit</th>
                <th className="py-3.5 px-3 text-right w-32">Unit Rate (NPR)</th>
                <th className="py-3.5 px-3 text-center w-28">Quantity</th>
                <th className="py-3.5 px-4 text-right w-36">Subtotal (NPR)</th>
                <th className="py-3.5 px-3 w-14 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-bold text-sm text-slate-700">BOQ Sheet is empty</p>
                    <p className="text-xs">Click "Pre-Fill Template" or "+ Add Blank Row" above to create items.</p>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>

                    {/* COLUMN 1: EDITABLE ITEM CODE */}
                    <td className="py-3.5 px-3">
                      <input
                        type="text"
                        value={item.product_code || ''}
                        onChange={(e) => handleUpdateItem(idx, 'product_code', e.target.value)}
                        placeholder="e.g. EP-075"
                        className="w-full font-mono text-xs font-bold text-blue-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                      />
                    </td>

                    {/* COLUMN 2: EDITABLE ITEM DESCRIPTION */}
                    <td className="py-3.5 px-4">
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => handleUpdateItem(idx, 'product_name', e.target.value)}
                        placeholder="Enter line item description..."
                        className="w-full font-bold text-slate-900 bg-white border border-slate-200 focus:border-blue-500 rounded px-2.5 py-1 outline-none text-xs"
                      />
                    </td>

                    {/* COLUMN 3: EDITABLE UNIT OF MEASUREMENT */}
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                        placeholder="m², kg, pcs..."
                        className="w-full text-center font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded px-1.5 py-1 outline-none text-xs"
                      />
                    </td>

                    {/* COLUMN 4: EDITABLE UNIT RATE */}
                    <td className="py-3.5 px-3 text-right">
                      <input
                        type="number"
                        value={item.unit_rate}
                        onChange={(e) => handleUpdateItem(idx, 'unit_rate', e.target.value)}
                        className="w-full text-right font-mono font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-xs"
                      />
                    </td>

                    {/* COLUMN 5: EDITABLE QUANTITY */}
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(idx, 'qty', e.target.value)}
                        className="w-full text-center rounded-lg border border-blue-300 bg-blue-50/40 py-1 text-xs font-bold text-blue-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </td>

                    {/* COLUMN 6: DYNAMIC SUBTOTAL AMOUNT */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-xs">
                      {formatCurrency(item.amount || 0)}
                    </td>

                    {/* COLUMN 7: DELETE ROW ACTION */}
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Line Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
              <tr>
                <td colSpan={6} className="py-3.5 px-4 text-right uppercase text-xs text-slate-500 font-extrabold">
                  Materials & Items Subtotal:
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-sm text-slate-900 font-black">
                  {formatCurrency(itemsSubtotal)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* BOQ Math Summary & Profit Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Services & Overhead Modifiers
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Labour Cost</label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Transportation</label>
              <input
                type="number"
                value={transportCost}
                onChange={(e) => setTransportCost(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Installation</label>
              <input
                type="number"
                value={installationCost}
                onChange={(e) => setInstallationCost(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-bold text-slate-700 flex justify-between mb-1">
                <span>Overhead Rate</span>
                <span className="text-blue-600 font-extrabold">{formatNumber(overheadPct)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="20"
                value={overheadPct}
                onChange={(e) => setOverheadPct(Number(e.target.value))}
                className="w-full cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 flex justify-between mb-1">
                <span>Target Profit</span>
                <span className="text-emerald-600 font-extrabold">{formatNumber(profitPct)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={profitPct}
                onChange={(e) => setProfitPct(Number(e.target.value))}
                className="w-full cursor-pointer accent-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Calculated Totals Box */}
        <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between text-slate-400">
              <span>Direct Material + Services</span>
              <span className="font-mono">{formatCurrency(directCostTotal)}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>Overhead ({formatNumber(overheadPct)}%)</span>
              <span className="font-mono">{formatCurrency(overheadAmount)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Profit Margin ({formatNumber(profitPct)}%)</span>
              <span className="font-mono">{formatCurrency(profitAmount)}</span>
            </div>
          </div>

          <div className="border-t-2 border-slate-800 pt-3 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Total Calculated Selling Price
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {formatCurrency(sellingPrice)}
            </div>
            <div className="text-[10px] italic text-slate-300 bg-slate-800/80 p-2 rounded-lg mt-2 border border-slate-700">
              "{numberToWordsSouthAsian(sellingPrice)}"
            </div>
          </div>
        </div>


      </div>

      {/* CREATE NEW TARGET GROUP / PROJECT MODAL DIALOG */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-blue-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-blue-300" />
                <h3 className="font-extrabold text-base">Create New Target Group / Project</h3>
              </div>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="rounded-lg p-1 text-slate-300 hover:bg-blue-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTargetGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Target Group / Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pokhara Resort Prefab Villas, Lalitpur Complex"
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                  Customer / Developer Account
                </label>
                <input
                  type="text"
                  placeholder="e.g. Annapurna Hospitality Pvt Ltd"
                  value={newProjCustomer}
                  onChange={(e) => setNewProjCustomer(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Building Area (Sq.Ft)
                  </label>
                  <input
                    type="number"
                    value={newProjArea}
                    onChange={(e) => setNewProjArea(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">
                    Target Sector Category
                  </label>
                  <select
                    value={newProjCategory}
                    onChange={(e) => setNewProjCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="Modular Residential">Modular Residential</option>
                    <option value="Commercial Resort">Commercial Resort</option>
                    <option value="Industrial Warehouse">Industrial Warehouse</option>
                    <option value="Government / Infra">Government / Infra</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <FolderPlus className="h-4 w-4" /> Create Target Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SAVE OPTIONS MODAL DIALOG (OVERWRITE vs CREATE REVISION COPY) */}
      {showSaveOptionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" />
                <h3 className="font-extrabold text-base">
                  Save Target Group BOQ: <span className="text-blue-400">{activeProject.name}</span>
                </h3>
              </div>
              <button
                onClick={() => setShowSaveOptionsModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Choose how you want to persist your BOQ changes in the PostgreSQL database:
              </p>

              <div className="space-y-3">
                {/* OPTION 1: OVERWRITE EXISTING */}
                <label
                  onClick={() => setSaveMode('overwrite')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    saveMode === 'overwrite'
                      ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-600/10'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="saveMode"
                    checked={saveMode === 'overwrite'}
                    onChange={() => setSaveMode('overwrite')}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <Save className="h-4 w-4 text-blue-600" /> Overwrite & Update Existing Target Group File
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Saves and updates the BOQ line items and calculation parameters for <strong className="text-slate-800">{activeProject.name}</strong> directly in DB memory.
                    </p>
                  </div>
                </label>

                {/* OPTION 2: CREATE NEW COPY / REVISION FORK */}
                <label
                  onClick={() => setSaveMode('copy')}
                  className={`flex items-start gap-3.5 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    saveMode === 'copy'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-600/10'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="saveMode"
                    checked={saveMode === 'copy'}
                    onChange={() => setSaveMode('copy')}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                      <Copy className="h-4 w-4 text-emerald-600" /> Create New Copy / Revision Fork (Branch)
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      Preserves the original target group unchanged, and creates a brand new independent Target Group copy in PostgreSQL.
                    </p>
                  </div>
                </label>
              </div>

              {/* Revision Copy Title Input if Copy Mode is Selected */}
              {saveMode === 'copy' && (
                <div className="pt-2 animate-in fade-in space-y-1">
                  <label className="block text-xs font-extrabold uppercase text-slate-700">
                    New Target Group Copy Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={copyTitle}
                    onChange={(e) => setCopyTitle(e.target.value)}
                    placeholder="e.g. Kathmandu Villa - Option B (Rev 2)"
                    className="w-full rounded-xl border border-emerald-400 px-3.5 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSaveOptionsModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleConfirmSaveBOQ}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
                    saveMode === 'copy'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  {saving
                    ? 'Saving to DB...'
                    : saveMode === 'copy'
                    ? 'Create Target Group Copy'
                    : 'Overwrite & Save Target Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
