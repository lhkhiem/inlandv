// Middleware xác thực JWT
// - Kiểm tra token trong Authorization header
// - Verify token và lưu thông tin user vào request
// - Trả về lỗi 401 nếu token không hợp lệ

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Mở rộng interface Request để thêm thuộc tính user
export interface AuthRequest extends Request {
  user?: any;  // Thông tin user sau khi verify token
}

function parseCookie(header?: string) {
  if (!header) return {} as Record<string, string>;
  return header.split(';').reduce((acc: Record<string, string>, part) => {
    const [k, ...v] = part.trim().split('=');
    acc[k] = decodeURIComponent(v.join('='));
    return acc;
  }, {});
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Try Authorization header first, then cookie from cookieParser, then manual parse
  const bearer = req.headers.authorization?.split(' ')[1];
  const tokenFromCookieParser = (req as any).cookies?.token;
  const cookies = parseCookie(req.headers.cookie as string | undefined);
  const token = bearer || tokenFromCookieParser || cookies['token'];

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[AuthMiddleware] Request:', {
      method: req.method,
      path: req.path,
      hasAuthHeader: !!req.headers.authorization,
      hasCookie: !!req.headers.cookie,
      cookies: Object.keys(cookies),
      hasToken: !!token,
    });
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    // Enrich with current role from DB in case role changed after token issuance
    let role = decoded.role;
    if (!role && decoded.id) {
      const u = await User.findByPk(decoded.id, { attributes: ['role'] });
      role = (u as any)?.role;
    }
    req.user = { id: decoded.id, email: decoded.email, role };
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Token verification failed:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Alias for backward compatibility
export const authenticate = authMiddleware;

// Middleware to check if user is admin
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
};
