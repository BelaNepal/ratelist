import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, Key, Search, RefreshCw, CheckCircle2, XCircle, Edit, Lock, Mail, Building2, AlertCircle, Save, Check, ShieldCheck, Sliders, CheckSquare, Square, RotateCcw, Crown, Info } from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { fetchUsersApi, createUserApi, updateUserRoleApi, updateUserStatusApi, resetUserPasswordApi, fetchRolePermissionsApi, updateRolePermissionsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { NavTab } from '../components/Sidebar';
import { ActionPermission } from '../utils/rbac';

const EDITABLE_ROLES: UserRole[] = ['Rate Manager', 'Approver', 'Estimator', 'Sales', 'Viewer'];
const ALL_DISPLAY_ROLES: Array<UserRole | 'Admin'> = ['Admin', 'Rate Manager', 'Approver', 'Estimator', 'Sales', 'Viewer'];

const ALL_TABS: Array<{ id: NavTab; label: string; description: string }> = [
  { id: 'products', label: '📦 Product Master', description: 'Access master product catalog & rate list' },
  { id: 'ecopanels', label: '🧱 Eco Panels Rate', description: 'Access EPS panel specific rates & calculators' },
  { id: 'modular', label: '🏠 Modular Prefab Homes', description: 'Access modular house design templates' },
  { id: 'costing', label: '🧮 Costing & BOM Engine', description: 'Access interactive raw material recipe & BOM rollup' },
  { id: 'boq', label: '📊 BOQ Builder', description: 'Create & calculate bill of quantities' },
  { id: 'projects', label: '🏗️ Construction Projects', description: 'Manage site project records' },
  { id: 'quotations', label: '💼 Quotations & PDF', description: 'Generate customer quotations & export PDF' },
  { id: 'approvals', label: '✅ Approval Workflow', description: 'Audit & approve pending rate change requests' },
  { id: 'users', label: '👥 User Management', description: 'Manage corporate accounts & role policies' },
  { id: 'suppliers', label: '🚚 Supplier Rate List', description: 'Inspect raw material supplier price lists' },
  { id: 'reports', label: '📈 Reports & Trends', description: 'View analytics charts & historical rate trends' },
  { id: 'trash', label: '🗑️ Trash Bin & Recovery', description: 'View and restore deleted products' }
];

const ALL_ACTIONS: Array<{ id: ActionPermission; label: string; description: string }> = [
  { id: 'addProduct', label: 'Add / Edit Catalog Products', description: 'Permission to add new products or modify existing rates' },
  { id: 'deleteProduct', label: 'Soft Delete Products', description: 'Permission to move products to Trash Bin' },
  { id: 'purgeProduct', label: 'Permanently Purge Trash', description: 'Permission to permanently wipe trash items' },
  { id: 'submitRateRequest', label: 'Submit Rate Changes', description: 'Permission to submit rate requests for manager approval' },
  { id: 'approveRateRequest', label: 'Approve Rate Requests', description: 'Permission to approve or reject submitted rate requests' },
  { id: 'saveBOM', label: 'Save BOM Recipes', description: 'Permission to save manufacturing BOM recipes to database' },
  { id: 'saveBOQ', label: 'Save BOQ Estimates', description: 'Permission to save BOQ estimates to projects' },
  { id: 'createProject', label: 'Create New Projects', description: 'Permission to create new construction projects' },
  { id: 'manageUsers', label: 'Manage Accounts & Policy', description: 'Permission to register users, change roles & update policies' }
];

export const UserManagement: React.FC = () => {
  const { user: currentUser, refreshRoleMatrix } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'matrix'>('directory');
  
  // User Directory State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [resetUserId, setResetUserId] = useState<string | null>(null);

  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Estimator');
  const [newDepartment, setNewDepartment] = useState('Engineering & BOQ');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset Password State
  const [resetPassInput, setResetPassInput] = useState('');

  // Policy Matrix State
  const [policyMatrix, setPolicyMatrix] = useState<Record<string, { role: string; allowed_tabs: string[]; allowed_actions: string[] }>>({});
  const [selectedRoleView, setSelectedRoleView] = useState<string>('All'); // 'All' or specific role
  const [loadingMatrix, setLoadingMatrix] = useState<boolean>(true);
  const [savingMatrix, setSavingMatrix] = useState<boolean>(false);
  const [matrixToast, setMatrixToast] = useState<string | null>(null);

  const loadUsers = () => {
    setLoadingUsers(true);
    fetchUsersApi().then((res) => {
      if (res.success && res.users) {
        setUsers(res.users);
      }
      setLoadingUsers(false);
    }).catch(() => setLoadingUsers(false));
  };

  const loadMatrix = () => {
    setLoadingMatrix(true);
    fetchRolePermissionsApi().then((res) => {
      if (res.success && res.matrix) {
        setPolicyMatrix(res.matrix);
      }
      setLoadingMatrix(false);
    }).catch(() => setLoadingMatrix(false));
  };

  useEffect(() => {
    loadUsers();
    loadMatrix();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword || !newFullName) {
      setFormError('Please fill all required fields.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await createUserApi({
        email: newEmail,
        password: newPassword,
        full_name: newFullName,
        role: newRole,
        department: newDepartment
      });
      if (res.success) {
        setShowAddModal(false);
        setNewEmail('');
        setNewPassword('');
        setNewFullName('');
        loadUsers();
      } else {
        setFormError(res.error || 'Failed to create user.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Server error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const res = await updateUserRoleApi(userId, role);
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await updateUserStatusApi(userId, nextStatus as 'ACTIVE' | 'INACTIVE');
    if (res.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus as any } : u)));
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !resetPassInput) return;
    const res = await resetUserPasswordApi(resetUserId, resetPassInput);
    if (res.success) {
      alert('Password reset successfully!');
      setResetUserId(null);
      setResetPassInput('');
    }
  };

  // Policy Matrix Checkbox Toggle Handlers
  const handleToggleTabPermission = (role: string, tabId: string) => {
    if (role === 'Admin') return; // Admin is superuser
    setPolicyMatrix((prev) => {
      const rec = prev[role] || { role, allowed_tabs: [], allowed_actions: [] };
      const hasTab = rec.allowed_tabs.includes(tabId);
      const nextTabs = hasTab
        ? rec.allowed_tabs.filter((t) => t !== tabId)
        : [...rec.allowed_tabs, tabId];

      return {
        ...prev,
        [role]: { ...rec, allowed_tabs: nextTabs }
      };
    });
  };

  const handleToggleActionPermission = (role: string, actionId: string) => {
    if (role === 'Admin') return;
    setPolicyMatrix((prev) => {
      const rec = prev[role] || { role, allowed_actions: [], allowed_tabs: [] };
      const hasAct = rec.allowed_actions.includes(actionId);
      const nextActions = hasAct
        ? rec.allowed_actions.filter((a) => a !== actionId)
        : [...rec.allowed_actions, actionId];

      return {
        ...prev,
        [role]: { ...rec, allowed_actions: nextActions }
      };
    });
  };

  const handleGrantAllForRole = (role: string) => {
    if (role === 'Admin') return;
    setPolicyMatrix((prev) => ({
      ...prev,
      [role]: {
        role,
        allowed_tabs: ALL_TABS.map((t) => t.id),
        allowed_actions: ALL_ACTIONS.map((a) => a.id)
      }
    }));
  };

  const handleRevokeAllForRole = (role: string) => {
    if (role === 'Admin') return;
    setPolicyMatrix((prev) => ({
      ...prev,
      [role]: {
        role,
        allowed_tabs: [],
        allowed_actions: []
      }
    }));
  };

  const handleSavePolicyMatrix = async () => {
    setSavingMatrix(true);
    setMatrixToast(null);
    try {
      for (const rKey of EDITABLE_ROLES) {
        const rec = policyMatrix[rKey] || { role: rKey, allowed_tabs: [], allowed_actions: [] };
        await updateRolePermissionsApi(rKey, rec.allowed_tabs, rec.allowed_actions);
      }
      refreshRoleMatrix();
      setMatrixToast('✅ Dynamic RBAC Policy Matrix saved to PostgreSQL DB! Changes live.');
      setTimeout(() => setMatrixToast(null), 4000);
    } catch (err: any) {
      alert('Error saving policy matrix: ' + err.message);
    } finally {
      setSavingMatrix(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<string, string> = {
    Admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Rate Manager': 'bg-blue-100 text-blue-800 border-blue-200',
    Approver: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Estimator: 'bg-amber-100 text-amber-800 border-amber-200',
    Sales: 'bg-purple-100 text-purple-800 border-purple-200',
    Viewer: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  const getUserCountByRole = (role: string) => {
    return users.filter((u) => u.role === role).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 text-left">
      {/* Sticky Header Banner */}
      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 md:px-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#ef7e2d]" /> Executive User Management & RBAC Vault
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            PostgreSQL DB user directory, security status, corporate roles & runtime policy matrix customization.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('directory')}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'directory' ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
          >
            👥 User Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'matrix' ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
          >
            🔐 Granular Role Policy Matrix
          </button>
        </div>
      </div>

      {/* Main Page Content Body */}
      <div className="p-6 md:p-8 space-y-6">

      {matrixToast && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
          <span>{matrixToast}</span>
        </div>
      )}

      {/* SUB-TAB 1: USER DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-extrabold text-slate-400">Total Users</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-extrabold text-emerald-600">Active Accounts</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {users.filter((u) => u.status === 'ACTIVE').length}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-extrabold text-indigo-600">Executive Admins</span>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {users.filter((u) => u.role === 'Admin').length}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase font-extrabold text-slate-400">Database Engine</span>
              <div className="text-sm font-bold text-slate-800 mt-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                PostgreSQL DB Vault
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, department..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Corporate Roles</option>
                <option value="Admin">Admin</option>
                <option value="Rate Manager">Rate Manager</option>
                <option value="Approver">Approver</option>
                <option value="Estimator">Estimator</option>
                <option value="Sales">Sales</option>
                <option value="Viewer">Viewer</option>
              </select>

              <button
                onClick={() => setShowAddModal(true)}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Corporate User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[50vh]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-wider sticky top-0 z-20 shadow-md">
                  <tr>
                    <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Corporate User</th>
                    <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Assigned Role</th>
                    <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Department</th>
                    <th className="py-3 px-4 text-center bg-slate-900 sticky top-0 z-20">Status</th>
                    <th className="py-3 px-4 bg-slate-900 sticky top-0 z-20">Last Login</th>
                    <th className="py-3 px-4 text-right bg-slate-900 sticky top-0 z-20">Admin Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Loading PostgreSQL user directory...
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt={u.full_name} className="h-9 w-9 rounded-full object-cover border border-slate-300" />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                                {u.full_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{u.full_name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            className={`text-[11px] font-bold rounded-lg px-2 py-1 border outline-none cursor-pointer ${roleColors[u.role] || 'bg-slate-100'}`}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Rate Manager">Rate Manager</option>
                            <option value="Approver">Approver</option>
                            <option value="Estimator">Estimator</option>
                            <option value="Sales">Sales</option>
                            <option value="Viewer">Viewer</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-slate-700 font-semibold">
                          {u.department || 'Bela Operations'}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleStatusToggle(u.id, u.status)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider cursor-pointer border transition-all ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'}`}
                          >
                            {u.status}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never logged in'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setResetUserId(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                            title="Reset User Password"
                          >
                            <Key className="h-3.5 w-3.5 text-amber-600" />
                            <span>Reset Pass</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No users matching criteria found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DYNAMIC GRANULAR ROLE POLICY MATRIX */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-6">

          {/* ROLE INDICATOR & SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ALL_DISPLAY_ROLES.map((roleKey) => {
              const userCount = getUserCountByRole(roleKey);
              const rec = policyMatrix[roleKey];
              const isSuperAdmin = roleKey === 'Admin';
              const allowedTabsCount = isSuperAdmin ? ALL_TABS.length : (rec?.allowed_tabs.length || 0);
              const allowedActionsCount = isSuperAdmin ? ALL_ACTIONS.length : (rec?.allowed_actions.length || 0);
              const isSelected = selectedRoleView === roleKey;

              return (
                <div
                  key={roleKey}
                  onClick={() => setSelectedRoleView(roleKey)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${roleColors[roleKey] || 'bg-slate-100'}`}>
                        {roleKey}
                      </span>
                      {isSuperAdmin && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                    </div>

                    <div className="mt-2.5">
                      <div className="text-xs font-black truncate">{roleKey}</div>
                      <div className={`text-[11px] font-semibold mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {userCount} {userCount === 1 ? 'User' : 'Users'} Assigned
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/40 text-[10px] space-y-0.5 font-mono">
                    <div className="flex justify-between">
                      <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>Tabs:</span>
                      <span className={`font-bold ${allowedTabsCount === ALL_TABS.length ? 'text-emerald-500' : isSelected ? 'text-indigo-300' : 'text-indigo-600'}`}>
                        {allowedTabsCount}/{ALL_TABS.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isSelected ? 'text-slate-400' : 'text-slate-500'}>Actions:</span>
                      <span className={`font-bold ${allowedActionsCount === ALL_ACTIONS.length ? 'text-emerald-500' : isSelected ? 'text-purple-300' : 'text-purple-600'}`}>
                        {allowedActionsCount}/{ALL_ACTIONS.length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* MAIN MATRIX EDITOR CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-indigo-600" /> Executive Granular Policy Editor
                </h2>
                <p className="text-xs text-slate-400">
                  Select a role view or edit permissions live in PostgreSQL DB.
                </p>
              </div>

              {/* ROLE FILTER SELECTOR TABS & ACTION BUTTONS */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setSelectedRoleView('All')}
                    className={`py-1 px-3 rounded-lg transition-all cursor-pointer ${selectedRoleView === 'All' ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    All Roles Grid
                  </button>
                  {EDITABLE_ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRoleView(r)}
                      className={`py-1 px-2.5 rounded-lg transition-all cursor-pointer ${selectedRoleView === r ? 'bg-white text-indigo-700 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSavePolicyMatrix}
                  disabled={savingMatrix}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{savingMatrix ? 'Saving DB...' : 'Save Matrix to DB'}</span>
                </button>
              </div>
            </div>

            {loadingMatrix ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading PostgreSQL role permissions matrix...</div>
            ) : (
              <div className="space-y-8">

                {/* ROLE PRESET CONTROLS (WHEN A SPECIFIC ROLE IS SELECTED) */}
                {selectedRoleView !== 'All' && selectedRoleView !== 'Admin' && (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-lg border ${roleColors[selectedRoleView] || 'bg-slate-100'}`}>
                        {selectedRoleView} Role Policy
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        Quick Preset Controls for <strong className="text-slate-900">{selectedRoleView}</strong>:
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleGrantAllForRole(selectedRoleView)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>Grant All</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRevokeAllForRole(selectedRoleView)}
                        className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Square className="h-3.5 w-3.5" />
                        <span>Revoke All</span>
                      </button>
                    </div>
                  </div>
                )}

                {selectedRoleView === 'Admin' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-600 shrink-0" />
                    <span>
                      Executive Superuser Admin role possesses permanent unrestricted access to all module tabs and operational actions.
                    </span>
                  </div>
                )}

                {/* SECTION A: MODULE TAB ACCESS MATRIX */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-indigo-600" />
                      1. Module Tab Access Controls
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Controls sidebar navigation visibility
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-wider">
                        <tr>
                          <th className="py-3 px-4 min-w-[220px]">Navigation Module Tab</th>
                          <th className="py-3 px-4 min-w-[200px]">Description</th>
                          {(selectedRoleView === 'All' ? ALL_DISPLAY_ROLES : [selectedRoleView as UserRole]).map((r) => (
                            <th key={r} className="py-3 px-4 text-center min-w-[120px]">
                              <div className="flex flex-col items-center">
                                <span className="font-black text-xs">{r}</span>
                                <span className="text-[9px] text-slate-400 font-mono lowercase">
                                  {r === 'Admin' ? 'Superuser' : `${policyMatrix[r]?.allowed_tabs?.length || 0} allowed`}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {ALL_TABS.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-bold text-slate-800">{t.label}</td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">{t.description}</td>
                            {(selectedRoleView === 'All' ? ALL_DISPLAY_ROLES : [selectedRoleView as UserRole]).map((roleKey) => {
                              const isSuperAdmin = roleKey === 'Admin';
                              const rec = policyMatrix[roleKey];
                              const isAllowed = isSuperAdmin ? true : (rec ? rec.allowed_tabs.includes(t.id) : false);

                              return (
                                <td key={roleKey} className="py-3 px-4 text-center">
                                  {isSuperAdmin ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Admin
                                    </span>
                                  ) : (
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isAllowed}
                                        onChange={() => handleToggleTabPermission(roleKey, t.id)}
                                        className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                      />
                                    </label>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SECTION B: OPERATIONAL PRIVILEGES (ACTIONS) MATRIX */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-amber-500" />
                      2. Operational Action Privileges
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Controls write, edit, approve & purge API permissions
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white uppercase text-[10px] font-extrabold tracking-wider">
                        <tr>
                          <th className="py-3 px-4 min-w-[220px]">Operational Privilege</th>
                          <th className="py-3 px-4 min-w-[200px]">Description</th>
                          {(selectedRoleView === 'All' ? ALL_DISPLAY_ROLES : [selectedRoleView as UserRole]).map((r) => (
                            <th key={r} className="py-3 px-4 text-center min-w-[120px]">
                              <div className="flex flex-col items-center">
                                <span className="font-black text-xs">{r}</span>
                                <span className="text-[9px] text-slate-400 font-mono lowercase">
                                  {r === 'Admin' ? 'Superuser' : `${policyMatrix[r]?.allowed_actions?.length || 0} allowed`}
                                </span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {ALL_ACTIONS.map((act) => (
                          <tr key={act.id} className="hover:bg-slate-50/80">
                            <td className="py-3 px-4 font-bold text-slate-800">{act.label}</td>
                            <td className="py-3 px-4 text-slate-500 text-[11px]">{act.description}</td>
                            {(selectedRoleView === 'All' ? ALL_DISPLAY_ROLES : [selectedRoleView as UserRole]).map((roleKey) => {
                              const isSuperAdmin = roleKey === 'Admin';
                              const rec = policyMatrix[roleKey];
                              const isAllowed = isSuperAdmin ? true : (rec ? rec.allowed_actions.includes(act.id) : false);

                              return (
                                <td key={roleKey} className="py-3 px-4 text-center">
                                  {isSuperAdmin ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-extrabold text-[10px] border border-purple-200">
                                      <CheckCircle2 className="h-3 w-3 text-purple-600" /> Admin
                                    </span>
                                  ) : (
                                    <label className="inline-flex items-center justify-center cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isAllowed}
                                        onChange={() => handleToggleActionPermission(roleKey, act.id)}
                                        className="h-4.5 w-4.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                                      />
                                    </label>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                Register New Corporate User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Rabin Gurung"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-semibold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="rabin@belanepal.com"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Rate Manager">Rate Manager</option>
                    <option value="Approver">Approver</option>
                    <option value="Estimator">Estimator</option>
                    <option value="Sales">Sales</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetUserId && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-500" />
              Reset Account Password
            </h3>
            <p className="text-xs text-slate-500">Enter a new secure password for this user account.</p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <input
                type="password"
                value={resetPassInput}
                onChange={(e) => setResetPassInput(e.target.value)}
                placeholder="New password (e.g. password123)"
                required
                className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono outline-none focus:border-indigo-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetUserId(null)}
                  className="py-2 px-3 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
