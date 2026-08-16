import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  X,
  Search,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Flame
} from 'lucide-react';
import { Product } from '../types';
import { fetchTrashProducts, restoreProductApi, purgeProductApi } from '../services/api';

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductRestored: () => void;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({
  isOpen,
  onClose,
  onProductRestored
}) => {
  const [trashedProducts, setTrashedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<string>('');

  const loadTrash = () => {
    setLoading(true);
    fetchTrashProducts()
      .then(setTrashedProducts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadTrash();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRestore = async (product: Product) => {
    try {
      const res = await restoreProductApi(product.id);
      setActionMessage(res.message || `Restored ${product.name}`);
      setTrashedProducts((prev) => prev.filter((p) => p.id !== product.id));
      onProductRestored();
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
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                Trash Bin & Soft Delete Recovery Hub
                <span className="rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs px-2.5 py-0.5 font-black">
                  {trashedProducts.length} Items
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Soft-deleted items are safely held for 30 days before permanent deletion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Status Notification */}
        {actionMessage && (
          <div className="mx-6 mt-4 rounded-xl bg-emerald-50 border border-emerald-300 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Filter Search Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search soft-deleted products by code, name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-blue-500 bg-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <span>Admin Recovery Active</span>
          </div>
        </div>

        {/* Trashed Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-12 text-center text-slate-400 font-bold text-xs">
              Loading soft-deleted catalog records...
            </div>
          ) : filteredTrash.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">Trash Bin is Empty</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No soft-deleted records match your filter. All active products are safely published in the Rate Master.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Product Name & Spec</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Approved Rate</th>
                    <th className="py-3 px-4">Deletion Info</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredTrash.map((p) => (
                    <tr key={p.id} className="hover:bg-red-50/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-red-600 bg-red-50/40">
                        {p.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{p.specification}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{p.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        NPR {Number(p.current_rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <span className="text-[10px] text-slate-400 font-normal"> / {p.unit}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="rounded bg-red-100 text-red-800 px-2 py-0.5 text-[10px] font-bold">
                          TRASHED
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {(p as any).deleted_at ? new Date((p as any).deleted_at).toLocaleDateString() : 'Recently'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          {/* RESTORE BUTTON */}
                          <button
                            onClick={() => handleRestore(p)}
                            className="flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                            title="Restore Product back to Active Rate List"
                          >
                            <RotateCcw className="h-3 w-3" /> RESTORE
                          </button>

                          {/* PERMANENT PURGE BUTTON */}
                          <button
                            onClick={() => handlePurge(p)}
                            className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase text-white hover:bg-red-700 transition-colors shadow-2xs cursor-pointer"
                            title="Permanently Purge from Memory"
                          >
                            <Flame className="h-3 w-3" /> PURGE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3 text-xs">
          <div className="text-slate-500 font-medium">
            Soft Delete Strategy ensures data security & prevents accidental data loss.
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-white transition-colors"
          >
            Close Trash Hub
          </button>
        </div>
      </div>
    </div>
  );
};
