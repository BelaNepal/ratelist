import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Building, XCircle, ArrowRight, ArrowLeft, CheckCircle2, MapPin, Layers, UserCheck, Ruler, Calendar, CheckSquare } from 'lucide-react';
import { createProject } from '../services/api';
import { Project } from '../types';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onProjectCreated }) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [location, setLocation] = useState<string>('Kathmandu, Nepal');
  const [buildingType, setBuildingType] = useState<string>('Residential Prefab Cottage');
  const [areaSqft, setAreaSqft] = useState<number>(2400);
  const [floors, setFloors] = useState<number>(2);
  const [assignedStaff, setAssignedStaff] = useState<string>('Ashish (Lead Engineer)');
  const [status, setStatus] = useState<'Completed' | 'Upcoming' | 'Running' | 'Active'>('Completed');

  const handleNext = () => {
    if (step === 1 && (!name.trim() || !customerName.trim())) {
      setError('Please provide both Project Name and Client Name.');
      return;
    }
    setError(null);
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const proj = await createProject({
        name,
        customer_name: customerName,
        location,
        building_type: buildingType,
        area_sqft: areaSqft,
        floors,
        assigned_staff: assignedStaff,
        status: status as any
      });
      onProjectCreated(proj);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-left relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Step {step} of 3 • Construction Wizard
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1.5 flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" /> Create Construction Project
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Step Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* STEP 1: CLIENT & LOCATION INFO */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              1. Project Title & Client Details
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pokhara Luxury Eco Resort"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client / Customer Name *</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Annapurna Hospitality Group"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Site Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Pokhara, Kaski"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Building Type</label>
                <select
                  value={buildingType}
                  onChange={(e) => setBuildingType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Residential Prefab Cottage">Residential Prefab Cottage</option>
                  <option value="Commercial Warehouse">Commercial Warehouse</option>
                  <option value="Hospitality Resort Suite">Hospitality Resort Suite</option>
                  <option value="Multi-Story Villa">Multi-Story Eco Villa</option>
                  <option value="School / Institutional Block">School / Institutional Block</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: TECHNICAL SPECS & LIFECYCLE STATUS */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              2. Technical Specifications & Lifecycle Status
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Built Area (sq. ft.)</label>
                <input
                  type="number"
                  value={areaSqft}
                  onChange={(e) => setAreaSqft(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-bold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Number of Floors</label>
                <input
                  type="number"
                  value={floors}
                  onChange={(e) => setFloors(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono font-bold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Lead Engineer / Staff</label>
              <input
                type="text"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                placeholder="Ashish (Lead Engineer)"
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Lifecycle Status *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Completed')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✓ Completed
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('Upcoming')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    status === 'Upcoming'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-400 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🚀 Upcoming
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('Running')}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    status === 'Running' || status === 'Active'
                      ? 'bg-blue-50 text-blue-800 border-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ● Running
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUMMARY PREVIEW & SAVE */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              3. Review & Confirm Project Dispatch
            </h3>

            <div className="rounded-2xl bg-slate-900 text-white p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] font-extrabold uppercase text-blue-400">Project Review Summary</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                  status === 'Completed' ? 'bg-emerald-500 text-white' : status === 'Upcoming' ? 'bg-indigo-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {status}
                </span>
              </div>

              <div>
                <div className="text-base font-black text-white">{name}</div>
                <div className="text-xs text-slate-300 font-medium">{customerName}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <div>Location: <strong className="text-white">{location}</strong></div>
                <div>Type: <strong className="text-white">{buildingType}</strong></div>
                <div>Built Area: <strong className="text-white">{areaSqft} sq.ft</strong></div>
                <div>Staff Lead: <strong className="text-white">{assignedStaff}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Next Step <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{loading ? 'Creating...' : 'Confirm & Save Project'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
