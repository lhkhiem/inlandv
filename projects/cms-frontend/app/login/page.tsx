'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, user, hydrate } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        await hydrate();
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          // Already authenticated, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        // Not authenticated, stay on login page
      }
    };
    
    checkExistingAuth();
  }, [hydrate, router]);

  // Avoid SSR hydration mismatch due to password-manager/browser extensions injecting attributes
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    try {
      await login(email, password);
      
      // Check if there's a redirect URL in the query params
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      
      // After successful login, redirect to intended page or dashboard
      router.push(redirectUrl);
      router.refresh(); // Force a refresh to ensure middleware picks up the new auth state
    } catch (err: any) {
      setLocalError(err?.response?.data?.error || 'Invalid email or password');
      console.error('Login error:', err);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-2xl">
            CMS
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">CMS Dashboard</h1>
          <p className="text-gray-600 text-center mb-6">Sign in to your account</p>

          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" autoComplete="username" required suppressHydrationWarning />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" autoComplete="current-password" required suppressHydrationWarning />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-primary-foreground font-semibold py-2 px-4 rounded-lg transition duration-200">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Default credentials:
              <br />
              Email: <code className="bg-gray-100 px-2 py-1 rounded text-xs">admin@inland.com</code>
              <br />
              Password: <code className="bg-gray-100 px-2 py-1 rounded text-xs">admin123</code>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">© 2024 Inland CMS. All rights reserved.</p>
      </div>
    </div>
  );
}
