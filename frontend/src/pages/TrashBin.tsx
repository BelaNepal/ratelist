import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  Search,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Clock,
  User,
  Calendar,
  RefreshCw,
  Tag,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { fetchTrashProducts, restoreProductApi, purgeProductApi } from '../services/api';
import { HighlightText } from '../components/HighlightText';
import { formatModernTimestamp } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

export const TrashBinPage: React.FC = () => {
  const { canPerform } = useAuth();
  const canRestore = canPerform('deleteProduct');
  const canPurge = canPerform('purgeProduct');
  const [trashedProducts, setTrashedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  const loadTrash = () => {
    setLoading(true);
    fetchTrashProducts()
      .then((data) => {
        setTrashedProducts(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const handleRestore = async (product: Product) => {
    try {
      const res = await restoreProductApi(product.id);
      setActionMessage(res.message || `Restored ${product.name}`);
      setTrashedProducts((prev) => prev.filter((p) => p.id !== product.id));
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert('Failed to restore product');
    }
  };

  const handlePurge = async (product: Product) => {
    if (
      window.confirm(
        `PERMANENT PURGE WARNING:\nAre you sure you want to permanently delete "${product.name}" (${product.code})?\nThis action CANNOT be undone!`
      )
    ) {
      try {
        const res = await purgeProductApi(product.id);
        setActionMessage(res.message || `Purged ${product.name}`);
        setTrashedProducts((prev) => prev.filter((p) => p.id !== product.id));
        setTimeout(() => setActionMessage(''), 4000);
      } catch (err) {
        alert('Failed to purge product');
      }
    }
  };

  const filteredTrash = trashedProducts.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.specification && p.specification.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-full pb-8 animate-in fade-in duration-300">
      {/* Sticky Top Header (0px Gap Flush under Navbar) */}
      <div className="sticky top-0 z-20 -mt-6 -mx-6 px-6 pt-4 pb-4 md:-mt-8 md:-mx-8 md:px-8 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/90 space-y-2 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <Trash2 className="h-6 w-6 text-[#ef7e2d]" /> Rate Master Trash Bin & Soft-Delete Recovery
            </h1>
            <p className="text-xs text-slate-500">
              Compact Kanban inspection for soft-deleted items with 1-click restore or permanent purge controls
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadTrash}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} /> Refresh Trash
            </button>
            <span className="rounded-xl bg-red-100 text-red-800 px-3.5 py-2 font-mono text-xs font-black border border-red-200">
              {trashedProducts.length} Trashed Items
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 space-y-6">
        {actionMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Filter Search & Audit Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search soft-deleted cards by code, name, category, or spec..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-xs font-bold outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>30-Day Soft Recovery Retention Active</span>
          </div>
        </div>

        {/* COMPACT KANBAN-STYLE CARDS GRID (NO TABLES) */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold text-xs">
            Loading soft-deleted catalog cards...
          </div>
        ) : filteredTrash.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">Trash Bin is Empty</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No soft-deleted records match your filter. All active products are live in the Product Master catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTrash.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-red-200/90 bg-white p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group border-t-4 border-t-red-600"
              >
                {/* Header Row: Code & Deletion Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-lg">
                    <HighlightText text={p.code} query={search} />
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="rounded bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5">
                      TRASHED
                    </span>
                    <span className="rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5">
                      28d Left
                    </span>
                  </div>
                </div>

                {/* Product Thumbnail Frame */}
                <div className="h-28 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center overflow-hidden">
                  <img
                    src={p.image_url || '/ecopanel_preview.png'}
                    alt={p.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Body Details */}
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">
                    <HighlightText text={p.name} query={search} />
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    <HighlightText text={p.specification} query={search} />
                  </p>

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                      {p.category}
                    </span>
                    <span className="font-mono font-extrabold text-blue-600 text-xs">
                      NPR {Number(p.current_rate || 0).toLocaleString('en-IN')} / {p.unit}
                    </span>
                  </div>
                </div>

                {/* Deletion Audit Info Box with Modern Date & Exact Time */}
                {(() => {
                  const ts = formatModernTimestamp((p as any).deleted_at);
                  return (
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 text-[10px] space-y-1 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold">
                          <Calendar className="h-3 w-3 text-red-500" /> Date:
                        </span>
                        <span className="font-mono font-bold text-slate-800">
                          {ts.formattedDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 font-semibold text-slate-500">
                          <Clock className="h-3 w-3 text-blue-500" /> Time:
                        </span>
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                          {ts.formattedTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-0.5 border-t border-slate-200/60">
                        <span className="flex items-center gap-1 font-semibold">
                          <User className="h-3 w-3 text-slate-400" /> Deleted By:
                        </span>
                        <span className="font-bold text-slate-800">
                          {(p as any).deleted_by || 'Admin User'}
                        </span>
                      </div>
                    </div>
                  );
                })()}


                {/* Actions Row */}
                <div className="flex items-center gap-2 pt-1">
                  {/* RESTORE BUTTON */}
                  {canRestore && (
                    <button
                      onClick={() => handleRestore(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black uppercase text-white hover:bg-emerald-700 shadow-xs transition-all cursor-pointer"
                      title="Restore Product back to Active Rate List"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> RESTORE
                    </button>
                  )}

                  {/* PURGE BUTTON */}
                  {canPurge && (
                    <button
                      onClick={() => handlePurge(p)}
                      className="flex items-center justify-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-[10px] font-black uppercase text-white hover:bg-red-700 shadow-xs transition-all cursor-pointer"
                      title="Permanently Purge from Memory"
                    >
                      <Flame className="h-3.5 w-3.5" /> PURGE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
