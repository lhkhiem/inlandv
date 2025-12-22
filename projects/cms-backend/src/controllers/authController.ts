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

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
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
    const cookieOptions: any = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: maxAgeMs,
      path: '/',
    };
    
    // In development, allow cross-origin cookies
    if (process.env.NODE_ENV === 'development') {
      cookieOptions.sameSite = 'none';
      cookieOptions.secure = false;
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
    res.status(500).json({ error: 'Login failed' });
  }
};

// Xác thực session hiện tại từ cookie và trả về user
export const verify = async (req: Request, res: Response) => {
  try {
    const header = req.headers.cookie || '';
    const cookies = header.split(';').reduce((acc: any, p) => {
      const [k, ...v] = p.trim().split('=');
      if (k) acc[k] = decodeURIComponent(v.join('='));
      return acc;
    }, {} as Record<string, string>);
    const bearer = req.headers.authorization?.split(' ')[1];
    const token = bearer || cookies['token'];
    if (!token) return res.status(401).json({ error: 'No session' });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: 'Invalid session' });
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user as any).role,
      },
    });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid session' });
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

