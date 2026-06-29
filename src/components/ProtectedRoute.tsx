'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (isAuthenticated && user && !user.hasHomestay) {
        // Skip redirect if already on onboarding page to prevent redirect loops
        if (pathname !== '/onboarding') {
          router.push('/onboarding');
        }
      } else if (isAuthenticated && user && user.hasHomestay && pathname === '/onboarding') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Block rendering dashboard/history if user has no homestay and isn't on onboarding
  if (user && !user.hasHomestay && pathname !== '/onboarding') {
    return null;
  }

  return <>{children}</>;
}

