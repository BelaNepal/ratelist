import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById, findSessionById, User } from '../database/userStore';

const JWT_SECRET = process.env.JWT_SECRET || 'bela_enterprise_rate_secret_key_2026_super_secure';

export interface AuthenticatedRequest extends Request {
  user?: User;
  sessionId?: string;
}

export async function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // 1. Check HttpOnly Cookie or Authorization header
    let token: string | undefined = req.cookies?.bela_session;
    
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please sign in.' });
    }

    // 2. Decode JWT Token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; sessionId: string; role: string };
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }

    // 3. Verify session in DB/store
    const session = await findSessionById(decoded.sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Session expired or invalidated. Please login again.' });
    }

    const user = await findUserById(decoded.userId);
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'Account disabled or user not found.' });
    }

    req.user = user;
    req.sessionId = session.id;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid authentication credentials.', details: err.message });
  }
}

import { getRolePermissionsMatrix } from '../database/roleStore';

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Access denied: Executive Admin privileges required.' });
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role === 'Admin') return next();

    const matrix = await getRolePermissionsMatrix();
    const roleRec = matrix[req.user.role];
    if (allowedRoles.includes(req.user.role)) return next();

    return res.status(403).json({ error: `Access denied: Role ${req.user.role} is not authorized for this operation.` });
  };
}

export function requirePermission(actionName: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.user.role === 'Admin') return next();

    const matrix = await getRolePermissionsMatrix();
    const roleRec = matrix[req.user.role];
    if (roleRec && roleRec.allowed_actions.includes(actionName)) {
      return next();
    }

    return res.status(403).json({ error: `Access denied: Action ${actionName} restricted for role ${req.user.role}.` });
  };
}
