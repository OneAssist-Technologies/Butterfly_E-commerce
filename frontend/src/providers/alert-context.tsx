'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Phone,
  Mail,
  Copy,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmModalOptions {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ContactModalOptions {
  type: 'phone' | 'email';
  title: string;
  value: string;
  hours?: string;
  whatsapp?: string;
}

interface AlertContextValue {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
  showAlert: (title: string, message: string, type?: ToastType) => void;
  showConfirm: (options: ConfirmModalOptions) => void;
  openContactModal: (options: ContactModalOptions) => void;
}

const AlertContext = createContext<AlertContextValue | null>(null);

// Global event listeners for non-hook or cross-component triggers
const TOAST_EVENT = 'butterfly_custom_toast';
const CONFIRM_EVENT = 'butterfly_custom_confirm';
const CONTACT_EVENT = 'butterfly_custom_contact';

export const customToast = {
  success: (message: string, title?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'success', message, title } }));
    }
  },
  error: (message: string, title?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'error', message, title } }));
    }
  },
  warning: (message: string, title?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'warning', message, title } }));
    }
  },
  info: (message: string, title?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type: 'info', message, title } }));
    }
  },
};

export const customConfirm = (options: ConfirmModalOptions) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONFIRM_EVENT, { detail: options }));
  }
};

export const customContactModal = (options: ContactModalOptions) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CONTACT_EVENT, { detail: options }));
  }
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalOptions | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; type: ToastType } | null>(null);
  const [contactModal, setContactModal] = useState<ContactModalOptions | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string, duration: number = 4000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const toastMethods = React.useMemo(() => ({
    success: (msg: string, title?: string) => addToast('success', msg, title),
    error: (msg: string, title?: string) => addToast('error', msg, title),
    warning: (msg: string, title?: string) => addToast('warning', msg, title),
    info: (msg: string, title?: string) => addToast('info', msg, title),
  }), [addToast]);

  const showAlert = useCallback((title: string, message: string, type: ToastType = 'info') => {
    setAlertModal({ title, message, type });
  }, []);

  const showConfirm = useCallback((options: ConfirmModalOptions) => {
    setConfirmModal(options);
  }, []);

  const openContactModal = useCallback((options: ContactModalOptions) => {
    setIsCopied(false);
    setContactModal(options);
  }, []);

  // Listen for custom window events so even legacy or non-hook code can call custom alerts
  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.message) {
        addToast(detail.type || 'info', detail.message, detail.title);
      }
    };

    const handleConfirmEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail as ConfirmModalOptions;
      if (detail && detail.title) {
        showConfirm(detail);
      }
    };

    const handleContactEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail as ContactModalOptions;
      if (detail && detail.value) {
        openContactModal(detail);
      }
    };

    window.addEventListener(TOAST_EVENT, handleToastEvent);
    window.addEventListener(CONFIRM_EVENT, handleConfirmEvent);
    window.addEventListener(CONTACT_EVENT, handleContactEvent);

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToastEvent);
      window.removeEventListener(CONFIRM_EVENT, handleConfirmEvent);
      window.removeEventListener(CONTACT_EVENT, handleContactEvent);
    };
  }, [addToast, showConfirm, openContactModal]);

  const handleCopyValue = (val: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(val);
      setIsCopied(true);
      addToast('success', `${contactModal?.type === 'phone' ? 'Phone number' : 'Email'} copied to clipboard!`, 'Copied');
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleCallAction = (phoneVal: string) => {
    const isMobile =
      typeof window !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `tel:${phoneVal.replace(/\s+/g, '')}`;
    } else {
      handleCopyValue(phoneVal);
      addToast(
        'info',
        `Phone number "${phoneVal}" copied to clipboard! Dial from your mobile or connect via WhatsApp.`,
        'Ready to Call'
      );
    }
  };

  const handleEmailAction = (emailVal: string) => {
    const isMobile =
      typeof window !== 'undefined' &&
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `mailto:${emailVal}`;
    } else {
      handleCopyValue(emailVal);
      addToast(
        'info',
        `Email address "${emailVal}" copied! Paste it in Gmail, Outlook, or your preferred mail service.`,
        'Ready to Mail'
      );
    }
  };

  return (
    <AlertContext.Provider
      value={{
        toast: toastMethods,
        showAlert,
        showConfirm,
        openContactModal,
      }}
    >
      {children}

      {/* 1. Global Floating Toast Stack */}
      <div className="fixed top-20 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${
              t.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/80'
                : t.type === 'error'
                ? 'bg-red-950/90 text-red-100 border-red-700/80'
                : t.type === 'warning'
                ? 'bg-amber-950/90 text-amber-100 border-amber-700/80'
                : 'bg-zinc-900/90 text-zinc-100 border-zinc-700/80'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 min-w-0">
              {t.title && <h5 className="text-xs font-black uppercase tracking-wider mb-0.5">{t.title}</h5>}
              <p className="text-xs font-medium leading-relaxed">{t.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 2. Custom Confirmation Modal Dialog */}
      {confirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmModal.type === 'danger'
                    ? 'bg-red-50 text-[#E50914]'
                    : confirmModal.type === 'warning'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {confirmModal.type === 'danger' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : confirmModal.type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                  {confirmModal.title}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  confirmModal.onCancel?.();
                  setConfirmModal(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                {confirmModal.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await confirmModal.onConfirm();
                  } finally {
                    setConfirmModal(null);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
                  confirmModal.type === 'danger'
                    ? 'bg-[#E50914] hover:bg-[#c70811] shadow-red-900/20'
                    : 'bg-zinc-900 hover:bg-black shadow-zinc-900/20'
                }`}
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Custom Alert Info Modal Dialog */}
      {alertModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  alertModal.type === 'error'
                    ? 'bg-red-50 text-[#E50914]'
                    : alertModal.type === 'warning'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {alertModal.type === 'error' ? (
                  <AlertCircle className="w-6 h-6" />
                ) : alertModal.type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                {alertModal.title}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {alertModal.message}
            </p>

            <div className="flex items-center justify-end pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setAlertModal(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Professional Contact / Phone / Email Support Modal */}
      {contactModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-zinc-200 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5 relative">
            <button
              type="button"
              onClick={() => setContactModal(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-800 rounded-full hover:bg-zinc-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0">
                {contactModal.type === 'phone' ? <Phone className="w-6 h-6" /> : <Mail className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#E50914] uppercase block">
                  BUTTERFLY CUSTOMER CARE
                </span>
                <h3 className="text-lg font-black text-zinc-900 tracking-tight">
                  {contactModal.title}
                </h3>
              </div>
            </div>

            {/* Value display box */}
            <div className="bg-zinc-50 border border-zinc-200/90 rounded-2xl p-4 text-center">
              <span className="text-lg sm:text-xl font-black text-zinc-900 block tracking-tight select-all">
                {contactModal.value}
              </span>
              {contactModal.hours && (
                <span className="text-xs text-zinc-500 font-medium mt-1 block">
                  {contactModal.hours}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              {/* Copy Button */}
              <button
                type="button"
                onClick={() => handleCopyValue(contactModal.value)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-800 transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-500" />
                    <span>Copy {contactModal.type === 'phone' ? 'Phone Number' : 'Email Address'}</span>
                  </>
                )}
              </button>

              {/* Direct Link Button */}
              {contactModal.type === 'phone' ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCallAction(contactModal.value)}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md shadow-red-900/20 text-center cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Helpline</span>
                  </button>
                  <a
                    href={`https://wa.me/${(contactModal.whatsapp || '918921793054').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello Butterfly Smart TV Support, I need assistance with a television.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/20 text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleEmailAction(contactModal.value)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md shadow-red-900/20 text-center cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-zinc-400 text-center">
              Dedicated on-site service all over Tamil Nadu.
            </p>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return ctx;
}

