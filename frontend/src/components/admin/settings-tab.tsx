import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  Save,
  CheckCircle2,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  Layers,
  Tv,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import { CompanySettings, SizeSelectorCard } from '@/services/settings.service';

const DEFAULT_SIZE_CARDS: SizeSelectorCard[] = [
  { size: '32"', tagline: 'Compact & Smart', image: '/menu_tv_32.jpg' },
  { size: '43"', tagline: 'Perfect for Every Home', image: '/menu_tv_43.jpg' },
  { size: '55"', tagline: 'Bigger Screen, Bigger Joy', image: '/menu_tv_55.jpg' },
  { size: '65"', tagline: 'The Ultimate Experience', image: '/menu_tv_65.jpg' },
];

interface SettingsTabProps {
  settings: CompanySettings;
  onUpdateSettings: (settings: CompanySettings) => Promise<void>;
  externalSaveTrigger?: boolean;
}

export function SettingsTab({
  settings: initialSettings,
  onUpdateSettings,
  externalSaveTrigger,
}: SettingsTabProps) {
  const [form, setForm] = useState<CompanySettings>(() => ({
    ...initialSettings,
    sizeSelectorCards:
      Array.isArray(initialSettings?.sizeSelectorCards) && initialSettings.sizeSelectorCards.length > 0
        ? initialSettings.sizeSelectorCards
        : DEFAULT_SIZE_CARDS,
  }));
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [processingSize, setProcessingSize] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<{ [size: string]: string }>({});

  // Only sync from external changes if user does not have uncommitted edits
  useEffect(() => {
    if (!isDirty && initialSettings) {
      setForm({
        ...initialSettings,
        sizeSelectorCards:
          Array.isArray(initialSettings?.sizeSelectorCards) && initialSettings.sizeSelectorCards.length > 0
            ? initialSettings.sizeSelectorCards
            : DEFAULT_SIZE_CARDS,
      });
    }
  }, [initialSettings, isDirty]);

  const handleFieldChange = (key: keyof CompanySettings, val: any) => {
    setIsDirty(true);
    setSaveSuccess(false);
    setSaveError(null);
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  // Process uploaded image to exact fixed 16:10 ratio (600x375)
  const processImageToFixedSize = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const targetWidth = 600;
          const targetHeight = 375; // 16:10 aspect ratio
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }

          // Clear with clean canvas
          ctx.clearRect(0, 0, targetWidth, targetHeight);

          // Fit image maintaining aspect ratio within 600x375
          const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          const dx = (targetWidth - drawWidth) / 2;
          const dy = (targetHeight - drawHeight) / 2;

          ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
          resolve(canvas.toDataURL('image/webp', 0.92));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCardImageUpload = async (size: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    setProcessingSize(size);
    try {
      const fixedDataUrl = await processImageToFixedSize(file);

      setIsDirty(true);
      setForm((prev) => {
        const currentCards = Array.isArray(prev.sizeSelectorCards) && prev.sizeSelectorCards.length > 0
          ? [...prev.sizeSelectorCards]
          : [...DEFAULT_SIZE_CARDS];

        const idx = currentCards.findIndex((c) => c.size === size);
        if (idx >= 0) {
          currentCards[idx] = { ...currentCards[idx], image: fixedDataUrl };
        } else {
          currentCards.push({
            size,
            tagline: DEFAULT_SIZE_CARDS.find((d) => d.size === size)?.tagline || 'Smart TV',
            image: fixedDataUrl,
          });
        }
        return { ...prev, sizeSelectorCards: currentCards };
      });

      setUploadFeedback((prev) => ({
        ...prev,
        [size]: 'Fitted to 600×375 (16:10) fixed size',
      }));

      setTimeout(() => {
        setUploadFeedback((prev) => {
          const next = { ...prev };
          delete next[size];
          return next;
        });
      }, 4000);
    } catch (err) {
      console.error('Image processing error:', err);
      alert('Could not process image. Please try again.');
    } finally {
      setProcessingSize(null);
    }
  };

  const handleCardImageUrlChange = (size: string, url: string) => {
    setIsDirty(true);
    setForm((prev) => {
      const currentCards = Array.isArray(prev.sizeSelectorCards) && prev.sizeSelectorCards.length > 0
        ? [...prev.sizeSelectorCards]
        : [...DEFAULT_SIZE_CARDS];

      const idx = currentCards.findIndex((c) => c.size === size);
      if (idx >= 0) {
        currentCards[idx] = { ...currentCards[idx], image: url };
      } else {
        currentCards.push({
          size,
          tagline: DEFAULT_SIZE_CARDS.find((d) => d.size === size)?.tagline || 'Smart TV',
          image: url,
        });
      }
      return { ...prev, sizeSelectorCards: currentCards };
    });
  };

  const handleCardTaglineChange = (size: string, tagline: string) => {
    setIsDirty(true);
    setForm((prev) => {
      const currentCards = Array.isArray(prev.sizeSelectorCards) && prev.sizeSelectorCards.length > 0
        ? [...prev.sizeSelectorCards]
        : [...DEFAULT_SIZE_CARDS];

      const idx = currentCards.findIndex((c) => c.size === size);
      if (idx >= 0) {
        currentCards[idx] = { ...currentCards[idx], tagline };
      }
      return { ...prev, sizeSelectorCards: currentCards };
    });
  };

  const handleResetCard = (size: string) => {
    const defaultCard = DEFAULT_SIZE_CARDS.find((d) => d.size === size);
    if (!defaultCard) return;

    setIsDirty(true);
    setForm((prev) => {
      const currentCards = Array.isArray(prev.sizeSelectorCards) && prev.sizeSelectorCards.length > 0
        ? [...prev.sizeSelectorCards]
        : [...DEFAULT_SIZE_CARDS];

      const idx = currentCards.findIndex((c) => c.size === size);
      if (idx >= 0) {
        currentCards[idx] = { ...defaultCard };
      }
      return { ...prev, sizeSelectorCards: currentCards };
    });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await onUpdateSettings(form);
      setIsDirty(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('butterfly_settings_updated'));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Settings save error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to save settings. Please try again.';
      setSaveError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (externalSaveTrigger) {
      handleSave();
    }
  }, [externalSaveTrigger]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150 relative">
      {/* Floating Success Popup (always visible in viewport) */}
      {saveSuccess && (
        <div className="fixed top-6 right-4 sm:right-8 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3.5 bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-emerald-900/30 border border-emerald-400">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Settings Saved Successfully!</h4>
              <p className="text-xs text-emerald-100 mt-0.5">
                Company credentials and size selector settings are updated and live.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccess(false)}
              aria-label="Close"
              className="ml-2 p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Error Popup */}
      {saveError && (
        <div className="fixed top-6 right-4 sm:right-8 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3.5 bg-red-600 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-red-900/30 border border-red-400">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Error Saving Settings</h4>
              <p className="text-xs text-red-100 mt-0.5">{saveError}</p>
            </div>
            <button
              type="button"
              onClick={() => setSaveError(null)}
              aria-label="Close"
              className="ml-2 p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 sm:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center border border-red-100 shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Company &amp; Storefront Settings
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Connected
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure corporate contact credentials. Values automatically sync to customer pages, footer, contact form, and emails.
              </p>
            </div>
          </div>

          {saveSuccess && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Settings Saved Successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-bold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{saveError}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SECTION 1: Company Profile & Email (Gmail) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Mail className="w-4 h-4 text-[#E50914]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Company Email &amp; Brand
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => handleFieldChange('companyName', e.target.value)}
                    required
                    placeholder="e.g. Butterfly Smart TV"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Gmail / Corporate Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      required
                      placeholder="e.g. butterflytvs@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Used for customer quotes, direct enquiries, and administrative alerts.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Customer Support Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={form.supportEmail}
                      onChange={(e) => handleFieldChange('supportEmail', e.target.value)}
                      required
                      placeholder="e.g. support@butterflytv.in"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Phone Numbers & WhatsApp */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Phone className="w-4 h-4 text-[#E50914]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Phone Numbers &amp; Helplines
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Helpline / Customer Care Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      required
                      placeholder="e.g. +91 422 430 1234"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Alternate Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.alternatePhone || ''}
                      onChange={(e) => handleFieldChange('alternatePhone', e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Helpline Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={form.whatsapp || ''}
                      onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Physical Address & Location */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-[#E50914]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Headquarters &amp; Physical Address
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Registered Street Address
                  </label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    required
                    placeholder="e.g. Butterfly Smart TV Technologies, Avinashi Road, Peelamedu"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      required
                      placeholder="e.g. Coimbatore"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => handleFieldChange('state', e.target.value)}
                      required
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Postal Code / PIN
                    </label>
                    <input
                      type="text"
                      value={form.pincode}
                      onChange={(e) => handleFieldChange('pincode', e.target.value)}
                      required
                      placeholder="e.g. 641004"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => handleFieldChange('country', e.target.value)}
                      required
                      placeholder="e.g. India"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: Location Map & Working Hours */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Globe className="w-4 h-4 text-[#E50914]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Location Link &amp; Hours
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Google Maps Location Link
                    </label>
                    <input
                      type="url"
                      value={form.locationUrl || ''}
                      onChange={(e) => handleFieldChange('locationUrl', e.target.value)}
                      placeholder="e.g. https://maps.google.com/?q=Peelamedu+Coimbatore"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                    />
                    {form.locationUrl && (
                      <a
                        href={form.locationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#E50914] font-bold mt-1.5 hover:underline"
                      >
                        <span>Preview Map Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Customer Support Operational Hours
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={form.supportHours}
                        onChange={(e) => handleFieldChange('supportHours', e.target.value)}
                        required
                        placeholder="e.g. Mon - Sat | 9:00 AM - 6:00 PM IST"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Storefront Preview Badge */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Storefront Customer Preview
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {form.companyName} &bull; {form.city}, {form.state}
                </p>
                <p className="text-[11px] text-slate-600 flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#E50914]" />
                    <span>{form.phone}</span>
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="inline-flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#E50914]" />
                    <span>{form.email}</span>
                  </span>
                </p>
              </div>
            </div>

            {/* SECTION 3: Storefront Section Images - TVs for Every Space (Screen Sizes) */}
            <div className="lg:col-span-2 p-5 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center border border-red-100">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      Storefront Section Images: TVs for Every Space
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#E50914] border border-red-200">
                        Dynamic Showcase
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload and manage the 4 hero screen size category images displayed in the storefront &quot;Choose Your Perfect Size&quot; section.
                    </p>
                  </div>
                </div>

                {/* Fixed Dimension Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-auto border border-slate-200">
                  <Info className="w-3.5 h-3.5 text-[#E50914]" />
                  <span>Fixed Target Size: <strong>16:10 Ratio</strong> (600×375 px)</span>
                </div>
              </div>

              {/* Requirement Hint Banner */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Automatic Fixed Size Fitting:</strong> When you select or drag any image file below, it is automatically processed and centered onto a standard <strong>16:10 (600×375)</strong> fixed canvas. When saved, the updated photo will immediately render in the <strong>&quot;TVs for Every Space&quot;</strong> storefront showcase.
                </p>
              </div>

              {/* Responsive Grid for the 4 Size Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {DEFAULT_SIZE_CARDS.map((cardDef) => {
                  const card = form.sizeSelectorCards?.find((c) => c.size === cardDef.size) || cardDef;
                  const isProcessing = processingSize === cardDef.size;
                  const feedback = uploadFeedback[cardDef.size];
                  const isDataOrExternal = card.image?.startsWith('data:') || card.image?.startsWith('http');

                  return (
                    <div
                      key={cardDef.size}
                      className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-slate-900">{cardDef.size}</span>
                          <span className="text-[11px] font-semibold text-slate-500">Smart TV</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResetCard(cardDef.size)}
                          title="Reset to brand default photo"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-[#E50914] transition-colors p-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset</span>
                        </button>
                      </div>

                      {/* Live 16:10 Card Preview */}
                      <div className="relative w-full aspect-[16/10] bg-white rounded-xl border border-slate-200/90 overflow-hidden flex items-center justify-center p-2 shadow-xs group">
                        <div className="relative w-full h-full flex items-center justify-center">
                          {isProcessing ? (
                            <div className="flex flex-col items-center gap-2 text-xs font-bold text-slate-500 animate-pulse">
                              <div className="w-5 h-5 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                              <span>Fitting to 16:10...</span>
                            </div>
                          ) : (
                            <Image
                              src={card.image || cardDef.image}
                              alt={`${cardDef.size} TV`}
                              fill
                              unoptimized={isDataOrExternal}
                              className="object-contain"
                              sizes="(max-width: 640px) 100vw, 25vw"
                            />
                          )}
                        </div>

                        {/* Dimensions watermark */}
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-mono font-medium backdrop-blur-xs">
                          600×375 (16:10)
                        </span>
                      </div>

                      {/* Tagline Field */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Tagline / Label
                        </label>
                        <input
                          type="text"
                          value={card.tagline}
                          onChange={(e) => handleCardTaglineChange(cardDef.size, e.target.value)}
                          placeholder="e.g. Compact & Smart"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                        />
                      </div>

                      {/* Image Upload Trigger & Direct URL */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                          Upload TV Image (Fixed 16:10)
                        </label>

                        {/* File Upload Button / Drop Area */}
                        <label className="relative flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#E50914] bg-white hover:bg-red-50/20 cursor-pointer transition-all text-center">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleCardImageUpload(cardDef.size, file);
                            }}
                            className="hidden"
                          />
                          <Upload className="w-4 h-4 text-[#E50914] mb-1" />
                          <span className="text-[11px] font-bold text-slate-800">
                            {isProcessing ? 'Processing Fixed Size...' : 'Choose File or Drag Here'}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            Auto-fitted to 600×375 • PNG, JPG, WEBP
                          </span>
                        </label>

                        {feedback && (
                          <div className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>{feedback}</span>
                          </div>
                        )}

                        {/* Direct URL input fallback */}
                        <div>
                          <label className="block text-[9px] font-semibold text-slate-400 mb-0.5">
                            Or Image URL / Path:
                          </label>
                          <input
                            type="text"
                            value={card.image}
                            onChange={(e) => handleCardImageUrlChange(cardDef.size, e.target.value)}
                            placeholder="/menu_tv_32.jpg or https://..."
                            className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#E50914]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Actions Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500">
                Changes are persisted to PostgreSQL and served to all storefront components.
              </p>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Saved!
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer disabled:opacity-50 ${
                saveSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#E50914] hover:bg-[#c70811]'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Settings Saved Successfully!</span>
                </>
              ) : isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Settings Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
