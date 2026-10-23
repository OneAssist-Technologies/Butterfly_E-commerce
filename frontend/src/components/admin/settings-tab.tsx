'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { CompanySettings } from '@/services/settings.service';

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
  const [form, setForm] = useState<CompanySettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setForm(initialSettings);
  }, [initialSettings]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateSettings(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
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
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
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
                      onChange={(e) => setForm({ ...form, locationUrl: e.target.value })}
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
                        onChange={(e) => setForm({ ...form, supportHours: e.target.value })}
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

          </div>

          {/* Actions Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Changes are persisted to PostgreSQL and served to all storefront components.
            </p>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Updates...' : 'Save Settings Changes'}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
