// Store quản lý trạng thái xác thực (Auth)
// - Sử dụng zustand cho state management
// - Lưu trữ thông tin user và token trong localStorage
// - Cung cấp các hàm login, register, logout

import { create } from 'zustand';
import axios from 'axios';
import { resolveApiBaseUrl } from '../lib/api';

interface LoginResponse {
  token?: string;
  user: User;
}

interface RegisterResponse {
  user: User;
}

interface User {
  id: string;
  email: string;
  name: string;
  role?: 'owner' | 'admin' | 'editor' | 'author';
}

// Interface định nghĩa store auth
interface AuthStore {
  user: User | null;       // Thông tin user hiện tại
  isLoading: boolean;      // Trạng thái loading
  error: string | null;    // Thông báo lỗi nếu có
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>; // Verify session from cookie
}

const getApiUrl = () => {
  // Always use direct backend URL, not Next.js rewrite
  if (typeof window !== 'undefined') {
    // In browser, use direct backend URL
    const port = 4001;
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${port}`;
  }
  // Server-side fallback
  const base = resolveApiBaseUrl();
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  // Đăng nhập: gửi email + password lên API
  // - Thiết lập cookie HTTP-only từ server
  // - Update state với thông tin user
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = getApiUrl();
      const loginUrl = `${apiUrl}/api/auth/login`;
      console.log('[AuthStore] Login attempt:', { email, apiUrl, loginUrl });
      
      const response = await axios.post(
        loginUrl,
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      console.log('[AuthStore] Login response:', response.data);
      const { user, token } = response.data as LoginResponse;
      
      // Store token in localStorage as backup (cookie may not work in some browsers)
      if (token) {
        localStorage.setItem('auth_token', token);
        console.log('[AuthStore] Token stored in localStorage');
      }
      
      set({ user, isLoading: false });
    } catch (error: any) {
      console.error('[AuthStore] Login error:', error);
      console.error('[AuthStore] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
      set({
        error: error.response?.data?.error || error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Đăng ký user mới
  // - Gọi API /auth/register
  // - Chỉ lưu thông tin user vào state, không tự động login
  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${getApiUrl()}/api/auth/register`, {
        email,
        password,
        name,
      });
      const { user } = response.data as RegisterResponse;
      set({ user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  // Đăng xuất: gọi API để xóa cookie và xóa user khỏi state
  logout: async () => {
    try {
      await axios.post(`${getApiUrl()}/api/auth/logout`, {}, { withCredentials: true });
    } catch {}
    
    // Clear token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    
    set({ user: null });
  },

  // Khôi phục session từ cookie hoặc localStorage
  hydrate: async () => {
    try {
      const apiUrl = getApiUrl();
      const verifyUrl = `${apiUrl}/api/auth/verify`;
      
      // Try to get token from localStorage as fallback
      const tokenFromStorage = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      
      console.log('[AuthStore] Hydrate attempt:', { 
        apiUrl, 
        verifyUrl,
        hasTokenInStorage: !!tokenFromStorage 
      });
      
      // Prepare headers - include Authorization if we have token in storage
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (tokenFromStorage) {
        headers['Authorization'] = `Bearer ${tokenFromStorage}`;
        console.log('[AuthStore] Using token from localStorage in Authorization header');
      }
      
      const res = await axios.get(verifyUrl, { 
        withCredentials: true,
        headers
      });
      
      console.log('[AuthStore] Hydrate success:', res.data);
      const { user } = res.data as { user: User };
      set({ user });
    } catch (error: any) {
      // 401 (Unauthorized) và 429 (Too Many Requests) là expected responses
      // Không nên log như error
      const status = error?.response?.status;
      if (status !== 401 && status !== 429) {
        console.error('[AuthStore] Hydrate error:', error);
        console.error('[AuthStore] Hydrate error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          url: error.config?.url,
        });
      }
      
      // If verify fails, clear localStorage token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      
      set({ user: null });
    }
  },
}));

