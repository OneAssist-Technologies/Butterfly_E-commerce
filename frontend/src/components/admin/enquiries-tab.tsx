'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Inbox,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react';
import { CustomerEnquiry } from './types';
import { CatalogProduct } from '@/data/products';

interface EnquiriesTabProps {
  enquiries: CustomerEnquiry[];
  productsList: CatalogProduct[];
  onAddEnquiry: (enquiry: Omit<CustomerEnquiry, 'id' | 'date'>) => Promise<void>;
  onUpdateStatus: (id: string, status: CustomerEnquiry['status']) => Promise<void>;
  onDeleteEnquiry: (id: string) => Promise<void>;
  externalOpenModal?: boolean;
  onClearExternalOpenModal?: () => void;
}

export function EnquiriesTab({
  enquiries,
  productsList,
  onAddEnquiry,
  onUpdateStatus,
  onDeleteEnquiry,
  externalOpenModal,
  onClearExternalOpenModal,
}: EnquiriesTabProps) {
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'All' | 'New' | 'Contacted' | 'Closed'>('All');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    productModel: '',
    message: '',
  });

  useEffect(() => {
    if (externalOpenModal) {
      setShowModal(true);
      if (onClearExternalOpenModal) onClearExternalOpenModal();
    }
  }, [externalOpenModal, onClearExternalOpenModal]);

  useEffect(() => {
    if (!form.productModel && productsList.length > 0) {
      setForm((prev) => ({
        ...prev,
        productModel: `${productsList[0].model} - ${productsList[0].name}`,
      }));
    }
  }, [productsList, form.productModel]);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      const matchSearch =
        enq.name.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        enq.phone.includes(enquirySearch) ||
        enq.city.toLowerCase().includes(enquirySearch.toLowerCase()) ||
        enq.productModel.toLowerCase().includes(enquirySearch.toLowerCase());
      const matchStatus = enquiryStatusFilter === 'All' || enq.status === enquiryStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [enquiries, enquirySearch, enquiryStatusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const modelStr =
      form.productModel ||
      (productsList[0] ? `${productsList[0].model} - ${productsList[0].name}` : 'Smart TV');

    await onAddEnquiry({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      city: form.city.trim() || 'Coimbatore',
      productModel: modelStr,
      message: form.message.trim(),
      status: 'New',
    });

    setShowModal(false);
    setForm({
      name: '',
      phone: '',
      email: '',
      city: '',
      productModel: productsList[0] ? `${productsList[0].model} - ${productsList[0].name}` : '',
      message: '',
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* SECTION CONTAINER 1: INQUIRIES SEARCH & FILTER */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#E50914]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Filter Customer Leads &amp; Inquiries
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {filteredEnquiries.length} of {enquiries.length} leads
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={enquirySearch}
              onChange={(e) => setEnquirySearch(e.target.value)}
              placeholder="Search customer name, phone, city, model..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/15 focus:border-[#E50914] transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['All', 'New', 'Contacted', 'Closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setEnquiryStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  enquiryStatusFilter === status
                    ? 'bg-[#E50914] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION CONTAINER 2: INQUIRIES TABLE */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Customer Inquiries List ({filteredEnquiries.length})
            </h2>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E50914] hover:underline cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Walk-in / Phone Enquiry</span>
          </button>
        </div>

        {filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-zinc-800">No Customer Enquiries Found</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Customer enquiries submitted from TV product pages or recorded manually will appear here in real time.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Walk-in / Phone Enquiry</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Lead ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Interested Model</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status &amp; Action</th>
                  <th className="py-3 px-4 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-800">{enq.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-zinc-900 block">{enq.name}</span>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-zinc-400" />
                          {enq.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-zinc-400" />
                          {enq.email}
                        </span>
                      </div>
                      {enq.message && (
                        <p className="text-[11px] text-zinc-500 italic mt-1 bg-zinc-50 p-1.5 rounded-md border border-zinc-200/60 max-w-sm">
                          &ldquo;{enq.message}&rdquo;
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-800">{enq.productModel}</td>
                    <td className="py-3.5 px-4 text-zinc-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        {enq.city}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 font-mono text-[11px]">{enq.date}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={enq.status}
                        onChange={(e) =>
                          onUpdateStatus(enq.id, e.target.value as CustomerEnquiry['status'])
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          enq.status === 'New'
                            ? 'bg-red-50 text-[#E50914] border-red-200'
                            : enq.status === 'Contacted'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onDeleteEnquiry(enq.id)}
                        aria-label="Delete inquiry"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ================= MODAL: ADD ENQUIRY ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-zinc-900 mb-1">New Customer Enquiry</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Record a direct phone call, dealership visit, or offline quote inquiry.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kannan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98400 12345"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chennai"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Interested TV Model</label>
                <select
                  value={form.productModel}
                  onChange={(e) => setForm({ ...form, productModel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white"
                >
                  {productsList.map((tv) => (
                    <option key={tv.id} value={`${tv.model} - ${tv.name}`}>
                      {tv.model} - {tv.name} ({tv.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 mb-1">Requirements / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Installation requirements, demo scheduling..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold cursor-pointer shadow-xs"
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
