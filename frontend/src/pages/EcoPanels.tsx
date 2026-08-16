import React, { useEffect, useState } from 'react';
import {
  Layers,
  History,
  Edit3,
  ShieldAlert,
  CheckCircle,
  Globe,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  LayoutGrid,
  Table as TableIcon,
  Tag,
  Sparkles,
  Search
} from 'lucide-react';

import { fetchProducts, syncLiveProducts } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HighlightText } from '../components/HighlightText';
import { ProductImageModal } from '../components/ProductImageModal';
import { Pagination } from '../components/Pagination';

interface EcoPanelsProps {
  onInspectHistory: (productId: string) => void;
  onEditRate: (product: Product) => void;
}

export const EcoPanels: React.FC<EcoPanelsProps> = ({ onInspectHistory, onEditRate }) => {
  const { role, canPerform } = useAuth();
  const { formatCurrency, formatNumber } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [subTab, setSubTab] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban'); // Modern Kanban Cards View by default!
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12); // 12 cards per page for grid alignment

  const canEditRate = canPerform('addProduct');

  const loadProducts = () => {
    setLoading(true);
    fetchProducts('Eco Panels')
      .then((res) => {
        fetchProducts('Accessories').then((acc) => {
          fetchProducts('Services').then((srv) => {
            setProducts([...res, ...acc, ...srv]);
            setCurrentPage(1);
          });
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSyncLive = async () => {
    setSyncing(true);
    try {
      const res = await syncLiveProducts();
      setSyncMessage(res.message);
      setTimeout(() => setSyncMessage(''), 4000);
      loadProducts();
    } catch (err) {
      setSyncMessage('Failed to sync live products');
    } finally {
      setSyncing(false);
    }
  };

  const [search, setSearch] = useState<string>('');

  const filteredProducts = products.filter((p) => {
    let matchTab = true;
    if (subTab === 'Wall Panels') matchTab = p.subcategory.includes('Panel') || p.subcategory === 'Wall Panel';
    else if (subTab === 'Accessories') matchTab = p.category === 'Accessories' || p.category === 'Raw Materials';
    else if (subTab === 'Services') matchTab = p.category === 'Services';

    if (!matchTab) return false;

    if (search.trim()) {
      const tokens = search.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const relevantText = [
        p.code,
        p.name,
        p.specification,
        p.category,
        p.subcategory,
        p.thickness,
        p.size
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return tokens.every((token) => relevantText.includes(token));
    }

    return true;
  });

  const paginatedEcoPanels = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Group products into Kanban Board Columns when viewing Kanban mode
  const kanbanColumns = [
    { title: '50mm Wall Panels', filter: (p: Product) => p.thickness.includes('50') || p.code.includes('050') },
    { title: '75mm Wall Panels', filter: (p: Product) => p.thickness.includes('75') || p.code.includes('075') },
    { title: '100mm Wall & Roof', filter: (p: Product) => p.thickness.includes('100') || p.code.includes('100') },
    { title: '150mm Heavy Panels', filter: (p: Product) => p.thickness.includes('150') || p.code.includes('150') },
    { title: 'Accessories & Services', filter: (p: Product) => p.category === 'Accessories' || p.category === 'Services' || p.category === 'Raw Materials' }
  ];

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-300">
      <ProductImageModal product={previewProduct} onClose={() => setPreviewProduct(null)} />

      {/* Sticky Section Header & Toolbar (0px Gap Flush under Navbar) */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-4 md:px-8 space-y-3 shadow-2xs">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Layers className="h-6 w-6 text-[#ef7e2d]" /> Eco Panel Rate Management
            </h1>
            <p className="text-xs text-slate-500">
              Dedicated rate list for EPS Sandwich Panels, Accessories, Adhesives & Erection (Synced with belaecopanels.com API)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* VIEW MODE SWITCHER (ICON ONLY: Kanban Cards vs Table Grid) */}
            <div className="flex items-center rounded-xl border border-slate-300 bg-white p-1 shadow-2xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Kanban Cards View"
                aria-label="Kanban Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Table Grid View"
                aria-label="Table Grid View"
              >
                <TableIcon className="h-4 w-4" />
              </button>
            </div>


            <button
              onClick={handleSyncLive}
              disabled={syncing}
              className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              <Globe className={`h-4 w-4 text-emerald-600 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync belaecopanels.com API'}
            </button>
          </div>
        </div>

        {/* Toolbar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Wall Panels', 'Accessories', 'Services'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSubTab(st);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  subTab === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search panels, thickness, spec, rate..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs font-semibold outline-none focus:border-[#ef7e2d] focus:ring-2 focus:ring-[#ef7e2d]/20 shadow-2xs"
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

        {/* Rate History Audit Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <div className="font-bold">Rate History & Audit Lineage active</div>
              <p className="text-[11px] text-blue-700">
                Rates are never overwritten. Every update preserves historical snapshots so old quotations retain their original rate.
              </p>
            </div>
          </div>
        </div>

        {/* TOP PAGINATION BAR (COMPACT SMALL SIZE) */}
        <div className="rounded-xl border border-slate-200/90 bg-white px-3 py-1 text-xs shadow-2xs">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </div>


        {/* MODERN KANBAN CARDS VIEW (DEFAULT) */}

        {viewMode === 'kanban' ? (
          loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 font-bold text-xs">
              Loading Eco Panel rates...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 font-bold text-xs">
              No Eco Panels found matching "{search}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paginatedEcoPanels.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setPreviewProduct(p)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View full product specifications and image details for ${p.name} (${p.code})`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setPreviewProduct(p);
                    }
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-lg hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
                >
                  {/* Card Top Row: Code Badge, Thickness, Approved Pill */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        <HighlightText text={p.code} query={search} />
                      </span>

                      <div className="flex items-center gap-1.5">
                        {p.thickness && (
                          <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            <HighlightText text={p.thickness} query={search} />
                          </span>
                        )}
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Approved
                        </span>
                      </div>
                    </div>

                    {/* Image Thumbnail & Product Title */}
                    <div className="flex items-start gap-3 pt-1">
                      <div
                        className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 h-14 w-14 p-1 shadow-2xs flex items-center justify-center border-amber-300 group-hover:scale-105 transition-transform"
                      >
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

                  {/* Card Bottom Row: Approved Rate & Action Buttons */}
                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Approved Unit Rate</span>
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
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <History className="h-3.5 w-3.5 text-blue-600" /> History
                      </button>

                      {canEditRate ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRate(p);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-amber-400" /> Edit Rate
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRate(p);
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700 transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit3 className="h-3.5 w-3.5" /> Request Change
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )
        ) : (
          /* TABLE VIEW MODE (ALTERNATIVE) */
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-22rem)] rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-bold sticky top-0 z-20 shadow-md">
                <tr>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Product</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Specification & Thickness</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Unit</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Current Approved Rate</th>
                  <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Status</th>
                  <th className="py-3.5 px-4 text-right bg-slate-900 sticky top-0 z-20">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Loading Eco Panel rates...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No Eco Panels found matching "{search}".
                    </td>
                  </tr>
                ) : (
                  paginatedEcoPanels.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewProduct(p)}
                            className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white h-10 w-10 shadow-2xs p-0.5 flex items-center justify-center cursor-pointer"
                          >
                            <img
                              src={p.image_url || '/ecopanel_preview.png'}
                              alt={p.name}
                              className="h-full w-full object-contain"
                            />
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded w-max">
                              <HighlightText text={p.code} query={search} />
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              <HighlightText text={p.name} query={search} />
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div><HighlightText text={p.specification} query={search} /></div>
                        <div className="text-[10px] text-slate-400">
                          Thickness: <HighlightText text={p.thickness} query={search} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{p.unit}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-base font-black text-slate-900 font-mono">
                          {formatCurrency(p.current_rate)}
                        </span>
                        <span className="text-[10px] text-slate-400"> / {p.unit}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-max">
                          <CheckCircle className="h-3 w-3" /> {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onInspectHistory(p.id)}
                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <History className="h-3.5 w-3.5" /> History
                          </button>

                          {canEditRate ? (
                            <button
                              onClick={() => onEditRate(p)}
                              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Edit
                            </button>
                          ) : (
                            <button
                              onClick={() => onEditRate(p)}
                              className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Request
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
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
