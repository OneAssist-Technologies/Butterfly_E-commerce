'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import { AuthTvShowcase } from '@/components/auth/auth-tv-showcase';
import { authService } from '@/services/auth.service';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Retrieve token and email from query params or sessionStorage
  useEffect(() => {
    const queryToken = searchParams.get('token');
    const queryEmail = searchParams.get('email');

    const sessionToken =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('butterfly_reset_token')
        : null;
    const sessionEmail =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('butterfly_reset_email')
        : null;

    const resolvedToken = queryToken || sessionToken || '';
    const resolvedEmail = queryEmail || sessionEmail || '';

    setToken(resolvedToken);
    setEmail(resolvedEmail);
  }, [searchParams]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isLengthValid = newPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Verification token missing. Please complete OTP verification first.');
      return;
    }

    if (!isLengthValid) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword({
        resetToken: token,
        newPassword,
      });

      // Clear token from sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('butterfly_reset_token');
        sessionStorage.removeItem('butterfly_reset_email');
      }

      setIsLoading(false);
      setIsSuccess(true);

      // Auto redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to reset password. Your verification session may have expired. Please request a new code.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-12">
      {/* LEFT COLUMN: Luxury Showcase */}
      <AuthTvShowcase
        title="Set Your New Password."
        subtitle="Create a fresh, secure password to access your orders, saved addresses, and profile."
      />

      {/* RIGHT COLUMN: Reset Form */}
      <div className="col-span-12 md:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-12 xl:p-16 bg-white min-h-screen">
        <div className="max-w-md w-full mx-auto my-auto">
          {/* Brand Logo */}
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

          {/* GUARD: IF NO TOKEN IS PRESENT, SHOW OTP REQUIREMENT NOTICE */}
          {!token ? (
            <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200 text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-zinc-900">
                  OTP Verification Required
                </h3>
                <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                  For your security, you must verify your identity using a 6-digit One-Time Passcode before creating a new password.
                </p>
              </div>

              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Start OTP Verification</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-xs text-zinc-500 hover:text-zinc-800 font-semibold"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* SUCCESS STATE */
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-emerald-950">
                  Password Successfully Changed!
                </h3>
                <p className="text-xs text-emerald-800 mt-1.5 leading-relaxed">
                  Your account password has been updated. You can now use your new password to sign in.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-emerald-700 mt-2">
                  Redirecting to sign in page automatically...
                </p>
              </div>
            </div>
          ) : (
            /* CREATE NEW PASSWORD FORM */
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>OTP Verified Identity</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                  Create New Password
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  {email ? (
                    <>
                      Enter a new password for <strong className="text-zinc-800">{email}</strong>.
                    </>
                  ) : (
                    'Enter and confirm your new password below.'
                  )}
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] transition-all bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Checklist Rules */}
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                        isLengthValid
                          ? 'bg-emerald-100 text-emerald-700 font-bold'
                          : 'bg-zinc-200 text-zinc-500'
                      }`}
                    >
                      ✓
                    </div>
                    <span className={isLengthValid ? 'text-zinc-800 font-semibold' : 'text-zinc-500'}>
                      At least 6 characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                        passwordsMatch
                          ? 'bg-emerald-100 text-emerald-700 font-bold'
                          : 'bg-zinc-200 text-zinc-500'
                      }`}
                    >
                      ✓
                    </div>
                    <span className={passwordsMatch ? 'text-zinc-800 font-semibold' : 'text-zinc-500'}>
                      Passwords match
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isLengthValid || !passwordsMatch}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Update Password &amp; Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-8 pt-6 border-t border-zinc-100 text-center text-xs">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-bold text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-zinc-400 text-center pt-6">
          Butterfly Smart TV Enterprise Authentication &bull; All roles supported
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-3 border-zinc-200 border-t-[#E50914] rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

