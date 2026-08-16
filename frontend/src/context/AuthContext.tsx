import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { loginUserApi, logoutUserApi, fetchCurrentUserApi, fetchRolePermissionsApi } from '../services/api';
import { canAccessTab, hasActionPermission, ActionPermission } from '../utils/rbac';
import { NavTab } from '../components/Sidebar';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  quickDemoSelect: (role: UserRole) => void;
  canAccess: (tab: NavTab) => boolean;
  canPerform: (action: ActionPermission) => boolean;
  refreshRoleMatrix: () => void;
  roleMatrix: Record<string, { role: string; allowed_tabs: string[]; allowed_actions: string[] }> | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'Admin',
  setRole: () => {},
  userName: 'Ashish (Admin)',
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  quickDemoSelect: () => {},
  canAccess: () => true,
  canPerform: () => true,
  refreshRoleMatrix: () => {},
  roleMatrix: null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRoleState] = useState<UserRole>('Admin');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [roleMatrix, setRoleMatrix] = useState<Record<string, { role: string; allowed_tabs: string[]; allowed_actions: string[] }> | null>(null);

  const refreshRoleMatrix = () => {
    fetchRolePermissionsApi().then((res) => {
      if (res.success && res.matrix) {
        setRoleMatrix(res.matrix);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    refreshRoleMatrix();
  }, []);

  // Check existing session cookie on app load
  useEffect(() => {
    fetchCurrentUserApi().then((res) => {
      if (res.authenticated && res.user) {
        setUser(res.user);
        setRoleState(res.user.role);
        setIsAuthenticated(true);
      } else {
        // Default demo mode active if no cookie session
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    const res = await loginUserApi(email, pass);
    if (res.success && res.user) {
      setUser(res.user);
      setRoleState(res.user.role);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await logoutUserApi();
    } catch (e) {}
    setUser(null);
    setIsAuthenticated(false);
  };

  const quickDemoSelect = (selectedRole: UserRole) => {
    const demoProfiles: Record<UserRole, UserProfile> = {
      Admin: {
        id: 'user_admin_001',
        email: 'admin@belanepal.com',
        full_name: 'Ashish Shrestha (Executive Admin)',
        role: 'Admin',
        department: 'Executive Management',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      'Rate Manager': {
        id: 'user_ratemgr_002',
        email: 'rate.mgr@belanepal.com',
        full_name: 'Bikash Adhikari (Rate Manager)',
        role: 'Rate Manager',
        department: 'Costing & Pricing',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      Approver: {
        id: 'user_approver_003',
        email: 'approver@belanepal.com',
        full_name: 'Sunil Thapa (Chief Approver)',
        role: 'Approver',
        department: 'Finance & Quality Audit',
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      Estimator: {
        id: 'user_estimator_004',
        email: 'estimator@belanepal.com',
        full_name: 'Prashant Gurung (BOQ Estimator)',
        role: 'Estimator',
        department: 'Engineering & BOQ',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      Sales: {
        id: 'user_sales_005',
        email: 'sales@belanepal.com',
        full_name: 'Deepa Maharjan (Sales Lead)',
        role: 'Sales',
        department: 'Sales & Client Quotations',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      },
      Viewer: {
        id: 'user_viewer_006',
        email: 'viewer@belanepal.com',
        full_name: 'Guest Viewer (Read Only)',
        role: 'Viewer',
        department: 'Public Inspector',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      }
    };

    const target = demoProfiles[selectedRole];
    setUser(target);
    setRoleState(selectedRole);
    setIsAuthenticated(true);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const getUserName = () => {
    if (user) return user.full_name;
    switch (role) {
      case 'Admin': return 'Ashish (Admin)';
      case 'Rate Manager': return 'Bikash (Rate Mgr)';
      case 'Approver': return 'Sunil (Approver)';
      case 'Estimator': return 'Prashant (Estimator)';
      case 'Sales': return 'Deepa (Sales Executive)';
      case 'Viewer': return 'Guest Viewer';
      default: return 'User';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        userName: getUserName(),
        isAuthenticated,
        isLoading,
        login,
        logout,
        quickDemoSelect,
        canAccess: (tab: NavTab) => canAccessTab(role, tab, roleMatrix || undefined),
        canPerform: (action: ActionPermission) => hasActionPermission(role, action, roleMatrix || undefined),
        refreshRoleMatrix,
        roleMatrix
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
