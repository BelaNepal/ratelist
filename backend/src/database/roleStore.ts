import { pgPool } from './pgPool';

export interface RolePermissionRecord {
  role: string;
  allowed_tabs: string[];
  allowed_actions: string[];
  updated_at?: string;
}

export const DEFAULT_ROLE_POLICY_MATRIX: Record<string, RolePermissionRecord> = {
  Admin: {
    role: 'Admin',
    allowed_tabs: [
      'dashboard', 'products', 'product_settings', 'ecopanels', 'modular',
      'costing', 'boq', 'projects', 'quotations', 'approvals', 'users',
      'suppliers', 'reports', 'trash', 'docs'
    ],
    allowed_actions: [
      'addProduct', 'deleteProduct', 'purgeProduct', 'submitRateRequest',
      'approveRateRequest', 'saveBOM', 'saveBOQ', 'createProject', 'manageUsers'
    ]
  },
  'Rate Manager': {
    role: 'Rate Manager',
    allowed_tabs: [
      'dashboard', 'products', 'product_settings', 'ecopanels',
      'costing', 'suppliers', 'reports', 'trash', 'docs'
    ],
    allowed_actions: ['addProduct', 'deleteProduct', 'submitRateRequest', 'saveBOM']
  },
  Approver: {
    role: 'Approver',
    allowed_tabs: [
      'dashboard', 'products', 'ecopanels', 'approvals', 'reports', 'docs'
    ],
    allowed_actions: ['approveRateRequest']
  },
  Estimator: {
    role: 'Estimator',
    allowed_tabs: [
      'dashboard', 'products', 'ecopanels', 'modular', 'costing',
      'boq', 'projects', 'reports', 'docs'
    ],
    allowed_actions: ['saveBOM', 'saveBOQ', 'createProject']
  },
  Sales: {
    role: 'Sales',
    allowed_tabs: [
      'dashboard', 'products', 'ecopanels', 'modular', 'projects',
      'quotations', 'reports', 'docs'
    ],
    allowed_actions: ['saveBOQ', 'createProject']
  },
  Viewer: {
    role: 'Viewer',
    allowed_tabs: ['dashboard', 'products', 'ecopanels', 'modular', 'reports', 'docs'],
    allowed_actions: []
  }
};

let inMemoryPolicyMatrix: Record<string, RolePermissionRecord> = { ...DEFAULT_ROLE_POLICY_MATRIX };

export async function initializeRolePermissionsTable() {
  try {
    const client = await pgPool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          role VARCHAR(50) PRIMARY KEY,
          allowed_tabs TEXT[] NOT NULL,
          allowed_actions TEXT[] NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      for (const rKey of Object.keys(DEFAULT_ROLE_POLICY_MATRIX)) {
        const check = await client.query('SELECT role FROM role_permissions WHERE role = $1', [rKey]);
        if (check.rows.length === 0) {
          const rec = DEFAULT_ROLE_POLICY_MATRIX[rKey];
          await client.query(
            `INSERT INTO role_permissions (role, allowed_tabs, allowed_actions, updated_at)
             VALUES ($1, $2, $3, $4)`,
            [rec.role, rec.allowed_tabs, rec.allowed_actions, new Date().toISOString()]
          );
        }
      }
      console.log('✅ PostgreSQL Enterprise Dynamic Role Permissions Table Initialized successfully!');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.log('ℹ️ PostgreSQL Role Policy Store fallback active (Using In-Memory Role Store)');
  }
}

export async function getRolePermissionsMatrix(): Promise<Record<string, RolePermissionRecord>> {
  try {
    const res = await pgPool.query('SELECT * FROM role_permissions');
    if (res.rows.length > 0) {
      const map: Record<string, RolePermissionRecord> = {};
      res.rows.forEach((r) => {
        map[r.role] = {
          role: r.role,
          allowed_tabs: r.allowed_tabs || [],
          allowed_actions: r.allowed_actions || [],
          updated_at: r.updated_at
        };
      });
      return map;
    }
  } catch (e) {
    // fallback
  }
  return inMemoryPolicyMatrix;
}

export async function updateRolePermissions(role: string, allowed_tabs: string[], allowed_actions: string[]): Promise<RolePermissionRecord> {
  const updated_at = new Date().toISOString();
  try {
    await pgPool.query(
      `INSERT INTO role_permissions (role, allowed_tabs, allowed_actions, updated_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (role) DO UPDATE SET
       allowed_tabs = EXCLUDED.allowed_tabs,
       allowed_actions = EXCLUDED.allowed_actions,
       updated_at = EXCLUDED.updated_at`,
      [role, allowed_tabs, allowed_actions, updated_at]
    );
  } catch (e) {
    // fallback
  }

  inMemoryPolicyMatrix[role] = {
    role,
    allowed_tabs,
    allowed_actions,
    updated_at
  };

  return inMemoryPolicyMatrix[role];
}
