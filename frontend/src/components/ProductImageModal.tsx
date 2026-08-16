import React from 'react';
import { X, ShieldCheck, CheckCircle2, Maximize2 } from 'lucide-react';
import { Product } from '../types';

interface ProductImageModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductImageModal: React.FC<ProductImageModalProps> = ({ product, onClose }) => {
  if (!product) return null;

  const imageUrl = product.image_url || '/ecopanel_preview.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-black bg-[#ef7e2d] text-white px-2 py-0.5 rounded">
              {product.code}
            </span>
            <h2 className="font-extrabold text-base text-white tracking-tight">{product.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Full High Resolution Uncropped Image View */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner min-h-[320px] max-h-[55vh] flex items-center justify-center">
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-[50vh] max-w-full object-contain rounded-xl shadow-lg transition-transform duration-200"
            />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur">
              <Maximize2 className="h-3.5 w-3.5 text-[#ef7e2d]" /> Full High Resolution Uncropped Render
            </div>
          </div>

          {/* Specs & Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">Category</div>
              <div className="font-extrabold text-slate-900 mt-0.5">{product.category}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">Thickness</div>
              <div className="font-extrabold text-slate-900 mt-0.5">{product.thickness}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-400">Dimensions</div>
              <div className="font-extrabold text-slate-900 mt-0.5">{product.size}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Current Rate</div>
              <div className="font-black text-slate-900 text-sm mt-0.5">
                Rs. {product.current_rate.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/ {product.unit}</span>
              </div>
            </div>
          </div>

          {/* Technical Description */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-1">
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Technical Specification
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              {product.specification}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3.5 bg-slate-50 text-xs shrink-0">
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <CheckCircle2 className="h-4 w-4" /> Single Source of Truth Approved Corporate Rate
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Full Image
          </button>
        </div>
      </div>
    </div>
  );
};
