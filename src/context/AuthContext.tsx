'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { SessionProvider, useSession, signOut as nextAuthSignOut } from 'next-auth/react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  hasHomestay?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthInnerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Check for OAuth toast messages on mount
  useEffect(() => {
    const oauthMessage = Cookies.get('oauth_message');
    if (oauthMessage === 'already_registered') {
      showToast('Welcome back! You are already registered.');
      Cookies.remove('oauth_message');
    }
  }, []);

  // Load auth state from cookies on mount or when NextAuth session updates
  useEffect(() => {
    // 0. Check URL parameters (for Express Passport OAuth redirects)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const urlUserJson = urlParams.get('user');

      if (urlToken && urlUserJson) {
        try {
          const urlUser = JSON.parse(urlUserJson);
          login(urlToken, urlUser);
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('[Auth] Failed to parse URL auth parameters:', e);
        }
      }
    }

    // 1. Check local credentials (cookies)
    const storedToken = Cookies.get('auth_token');
    const storedUser = Cookies.get('user');


    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('[Auth] Failed to parse stored user:', error);
        Cookies.remove('auth_token');
        Cookies.remove('user');
      }
    }

    // 2. Check NextAuth session
    if (status === 'authenticated' && session?.user) {
      const oauthUser: AuthUser = {
        id: session.user.id || '',
        name: session.user.name || '',
        email: session.user.email || '',
        hasHomestay: (session.user as any).hasHomestay,
      };
      setToken('nextauth-token');
      setUser(oauthUser);
    } else if (status === 'unauthenticated') {
      if (token === 'nextauth-token') {
        setToken(null);
        setUser(null);
      }
    }

    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [session, status, token]);

  const login = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    Cookies.set('auth_token', newToken, { 
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    Cookies.set('user', JSON.stringify(newUser), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    Cookies.remove('auth_token');
    Cookies.remove('user');
    
    if (status === 'authenticated') {
      await nextAuthSignOut({ redirect: true, callbackUrl: '/auth/login' });
    }
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, hasHomestay: true };
      setUser(updatedUser);
      Cookies.set('user', JSON.stringify(updatedUser), {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 bg-[#16212E]/95 dark:bg-black/80 text-white rounded-xl shadow-2xl border border-white/20 dark:border-[#1E2D3D] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00C2A9] animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer text-xs font-bold">✕</button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthInnerProvider>{children}</AuthInnerProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

