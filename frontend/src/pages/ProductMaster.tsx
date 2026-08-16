import React, { useEffect, useState } from 'react';
import {
  Package,
  Search,
  Filter,
  History,
  Edit3,
  Plus,
  CheckCircle,
  XCircle,
  RefreshCw,
  Globe,
  Image as ImageIcon,
  Eye,
  Trash2,
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  CheckSquare,
  Square,
  RotateCcw
} from 'lucide-react';


import { fetchProducts, syncLiveProducts, deleteProductApi, fetchCategories, fetchColumnSchemas } from '../services/api';
import { Product } from '../types';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HighlightText } from '../components/HighlightText';
import { ProductImageModal } from '../components/ProductImageModal';
import { TrashBinModal } from '../components/TrashBinModal';
import { Pagination } from '../components/Pagination';

interface ProductMasterProps {
  onInspectHistory: (productId: string) => void;
  onEditRate: (product: Product) => void;
  onOpenAddProduct: () => void;
  searchQuery?: string;
}

interface ColumnOption {
  key: string;
  label: string;
}

export const ProductMaster: React.FC<ProductMasterProps> = ({
  onInspectHistory,
  onEditRate,
  onOpenAddProduct,
  searchQuery = ''
}) => {
  const { role, canPerform } = useAuth();
  const { formatCurrency } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>(searchQuery);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [showTrashModal, setShowTrashModal] = useState<boolean>(false);
  const [dbCategoryNames, setDbCategoryNames] = useState<string[]>([]);

  // View Mode: Table vs Kanban
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Dynamic Extra Columns state (All 11 Master Table Columns available)
  const [extraColumns, setExtraColumns] = useState<ColumnOption[]>([
    { key: 'code', label: 'SKU Code' },
    { key: 'name', label: 'Product Title' },
    { key: 'category', label: 'Category' },
    { key: 'thickness', label: 'Thickness' },
    { key: 'unit', label: 'Unit' },
    { key: 'current_rate', label: 'Approved Rate' },
    { key: 'status', label: 'Status' },
    { key: 'specification', label: 'Specification' },
    { key: 'brand', label: 'Brand Name' },
    { key: 'size', label: 'Dimension Size' },
    { key: 'subcategory', label: 'Subcategory' }
  ]);
  const [selectedExtraCols, setSelectedExtraCols] = useState<string[]>([]); // Default clean basic table (0 unchecked extra columns)


  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const canAddProduct = canPerform('addProduct');
  const canDeleteProduct = canPerform('deleteProduct');

  const handleDeleteProduct = async (p: Product) => {
    if (window.confirm(`Are you sure you want to delete product "${p.name}" (${p.code}) from Rate Master?`)) {
      try {
        const res = await deleteProductApi(p.id);
        setSyncMessage(res.message || `Product ${p.name} deleted`);
        setTimeout(() => setSyncMessage(''), 4000);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (searchQuery !== undefined) {
      setSearch(searchQuery);
      setCurrentPage(1);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories().then((cats) => {
      if (cats && Array.isArray(cats)) {
        setDbCategoryNames(cats.map((c: any) => c.name));
      }
    });

    fetchColumnSchemas('products').then((cols) => {
      if (cols && Array.isArray(cols)) {
        const backendKeys = new Set(cols.map((c: any) => c.key));
        const defaultKeys = new Set(['code', 'name', 'category', 'thickness', 'unit', 'current_rate', 'status', 'specification', 'brand', 'size', 'subcategory']);

        setExtraColumns((prev) => {
          const filteredPrev = prev.filter((c) => defaultKeys.has(c.key) || backendKeys.has(c.key));
          const existingKeys = new Set(filteredPrev.map((c) => c.key));
          const newCols: ColumnOption[] = [];
          cols.forEach((col: any) => {
            if (col.key && !existingKeys.has(col.key)) {
              existingKeys.add(col.key);
              newCols.push({ key: col.key, label: col.label || col.key });
            }
          });
          return [...filteredPrev, ...newCols];
        });

        setSelectedExtraCols((prevSelected) =>
          prevSelected.filter((k) => defaultKeys.has(k) || backendKeys.has(k))
        );
      }
    });

  }, []);


  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(category, search);
      setProducts(data);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [category, search]);

  // Dynamic categories combined from persistent DB + product list
  const categoriesList = Array.from(
    new Set([
      'All',
      'Eco Panels',
      'Modular Components',
      'Accessories',
      'Services',
      'Raw Materials',
      ...dbCategoryNames,
      ...products.map((p) => p.category)
    ])
  );

  const handleSyncLive = async () => {
    setSyncing(true);
    try {
      const res = await syncLiveProducts();
      setSyncMessage(res.message);
      setTimeout(() => setSyncMessage(''), 4000);
      setCategory('All');
      loadData();
    } finally {
      setSyncing(false);
    }
  };

  const toggleExtraCol = (key: string) => {
    setSelectedExtraCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Paginated Slice
  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-300">
      <ProductImageModal product={previewProduct} onClose={() => setPreviewProduct(null)} />

      {/* Sticky Section Header & Filter Toolbar */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-4 md:px-8 space-y-3 shadow-2xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-[#ef7e2d]" /> Product & Rate Master
            </h1>
            <p className="text-xs text-slate-500">
              Rich metadata product registry — click any row or card to view technical specifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* VIEW MODE TOGGLE BUTTONS (ICON ONLY) BEFORE SYNC BUTTON */}
            <div className="flex items-center rounded-xl border border-slate-300 bg-white p-1 shadow-2xs">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'table'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                title="Table Grid View"
                aria-label="Table Grid View"
              >
                <TableIcon className="h-4 w-4" />
              </button>

              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'kanban'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                title="Kanban Cards View"
                aria-label="Kanban Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            {canAddProduct && (
              <>
                <button
                  onClick={handleSyncLive}
                  disabled={syncing}
                  className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Globe className={`h-4 w-4 text-emerald-600 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Live API'}
                </button>
                <button
                  onClick={onOpenAddProduct}
                  className="flex items-center gap-2 rounded-xl bg-[#ef7e2d] px-4 py-2 text-xs font-bold text-white hover:bg-[#ef7e2d]/90 shadow-sm shadow-[#ef7e2d]/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs">
          {/* Dynamic Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${category === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Deep Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Type anything (code, spec, thickness, rate)..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-xs font-semibold outline-none focus:border-[#ef7e2d] focus:bg-white focus:ring-2 focus:ring-[#ef7e2d]/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Main Page Content Body (Ultra-Tight 2px Vertical Spacing) */}
      <div className="px-3.5 pt-[2px] pb-3 space-y-[2px]">
        {syncMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-2 text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* DYNAMIC COLUMN SELECTION BAR ABOVE TABLE */}
        {viewMode === 'table' && (
          <div className="rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 shadow-2xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#ef7e2d]" />
              <span>Table Dynamic Extra Columns:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {extraColumns.map((col) => {
                const isChecked = selectedExtraCols.includes(col.key);
                return (
                  <button
                    key={col.key}
                    onClick={() => toggleExtraCol(col.key)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                      isChecked
                        ? 'border-blue-300 bg-blue-50 text-blue-800 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                    ) : (
                      <Square className="h-3.5 w-3.5 text-slate-400" />
                    )}
                    {col.label}
                  </button>
                );
              })}

              {/* RESET COLUMNS BUTTON */}
              {selectedExtraCols.length > 0 && (
                <button
                  onClick={() => setSelectedExtraCols([])}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-700 hover:bg-slate-200 transition-all cursor-pointer shadow-2xs ml-1"
                  title="Reset all dynamic extra columns (Clean basic table)"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-500" /> Reset Columns
                </button>
              )}
            </div>
          </div>
        )}

        {/* TOP PAGINATION BAR (COMPACT SMALL SIZE) */}
        <div className="rounded-xl border border-slate-200/90 bg-white px-3 py-1 text-xs shadow-2xs">
          <Pagination
            currentPage={currentPage}
            totalItems={products.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </div>


        {/* VIEW MODE 1: TABLE GRID */}

        {viewMode === 'table' ? (
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-22rem)] rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-bold sticky top-0 z-20 shadow-md">
                <tr>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Code</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Product Name</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Category</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Thickness</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Unit</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Current Approved Rate</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Status</th>
                  <th className="py-3.5 px-4 text-center bg-slate-900 sticky top-0 z-20">Actions</th>

                  {/* DYNAMIC EXTRA COLUMNS RENDERED AT THE END OF TABLE */}
                  {selectedExtraCols.map((colKey) => {
                    const colObj = extraColumns.find((c) => c.key === colKey);
                    return (
                      <th
                        key={colKey}
                        className="py-3.5 px-4 bg-slate-800 text-blue-200 sticky top-0 z-20 border-l border-slate-700 whitespace-nowrap"
                      >
                        + {colObj ? colObj.label : colKey}
                      </th>
                    );
                  })}

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8 + selectedExtraCols.length} className="py-8 text-center text-slate-400">
                      Loading products...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8 + selectedExtraCols.length} className="py-8 text-center text-slate-400">
                      No products found matching "{search}".
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setPreviewProduct(p)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View detailed specifications for ${p.name} (${p.code})`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setPreviewProduct(p);
                        }
                      }}
                      className="hover:bg-amber-50/60 cursor-pointer transition-colors focus:outline-none focus:bg-amber-100/60 focus:ring-2 focus:ring-blue-500/50"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 bg-blue-50/30">
                        <HighlightText text={p.code} query={search} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white h-10 w-10 shadow-2xs p-0.5 flex items-center justify-center">
                            <img
                              src={p.image_url || '/ecopanel_preview.png'}
                              alt={p.name}
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <div>
                            <div className="font-bold text-slate-900">
                              <HighlightText text={p.name} query={search} />
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          <HighlightText text={p.category} query={search} />
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-bold">
                        <HighlightText text={p.thickness || '-'} query={search} />
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{p.unit}</td>
                      <td className="py-3 px-4 font-mono">
                        <span className="text-sm font-black text-slate-900">
                          {formatCurrency(p.current_rate)}
                        </span>
                        <span className="text-[10px] text-slate-400"> / {p.unit}</span>
                      </td>
                      <td className="py-3 px-4">
                        {p.status === 'Active' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-max">
                            <CheckCircle className="h-3 w-3" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded w-max">
                            <XCircle className="h-3 w-3" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* ACTION BUTTONS (NO TEXT ON DELETE BUTTON, ICON ONLY) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onInspectHistory(p.id);
                            }}
                            className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="View Rate Lineage History"
                          >
                            <History className="h-3.5 w-3.5 text-blue-600" /> History
                          </button>

                          {canAddProduct && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditRate(p);
                              }}
                              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                              title="Propose Rate Change"
                            >
                              <Edit3 className="h-3.5 w-3.5 text-emerald-600" /> Edit Rate
                            </button>
                          )}

                          {canDeleteProduct && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(p);
                              }}
                              className="flex items-center justify-center rounded-lg bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 hover:text-rose-900 transition-colors cursor-pointer"
                              title="Move product to Trash Bin"
                              aria-label={`Delete product ${p.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* DYNAMIC EXTRA COLUMNS DATA CELLS AT TABLE END */}
                      {selectedExtraCols.map((colKey) => (
                        <td key={colKey} className="py-3 px-4 bg-slate-50/60 border-l border-slate-100 text-slate-700 whitespace-nowrap">
                          {colKey === 'code' && <span className="font-mono font-bold text-blue-600"><HighlightText text={p.code} query={search} /></span>}
                          {colKey === 'name' && <span className="font-bold text-slate-900"><HighlightText text={p.name} query={search} /></span>}
                          {colKey === 'category' && <HighlightText text={p.category || '-'} query={search} />}
                          {colKey === 'thickness' && <HighlightText text={p.thickness || '-'} query={search} />}
                          {colKey === 'unit' && <HighlightText text={p.unit || '-'} query={search} />}
                          {colKey === 'current_rate' && <span className="font-mono font-bold text-slate-900">{formatCurrency(p.current_rate)}</span>}
                          {colKey === 'status' && <HighlightText text={p.status || '-'} query={search} />}
                          {colKey === 'specification' && <HighlightText text={p.specification || '-'} query={search} />}
                          {colKey === 'brand' && <HighlightText text={p.brand || '-'} query={search} />}
                          {colKey === 'size' && <HighlightText text={p.size || '-'} query={search} />}
                          {colKey === 'subcategory' && <HighlightText text={p.subcategory || '-'} query={search} />}
                          {!['code', 'name', 'category', 'thickness', 'unit', 'current_rate', 'status', 'specification', 'brand', 'size', 'subcategory'].includes(colKey) && (
                            <HighlightText text={String((p as any)[colKey] || '-')} query={search} />
                          )}
                        </td>
                      ))}


                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* VIEW MODE 2: KANBAN CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => setPreviewProduct(p)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${p.name} (${p.code})`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPreviewProduct(p);
                  }
                }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-lg hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      <HighlightText text={p.code} query={search} />
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      <HighlightText text={p.category} query={search} />
                    </span>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 h-14 w-14 p-1 shadow-2xs flex items-center justify-center group-hover:scale-105 transition-transform">
                      <img
                        src={p.image_url || '/ecopanel_preview.png'}
                        alt={p.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2">
                        <HighlightText text={p.name} query={search} />
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 font-medium">
                        <HighlightText text={p.specification} query={search} />
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Approved Rate</span>
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 font-mono">
                        {formatCurrency(p.current_rate)}
                      </span>
                      <span className="text-[11px] text-slate-400 font-bold"> / {p.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectHistory(p.id);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <History className="h-3.5 w-3.5 text-blue-600" /> History
                    </button>

                    <div className="flex items-center gap-1.5">
                      {canAddProduct && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRate(p);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-amber-400" /> Edit
                        </button>
                      )}

                      {canDeleteProduct && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProduct(p);
                          }}
                          className="flex items-center justify-center rounded-xl bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Move product to Trash Bin"
                          aria-label={`Delete product ${p.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={products.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};
