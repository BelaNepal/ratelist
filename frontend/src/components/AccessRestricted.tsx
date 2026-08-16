import React from 'react';
import { ShieldAlert, ArrowLeft, Lock, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AccessRestrictedProps {
  tabName: string;
  onNavigateHome: () => void;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({ tabName, onNavigateHome }) => {
  const { role, user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-slate-800 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            HTTP 403 Forbidden
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2 tracking-tight">
            Corporate Access Restricted
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Your assigned role <span className="font-bold text-slate-800">"{role}"</span> does not possess executive security clearance to access the <span className="font-bold text-indigo-600">{tabName}</span> module.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1.5 text-left font-medium">
          <div className="flex items-center justify-between text-slate-700">
            <span>Account Email:</span>
            <span className="font-mono font-bold text-slate-900">{user?.email || 'Corporate Session'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Assigned Role:</span>
            <span className="font-bold text-indigo-600">{role}</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span>Policy Status:</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <Lock className="h-3 w-3" /> Strict RBAC Enforced
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={onNavigateHome}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Executive Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
