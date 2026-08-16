import React, { useEffect, useState } from 'react';
import { Layers, History, Edit3, ShieldAlert, CheckCircle, Globe, RefreshCw, Image as ImageIcon, Eye } from 'lucide-react';

import { fetchProducts, syncLiveProducts } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { HighlightText } from '../components/HighlightText';
import { ProductImageModal } from '../components/ProductImageModal';
import { Pagination } from '../components/Pagination';

interface EcoPanelsProps {
  onInspectHistory: (productId: string) => void;
  onEditRate: (product: Product) => void;
}

export const EcoPanels: React.FC<EcoPanelsProps> = ({ onInspectHistory, onEditRate }) => {
  const { role, canPerform } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [subTab, setSubTab] = useState<string>('All');
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

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
              Dedicated rate list for EPS Sandwich Panels, Accessories, Adhesives & Installation (Synced with belaecopanels.com API)
            </p>
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

        {/* Toolbar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-2.5 shadow-2xs">
          <div className="flex items-center gap-2">
            {['All', 'Wall Panels', 'Accessories', 'Services'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setSubTab(st);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
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

      {/* Main Page Content Body (Padded) */}
      <div className="p-6 md:p-8 space-y-6">
        {syncMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Rate History Audit Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-blue-600 shrink-0" />
            <div>
              <div className="font-bold">Rate History & Audit Lineage active</div>
              <p className="text-[11px] text-blue-700">
                Rates are never overwritten. Every update preserves historical snapshots so old quotations retain their original rate.
              </p>
            </div>
          </div>
        </div>

        {/* Panels Rate Table with Freeze-Header Top Row (0px Gap Above) */}
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
                        <div className="shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white h-10 w-10 shadow-2xs p-0.5 flex items-center justify-center">
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
                      <span className="text-base font-black text-slate-900">
                        Rs. {p.current_rate.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400"> / {p.unit}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-max">
                        <CheckCircle className="h-3 w-3" /> {p.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => setPreviewProduct(p)}
                          className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs whitespace-nowrap"
                          title="View Complete Specs & Rates"
                        >
                          <Eye className="h-3 w-3" /> VIEW INFO
                        </button>
                        <button
                          onClick={() => onInspectHistory(p.id)}
                          className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap"
                        >
                          <History className="h-3 w-3" /> HISTORY
                        </button>
                        {canEditRate && (
                          <button
                            onClick={() => onEditRate(p)}
                            className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                          >
                            <Edit3 className="h-3 w-3" /> UPDATE RATE
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

        {/* Pagination Footer */}
        {!loading && filteredProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
    </div>
  );
};
