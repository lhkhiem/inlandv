'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard component - Protects routes by checking authentication
 * - Verifies session on mount using cookie
 * - Redirects to /login if not authenticated
 * - Shows loading state while checking auth
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { user, hydrate } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // If no user in store, try to hydrate from cookie
        if (!user) {
          await hydrate();
          
          if (!isMounted) return;
          
          // After hydration, check if we have a user
          const currentUser = useAuthStore.getState().user;
          if (!currentUser) {
            // No valid session, redirect to login
            router.push('/login');
            return;
          }
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [user, hydrate, router]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
          </div>
        </div>
      )
    );
  }

  // Only render children if user is authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}




