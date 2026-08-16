import React, { useEffect, useState } from 'react';
import { Package, Search, Filter, History, Edit3, Plus, CheckCircle, XCircle, RefreshCw, Globe, Image as ImageIcon, Eye, Trash2 } from 'lucide-react';

import { fetchProducts, syncLiveProducts, deleteProductApi } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../context/AuthContext';
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

export const ProductMaster: React.FC<ProductMasterProps> = ({
  onInspectHistory,
  onEditRate,
  onOpenAddProduct,
  searchQuery = ''
}) => {
  const { role, canPerform } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState<string>(searchQuery);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [showTrashModal, setShowTrashModal] = useState<boolean>(false);

  // Mouse-tip floating preview state
  const [hoveredProd, setHoveredProd] = useState<Product | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Extract unique categories dynamically from current products list + defaults
  const categoriesList = Array.from(new Set(['All', 'Eco Panels', 'Modular Components', 'Accessories', 'Services', 'Raw Materials', ...products.map((p) => p.category)]));

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

  // Paginated Slice
  const paginatedProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-300">
      <ProductImageModal product={previewProduct} onClose={() => setPreviewProduct(null)} />

      {/* Sticky Section Header & Filter Toolbar (0px Gap Flush under Navbar) */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 px-6 py-4 md:px-8 space-y-3 shadow-2xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-[#ef7e2d]" /> Product & Rate Master
            </h1>
            <p className="text-xs text-slate-500">
              Rich metadata product registry — type anything to search & highlight across all columns
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canAddProduct && (
              <>
                <button
                  onClick={handleSyncLive}
                  disabled={syncing}
                  className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Globe className={`h-4 w-4 text-emerald-600 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Live belaecopanels.com API'}
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
            {Array.from(new Set(['All', 'Eco Panels', 'Modular Components', 'Accessories', 'Services', 'Raw Materials', ...products.map((p) => p.category)])).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  category === cat
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

      {/* Main Page Content Body (Padded) */}
      <div className="p-6 md:p-8 space-y-6">
        {syncMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-bold text-emerald-900 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Product Master Table with Freeze-Header Top Row (0px Gap Above) */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-18rem)] rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white uppercase tracking-wider text-[10px] font-bold sticky top-0 z-20 shadow-md">
              <tr>
                <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Code</th>
                <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Product Name & Spec</th>
                <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Category</th>
                <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Thickness / Size</th>
                <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Unit</th>
                <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Current Approved Rate</th>
                <th className="py-3.5 px-4 bg-slate-900 sticky top-0 z-20">Status</th>
                <th className="py-3.5 px-4 text-right bg-slate-900 sticky top-0 z-20">Actions</th>
              </tr>
            </thead>


            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No products found matching "{search}".
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/40 transition-colors">
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
                          <div className="text-[11px] text-slate-500 font-normal">
                            <HighlightText text={p.specification} query={search} />
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                        <HighlightText text={p.category} query={search} />
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        <HighlightText text={p.subcategory} query={search} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div><HighlightText text={p.thickness} query={search} /></div>
                      <div className="text-[10px] text-slate-400"><HighlightText text={p.size} query={search} /></div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">{p.unit}</td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-black text-slate-900">
                        Rs. {p.current_rate.toLocaleString()}
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

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
                        <button
                          onClick={() => setPreviewProduct(p)}
                          className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs whitespace-nowrap"
                          title="View Complete Product Info & Technical Spec"
                        >
                          <Eye className="h-3 w-3" /> VIEW INFO
                        </button>
                        <button
                          onClick={() => onInspectHistory(p.id)}
                          className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition-colors whitespace-nowrap"
                          title="View Rate Lineage History"
                        >
                          <History className="h-3 w-3" /> HISTORY
                        </button>
                        {canAddProduct && (
                          <button
                            onClick={() => onEditRate(p)}
                            className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap cursor-pointer"
                            title="Propose Rate Change"
                          >
                            <Edit3 className="h-3 w-3" /> UPDATE RATE
                          </button>
                        )}
                        {canDeleteProduct && (
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="flex items-center justify-center rounded-md bg-red-50 p-1 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors whitespace-nowrap cursor-pointer"
                            title="Delete Product from Rate Master"
                          >
                            <Trash2 className="h-3 w-3" />
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
        {!loading && products.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={products.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        )}
      </div>

      {/* Product Specification & Image Modal */}
      {previewProduct && (
        <ProductImageModal
          product={previewProduct}
          onClose={() => setPreviewProduct(null)}
        />
      )}
    </div>
  );
};










