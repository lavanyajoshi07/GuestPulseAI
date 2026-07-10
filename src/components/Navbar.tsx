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
  const isAnalyzer = pathname === '/analyzer';

  const getNavLinkClass = (path: string) => {
    const active = isActive(path);
    const baseClasses = "px-3 py-1 rounded-full font-semibold transition-all text-xs tracking-wider select-none border";
    if (isLanding) {
      return `${baseClasses} ${
        active
          ? 'bg-[#00C2A9]/20 text-[#00C2A9] border-[#00C2A9]/35 shadow-[0_2px_10px_rgba(0,194,169,0.1)]'
          : 'text-white/70 hover:bg-white/5 hover:text-white border-transparent'
      }`;
    }
    return `${baseClasses} ${
      active
        ? 'bg-[#00C2A9]/12 text-[#00C2A9] border-[#00C2A9]/25 dark:bg-[#00C2A9]/18'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground border-transparent'
    }`;
  };

  return (
    <nav
      style={{
        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.5s, border-color 0.5s, backdrop-filter 0.5s',
        willChange: 'transform, opacity',
      }}
      className={`z-50 w-full transition-all duration-500 ${
        isLanding
          ? 'fixed top-0 left-0 right-0 text-white'
          : isAnalyzer
          ? 'relative bg-white dark:bg-[#16212E] border-b border-slate-200 dark:border-[#1E2D3D] text-foreground'
          : 'relative bg-card dark:bg-[#16212E] border-b border-border/60 dark:border-[#1E2D3D] text-foreground'
      } ${
        isNavbarVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : '-translate-y-full opacity-0 pointer-events-none'
      } ${
        isLanding && isNavbarVisible
          ? 'bg-[#0B1220]/75 backdrop-blur-xl border-b border-white/10'
          : isLanding
          ? 'bg-transparent border-transparent'
          : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left section: Logo + Tabs inline */}
          <div className="flex items-center gap-8">
            {/* Logo with GuestPulse AI branding */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="relative flex items-center justify-center w-7.5 h-7.5 rounded-xl bg-[#00C2A9]/10 border border-[#00C2A9]/20 dark:bg-[#00C2A9]/15 overflow-hidden transition-all duration-300 group-hover:border-[#00C2A9]/40 group-hover:shadow-[0_0_10px_rgba(0,194,169,0.25)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4.5 h-4.5 text-[#00C2A9] transition-transform duration-300 group-hover:scale-110"
                >
                  <path
                    d="M3 12H7L9.5 5L13.5 19L16 10L18 13H21"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {/* Subtle ambient pulse background glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00C2A9]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              <span className={`text-lg font-bold tracking-tight transition-colors duration-300 font-sans ${
                isLanding ? 'text-white' : 'text-foreground'
              }`}>
                GuestPulse<span className="text-[#00C2A9]">AI</span>
              </span>
            </Link>

            {/* Desktop Navigation Link Tabs (Centered inline) */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-1.5 bg-white/5 dark:bg-white/[0.02] border border-white/5 p-0.5 rounded-full backdrop-blur-md">
                <Link href="/" className={getNavLinkClass('/')}>
                  Home
                </Link>
                <Link href="/analyzer" className={getNavLinkClass('/analyzer')}>
                  Analyzer
                </Link>
                <Link href="/history" className={getNavLinkClass('/history')}>
                  History
                </Link>
                <Link href="/dashboard" className={getNavLinkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link href="/reports" className={getNavLinkClass('/reports')}>
                  Reports
                </Link>
              </div>
            )}
          </div>

          {/* Right actions: Theme toggle + Logout */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`w-8.5 h-8.5 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                isLanding
                  ? 'border border-white/10 bg-white/5 hover:bg-white/15 text-white'
                  : 'border border-border bg-background/50 hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Toggle theme"
            >
              {!mounted ? (
                <div className="w-3.5 h-3.5" />
              ) : theme === 'dark' ? (
                <Sun className={`w-4 h-4 hover:rotate-45 transition-transform duration-300 ${isLanding ? 'text-[#00C2A9]' : 'text-amber-500'}`} />
              ) : (
                <Moon className={`w-4 h-4 hover:-rotate-12 transition-transform duration-300 ${isLanding ? 'text-white' : 'text-[#00C2A9]'}`} />
              )}
            </button>

            {/* Auth Actions */}
            {isAuthenticated && user ? (
              <button
                onClick={handleLogout}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-bold tracking-wider uppercase transition-all rounded-lg cursor-pointer ${
                  isLanding
                    ? 'bg-white/10 border border-white/15 text-white/95 hover:bg-white/20'
                    : 'border border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                Logout
              </button>
            ) : !isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className={`text-xs font-semibold uppercase tracking-wider px-3.5 py-2 transition-all ${
                    isLanding
                      ? 'text-white/90 hover:text-[#00C2A9]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className={`text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    isLanding
                      ? 'bg-[#00C2A9] hover:bg-[#00A38E] text-white rounded-lg px-3.5 py-1.5 cursor-pointer shadow-sm shadow-emerald-500/10'
                      : 'bg-[#00C2A9] hover:bg-[#00A38E] text-white rounded-lg px-3.5 py-1.5'
                  }`}
                >
                  {isLanding ? 'Get Started' : 'Register'}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Links (Only shown underneath when authenticated and on mobile) */}
        {isAuthenticated && (
          <div className="flex md:hidden gap-1.5 flex-wrap border-t border-border/10 dark:border-white/5 mt-2.5 pt-2.5">
            <Link href="/" className={getNavLinkClass('/')}>
              Home
            </Link>
            <Link href="/analyzer" className={getNavLinkClass('/analyzer')}>
              Analyzer
            </Link>
            <Link href="/history" className={getNavLinkClass('/history')}>
              History
            </Link>
            <Link href="/dashboard" className={getNavLinkClass('/dashboard')}>
              Dashboard
            </Link>
            <Link href="/reports" className={getNavLinkClass('/reports')}>
              Reports
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
