'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle, Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordsMatch = password && passwordConfirm && password === passwordConfirm;
  const passwordValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          passwordConfirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
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

  return (
    <div className="w-full max-w-md">
      <div className="bg-white/90 dark:bg-black/45 backdrop-blur-md rounded-2xl border border-white/30 dark:border-white/10 shadow-2xl px-6 py-5 transition-all duration-300">
        <div className="flex flex-col items-center mb-4">
          <div className="text-black dark:text-white mb-2">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-0.5">Create Account</h1>
          <p className="text-muted-foreground text-xs">Join GuestPulse AI to start analyzing reviews</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-3 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-300 text-xs">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-foreground mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-1.5 bg-background border border-border text-foreground text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-foreground mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-1.5 bg-background border border-border text-foreground text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-foreground mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-1.5 bg-background border border-border text-foreground text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted transition-colors"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {passwordValid ? (
                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              ) : (
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className={passwordValid ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                At least 6 characters
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-xs font-semibold text-foreground mb-1">
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-1.5 bg-background border border-border text-foreground text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-muted transition-colors"
              disabled={isLoading}
              required
            />
            {password && passwordConfirm && (
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                {passwordsMatch ? (
                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                )}
                <span className={passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !passwordValid || !passwordsMatch}
            className="w-full bg-[#00C2A9] dark:bg-[#00C2A9] text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-[#00A38E] dark:hover:bg-[#00A38E] disabled:bg-[#00C2A9]/50 dark:disabled:bg-[#00C2A9]/50 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm mt-1"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-4 text-center text-muted-foreground text-xs">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
