import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Search, Building2, User, X, ArrowRight, Package, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole, Product, Project, Supplier } from '../types';

import { fetchProducts, fetchProjects, fetchSuppliers } from '../services/api';
import { HighlightText } from './HighlightText';
import { UserProfileModal } from './UserProfileModal';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  pendingCount: number;
  onOpenApprovalQueue: () => void;
  onNavigateTab?: (tab: string) => void;
  onSelectProduct?: (productId: string) => void;
  onGlobalSearchChange?: (query: string) => void;
  globalSearchQuery?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  pendingCount,
  onOpenApprovalQueue,
  onNavigateTab,
  onSelectProduct,
  onGlobalSearchChange,
  globalSearchQuery = ''
}) => {
  const { role, setRole, userName, user, logout } = useAuth();
  const [search, setSearch] = useState(globalSearchQuery);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchProjects, setSearchProjects] = useState<Project[]>([]);
  const [searchSuppliers, setSearchSuppliers] = useState<Supplier[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    setSearch(globalSearchQuery);
  }, [globalSearchQuery]);

  useEffect(() => {
    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      fetchProducts('All', search).then((list) => {
        setSearchResults(list.slice(0, 5));
        setShowResults(true);
      });
      fetchProjects().then((list) => {
        const match = list.filter((p: Project) =>
          p.name.toLowerCase().includes(q) ||
          (p.customer_name && p.customer_name.toLowerCase().includes(q)) ||
          (p.location && p.location.toLowerCase().includes(q))
        );
        setSearchProjects(match.slice(0, 4));
      });
      fetchSuppliers().then((res: any) => {
        const list: Supplier[] = Array.isArray(res) ? res : (res.suppliers || []);
        const match = list.filter((s: Supplier) =>
          s.name.toLowerCase().includes(q) ||
          (s.contact_person && s.contact_person.toLowerCase().includes(q)) ||
          (s.category && s.category.toLowerCase().includes(q))
        );
        setSearchSuppliers(match.slice(0, 4));
      });
    } else {
      setSearchResults([]);
      setSearchProjects([]);
      setSearchSuppliers([]);
      setShowResults(false);
    }
  }, [search]);

  const handleSearchInput = (val: string) => {
    setSearch(val);
    if (onGlobalSearchChange) {
      onGlobalSearchChange(val);
    }
  };

  const handleClear = () => {
    setSearch('');
    setShowResults(false);
    if (onGlobalSearchChange) onGlobalSearchChange('');
  };

  const roleColors: Record<UserRole, string> = {
    Admin: 'bg-indigo-600 text-white',
    'Rate Manager': 'bg-blue-600 text-white',
    Approver: 'bg-emerald-600 text-white',
    Estimator: 'bg-amber-600 text-white',
    Sales: 'bg-purple-600 text-white',
    Viewer: 'bg-slate-600 text-white'
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur shadow-sm">
      {/* Brand & Official Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/bela_logo.png"
          alt="Bela Nepal Industries Logo"
          className="h-11 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform cursor-pointer"
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-slate-900 text-lg">BELA NEPAL</span>
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              Rate Manager
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Single Source of Truth Rate & Costing Engine</p>
        </div>
      </div>


      {/* Center Search Bar with System-Wide Deep Search Highlighting */}
      <div className="hidden md:flex items-center w-96 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchInput(e.target.value)}
          onFocus={() => search.trim() && setShowResults(true)}
          placeholder="System-wide deep search (Products, Projects, Vendors)..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-8 text-xs font-semibold outline-none focus:border-[#ef7e2d] focus:bg-white focus:ring-2 focus:ring-[#ef7e2d]/20 transition-all"
        />
        {search && (
          <button
            onClick={handleClear}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Global Deep Search Results Overlay */}
        {showResults && (searchResults.length > 0 || searchProjects.length > 0 || searchSuppliers.length > 0) && (
          <div className="absolute top-11 left-0 right-0 z-50 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl divide-y divide-slate-100 p-2 animate-in fade-in duration-150 text-left">
            
            {/* Products Section */}
            {searchResults.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#ef7e2d] flex items-center justify-between">
                  <span>📦 Products ({searchResults.length})</span>
                  <span>Match</span>
                </div>
                {searchResults.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('products');
                      if (onSelectProduct) onSelectProduct(prod.id);
                      setShowResults(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          <HighlightText text={prod.code} query={search} />
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          <HighlightText text={prod.name} query={search} />
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        <HighlightText text={prod.specification} query={search} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-slate-900">
                        Rs. <HighlightText text={prod.current_rate} query={search} />
                      </div>
                      <span className="text-[9px] text-slate-400">/ {prod.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Projects Section */}
            {searchProjects.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-600 flex items-center justify-between">
                  <span>🏗️ Construction Projects ({searchProjects.length})</span>
                  <span>Match</span>
                </div>
                {searchProjects.slice(0, 3).map((prj) => (
                  <div
                    key={prj.id}
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('projects');
                      setShowResults(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        <HighlightText text={prj.name} query={search} />
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Client: <HighlightText text={prj.customer_name} query={search} /> • Location: <HighlightText text={prj.location} query={search} />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {prj.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Suppliers Section */}
            {searchSuppliers.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-purple-600 flex items-center justify-between">
                  <span>🚚 Vendor Partners ({searchSuppliers.length})</span>
                  <span>Match</span>
                </div>
                {searchSuppliers.slice(0, 3).map((sup) => (
                  <div
                    key={sup.id}
                    onClick={() => {
                      if (onNavigateTab) onNavigateTab('suppliers');
                      setShowResults(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/50 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        <HighlightText text={sup.name} query={search} />
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Contact: <HighlightText text={sup.contact_person || 'N/A'} query={search} /> • <HighlightText text={sup.phone || ''} query={search} />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      {sup.category}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* Right Controls & Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Live Notification Center Popover */}
        <NotificationCenter
          onNavigateTab={(tab) => {
            if (onNavigateTab) onNavigateTab(tab);
            else if (tab === 'approvals') onOpenApprovalQueue();
          }}
          pendingApprovalsCount={pendingCount}
        />


        {/* Dynamic RBAC Role Display (Only Executive Admin can switch roles; non-admins appear as assigned) */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {user?.role === 'Admin' ? 'Role Switcher (Admin)' : 'Assigned Corporate Role'}
            </span>
            {user?.role === 'Admin' ? (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded px-2 py-0.5 outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Admin">👑 Admin (Full Access)</option>
                <option value="Rate Manager">📦 Rate Manager (Submit Rates)</option>
                <option value="Approver">✅ Approver (Approve Rates)</option>
                <option value="Estimator">🧮 Estimator (BOQ Builder)</option>
                <option value="Sales">💼 Sales (Quotations)</option>
                <option value="Viewer">👀 Viewer (Read Only)</option>
              </select>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 cursor-default">
                <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${roleColors[role]}`}>
                  {role}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">(Locked)</span>
              </div>
            )}
          </div>
        </div>

        {/* User Info Tag & Profile Trigger */}
        <div
          onClick={() => setShowProfileModal(true)}
          className="hidden lg:flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-90 cursor-pointer transition-opacity"
          title="Click to view Account Profile & Active DB Sessions"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={userName}
              className="h-8 w-8 rounded-full border border-blue-500 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200">
              <User className="h-4 w-4" />
            </div>
          )}
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span>{userName}</span>
            </div>
            <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${roleColors[role]}`}>
              {role}
            </span>
          </div>
        </div>
      </div>

      {showProfileModal && (
        <UserProfileModal
          user={user || {
            id: 'user_current',
            email: 'admin@belanepal.com',
            full_name: userName,
            role,
            department: 'Bela Operations',
            status: 'ACTIVE',
            created_at: new Date().toISOString()
          }}
          onClose={() => setShowProfileModal(false)}
          onLogout={logout}
        />
      )}
    </header>
  );
};

