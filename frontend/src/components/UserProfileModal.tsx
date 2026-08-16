import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, User, Shield, Key, Laptop, Globe, LogOut, Clock, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';
import { UserProfile, UserSession } from '../types';
import { fetchUserSessionsApi } from '../services/api';

interface UserProfileModalProps {
  user: UserProfile | null;
  onClose: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onLogout }) => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    if (user && user.role === 'Admin') {
      setLoadingSessions(true);
      fetchUserSessionsApi().then((res) => {
        if (res.success) {
          setSessions(res.sessions);
        }
        setLoadingSessions(false);
      }).catch(() => setLoadingSessions(false));
    }
  }, [user]);

  if (!user) return null;

  const roleColors: Record<string, string> = {
    Admin: 'bg-indigo-600 text-white',
    'Rate Manager': 'bg-blue-600 text-white',
    Approver: 'bg-emerald-600 text-white',
    Estimator: 'bg-amber-600 text-white',
    Sales: 'bg-purple-600 text-white',
    Viewer: 'bg-slate-600 text-white'
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-slate-800 my-auto"
      >
        
        {/* Header Banner */}
        <div className="bg-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="h-16 w-16 rounded-full border-2 border-blue-500 object-cover shadow-md"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-extrabold text-2xl border-2 border-blue-400">
                {user.full_name.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{user.full_name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${roleColors[user.role] || 'bg-slate-700 text-white'}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{user.email}</p>
              <div className="text-[11px] text-blue-400 font-medium mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>PostgreSQL DB Session Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 text-left overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Department</span>
              <span className="font-bold text-slate-800">{user.department || 'Bela Operations'}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Account Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                <UserCheck className="h-3.5 w-3.5" />
                {user.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">User ID</span>
              <span className="font-mono text-slate-600 font-bold">{user.id}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Last Login Time</span>
              <span className="font-medium text-slate-700">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>

          {/* Active Sessions Audit Section (Admin View) */}
          {user.role === 'Admin' && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-indigo-600" />
                  Active PostgreSQL DB Sessions ({sessions.length})
                </h4>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {loadingSessions ? (
                  <div className="text-xs text-slate-400 py-2">Loading session log...</div>
                ) : sessions.length > 0 ? (
                  sessions.map((s) => (
                    <div key={s.id} className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-slate-700 flex items-center gap-1">
                          <Globe className="h-3 w-3 text-slate-400" />
                          <span>IP: {s.ip_address}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{s.user_agent}</div>
                      </div>
                      <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400">1 active session (Current)</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Bela Nepal Security Standard</span>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
