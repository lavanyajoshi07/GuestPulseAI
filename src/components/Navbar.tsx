'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart3, Home, History, Search, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-card shadow-sm border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-foreground">ReviewLens AI</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all border border-border"
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-5 h-5" />
              ) : theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Auth Actions */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors border border-border"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/')
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>

            <Link
              href="/analyzer"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/analyzer')
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
              }`}
            >
              <Search className="w-4 h-4" />
              Analyzer
            </Link>

            <Link
              href="/history"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/history')
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
