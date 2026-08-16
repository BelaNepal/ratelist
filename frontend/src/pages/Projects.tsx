import React, { useEffect, useState } from 'react';
import { Building, Plus, MapPin, Layers, FileText, ArrowRight, UserCheck, CheckCircle2, Rocket, PlayCircle, Search, Filter, Image as ImageIcon, FolderOpen, DollarSign, Calendar, Sparkles, Trash2 } from 'lucide-react';
import { fetchProjects } from '../services/api';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { ProjectDetailModal } from '../components/ProjectDetailModal';

interface ProjectsProps {
  onNavigateToBOQ: (projectId: string) => void;
  onOpenAddProject?: () => void;
}

export const Projects: React.FC<ProjectsProps> = ({ onNavigateToBOQ, onOpenAddProject }) => {
  const { canPerform } = useAuth();
  const canCreateProject = canPerform('createProject');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Status Filter State (Default set to 'Completed' as requested by user)
  const [statusFilter, setStatusFilter] = useState<'Completed' | 'Upcoming' | 'Running' | 'All'>('Completed');
  const [search, setSearch] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [selectedProjectVault, setSelectedProjectVault] = useState<Project | null>(null);

  const loadProjects = () => {
    setLoading(true);
    fetchProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenModal = () => {
    if (onOpenAddProject) onOpenAddProject();
    setShowCreateModal(true);
  };

  const handleProjectCreated = (newProj: Project) => {
    const pStatus = (newProj.status || '').toLowerCase();
    if (pStatus.includes('complete')) {
      setStatusFilter('Completed');
    } else if (pStatus.includes('upcom') || pStatus.includes('draft')) {
      setStatusFilter('Upcoming');
    } else if (pStatus.includes('run') || pStatus.includes('active')) {
      setStatusFilter('Running');
    } else {
      setStatusFilter('All');
    }

    loadProjects();
    setSelectedProjectVault(newProj);
  };

  const handleProjectUpdated = (updatedProj: Project) => {
    loadProjects();
    if (selectedProjectVault && selectedProjectVault.id === updatedProj.id) {
      setSelectedProjectVault(updatedProj);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const pStatus = (p.status || 'Active').toLowerCase();
    let matchesStatus = true;

    if (statusFilter === 'Completed') {
      matchesStatus = pStatus.includes('complete');
    } else if (statusFilter === 'Upcoming') {
      matchesStatus = pStatus.includes('upcom') || pStatus.includes('draft');
    } else if (statusFilter === 'Running') {
      matchesStatus = pStatus.includes('run') || pStatus.includes('active');
    }

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(search.toLowerCase())) ||
      (p.assigned_staff && p.assigned_staff.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (statusStr: string) => {
    const s = (statusStr || '').toLowerCase();
    if (s.includes('complete')) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Completed
        </span>
      );
    }
    if (s.includes('upcom') || s.includes('draft')) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
          <Rocket className="h-3 w-3 text-indigo-600" /> Upcoming
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
        <PlayCircle className="h-3 w-3 text-blue-600" /> Running
      </span>
    );
  };

  const completedCount = projects.filter((p) => (p.status || '').toLowerCase().includes('complete')).length;
  const upcomingCount = projects.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s.includes('upcom') || s.includes('draft');
  }).length;
  const runningCount = projects.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s.includes('run') || s.includes('active');
  }).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Unified Sticky Section Header & Filter Toolbar */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 md:px-8 space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <Building className="h-6 w-6 text-[#ef7e2d]" /> Project Management & Asset Vault
            </h1>
            <p className="text-xs text-slate-500">
              PostgreSQL persistent project database, site photo gallery & document vault (.pdf, .xlsm, .docx).
            </p>
          </div>

          {canCreateProject && (
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 rounded-xl bg-[#ef7e2d] hover:bg-[#ef7e2d]/90 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-[#ef7e2d]/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> Create New Project Wizard
            </button>
          )}
        </div>

        {/* FILTER TOOLBAR BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Status Tab Selectors */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('Completed')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Completed'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Completed Projects ({completedCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Upcoming')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Upcoming'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>Upcoming Projects ({upcomingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Running')}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Running'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              <span>Running Projects ({runningCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('All')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({projects.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects, clients, location..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs outline-none focus:border-[#ef7e2d] font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Page Content Body */}
      <div className="p-6 md:p-8 space-y-6">

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading project records...
          </div>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((p) => {
            const galCount = (p.gallery_images || []).length;
            const docCount = (p.project_files || []).length;
            const estCost = Number(p.estimated_cost || 0);

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {p.id}
                    </span>
                    {getStatusBadge(p.status)}
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base">{p.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{p.customer_name}</p>

                  {/* Attributes Section */}
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    {estCost > 0 && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>Budget / Cost: <strong className="text-emerald-700 font-mono">NPR {estCost.toLocaleString()}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Location: <strong>{p.location || 'Kathmandu, Nepal'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Type: <strong>{p.building_type || 'Residential Cottage'} ({p.area_sqft || 2400} sq.ft • {p.floors || 1} Floor)</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>Assigned: <strong>{p.assigned_staff || 'Engineering Lead'}</strong></span>
                    </div>

                    {(p.start_date || p.completion_date) && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>Timeline: <strong>{p.start_date || 'Start'} → {p.completion_date || 'Ongoing'}</strong></span>
                      </div>
                    )}

                    {p.description && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2 mt-2 leading-relaxed">
                        "{p.description}"
                      </p>
                    )}
                  </div>

                  {/* Asset Counter Badges */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <ImageIcon className="h-3 w-3 text-blue-500" /> {galCount} Photos
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <FileText className="h-3 w-3 text-purple-500" /> {docCount} Docs/XLSM
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedProjectVault(p)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FolderOpen className="h-3.5 w-3.5 text-purple-600" /> Vault & Gallery
                  </button>

                  <button
                    onClick={() => onNavigateToBOQ(p.id)}
                    className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Build BOQ</span> <ArrowRight className="h-3.5 w-3.5" />
                  </button>

                  {canPerform('deleteProduct') && (
                    <button
                      onClick={async () => {
                        if (window.confirm(`Move project "${p.name}" (${p.id}) to Trash Bin?`)) {
                          try {
                            const { deleteProjectApi } = await import('../services/api');
                            await deleteProjectApi(p.id);
                            loadProjects();
                          } catch (err: any) {
                            alert('Delete failed: ' + err.message);
                          }
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                      title="Move Project to Trash Bin"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            No projects found under <strong>"{statusFilter}"</strong> criteria.
          </div>
        )}
      </div>

      {/* Multi-Step Create Project Wizard Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {/* Project Asset Vault Drawer / Modal */}
      {selectedProjectVault && (
        <ProjectDetailModal
          project={selectedProjectVault}
          onClose={() => setSelectedProjectVault(null)}
          onProjectUpdated={handleProjectUpdated}
        />
      )}
      </div>
    </div>
  );
};


