import React, { useState } from 'react';
import { X, PlusCircle, Upload, Image as ImageIcon, FolderPlus, CheckCircle2 } from 'lucide-react';
import { createProduct, uploadProductImageFile } from '../services/api';

interface AddProductModalProps {
  onClose: () => void;
  onAdded: () => void;
  existingCategories?: string[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAdded, existingCategories = [] }) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Eco Panels');
  const [customCategory, setCustomCategory] = useState('');
  const [subcategory, setSubcategory] = useState('Wall Panel');
  const [unit, setUnit] = useState('m²');
  const [specification, setSpecification] = useState('');
  const [thickness, setThickness] = useState('50 mm');
  const [size, setSize] = useState('1200 × 2400 mm');
  const [brand, setBrand] = useState('Bela EcoPanel');
  const [currentRate, setCurrentRate] = useState('');
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const defaultCategoryList = Array.from(new Set([
    'Eco Panels',
    'Modular Components',
    'Accessories',
    'Services',
    'Raw Materials',
    ...existingCategories
  ]));

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currentRate) return;

    setLoading(true);
    try {
      const finalCategory = category === 'NEW' ? (customCategory.trim() || 'Custom Category') : category;
      let finalImageUrl = '/ecopanel_preview.png';

      // Upload Asset File to Backend Subdirectory if selected
      if (imageFile) {
        setUploading(true);
        const uploadRes = await uploadProductImageFile(imageFile, finalCategory);
        if (uploadRes.success && uploadRes.imageUrl) {
          finalImageUrl = uploadRes.imageUrl;
        }
      }

      await createProduct({
        code: code.trim() || `BP-${Math.floor(100 + Math.random() * 900)}`,
        name,
        category: finalCategory,
        subcategory,
        unit,
        specification,
        thickness,
        size,
        brand,
        current_rate: Number(currentRate),
        image_url: finalImageUrl
      });

      onAdded();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight text-white">Add New Product & Asset to Master</h3>
              <p className="text-xs text-slate-400">Stores specs, custom category, and uploads product image to backend disk</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Image Upload Dropzone Box */}
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-2">Product Image Asset</label>
            <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-blue-50/40 hover:border-blue-400 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />

              {imagePreview ? (
                <div className="flex items-center gap-4 w-full">
                  <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-xl border border-slate-300 shadow-xs" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Image Asset Selected
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">{imageFile?.name}</div>
                    <div className="text-[10px] text-blue-600 font-bold mt-1">Will save to backend /uploads/products/{category.toLowerCase().replace(/[^a-z0-9]/g, '_')}/</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full justify-center py-2 text-slate-500">
                  <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-2xs border border-slate-200">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800">Click or Drag & Drop Image File</div>
                    <p className="text-[10px] text-slate-400">PNG, JPG, WEBP or SVG up to 10MB (Saves to backend directory)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Code & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Code</label>
              <input
                type="text"
                placeholder="e.g. EP-050 / MOD-STL"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Solar Prefab Roof Sheet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Category Dropdown with Custom Category Creation Option */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category Select</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {defaultCategoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="NEW" className="font-extrabold text-blue-600">
                  + Create New Custom Category...
                </option>
              </select>
            </div>

            {/* Custom Category Input if NEW is chosen */}
            {category === 'NEW' ? (
              <div>
                <label className="text-xs font-bold text-blue-700 block mb-1 flex items-center gap-1">
                  <FolderPlus className="h-3.5 w-3.5 text-blue-600" /> New Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Prefab Systems"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full rounded-xl border border-blue-400 bg-blue-50/40 p-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subcategory / Type</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}
          </div>

          {/* Unit, Thickness & Initial Rate */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Thickness / Size</label>
              <input
                type="text"
                value={thickness}
                onChange={(e) => setThickness(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-extrabold text-blue-700 block mb-1">Approved Initial Rate (Rs.) *</label>
              <input
                type="number"
                required
                placeholder="1920"
                value={currentRate}
                onChange={(e) => setCurrentRate(e.target.value)}
                className="w-full rounded-xl border-2 border-blue-500 bg-blue-50/20 p-2.5 text-xs font-black outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Specification */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Technical Specification</label>
            <textarea
              rows={2}
              placeholder="e.g. 50mm EPS core density 12kg/m³ with 0.5mm CSB board facings"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              {uploading ? 'Uploading Asset...' : loading ? 'Saving Product...' : 'Save Product & Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
