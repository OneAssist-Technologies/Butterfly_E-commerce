'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { AuthTvShowcase } from '@/components/auth/auth-tv-showcase';
import { authService } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already authenticated as admin, redirect directly to admin dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('butterfly_admin_token');
      const adminRaw = localStorage.getItem('butterfly_admin_user');
      if (adminToken && adminRaw) {
        try {
          const parsed = JSON.parse(adminRaw);
          if (['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER'].includes(parsed?.role)) {
            router.replace('/admin/overview');
          }
        } catch {}
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const inputEmail = email.trim().toLowerCase();

    try {
      const data = await authService.customerLogin({ email: inputEmail, password });
      if (!data?.token || !data?.user || data?.success !== true) {
        throw new Error('Authentication failed: Invalid response format from server.');
      }

      const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER'].includes(
        data.user.role
      );

      if (isAdmin) {
        localStorage.setItem('butterfly_admin_token', data.token);
        localStorage.setItem('butterfly_admin_user', JSON.stringify(data.user));
        setIsLoading(false);
        setSuccessMsg(`Welcome, ${data.user.name || 'Admin'}! Entering Admin Dashboard...`);
        setTimeout(() => {
          router.push('/admin');
        }, 600);
      } else {
        localStorage.setItem('butterfly_user_token', data.token);
        localStorage.setItem('butterfly_user', JSON.stringify(data.user));
        setIsLoading(false);
        const redirectParam = typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('redirect')
          : null;
        setSuccessMsg(`Welcome, ${data.user.name || 'Member'}! Redirecting...`);
        setTimeout(() => {
          router.push(redirectParam || '/');
        }, 700);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Login failed. Please verify email and password.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-12">
      {/* LEFT COLUMN: Luxury Dark Room with Wall-Mounted TV showing Original Butterfly Logo on Display & Under TV */}
      <AuthTvShowcase
        title="Welcome back to brighter viewing."
        subtitle="Discover televisions designed to make every story feel closer with vibrant colour technology and lifelike clarity."
      />

      {/* RIGHT COLUMN: Member / Admin Sign In Form */}
      <div className="col-span-12 md:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-12 xl:p-16 bg-white min-h-screen">
        <div className="max-w-md w-full mx-auto my-auto">
          {/* Official Butterfly Brand Logo matching Navbar */}
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="relative h-8 sm:h-9 w-48 sm:w-56 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/brand/butterfly-wordmark-red.png"
                alt="Butterfly Logo"
                fill
                sizes="(max-width: 640px) 192px, 224px"
                className="object-contain object-left"
                priority
              />
            </div>
            <div className="flex flex-col border-l border-zinc-300 pl-2 py-0.5">
              <span className="text-[11px] sm:text-xs font-black tracking-wider text-zinc-900 uppercase leading-none whitespace-nowrap">
                SMART TV
              </span>
            </div>
          </Link>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Sign In
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Sign in with your customer account or administrator credentials.
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5"
              >
                Email Address / Admin ID
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com or admin@buttterfly.com"
                className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] transition-all bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-zinc-600 hover:text-zinc-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-[#E50914] focus:ring-[#E50914] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <Link
                href="/forgot-password"
                className="font-semibold text-[#E50914] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-70 active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signup */}
          <div className="mt-8 pt-6 border-t border-zinc-100 text-center text-xs text-zinc-600">
            <span>New customer? </span>
            <Link
              href="/signup"
              className="font-bold text-[#E50914] hover:underline"
            >
              Create a Butterfly account
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-zinc-400 text-center pt-6">
          Butterfly Smart TV Enterprise Authentication &bull; All roles supported
        </p>
      </div>
    </div>
  );
}
