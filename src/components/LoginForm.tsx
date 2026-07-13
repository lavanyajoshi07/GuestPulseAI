'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import Cookies from 'js-cookie';
import { RegisterFirstDialog } from './AuthDialogs';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterFirst, setShowRegisterFirst] = useState(false);
  const [registerFirstMsg, setRegisterFirstMsg] = useState('');

  useEffect(() => {
    const oauthError = Cookies.get('oauth_error');
    if (oauthError === 'register_required') {
      setRegisterFirstMsg('No account exists with this Google account. Please register first.');
      setShowRegisterFirst(true);
      Cookies.remove('oauth_error');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404 || data.code === 'ACCOUNT_NOT_FOUND') {
          setRegisterFirstMsg('Account not found. Please register first.');
          setShowRegisterFirst(true);
          setIsLoading(false);
          return;
        }
        const errorMsg = data.error || 'Login failed';
        const isNotRegistered = errorMsg.toLowerCase().includes('not registered') || errorMsg.toLowerCase().includes('register first');
        
        setError(isNotRegistered ? `${errorMsg} Redirecting to register page...` : errorMsg);
        
        if (isNotRegistered) {
          setTimeout(() => {
            router.push('/auth/register');
          }, 2500);
        }
        return;
      }

      // Update auth context
      login(data.token, data.user);

      // Redirect to analyzer
      router.push('/analyzer');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError('');
    Cookies.set('auth_flow', 'login', { expires: 1/24, path: '/' });
    try {
      const checkRes = await fetch('/api/auth/providers');
      if (checkRes.ok) {
        await nextAuthSignIn(provider, { callbackUrl: '/analyzer' });
      } else {
        window.location.href = `/api/auth/${provider}?flow=login`;
      }
    } catch (err) {
      window.location.href = `/api/auth/${provider}?flow=login`;
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/90 dark:bg-black/45 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl p-8 transition-all duration-300">
        <h1 className="text-2xl font-bold text-foreground mb-2">Sign In</h1>
        <p className="text-muted-foreground mb-6">Enter your credentials to access GuestPulse AI</p>


        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted transition-colors"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#00C2A9] dark:bg-[#00C2A9] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#00A38E] dark:hover:bg-[#00A38E] disabled:bg-[#00C2A9]/50 dark:disabled:bg-[#00C2A9]/50 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border dark:border-[#1E2D3D]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#16212E]/90 dark:bg-black/45 px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="w-full">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border dark:border-[#1E2D3D] rounded-lg bg-background hover:bg-muted font-medium transition-colors text-sm cursor-pointer disabled:cursor-not-allowed text-foreground"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>
        </div>

        {/* Register Link */}
        <p className="mt-6 text-center text-muted-foreground text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
            Register
          </Link>
        </p>
      </div>

      <RegisterFirstDialog
        isOpen={showRegisterFirst}
        message={registerFirstMsg}
        onClose={() => setShowRegisterFirst(false)}
        onConfirm={() => {
          setShowRegisterFirst(false);
          router.push('/auth/register');
        }}
      />
    </div>
  );
}
