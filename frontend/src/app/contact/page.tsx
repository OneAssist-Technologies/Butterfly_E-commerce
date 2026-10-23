'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Tv,
  Shield,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { enquiryService } from '@/services/enquiry.service';
import { ALL_PRODUCTS } from '@/data/products';
import { productService } from '@/services/product.service';
import { settingsService, CompanySettings } from '@/services/settings.service';
import { ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [liveProducts, setLiveProducts] = useState<any[]>(ALL_PRODUCTS);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    productModel: 'General Enquiry / Support',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-fill from local user session if logged in
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
        }));
      }
    } catch {
      // Ignore
    }

    settingsService.getSettings()
      .then((data) => {
        if (data) setCompanySettings(data);
      })
      .catch(() => {});

    productService.getAll()
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setLiveProducts(items);
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      await enquiryService.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim() || 'Coimbatore',
        productModel: formData.productModel,
        message: formData.message.trim(),
      });

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: '',
        productModel: 'General Enquiry / Support',
        message: '',
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit your enquiry. Please verify your details or call our support line.';
      setErrorMessage(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900">
      
      {/* 1. Header Hero */}
      <section className="relative bg-[#070b12] text-white pt-8 pb-16 overflow-hidden border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-medium">Contact Us</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <span className="inline-block text-xs font-black tracking-widest text-[#E50914] uppercase">
              CONTACT US
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Get in Touch with Our Team
            </h1>
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Have questions about our Smart TVs, on-site installation, warranty claims, or enterprise orders? We are here to assist you every step of the way.
            </p>
          </div>

        </div>
      </section>

      {/* 2. Main Content Grid */}
      <section className="py-14 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact Cards & Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-black tracking-widest text-[#E50914] uppercase block mb-1">
                REACH US DIRECTLY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                We Love Hearing From You
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
                Reach out by phone, email, or visit our Coimbatore headquarters. We ensure swift assistance within 24 business hours.
              </p>
            </div>

            {/* Quick Contact Cards */}
            <div className="space-y-4 pt-2">
              
              {/* Phone Card */}
              <a
                href={`tel:${companySettings?.phone || '+914224301234'}`}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-md hover:border-[#E50914]/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] shrink-0 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Customer Care Helpline
                  </span>
                  <p className="text-base font-black text-zinc-900 mt-0.5 group-hover:text-[#E50914] transition-colors">
                    {companySettings?.phone || '+91 422 430 1234'}
                  </p>
                  {companySettings?.alternatePhone && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Alt: {companySettings.alternatePhone}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {companySettings?.supportHours || 'Mon - Sat | 9:00 AM - 6:00 PM IST'}
                  </p>
                </div>
              </a>

              {/* Email Card */}
              <a
                href={`mailto:${companySettings?.supportEmail || companySettings?.email || 'support@butterflytv.in'}`}
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs hover:shadow-md hover:border-[#E50914]/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] shrink-0 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Direct Email Support
                  </span>
                  <p className="text-base font-black text-zinc-900 mt-0.5 group-hover:text-[#E50914] transition-colors">
                    {companySettings?.supportEmail || companySettings?.email || 'support@butterflytv.in'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Response guaranteed within 24 hours
                  </p>
                </div>
              </a>

              {/* Address Card */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-zinc-200/90 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Headquarters &amp; Experience Center
                  </span>
                  <p className="text-sm font-bold text-zinc-900 mt-0.5">
                    {companySettings?.companyName || 'Butterfly Smart TV Technologies'}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    {companySettings
                      ? `${companySettings.address}, ${companySettings.city}, ${companySettings.state} – ${companySettings.pincode}, ${companySettings.country}`
                      : 'Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu – 641004, India'}
                  </p>
                  {companySettings?.locationUrl && (
                    <a
                      href={companySettings.locationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E50914] hover:underline mt-2"
                    >
                      <span>View on Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Support Trust Highlights */}
            <div className="bg-red-50/60 border border-red-100 rounded-2xl p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E50914]">
                <Shield className="w-4 h-4" />
                <span>Pan-India On-Site Warranty</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Technician visit right at your doorstep for installation, wall-mounting, or troubleshooting across 250+ cities.
              </p>
            </div>
          </div>

          {/* Right Column: User Enquiry Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200 shadow-sm relative">
            
            <div className="mb-6">
              <span className="text-xs font-black tracking-widest text-[#E50914] uppercase block mb-1">
                ONLINE ENQUIRY FORM
              </span>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
                Send Us a Message
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Fill in your details below and our product specialist will reach out promptly.
              </p>
            </div>

            {/* Success Notification */}
            {success && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Enquiry Submitted Successfully!</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    Thank you for reaching out. A Butterfly support specialist will contact you shortly on your provided mobile or email.
                  </p>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-[#E50914] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Failed to Send Enquiry</p>
                  <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Email & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    City / Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore, Chennai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Row 3: Product Interest / Subject */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Interested TV Model / Purpose
                </label>
                <select
                  value={formData.productModel}
                  onChange={(e) => setFormData({ ...formData, productModel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:bg-white transition-all"
                >
                  <option value="General Enquiry / Support">General Enquiry / Technical Support</option>
                  <option value="Installation / Wall Mounting Request">Installation / Wall Mounting Request</option>
                  <option value="Warranty Claim / Registration">Warranty Claim / Registration</option>
                  <option value="Corporate / Bulk Order Enquiry">Corporate / Bulk Order Enquiry</option>
                  {liveProducts.map((prod) => (
                    <option key={prod.id} value={`${prod.name} (${prod.model})`}>
                      {prod.name} — {prod.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 4: Message */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Your Message or Question
                </label>
                <textarea
                  rows={4}
                  placeholder="How can we assist you? Tell us about your requirement or query..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:bg-white transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#E50914] hover:bg-[#c70811] text-white text-sm font-bold shadow-lg shadow-red-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Enquiry</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>

        </div>
      </section>

    </div>
  );
}
