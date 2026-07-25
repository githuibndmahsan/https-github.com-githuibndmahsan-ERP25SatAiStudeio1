import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { User, Permission } from '../../src/types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'educore_enterprise_erp_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
  tenantId?: string;
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, role: user.role, institutionId: user.institutionId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-access-token']) {
    token = req.headers['x-access-token'] as string;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; institutionId?: string };
    const users = db.getRawData().users;
    const user = users.find((u) => u.id === decoded.id);

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Invalid user or account is suspended.'
      });
    }

    req.user = user;
    
    // Resolve Tenant Context:
    // If header x-tenant-id is provided and user is SUPER_ADMIN, allow previewing that tenant.
    // Otherwise, tenantId is tied directly to user's assigned institutionId.
    const requestedTenant = req.headers['x-tenant-id'] as string;
    if (user.role === 'SUPER_ADMIN' && requestedTenant) {
      req.tenantId = requestedTenant;
    } else {
      req.tenantId = user.institutionId;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}

export function requirePermission(...permissions: Permission[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next(); // Super Admin has all permissions
    }

    const hasAll = permissions.every((p) => req.user?.permissions.includes(p));
    if (!hasAll) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission (${permissions.join(', ')})`
      });
    }

    next();
  };
}

export function requireTenantContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.tenantId) {
    return res.status(400).json({
      success: false,
      message: 'Tenant context (institution ID) is required for this action.'
    });
  }
  next();
}
