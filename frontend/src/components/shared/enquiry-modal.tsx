'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, CheckCircle2, Send, PhoneCall, AlertCircle } from 'lucide-react';
import { TVProduct } from '@/components/cards/product-card';
import { enquiryService } from '@/services/enquiry.service';

interface EnquiryModalProps {
  product: TVProduct | null;
  onClose: () => void;
}

export function EnquiryModal({ product, onClose }: EnquiryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await enquiryService.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        message: formData.message,
        productModel: `${product.model} - ${product.name}`,
        productPrice: product.price,
      });

      // Keep localStorage in sync for admin offline tab if needed
      try {
        const newEnquiry = {
          id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          message: formData.message,
          productModel: `${product.model} - ${product.name}`,
          productPrice: product.price,
          date: new Date().toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          status: 'New' as const,
        };
        const existing = JSON.parse(localStorage.getItem('butterfly_customer_enquiries') || '[]');
        localStorage.setItem('butterfly_customer_enquiries', JSON.stringify([newEnquiry, ...existing]));
      } catch {
        // ignore
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Failed to submit enquiry. Please verify your details.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Enquiry Received!</h3>
            <p className="text-sm text-zinc-600 max-w-xs mx-auto">
              Our television expert will call you shortly with exclusive pricing and doorstep demonstration options for {product.model}.
            </p>
          </div>
        ) : (
          <div>
            {/* Header info */}
            <div className="flex items-center gap-4 pb-4 border-b border-zinc-100">
              <div className="relative w-20 h-14 bg-zinc-50 rounded-xl overflow-hidden p-1 border border-zinc-100 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="80px"
                  className="object-contain"
                  unoptimized={true}
                />
              </div>
              <div>
                <span className="text-xs font-bold text-[#E50914] uppercase tracking-wider block">
                  Quick TV Enquiry
                </span>
                <h3 className="text-base font-bold text-zinc-900">{product.model}</h3>
                <p className="text-xs text-zinc-500">{product.name} • <span className="font-bold text-zinc-900">{product.price}</span></p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#E50914]/40 focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#E50914]/40 focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coimbatore / Chennai"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#E50914]/40 focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#E50914]/40 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Questions / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ask about discounts, wall mounting or installation..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#E50914]/40 focus:border-[#E50914] resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#E50914] text-white font-bold text-xs hover:bg-[#c70811] shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Request Best Price Quote
                </button>
                <p className="text-[11px] text-zinc-400 text-center mt-2 flex items-center justify-center gap-1.5">
                  <PhoneCall className="w-3 h-3 text-[#E50914]" /> Free callback within 15 minutes during business hours
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
