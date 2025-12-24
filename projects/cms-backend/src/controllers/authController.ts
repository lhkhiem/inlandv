// Controller xác thực (Auth)
// - Chứa các hàm đăng ký và đăng nhập cơ bản
// - Lưu ý: hiện lưu password đã hash vào trường `password_hash` trong bảng users

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Đăng ký user mới
// Body: { email, password, name }
// Trả về: id, email, name (không trả password)
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password_hash: hashedPassword,
      name,
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Đăng nhập và phát JWT
// Body: { email, password }
// Trả về: { token, user }
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password_hash) {
      console.error('[AuthController] User has no password_hash:', user.email);
      return res.status(500).json({ error: 'User account is not properly configured' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: (user as any).role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
    );

    // Set HTTP-only cookie for session
    const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const cookieOptions: any = {
      httpOnly: true,
      maxAge: maxAgeMs,
      path: '/',
    };
    
    // In development, allow cross-origin cookies
    // Note: sameSite: 'none' requires secure: true in modern browsers
    // But for localhost, we can use 'lax' which works better
    if (isDevelopment) {
      // Try 'lax' first for same-origin requests, fallback to 'none' if needed
      cookieOptions.sameSite = 'lax';
      cookieOptions.secure = false;
    } else {
      cookieOptions.sameSite = 'lax';
      cookieOptions.secure = true;
    }
    
    res.cookie('token', token, cookieOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthController] Cookie set:', {
        hasToken: !!token,
        options: cookieOptions,
        origin: req.headers.origin,
      });
    }

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user as any).role,
      },
    });
  } catch (error) {
    console.error('[AuthController] Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Xác thực session hiện tại từ cookie và trả về user
export const verify = async (req: Request, res: Response) => {
  try {
    // Use cookieParser middleware to get cookies (already parsed by app.ts)
    // Also check Authorization header as fallback
    const bearer = req.headers.authorization?.split(' ')[1];
    const token = bearer || (req as any).cookies?.token;

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthController] Verify request:', {
        hasCookieHeader: !!req.headers.cookie,
        cookies: (req as any).cookies,
        cookieKeys: (req as any).cookies ? Object.keys((req as any).cookies) : [],
        hasBearer: !!bearer,
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      });
    }

    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthController] No token found in cookie or Authorization header');
      }
      return res.status(401).json({ error: 'No session' });
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthController] JWT decoded:', { id: decoded.id, email: decoded.email });
      }
    } catch (jwtError: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AuthController] JWT verification failed:', {
          message: jwtError.message,
          name: jwtError.name,
        });
      }
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        details: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
      });
    }

    // Find user by ID from token
    const user = await User.findByPk(decoded.id);
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AuthController] User not found in database:', decoded.id);
      }
      return res.status(401).json({ error: 'User not found' });
    }

    // Return user data
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthController] Verify success:', { id: user.id, email: user.email });
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user as any).role,
      },
    });
  } catch (e: any) {
    console.error('[AuthController] Verify error:', e);
    return res.status(401).json({ 
      error: 'Invalid session',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
};

// Đăng xuất: xóa cookie token
export const logout = async (_req: Request, res: Response) => {
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
  });
  res.json({ ok: true });
};

