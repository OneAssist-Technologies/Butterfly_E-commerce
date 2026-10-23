'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { AuthTvShowcase } from '@/components/auth/auth-tv-showcase';
import { authService } from '@/services/auth.service';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const data = await authService.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (!data?.token || !data?.user || data?.success !== true) {
        throw new Error('Registration failed: Invalid response format from server.');
      }

      // Save user session
      localStorage.setItem('butterfly_user_token', data.token);
      localStorage.setItem('butterfly_user', JSON.stringify(data.user));

      setIsLoading(false);
      setSuccessMsg(true);
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(
        err?.response?.data?.message || 'Registration failed. Please check your information.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-12">
      {/* LEFT COLUMN: Luxury Dark Room with Wall-Mounted TV showing Original Butterfly Logo on Display & Under TV */}
      <AuthTvShowcase
        title="A smarter world of entertainment awaits."
        subtitle="Discover televisions crafted with precision, brilliant colour technology, and intuitive smart features that bring every scene to life."
      />

      {/* RIGHT COLUMN: Create Your Account Form */}
      <div className="col-span-12 md:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-12 xl:p-16 bg-white min-h-screen">
        <div className="max-w-md w-full mx-auto my-auto">
          
          {/* Official Butterfly Brand Logo matching Navbar */}
          <Link href="/" className="inline-flex items-center gap-2 group mb-8">
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
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E50914] block mb-2">
              CREATE YOUR ACCOUNT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Join Butterfly
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Create an account to save favourites and manage enquiries.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-[#E50914] text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Account created successfully! Redirecting to sign in...</span>
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] transition-all bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] transition-all bg-white"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] transition-all bg-white"
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
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] transition-all bg-white"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter password again"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-600 leading-normal">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-zinc-300 text-[#E50914] focus:ring-[#E50914] cursor-pointer"
                />
                <span>
                  I agree to the{' '}
                  <span className="text-[#E50914] font-semibold hover:underline">
                    Terms of Service
                  </span>{' '}
                  &amp;{' '}
                  <span className="text-[#E50914] font-semibold hover:underline">
                    Privacy Policy
                  </span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-70 active:scale-[0.99] mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-5 border-t border-zinc-100 text-center text-xs text-zinc-600">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="font-bold text-[#E50914] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Prototype notice at bottom */}
        <p className="text-[11px] text-zinc-400 text-center pt-6">
          Secure account services require backend integration and are not active in this prototype.
        </p>
      </div>
    </div>
  );
}
