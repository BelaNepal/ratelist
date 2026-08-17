import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import {
  findUserByEmail,
  findUserById,
  updateUserLastLogin,
  createSession,
  deleteSession,
  getAllUsers,
  getAllActiveSessions,
  updateUserRole,
  createNewUser,
  updateUserStatus,
  resetUserPassword,
  UserSession,
  User
} from '../database/userStore';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'bela_enterprise_rate_secret_key_2026_super_secure';

function generateSessionId(): string {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid corporate credentials. User not found.' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Corporate account is currently inactive. Contact your administrator.' });
    }

    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const token = jwt.sign(
      {
        userId: user.id,
        sessionId,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Save session in PostgreSQL DB or in-memory fallback
    const sessionObj: UserSession = {
      id: sessionId,
      user_id: user.id,
      token_hash: bcrypt.hashSync(token, 8),
      ip_address: req.ip || req.socket.remoteAddress || '127.0.0.1',
      user_agent: req.get('User-Agent') || 'Unknown Browser',
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };

    await createSession(sessionObj);
    await updateUserLastLogin(user.id);

    // Set secure HTTP-only Cookie with Cross-Site SameSite None support for production
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('bela_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });


    const { password_hash, ...userPayload } = user;
    userPayload.last_login_at = new Date().toISOString();

    return res.json({
      success: true,
      message: `Welcome back, ${user.full_name}! Authenticated successfully.`,
      user: userPayload,
      token,
      sessionId
    });
  } catch (err: any) {
    console.error('Login Error:', err);
    return res.status(500).json({ error: 'Authentication failed due to server error.', details: err.message });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response) {
  try {
    if (req.sessionId) {
      await deleteSession(req.sessionId);
    }
    res.clearCookie('bela_session', { path: '/' });
    return res.json({ success: true, message: 'Logged out successfully. Cookie cleared.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Logout error', details: err.message });
  }
}

export async function getCurrentUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated.' });
  }
  const { password_hash, ...userPayload } = req.user;
  return res.json({
    authenticated: true,
    user: userPayload,
    sessionId: req.sessionId
  });
}

export async function getAllUsersHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await getAllUsers();
    return res.json({ success: true, users });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getAllSessionsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const sessions = await getAllActiveSessions();
    return res.json({ success: true, sessions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateUserRoleHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ error: 'userId and role are required.' });
    }
    await updateUserRole(userId, role);
    return res.json({ success: true, message: `Updated user role to ${role}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createNewUserHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password, full_name, role, department } = req.body;
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Email, password, full name, and role are required.' });
    }
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'A user with this corporate email already exists.' });
    }
    const newUser: User = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      password_hash: bcrypt.hashSync(password, 10),
      full_name: full_name.trim(),
      role,
      department: department ? department.trim() : 'Bela Operations',
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await createNewUser(newUser);
    const { password_hash, ...userPayload } = newUser;
    return res.json({ success: true, message: 'New corporate user created successfully.', user: userPayload });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateUserStatusHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, status } = req.body;
    if (!userId || !status) {
      return res.status(400).json({ error: 'userId and status are required.' });
    }
    await updateUserStatus(userId, status);
    return res.json({ success: true, message: `User status updated to ${status}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

import { getRolePermissionsMatrix, updateRolePermissions } from '../database/roleStore';

export async function resetUserPasswordHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'userId and newPassword are required.' });
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    await resetUserPassword(userId, hash);
    return res.json({ success: true, message: 'User password reset successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getRolePermissionsHandler(req: Request, res: Response) {
  try {
    const matrix = await getRolePermissionsMatrix();
    return res.json({ success: true, matrix });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function updateRolePermissionsHandler(req: AuthenticatedRequest, res: Response) {
  try {
    const { role, allowed_tabs, allowed_actions } = req.body;
    if (!role || !Array.isArray(allowed_tabs) || !Array.isArray(allowed_actions)) {
      return res.status(400).json({ error: 'role, allowed_tabs, and allowed_actions are required.' });
    }
    const updated = await updateRolePermissions(role, allowed_tabs, allowed_actions);
    return res.json({
      success: true,
      message: `Updated dynamic RBAC permissions matrix for role ${role} in PostgreSQL DB!`,
      record: updated
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
