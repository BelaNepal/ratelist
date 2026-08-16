import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Building, XCircle, Image as ImageIcon, FileText, Upload, Trash2, Download, ExternalLink, Calendar, MapPin, Layers, UserCheck, DollarSign, Save, CheckCircle2, Eye, FileSpreadsheet, FileCode, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, ProjectFile } from '../types';
import { updateProjectApi, uploadProjectGalleryApi, uploadProjectDocumentApi, deleteProjectFileApi } from '../services/api';
import { resolveAssetUrl } from '../utils/formatters';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
  onProjectUpdated: (updated: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project: initialProject, onClose, onProjectUpdated }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeTab, setActiveTab] = useState<'gallery' | 'documents' | 'metadata'>('gallery');
  const [uploading, setUploading] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Metadata Edit Form State
  const [estimatedCost, setEstimatedCost] = useState<number | ''>(project.estimated_cost || '');
  const [startDate, setStartDate] = useState<string>(project.start_date || '');
  const [completionDate, setCompletionDate] = useState<string>(project.completion_date || '');
  const [assignedStaff, setAssignedStaff] = useState<string>(project.assigned_staff || '');
  const [description, setDescription] = useState<string>(project.description || '');

  const galleryImages = project.gallery_images || [];
  const projectFiles = project.project_files || [];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleNextImage = () => {
    if (lightboxIndex === null || galleryImages.length === 0) return;
    setLightboxIndex((prev) => (prev! + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    if (lightboxIndex === null || galleryImages.length === 0) return;
    setLightboxIndex((prev) => (prev! - 1 + galleryImages.length) % galleryImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') handleNextImage();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'Escape') setLightboxIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, galleryImages.length]);

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files);
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('images', file);
    });

    setUploading(true);
    try {
      const res = await uploadProjectGalleryApi(project.id, formData);
      if (res.success && res.project) {
        setProject(res.project);
        onProjectUpdated(res.project);
        triggerToast(`✅ ${fileList.length} site photo(s) uploaded to gallery & database!`);
      } else if (res.error) {
        alert('Upload error: ' + res.error);
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      const res = await uploadProjectDocumentApi(project.id, formData);
      if (res.success && res.project) {
        setProject(res.project);
        onProjectUpdated(res.project);
        triggerToast(`✅ Project file "${file.name}" saved to asset vault!`);
      } else if (res.error) {
        alert('Document upload error: ' + res.error);
      }
    } catch (err: any) {
      alert('Document upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileOrImgId: string) => {
    if (window.confirm('Are you sure you want to remove this file/photo from project vault?')) {
      try {
        const res = await deleteProjectFileApi(project.id, fileOrImgId);
        if (res.success && res.project) {
          setProject(res.project);
          onProjectUpdated(res.project);
          triggerToast('Asset removed from database.');
        }
      } catch (err: any) {
        alert('Failed to delete asset: ' + err.message);
      }
    }
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateProjectApi(project.id, {
        estimated_cost: Number(estimatedCost) || 0,
        start_date: startDate,
        completion_date: completionDate,
        assigned_staff: assignedStaff,
        description: description
      });
      setProject(updated);
      onProjectUpdated(updated);
      triggerToast('✅ Project metadata updated in PostgreSQL DB!');
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    }
  };

  const getFileBadge = (fileType: string) => {
    const ext = (fileType || '').toLowerCase();
    if (ext.includes('xls') || ext.includes('csv')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">XLSM / EXCEL</span>;
    }
    if (ext.includes('pdf')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">PDF DOC</span>;
    }
    if (ext.includes('doc')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-300">WORD DOC</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-300">{ext}</span>;
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-left">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-700">
                {project.id}
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                {project.status}
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-400" /> {project.name}
            </h2>
            <p className="text-xs text-slate-300 font-medium">Client: {project.customer_name} | Location: {project.location}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation Toolbar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Site Image Gallery ({galleryImages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'documents'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Documents Vault ({projectFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'metadata'
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Scope & Financials</span>
          </button>
        </div>

        {toastMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Body Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: SITE GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Project Site Photos & Video Gallery</h3>
                  <p className="text-xs text-slate-500">Select single or multiple site photos & site drone videos (.mp4, .mov, .webm) to upload.</p>
                </div>

                <label className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload Photos & Videos'}</span>
                  <input type="file" accept="image/*,video/*" multiple onChange={handleGalleryUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {galleryImages.map((imgUrl, idx) => {
                    const resolved = resolveAssetUrl(imgUrl);
                    const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(imgUrl);
                    return (
                      <div key={idx} className="group relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs hover:shadow-md transition-all h-36">
                        {isVideo ? (
                          <video src={resolved} className="h-full w-full object-cover" muted />
                        ) : (
                          <img src={resolved} alt={`Site media ${idx}`} className="h-full w-full object-cover" />
                        )}
                        
                        {isVideo && (
                          <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur">
                            ▶ VIDEO
                          </div>
                        )}

                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => setLightboxIndex(idx)}
                            className="p-2 rounded-full bg-white/90 text-slate-900 hover:bg-white transition-colors cursor-pointer"
                            title="Open Media Viewer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFile(imgUrl)}
                            className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                            title="Delete Media"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  No site gallery photos uploaded yet. Click <strong>"Upload Site Photos (Multiple)"</strong> above.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOCUMENTS VAULT */}
          {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Project Documents & Spreadsheet Vault</h3>
                  <p className="text-xs text-slate-500">Upload BOQ spreadsheets (.xlsm), architectural drawings (.pdf), and contracts (.docx).</p>
                </div>

                <label className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload Project File'}</span>
                  <input type="file" accept=".pdf,.docx,.doc,.xlsx,.xlsm,.dwg,.txt" onChange={handleDocumentUpload} className="hidden" disabled={uploading} />
                </label>
              </div>

              {projectFiles.length > 0 ? (
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs">
                  {projectFiles.map((file: ProjectFile) => (
                    <div key={file.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                          <FileSpreadsheet className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{file.original_name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Uploaded: {file.uploaded_at}</span>
                            <span>•</span>
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {getFileBadge(file.file_type)}

                        <a
                          href={resolveAssetUrl(file.file_url)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Download / View File"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                  No project documents or spreadsheets uploaded yet. Click <strong>"Upload Project File"</strong> above.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECT METADATA */}
          {activeTab === 'metadata' && (
            <form onSubmit={handleSaveMetadata} className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-extrabold text-slate-900">Project Financials & Timeline Metadata</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Budget / Contract Cost (NPR)</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 12500000"
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Site Lead Engineer</label>
                  <input
                    type="text"
                    value={assignedStaff}
                    onChange={(e) => setAssignedStaff(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Completion Date</label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Scope & Technical Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed project architectural scope, panel specifications, and client requirement notes..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs outline-none focus:border-amber-500 leading-relaxed font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Save Scope & Financials to DB
                </button>
              </div>
            </form>
          )}

        </div>

      </div>

      {/* Modern Interactive Lightbox Carousel */}
      {lightboxIndex !== null && galleryImages.length > 0 && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-200">
          {/* Top Bar with Counter & Close */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <span className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-extrabold text-white">
              Site Photo {lightboxIndex + 1} of {galleryImages.length}
            </span>

            <button
              onClick={() => setLightboxIndex(null)}
              className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer"
            >
              <XCircle className="h-7 w-7" />
            </button>
          </div>

          {/* Left Arrow Button */}
          {galleryImages.length > 1 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-blue-600 border border-slate-700 shadow-2xl transition-all cursor-pointer z-10"
              title="Previous Photo (Left Arrow)"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* Main Media View */}
          <div className="relative max-w-5xl max-h-[82vh] flex items-center justify-center">
            {/\.(mp4|webm|mov|mkv)$/i.test(galleryImages[lightboxIndex]) ? (
              <video
                src={resolveAssetUrl(galleryImages[lightboxIndex])}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-150"
              />
            ) : (
              <img
                src={resolveAssetUrl(galleryImages[lightboxIndex])}
                alt={`Gallery site media ${lightboxIndex + 1}`}
                className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl object-contain animate-in zoom-in-95 duration-150"
              />
            )}
          </div>

          {/* Right Arrow Button */}
          {galleryImages.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-blue-600 border border-slate-700 shadow-2xl transition-all cursor-pointer z-10"
              title="Next Photo (Right Arrow)"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
