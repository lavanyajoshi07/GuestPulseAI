'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart3, Home, History, Search, LogOut, User, Sun, Moon, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNavbar } from '@/context/NavbarContext';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isNavbarVisible } = useNavbar();
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

  const isLanding = pathname === '/';

  const getNavLinkClass = (path: string) => {
    const active = isActive(path);
    if (isLanding) {
      return `flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all text-sm ${
        active
          ? 'bg-white/15 text-white border border-white/10 shadow-sm'
          : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
      }`;
    }
    return `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
      active
        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent'
    }`;
  };

  return (
    <nav
      style={{
        transition: 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.8s, border-color 0.8s, backdrop-filter 0.8s',
        willChange: 'transform, opacity',
      }}
      className={`z-50 ${
        isLanding
          ? 'fixed top-0 left-0 right-0 text-white'
          : 'relative bg-card border-b border-border text-foreground'
      } ${
        isNavbarVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        isLanding && isNavbarVisible
          ? 'bg-[rgba(20,20,20,0.55)] backdrop-blur-[20px] border-b border-white/8'
          : isLanding
          ? 'bg-transparent border-transparent'
          : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          {/* Logo with GuestPulse AI branding */}
          <Link href="/" className="flex items-center gap-2 group">
            {isLanding ? (
              <span className="flex items-center gap-2 text-xl font-bold tracking-tight text-white font-sans">
                <span className="flex items-center justify-center w-5 h-5 rounded-full border border-white/40 text-[10px] text-white/90 bg-white/5 font-mono select-none">
                  ◉
                </span>
                GuestPulse AI
              </span>
            ) : (
              <>
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-xl font-bold text-foreground">GuestPulse AI</span>
              </>
            )}
          </Link>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button (Glass style on landing) */}
            <button
              onClick={toggleTheme}
              className={
                isLanding
                  ? 'w-10 h-10 flex items-center justify-center rounded-full border border-white/18 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all cursor-pointer'
                  : 'p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all border border-border cursor-pointer'
              }
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-4 h-4" />
              ) : theme === 'dark' ? (
                <Sun className={`w-4 h-4 hover:rotate-45 transition-transform duration-300 ${isLanding ? 'text-amber-400' : 'text-amber-500'}`} />
              ) : (
                <Moon className={`w-4 h-4 hover:-rotate-12 transition-transform duration-300 ${isLanding ? 'text-white' : 'text-blue-600'}`} />
              )}
            </button>

            {/* Auth Actions */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className={`w-4 h-4 ${isLanding ? 'text-white/50' : 'text-muted-foreground'}`} />
                  <span className={isLanding ? 'text-white/90' : 'text-foreground'}>{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                    isLanding
                      ? 'bg-white/10 border border-white/15 text-white/90 hover:bg-white/20 rounded-full cursor-pointer'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground rounded-lg border border-border cursor-pointer'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className={`text-sm font-medium transition-all ${
                    isLanding
                      ? 'text-white/95 hover:opacity-70'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground px-4 py-2 rounded-lg'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className={`text-sm font-medium transition-all ${
                    isLanding
                      ? 'bg-white/14 border border-white/18 backdrop-blur-md text-white hover:bg-white/22 rounded-full px-5 py-2 cursor-pointer shadow-sm'
                      : 'text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2'
                  }`}
                >
                  {isLanding ? 'Get Started' : 'Register'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tab Links - only shown when authenticated */}
        {isAuthenticated && (
          <div className="flex gap-2 flex-wrap border-t border-white/5 pt-4">
            <Link href="/" className={getNavLinkClass('/')}>
              <Home className="w-4 h-4" />
              Home
            </Link>

            <Link href="/analyzer" className={getNavLinkClass('/analyzer')}>
              <Search className="w-4 h-4" />
              Analyzer
            </Link>

            <Link href="/history" className={getNavLinkClass('/history')}>
              <History className="w-4 h-4" />
              History
            </Link>

            <Link href="/dashboard" className={getNavLinkClass('/dashboard')}>
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>

            <Link href="/reports" className={getNavLinkClass('/reports')}>
              <FileText className="w-4 h-4" />
              Reports
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
