import { pgPool } from './pgPool';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'Admin' | 'Rate Manager' | 'Approver' | 'Estimator' | 'Sales' | 'Viewer';
  department?: string;
  avatar_url?: string;
  status: 'ACTIVE' | 'INACTIVE';
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  token_hash: string;
  ip_address: string;
  user_agent: string;
  expires_at: string;
  created_at: string;
}

// AES-256 Data Encryption at Rest for sensitive attributes
const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY || 'bela_corporate_aes_256_secret_key_32bytes!';
const ALGORITHM = 'aes-256-cbc';

export function encryptAtRest(text: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'bela_salt', 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    return text;
  }
}

export function decryptAtRest(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText;
    const iv = Buffer.from(parts[0], 'hex');
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'bela_salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    return encryptedText;
  }
}

// Default Seeded Corporate Users
const DEFAULT_CORP_USERS: User[] = [
  {
    id: 'user_admin_001',
    email: 'admin@belanepal.com',
    password_hash: bcrypt.hashSync('admin123', 10),
    full_name: 'Ashish Shrestha (Executive Admin)',
    role: 'Admin',
    department: 'Executive Management',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user_ratemgr_002',
    email: 'rate.mgr@belanepal.com',
    password_hash: bcrypt.hashSync('rate123', 10),
    full_name: 'Bikash Adhikari (Rate Manager)',
    role: 'Rate Manager',
    department: 'Costing & Pricing',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user_approver_003',
    email: 'approver@belanepal.com',
    password_hash: bcrypt.hashSync('approver123', 10),
    full_name: 'Sunil Thapa (Chief Approver)',
    role: 'Approver',
    department: 'Finance & Quality Audit',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user_estimator_004',
    email: 'estimator@belanepal.com',
    password_hash: bcrypt.hashSync('est123', 10),
    full_name: 'Prashant Gurung (BOQ Estimator)',
    role: 'Estimator',
    department: 'Engineering & BOQ',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user_sales_005',
    email: 'sales@belanepal.com',
    password_hash: bcrypt.hashSync('sales123', 10),
    full_name: 'Deepa Maharjan (Sales Lead)',
    role: 'Sales',
    department: 'Sales & Client Quotations',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'user_viewer_006',
    email: 'viewer@belanepal.com',
    password_hash: bcrypt.hashSync('viewer123', 10),
    full_name: 'Guest Viewer (Read Only)',
    role: 'Viewer',
    department: 'Public Inspector',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Fallback In-Memory Stores
let inMemoryUsers: User[] = [...DEFAULT_CORP_USERS];
let inMemorySessions: UserSession[] = [];

// Initialize SQL Tables in PostgreSQL DB if connected
export async function initializeUserDatabaseTables() {
  try {
    const client = await pgPool.connect();
    try {
      // Create Users Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          department VARCHAR(100),
          avatar_url TEXT,
          status VARCHAR(20) DEFAULT 'ACTIVE',
          last_login_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create Sessions Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if seeded default users exist, if not insert them
      for (const u of DEFAULT_CORP_USERS) {
        const check = await client.query('SELECT id FROM users WHERE email = $1', [u.email]);
        if (check.rows.length === 0) {
          await client.query(
            `INSERT INTO users (id, email, password_hash, full_name, role, department, avatar_url, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [u.id, u.email, u.password_hash, u.full_name, u.role, u.department, u.avatar_url, u.status, u.created_at, u.updated_at]
          );
        }
      }
      console.log('✅ PostgreSQL Enterprise Users & Sessions Tables Initialized successfully!');
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.log('ℹ️ PostgreSQL User Store fallback active (Using In-Memory User & Session Store)');
  }
}

// Store Queries
export async function findUserByEmail(email: string): Promise<User | null> {
  const normEmail = email.trim().toLowerCase();
  try {
    const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normEmail]);
    if (res.rows.length > 0) return res.rows[0];
  } catch (e) {
    // fallback
  }
  const found = inMemoryUsers.find((u) => u.email.toLowerCase() === normEmail);
  return found || null;
}

export async function findUserById(id: string): Promise<User | null> {
  try {
    const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows.length > 0) return res.rows[0];
  } catch (e) {
    // fallback
  }
  const found = inMemoryUsers.find((u) => u.id === id);
  return found || null;
}

export async function updateUserLastLogin(userId: string) {
  const now = new Date().toISOString();
  try {
    await pgPool.query('UPDATE users SET last_login_at = $1 WHERE id = $2', [now, userId]);
  } catch (e) {
    // fallback
  }
  const idx = inMemoryUsers.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    inMemoryUsers[idx].last_login_at = now;
  }
}

export async function createSession(session: UserSession): Promise<void> {
  try {
    await pgPool.query(
      `INSERT INTO sessions (id, user_id, token_hash, ip_address, user_agent, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [session.id, session.user_id, session.token_hash, session.ip_address, session.user_agent, session.expires_at, session.created_at]
    );
  } catch (e) {
    // fallback
  }
  inMemorySessions.push(session);
}

export async function findSessionById(sessionId: string): Promise<UserSession | null> {
  try {
    const res = await pgPool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
    if (res.rows.length > 0) return res.rows[0];
  } catch (e) {
    // fallback
  }
  const found = inMemorySessions.find((s) => s.id === sessionId);
  return found || null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await pgPool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  } catch (e) {
    // fallback
  }
  inMemorySessions = inMemorySessions.filter((s) => s.id !== sessionId);
}

export async function getAllUsers(): Promise<Omit<User, 'password_hash'>[]> {
  try {
    const res = await pgPool.query('SELECT id, email, full_name, role, department, avatar_url, status, last_login_at, created_at, updated_at FROM users ORDER BY created_at ASC');
    if (res.rows.length > 0) return res.rows;
  } catch (e) {
    // fallback
  }
  return inMemoryUsers.map(({ password_hash, ...rest }) => rest);
}

export async function getAllActiveSessions(): Promise<UserSession[]> {
  try {
    const res = await pgPool.query('SELECT * FROM sessions ORDER BY created_at DESC LIMIT 50');
    if (res.rows.length > 0) return res.rows;
  } catch (e) {
    // fallback
  }
  return inMemorySessions;
}

export async function updateUserRole(userId: string, newRole: User['role']): Promise<boolean> {
  const updated_at = new Date().toISOString();
  try {
    await pgPool.query('UPDATE users SET role = $1, updated_at = $2 WHERE id = $3', [newRole, updated_at, userId]);
  } catch (e) {
    // fallback
  }
  const idx = inMemoryUsers.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    inMemoryUsers[idx].role = newRole;
    inMemoryUsers[idx].updated_at = updated_at;
  }
  return true;
}

export async function createNewUser(user: User): Promise<User> {
  try {
    await pgPool.query(
      `INSERT INTO users (id, email, password_hash, full_name, role, department, avatar_url, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [user.id, user.email, user.password_hash, user.full_name, user.role, user.department, user.avatar_url, user.status, user.created_at, user.updated_at]
    );
  } catch (e) {
    // fallback
  }
  inMemoryUsers.push(user);
  return user;
}

export async function updateUserStatus(userId: string, status: User['status']): Promise<boolean> {
  const updated_at = new Date().toISOString();
  try {
    await pgPool.query('UPDATE users SET status = $1, updated_at = $2 WHERE id = $3', [status, updated_at, userId]);
  } catch (e) {
    // fallback
  }
  const idx = inMemoryUsers.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    inMemoryUsers[idx].status = status;
    inMemoryUsers[idx].updated_at = updated_at;
  }
  return true;
}

export async function resetUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
  const updated_at = new Date().toISOString();
  try {
    await pgPool.query('UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3', [newPasswordHash, updated_at, userId]);
  } catch (e) {
    // fallback
  }
  const idx = inMemoryUsers.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    inMemoryUsers[idx].password_hash = newPasswordHash;
    inMemoryUsers[idx].updated_at = updated_at;
  }
  return true;
}
