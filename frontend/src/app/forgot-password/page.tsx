'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { AuthTvShowcase } from '@/components/auth/auth-tv-showcase';
import { authService } from '@/services/auth.service';

function ForgotPasswordContent() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown effect for Resend Code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus first OTP box on entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(cleanEmail);
      setIsLoading(false);
      setSuccessMessage(res.message || 'Verification code sent to your email.');
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setCountdown(60);
      setStep('otp');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to send verification code. Please check your email and try again.'
      );
    }
  };

  // Handle OTP digit box input
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric characters
    const char = value.slice(-1).replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto focus next box
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste in OTP boxes
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(digits.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // Handle Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('').trim();

    if (fullOtp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your verification code.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await authService.verifyOtp(email.trim().toLowerCase(), fullOtp);
      if (!res?.resetToken) {
        throw new Error('Verification failed: No reset token received.');
      }

      // Store in sessionStorage as safety backup
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('butterfly_reset_token', res.resetToken);
        sessionStorage.setItem('butterfly_reset_email', res.email || email);
      }

      setIsLoading(false);
      setSuccessMessage('Code verified successfully! Redirecting to create your new password...');

      // Transition to /reset-password
      setTimeout(() => {
        router.push(
          `/reset-password?token=${res.resetToken}&email=${encodeURIComponent(
            res.email || email
          )}`
        );
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          'Invalid or expired verification code. Please check and try again.'
      );
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (countdown > 0 || isLoading) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await authService.forgotPassword(email.trim().toLowerCase());
      setIsLoading(false);
      setSuccessMessage('A new verification code has been sent to your email.');
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to resend verification code.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white grid grid-cols-1 md:grid-cols-12">
      {/* LEFT COLUMN: Luxury Showcase */}
      <AuthTvShowcase
        title="Secure Password Recovery."
        subtitle="Protect your Butterfly account with two-step verification. Enter your registered email to receive an instant One-Time Passcode."
      />

      {/* RIGHT COLUMN: Forgot Password Form */}
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

          {/* Form Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#E50914] text-[11px] font-bold border border-red-100 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Step {step === 'email' ? '1 of 2: Email Verification' : '2 of 2: OTP Verification'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              {step === 'email' ? 'Forgot Password?' : 'Enter Verification Code'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              {step === 'email'
                ? 'Enter the email address associated with your Butterfly account to receive a 6-digit OTP.'
                : `We have sent a 6-digit verification code to ${email}.`}
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Developer Quick OTP Helper (shows if SMTP running in dev/console mode) */}
          {devOtp && step === 'otp' && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div>
                <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-700">
                  Demo / Development Mode OTP
                </span>
                <span className="font-mono font-black text-sm text-zinc-900 tracking-widest">{devOtp}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const digits = devOtp.split('');
                  setOtp(digits);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Auto-fill Code
              </button>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] transition-all bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-70 active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wider">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs text-[#E50914] hover:underline font-semibold"
                  >
                    Change Email
                  </button>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-13 sm:w-14 sm:h-15 text-center text-xl sm:text-2xl font-black font-mono rounded-xl border-2 border-zinc-300 text-zinc-900 focus:outline-none focus:border-[#E50914] focus:ring-4 focus:ring-[#E50914]/15 transition-all bg-white"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Cooldown and Button */}
              <div className="flex items-center justify-between text-xs text-zinc-600 pt-1">
                <span>Didn&apos;t receive code?</span>
                {countdown > 0 ? (
                  <span className="font-semibold text-zinc-500">
                    Resend in <strong className="text-zinc-800">{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleResend}
                    className="font-bold text-[#E50914] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-70 active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Code &amp; Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
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

        {/* Footer info */}
        <p className="text-[11px] text-zinc-400 text-center pt-6">
          Butterfly Smart TV Enterprise Authentication &bull; Secure OTP Verification
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-8 h-8 border-3 border-zinc-200 border-t-[#E50914] rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}

