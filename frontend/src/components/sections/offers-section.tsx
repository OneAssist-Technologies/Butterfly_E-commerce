'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tag,
  Percent,
  Sparkles,
  Phone,
  MessageCircle,
  Copy,
  CheckCircle2,
  Gift,
  ArrowRight,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { offerService, Offer } from '@/services/offer.service';
import { settingsService, CompanySettings } from '@/services/settings.service';
import { useAlert } from '@/providers';

export function OffersSection() {
  const { toast, openContactModal } = useAlert();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOffersAndSettings = async () => {
    try {
      const [offersData, settingsData] = await Promise.allSettled([
        offerService.getActiveOffers(),
        settingsService.getSettings(),
      ]);

      if (offersData.status === 'fulfilled' && Array.isArray(offersData.value)) {
        // Show active offers marked for homepage or all active offers
        const active = offersData.value.filter((o) => o.isActive !== false);
        setOffers(active);
      }

      if (settingsData.status === 'fulfilled' && settingsData.value) {
        setCompanySettings(settingsData.value);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffersAndSettings();

    if (typeof window !== 'undefined') {
      window.addEventListener('butterfly_offers_updated', fetchOffersAndSettings);
      window.addEventListener('butterfly_settings_updated', fetchOffersAndSettings);
      return () => {
        window.removeEventListener('butterfly_offers_updated', fetchOffersAndSettings);
        window.removeEventListener('butterfly_settings_updated', fetchOffersAndSettings);
      };
    }
  }, []);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code "${code}" copied! Apply it in your cart.`, 'Code Copied');
      setTimeout(() => setCopiedCode(null), 3000);
    }
  };

  const whatsappPhone = (companySettings?.whatsapp || companySettings?.phone || '919876543210').replace(/[^0-9]/g, '');
  const cleanWhatsapp = whatsappPhone.length === 10 ? `91${whatsappPhone}` : whatsappPhone;
  const storePhone = companySettings?.phone || '+91 422 430 1234';
  const supportHours = companySettings?.supportHours || 'Mon - Sat | 9:00 AM - 6:00 PM (Working Hours)';

  return (
    <section id="exclusive-offers" className="py-10 sm:py-14 bg-gradient-to-b from-white via-zinc-50/60 to-[#F8FAFC] border-t border-zinc-200/80 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#E50914] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CURRENT DEALS &amp; STORE OFFERS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {offers.length > 0 ? 'Live Deals & Store Discounts' : 'Special Store Offers & Enquiries'}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl">
              {offers.length > 0
                ? 'Save big on Butterfly Smart TVs with active promotions, or contact our store for custom package deals.'
                : 'Offers change dynamically across seasons. Contact our store directly to get today’s unadvertised in-store discounts across Tamil Nadu.'}
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-700 hover:text-[#E50914] transition-colors group self-start sm:self-auto shrink-0"
          >
            <span>Browse All TVs</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ================= CASE 1: ACTIVE OFFERS ARE AVAILABLE ================= */}
        {offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {offers.map((offer) => {
              const isCopied = copiedCode === offer.code;
              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-3xl p-6 border border-zinc-200/90 shadow-xs hover:shadow-lg hover:border-red-200 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Badge row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-50 text-[#E50914] border border-red-100">
                        <Tag className="w-3 h-3" />
                        {offer.badge || (offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue.toLocaleString('en-IN')} OFF`)}
                      </span>
                      {offer.applicableSize && (
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                          For {offer.applicableSize} TVs
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-zinc-900 group-hover:text-[#E50914] transition-colors">
                      {offer.title}
                    </h3>

                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                      {offer.description || 'Valid on select Butterfly Smart TVs. Redeem this code at cart checkout.'}
                    </p>

                    {offer.minOrderAmount > 0 && (
                      <p className="text-[11px] text-zinc-400 font-medium">
                        Min. order: ₹{offer.minOrderAmount.toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  {/* Coupon Code & Copy Action */}
                  <div className="pt-5 mt-4 border-t border-zinc-100 flex items-center justify-between gap-3">
                    <div className="bg-zinc-50 border border-dashed border-zinc-300 px-3 py-1.5 rounded-xl font-mono text-xs font-black text-zinc-800 tracking-wider">
                      {offer.code}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(offer.code)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-900 hover:bg-[#E50914] text-white shadow-xs'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* In-Store Bonus Card along with live offers */}
            <div className="bg-gradient-to-br from-[#0b0f17] to-[#151c28] text-white rounded-3xl p-6 sm:p-7 border border-zinc-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <Gift className="w-3 h-3" />
                  STORE PRIVILEGE
                </span>

                <h3 className="text-lg font-black text-white tracking-tight">
                  Want an In-Store Exclusive Offer?
                </h3>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Looking for additional festive combo discounts, wall-mounting offers, or bulk purchase pricing? Contact our Coimbatore store team directly!
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-zinc-800/80 flex flex-wrap gap-2.5">
                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Butterfly Smart TV, I'd like to ask about today's current store offers & best pricing.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center shadow-md shadow-emerald-950/30"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp for Deals</span>
                </a>

                <button
                  type="button"
                  onClick={() =>
                    openContactModal({
                      type: 'phone',
                      title: 'Direct Store Helpline',
                      value: storePhone,
                      hours: supportHours,
                      whatsapp: cleanWhatsapp,
                    })
                  }
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Store</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================= CASE 2: NO OFFERS CURRENTLY ACTIVE ================= */
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200/90 shadow-sm relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Explanatory text */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#E50914] text-xs font-bold border border-red-100">
                  <Gift className="w-3.5 h-3.5" />
                  <span>SPECIAL STORE ENQUIRY</span>
                </div>

                <h3 className="text-xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-tight">
                  Looking for Today’s Exclusive In-Store Offer?
                </h3>

                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl">
                  While online coupons run on seasonal schedules, our showroom team regularly provides <strong>direct customer discounts, free wall-mounting deals, and bundle savings</strong> across Tamil Nadu.
                </p>

                <div className="flex flex-wrap gap-4 pt-1 text-xs text-zinc-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Official Brand Warranty</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>Mon - Sat | 9 AM - 6 PM</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#E50914]" />
                    <span>Tamil Nadu Doorstep Delivery</span>
                  </span>
                </div>
              </div>

              {/* Right Column: Direct Contact CTA Box */}
              <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-3.5">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    GET TODAY’S BEST PRICE
                  </span>
                  <h4 className="text-base font-extrabold text-zinc-900 mt-0.5">
                    Connect with our Coimbatore Store
                  </h4>
                </div>

                <div className="space-y-2.5">
                  {/* WhatsApp CTA */}
                  <a
                    href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent("Hello Butterfly Smart TV Team, I am browsing your website and want to know about current in-store offers and best prices on Smart TVs.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm text-center"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp for Today’s Offer</span>
                  </a>

                  {/* Phone Helpline CTA */}
                  <button
                    type="button"
                    onClick={() =>
                      openContactModal({
                        type: 'phone',
                        title: 'Store Deals Helpline',
                        value: storePhone,
                        hours: supportHours,
                        whatsapp: cleanWhatsapp,
                      })
                    }
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold transition-colors cursor-pointer text-center"
                  >
                    <Phone className="w-4 h-4 text-zinc-600" />
                    <span>Call Store: {storePhone}</span>
                  </button>

                  {/* Contact / Showroom Page Link */}
                  <Link
                    href="/contact"
                    className="w-full block py-2 text-center text-[11px] font-bold text-zinc-500 hover:text-[#E50914] transition-colors"
                  >
                    Visit Showroom Address &amp; Send Message &rarr;
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

