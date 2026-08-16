import { UserRole } from '../types';
import { NavTab } from '../components/Sidebar';

export type ActionPermission =
  | 'addProduct'
  | 'deleteProduct'
  | 'purgeProduct'
  | 'submitRateRequest'
  | 'approveRateRequest'
  | 'saveBOM'
  | 'saveBOQ'
  | 'createProject'
  | 'manageUsers';

const TAB_ACCESS_MAP: Record<UserRole, NavTab[]> = {
  Admin: [
    'dashboard',
    'products',
    'product_settings',
    'ecopanels',
    'modular',
    'costing',
    'boq',
    'projects',
    'quotations',
    'approvals',
    'users',
    'suppliers',
    'reports',
    'trash',
    'docs'
  ],
  'Rate Manager': [
    'dashboard',
    'products',
    'product_settings',
    'ecopanels',
    'costing',
    'suppliers',
    'reports',
    'trash',
    'docs'
  ],
  Approver: [
    'dashboard',
    'products',
    'ecopanels',
    'approvals',
    'reports',
    'docs'
  ],
  Estimator: [
    'dashboard',
    'products',
    'ecopanels',
    'modular',
    'costing',
    'boq',
    'projects',
    'reports',
    'docs'
  ],
  Sales: [
    'dashboard',
    'products',
    'ecopanels',
    'modular',
    'projects',
    'quotations',
    'reports',
    'docs'
  ],
  Viewer: [
    'dashboard',
    'products',
    'ecopanels',
    'modular',
    'reports',
    'docs'
  ]
};

const ACTION_PERMISSION_MAP: Record<ActionPermission, UserRole[]> = {
  addProduct: ['Admin', 'Rate Manager'],
  deleteProduct: ['Admin', 'Rate Manager'],
  purgeProduct: ['Admin'],
  submitRateRequest: ['Admin', 'Rate Manager'],
  approveRateRequest: ['Admin', 'Approver'],
  saveBOM: ['Admin', 'Rate Manager', 'Estimator'],
  saveBOQ: ['Admin', 'Estimator', 'Sales'],
  createProject: ['Admin', 'Estimator', 'Sales'],
  manageUsers: ['Admin']
};

export function canAccessTab(role: UserRole, tab: NavTab, dynamicMatrix?: Record<string, { role: string; allowed_tabs: string[]; allowed_actions: string[] }>): boolean {
  if (role === 'Admin') return true;
  if (dynamicMatrix && dynamicMatrix[role]) {
    return dynamicMatrix[role].allowed_tabs.includes(tab);
  }
  const allowed = TAB_ACCESS_MAP[role] || [];
  return allowed.includes(tab);
}

export function hasActionPermission(role: UserRole, action: ActionPermission, dynamicMatrix?: Record<string, { role: string; allowed_tabs: string[]; allowed_actions: string[] }>): boolean {
  if (role === 'Admin') return true;
  if (dynamicMatrix && dynamicMatrix[role]) {
    return dynamicMatrix[role].allowed_actions.includes(action);
  }
  const allowedRoles = ACTION_PERMISSION_MAP[action] || [];
  return allowedRoles.includes(role);
}
