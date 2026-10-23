'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Megaphone,
  Sparkles,
  Calendar,
  Percent,
  IndianRupee,
  TrendingUp,
  X,
  AlertCircle,
  Eye,
  SlidersHorizontal,
  Flame,
  Gift,
  Layers,
  Truck,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Tv,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';
import { Offer, CreateOfferPayload, DiscountType } from '@/services/offer.service';
import { CatalogProduct } from '@/data/products';

interface OffersTabProps {
  offers: Offer[];
  productsList?: CatalogProduct[];
  onAddOffer: (payload: CreateOfferPayload) => Promise<void>;
  onUpdateOffer: (id: string, payload: Partial<CreateOfferPayload>) => Promise<void>;
  onDeleteOffer: (id: string) => Promise<void>;
  onToggleActive: (id: string) => Promise<void>;
  externalOpenModal?: boolean;
  onClearExternalOpenModal?: () => void;
}

// 1. Clear & User-Friendly Offer Types
export const OFFER_TYPES = [
  { value: 'COUPON', label: 'Coupon Code (Customer enters code at checkout)', category: 'coupons', icon: Tag },
  { value: 'PRODUCT_DISCOUNT', label: 'Discount on a Specific TV Model', category: 'discounts', icon: Tv },
  { value: 'CATEGORY_DISCOUNT', label: 'Discount by Screen Size (e.g. all 55" TVs)', category: 'discounts', icon: Layers },
  { value: 'CART_VALUE_DISCOUNT', label: 'Discount on Minimum Order Amount (Spend & Save)', category: 'discounts', icon: IndianRupee },
  { value: 'PERCENTAGE_DISCOUNT', label: 'Storewide Percentage Discount (% off all TVs)', category: 'discounts', icon: Percent },
  { value: 'FLAT_DISCOUNT', label: 'Flat Cash Discount (Fixed ₹ off)', category: 'discounts', icon: IndianRupee },
  { value: 'FLASH_SALE', label: 'Limited-Time Flash Sale', category: 'flash-sales', icon: Flame },
  { value: 'SEASONAL', label: 'Festival & Holiday Sale (Diwali, New Year, etc.)', category: 'flash-sales', icon: Sparkles },
  { value: 'FREE_SHIPPING', label: 'Free Delivery & Installation', category: 'discounts', icon: Truck },
  { value: 'COMBO', label: 'Combo Deal (e.g. TV + Soundbar Bundle)', category: 'campaigns', icon: Gift },
  { value: 'BOGO', label: 'Free Gift with TV (e.g. Free Wall Mount)', category: 'campaigns', icon: Gift },
  { value: 'NEW_USER', label: 'First-Time Buyer Welcome Discount', category: 'campaigns', icon: ShieldCheck },
] as const;

// 2. Badge Color Themes
export const BADGE_COLORS = [
  { value: 'red', label: 'Red (Hot Deal / Sale)', bg: 'bg-red-50', text: 'text-[#E50914]', border: 'border-red-200', dot: 'bg-[#E50914]' },
  { value: 'orange', label: 'Orange (Trending Offer)', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', dot: 'bg-orange-500' },
  { value: 'green', label: 'Green (Best Value / Savings)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  { value: 'blue', label: 'Blue (Standard Offer)', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500' },
  { value: 'purple', label: 'Purple (VIP / Exclusive)', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500' },
];

export function OffersTab({
  offers,
  productsList = [],
  onAddOffer,
  onUpdateOffer,
  onDeleteOffer,
  onToggleActive,
  externalOpenModal,
  onClearExternalOpenModal,
}: OffersTabProps) {
  // Navigation tabs matching SD Smart Appliances Marketing Dashboard
  const [currentTab, setCurrentTab] = useState<'discounts' | 'coupons' | 'flash-sales' | 'campaigns' | 'analytics'>('discounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive' | 'percentage' | 'fixed'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Dynamic Form Field States matching SD Smart Appliances
  const [formOfferType, setFormOfferType] = useState<string>('COUPON');
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formMinOrderAmount, setFormMinOrderAmount] = useState<number>(0);
  const [formMaxDiscountAmount, setFormMaxDiscountAmount] = useState<string>('3000');
  const [formBadge, setFormBadge] = useState('Special Offer');
  const [formBadgeColor, setFormBadgeColor] = useState('red');
  const [formBannerText, setFormBannerText] = useState('');
  const [formShowInAnnouncement, setFormShowInAnnouncement] = useState(true);
  const [formShowInHomepage, setFormShowInHomepage] = useState(true);
  const [formApplyAutomatically, setFormApplyAutomatically] = useState(false);
  const [formStackable, setFormStackable] = useState(false);
  const [formApplicableSize, setFormApplicableSize] = useState('ALL');
  const [formTargetProduct, setFormTargetProduct] = useState('');
  const [formMaxUsageLimit, setFormMaxUsageLimit] = useState('');
  const [formUsagePerCustomer, setFormUsagePerCustomer] = useState(1);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formTermsConditions, setFormTermsConditions] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Handle external modal trigger from header "+ Create Offer" button
  useEffect(() => {
    if (externalOpenModal) {
      handleOpenCreateModal();
      if (onClearExternalOpenModal) onClearExternalOpenModal();
    }
  }, [externalOpenModal, onClearExternalOpenModal]);

  // Automated Code Generator matching SD Smart Appliances
  const generateOfferCode = (type: string = formOfferType) => {
    const prefixes: Record<string, string> = {
      COUPON: 'COUP',
      PRODUCT_DISCOUNT: 'PROD',
      CATEGORY_DISCOUNT: 'SIZE',
      CART_VALUE_DISCOUNT: 'CART',
      PERCENTAGE_DISCOUNT: 'PCT',
      FLAT_DISCOUNT: 'FLAT',
      FLASH_SALE: 'FLSH',
      SEASONAL: 'FEST',
      FREE_SHIPPING: 'SHIP',
      COMBO: 'COMB',
      BOGO: 'BOGO',
      NEW_USER: 'WELCOME',
    };
    const prefix = prefixes[type] || 'OFFER';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormCode(`${prefix}-${rand}`);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreateModal = (suggestedType?: string) => {
    const targetType = suggestedType || (currentTab === 'coupons' ? 'COUPON' : currentTab === 'flash-sales' ? 'FLASH_SALE' : currentTab === 'campaigns' ? 'COMBO' : 'PRODUCT_DISCOUNT');
    setEditingOffer(null);
    setFormOfferType(targetType);
    setFormTitle('');
    setFormDescription('');
    setFormDiscountType('PERCENTAGE');
    setFormDiscountValue(10);
    setFormMinOrderAmount(0);
    setFormMaxDiscountAmount('3000');
    setFormBadge(targetType === 'FLASH_SALE' ? '⚡ Flash Sale' : targetType === 'SEASONAL' ? '🎉 Festive Deal' : 'Special Offer');
    setFormBadgeColor(targetType === 'FLASH_SALE' ? 'orange' : 'red');
    setFormBannerText('');
    setFormShowInAnnouncement(true);
    setFormShowInHomepage(true);
    setFormApplyAutomatically(targetType !== 'COUPON');
    setFormStackable(false);
    setFormApplicableSize('ALL');
    setFormTargetProduct('');
    setFormMaxUsageLimit('');
    setFormUsagePerCustomer(1);
    setFormTermsConditions('Offer valid for limited time on authentic Butterfly Smart TVs. Standard warranty applies.');
    setFormIsActive(true);

    // Default dates (today to next month)
    const today = new Date().toISOString().split('T')[0] || '';
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextMonthStr = nextMonth.toISOString().split('T')[0] || '';
    setFormStartDate(today);
    setFormEndDate(nextMonthStr);

    // Auto-generate code
    generateOfferCode(targetType);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setFormOfferType(offer.offerType || 'COUPON');
    setFormTitle(offer.title);
    setFormCode(offer.code);
    setFormDescription(offer.description);
    setFormDiscountType(offer.discountType);
    setFormDiscountValue(offer.discountValue);
    setFormMinOrderAmount(offer.minOrderAmount || 0);
    setFormMaxDiscountAmount(offer.maxDiscountAmount ? String(offer.maxDiscountAmount) : '');
    setFormBadge(offer.badge || 'Special Offer');
    setFormBadgeColor(offer.badgeColor || 'red');
    setFormBannerText(offer.bannerText || '');
    setFormShowInAnnouncement(offer.showInAnnouncement);
    setFormShowInHomepage(offer.showInHomepage);
    setFormApplyAutomatically(offer.applyAutomatically || false);
    setFormStackable(offer.stackable || false);
    setFormApplicableSize(offer.applicableSize || 'ALL');
    setFormTargetProduct(offer.targetProducts || '');
    setFormMaxUsageLimit(offer.maxUsageLimit ? String(offer.maxUsageLimit) : '');
    setFormUsagePerCustomer(offer.usagePerCustomer || 1);
    setFormStartDate(offer.startDate ? offer.startDate.split('T')[0] : '');
    setFormEndDate(offer.endDate ? offer.endDate.split('T')[0] : '');
    setFormTermsConditions(offer.termsConditions || '');
    setFormIsActive(offer.isActive);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Please provide a campaign title.');
      return;
    }
    if (!formCode.trim()) {
      setFormError('Please enter a promotional coupon code.');
      return;
    }
    if (formDiscountValue <= 0) {
      setFormError('Discount value must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateOfferPayload = {
        title: formTitle.trim(),
        code: formCode.trim().toUpperCase(),
        description: formDescription.trim(),
        offerType: formOfferType,
        discountType: formDiscountType,
        discountValue: Number(formDiscountValue),
        minOrderAmount: Number(formMinOrderAmount) || 0,
        maxDiscountAmount: formMaxDiscountAmount ? Number(formMaxDiscountAmount) : null,
        badge: formBadge.trim() || 'Special Offer',
        badgeColor: formBadgeColor,
        bannerText: formBannerText.trim() || undefined,
        showInAnnouncement: formShowInAnnouncement,
        showInHomepage: formShowInHomepage,
        applyAutomatically: formApplyAutomatically,
        stackable: formStackable,
        applicableSize: formApplicableSize,
        targetProducts: formTargetProduct || undefined,
        maxUsageLimit: formMaxUsageLimit ? Number(formMaxUsageLimit) : null,
        usagePerCustomer: Number(formUsagePerCustomer) || 1,
        termsConditions: formTermsConditions.trim() || undefined,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : undefined,
        endDate: formEndDate ? new Date(formEndDate).toISOString() : undefined,
        isActive: formIsActive,
      };

      if (editingOffer) {
        await onUpdateOffer(editingOffer.id, payload);
      } else {
        await onAddOffer(payload);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed. Please check coupon code uniqueness.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // High-Level Live Analytics Metrics matching SD Smart
  const metrics = useMemo(() => {
    const totalOffers = offers.length;
    const activeCount = offers.filter((o) => o.isActive).length;
    const totalRedemptions = offers.reduce((acc, o) => acc + (o.usageCount || 0), 0);
    const autoAppliedCount = offers.filter((o) => o.isActive && o.applyAutomatically).length;
    return {
      totalOffers,
      activeCount,
      totalRedemptions,
      autoAppliedCount,
    };
  }, [offers]);

  // Tab Filter Logic matching SD Smart Appliances
  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      // 1. Tab Level Categorization
      const type = o.offerType || 'COUPON';
      if (currentTab === 'discounts') {
        if (!['PRODUCT_DISCOUNT', 'CATEGORY_DISCOUNT', 'CART_VALUE_DISCOUNT', 'PERCENTAGE_DISCOUNT', 'FLAT_DISCOUNT', 'FREE_SHIPPING'].includes(type)) {
          // If offerType is unassigned or legacy coupon with no code restriction
          if (type !== 'COUPON') return false;
        }
      } else if (currentTab === 'coupons') {
        if (type !== 'COUPON') return false;
      } else if (currentTab === 'flash-sales') {
        if (!['FLASH_SALE', 'SEASONAL'].includes(type)) return false;
      } else if (currentTab === 'campaigns') {
        if (!['COMBO', 'BOGO', 'NEW_USER'].includes(type)) return false;
      }

      // 2. Search Query Matching
      const matchesSearch =
        o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.targetProducts && o.targetProducts.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // 3. Sub-Filters
      if (filterType === 'active') return o.isActive;
      if (filterType === 'inactive') return !o.isActive;
      if (filterType === 'percentage') return o.discountType === 'PERCENTAGE';
      if (filterType === 'fixed') return o.discountType === 'FIXED_AMOUNT';

      return true;
    });
  }, [offers, currentTab, searchQuery, filterType]);

  const getBadgeStyle = (colorName: string = 'red') => {
    const found = BADGE_COLORS.find((b) => b.value === colorName);
    return found || BADGE_COLORS[0];
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      
      {/* 1. Header Overview & Live KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center shrink-0 border border-red-100">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Campaigns</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalOffers}</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Deals</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">{metrics.activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Auto-Applied Rules</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.autoAppliedCount}</p>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Times Redeemed</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalRedemptions}</p>
          </div>
        </div>
      </div>

      {/* 2. SD Smart Appliances Style Category Navigation Tabs */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-2 sm:p-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'discounts', label: 'Discounts & TV Offers', icon: Percent },
            { id: 'coupons', label: 'Promo Codes & Coupons', icon: Tag },
            { id: 'flash-sales', label: 'Flash Deals & Festivals', icon: Flame },
            { id: 'campaigns', label: 'Combos & Bundles', icon: Gift },
            { id: 'analytics', label: 'Offer Analytics & ROI', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#E50914] text-white shadow-md shadow-red-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Analytics View */}
      {currentTab === 'analytics' ? (
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Promotional Marketing Performance</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Analytics
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time redemption tracking across checkout orders and customer checkouts
              </p>
            </div>
            <button
              onClick={() => handleOpenCreateModal()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Launch New Campaign</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="py-3 px-4">Campaign & Code</th>
                  <th className="py-3 px-4">Offer Type</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Redemptions</th>
                  <th className="py-3 px-4">Min Spend</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{offer.title}</span>
                      <span className="font-mono text-[11px] font-bold text-[#E50914] bg-red-50 px-1.5 py-0.5 rounded border border-red-100 inline-block mt-0.5">
                        {offer.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 capitalize">
                      {offer.offerType?.replace(/_/g, ' ').toLowerCase() || 'Coupon'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `₹ ${offer.discountValue.toLocaleString('en-IN')} OFF`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <TrendingUp className="w-3 h-3" />
                        <span>{offer.usageCount || 0} times</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {offer.minOrderAmount > 0 ? `₹ ${offer.minOrderAmount.toLocaleString('en-IN')}` : 'No Min Spend'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        offer.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEditModal(offer)}
                        className="text-slate-500 hover:text-[#E50914] font-bold text-xs cursor-pointer mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteOffer(offer.id)}
                        className="text-slate-400 hover:text-red-600 font-bold text-xs cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <>
          {/* 4. Search, Filter & Action Bar */}
          <section className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search offer title, code, model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] text-slate-800 transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {(['all', 'active', 'inactive', 'percentage', 'fixed'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                    filterType === type
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type === 'percentage' ? 'Percentage %' : type === 'fixed' ? 'Flat Cash ₹' : type}
                </button>
              ))}

              <button
                onClick={() => handleOpenCreateModal()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all shadow-md shadow-red-500/20 cursor-pointer ml-auto shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create Offer</span>
              </button>
            </div>
          </section>

          {/* 5. Dynamic Offers Grid */}
          {filteredOffers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-red-50 flex items-center justify-center text-[#E50914] border border-red-100">
                <Tag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No campaigns found in this view</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No offers matching "${searchQuery}". Try clearing search.`
                  : `There are currently no active offers in this section. Create one dynamically using the button below.`}
              </p>
              <button
                onClick={() => handleOpenCreateModal()}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Campaign</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredOffers.map((offer) => {
                const isPercentage = offer.discountType === 'PERCENTAGE';
                const isCopied = copiedCode === offer.code;
                const badgeStyle = getBadgeStyle(offer.badgeColor || 'red');

                return (
                  <div
                    key={offer.id}
                    className={`bg-white rounded-3xl border transition-all duration-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl flex flex-col justify-between overflow-hidden relative group ${
                      offer.isActive
                        ? 'border-slate-200/90 hover:border-slate-300'
                        : 'border-slate-200/60 opacity-65 bg-slate-50/50'
                    }`}
                  >
                    {/* Top Accent Strip */}
                    <div
                      className={`h-1.5 w-full ${
                        offer.isActive
                          ? isPercentage
                            ? 'bg-gradient-to-r from-[#E50914] to-red-400'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-slate-300'
                      }`}
                    />

                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        {/* Badges Row */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badgeStyle.dot}`} />
                            {offer.badge || 'PROMO'}
                          </span>

                          <div className="flex items-center gap-2">
                            {offer.applyAutomatically && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200" title="Applies automatically at checkout">
                                Auto-Apply
                              </span>
                            )}
                            <button
                              onClick={() => onToggleActive(offer.id)}
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full cursor-pointer transition-colors ${
                                offer.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {offer.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#E50914] transition-colors leading-snug">
                          {offer.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {offer.description}
                        </p>

                        {/* Discount Big Value Display */}
                        <div className="my-3.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-xl font-black text-slate-900 block tracking-tight">
                              {isPercentage ? `${offer.discountValue}% OFF` : `₹ ${offer.discountValue.toLocaleString('en-IN')} OFF`}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              {offer.minOrderAmount > 0 ? `Min order ₹ ${offer.minOrderAmount.toLocaleString('en-IN')}` : 'No minimum order required'}
                            </span>
                          </div>
                          {offer.maxDiscountAmount && isPercentage && (
                            <span className="text-[11px] font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                              Max ₹{offer.maxDiscountAmount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        {/* Coupon Code Pill */}
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                          <span className="font-mono font-black text-sm text-[#E50914] tracking-wider flex-1 px-2 select-all truncate">
                            {offer.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(offer.code)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs shrink-0"
                            title="Copy promo code"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Card Footer: Metadata & Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-500">
                            {offer.usageCount || 0} used
                          </span>
                          {offer.applicableSize && offer.applicableSize !== 'ALL' && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold font-mono">
                              {offer.applicableSize} TV
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(offer)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Campaign"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteOffer(offer.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 6. Dynamic Campaign Builder Modal matching SD Smart Appliances */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center border border-red-100">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {editingOffer ? 'Edit Offer & Discount' : 'Create New Offer or Discount'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set up discount deals, coupon codes, and special savings for your customers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-[#E50914] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Offer Type Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Offer Type
                </label>
                <select
                  value={formOfferType}
                  onChange={(e) => {
                    setFormOfferType(e.target.value);
                    generateOfferCode(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                >
                  {OFFER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Offer Name & Code with Auto Generator Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Offer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Festival Special 10% Off, Mega TV Deal"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Coupon Code *
                    </label>
                    <button
                      type="button"
                      onClick={() => generateOfferCode()}
                      className="text-[10px] font-bold text-[#E50914] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto Generate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DIWALI10, SAVE2000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase text-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Offer Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="e.g. Get flat 10% discount on all 55-inch and 65-inch 4K Smart TVs during checkout."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              {/* Target TV Model & Screen Size Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Apply to Specific TV
                  </label>
                  <select
                    value={formTargetProduct}
                    onChange={(e) => setFormTargetProduct(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  >
                    <option value="">-- All TVs (Whole Catalog) --</option>
                    {productsList.map((prod) => (
                      <option key={prod.id} value={prod.model}>
                        {prod.model} - {prod.name} ({prod.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Apply to Screen Size
                  </label>
                  <select
                    value={formApplicableSize}
                    onChange={(e) => setFormApplicableSize(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  >
                    <option value="ALL">All Screen Sizes (32" to 85")</option>
                    <option value='32"'>32" Screen TVs</option>
                    <option value='43"'>43" Screen TVs</option>
                    <option value='55"'>55" Screen TVs</option>
                    <option value='65"'>65" Screen TVs</option>
                    <option value='75"+'>75" & Larger TVs</option>
                  </select>
                </div>
              </div>

              {/* Discount Value & Max Cap */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as DiscountType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  >
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (₹ Off)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Discount Amount *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                      placeholder={formDiscountType === 'PERCENTAGE' ? '10' : '2000'}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {formDiscountType === 'PERCENTAGE' ? '%' : '₹'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Maximum Discount Limit (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMaxDiscountAmount}
                    onChange={(e) => setFormMaxDiscountAmount(e.target.value)}
                    placeholder="e.g. 3000 (No limit if blank)"
                    disabled={formDiscountType === 'FIXED_AMOUNT'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Minimum Order Spend & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formMinOrderAmount}
                    onChange={(e) => setFormMinOrderAmount(Number(e.target.value))}
                    placeholder="0 for no minimum purchase"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Total Number of Uses Allowed
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formMaxUsageLimit}
                    onChange={(e) => setFormMaxUsageLimit(e.target.value)}
                    placeholder="Leave blank for unlimited uses"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
              </div>

              {/* Badge Text & Badge Color Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Offer Tag / Badge Text
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. SPECIAL OFFER, HOT DEAL, LIMITED TIME"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Badge Color
                  </label>
                  <select
                    value={formBadgeColor}
                    onChange={(e) => setFormBadgeColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  >
                    {BADGE_COLORS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Validity Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    End Date (Expiry)
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                  />
                </div>
              </div>

              {/* Automatic Rules & Status Checkboxes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formApplyAutomatically}
                    onChange={(e) => setFormApplyAutomatically(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E50914] focus:ring-[#E50914] accent-[#E50914]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Apply discount automatically at checkout (Customers don't need to type the code)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#E50914] focus:ring-[#E50914] accent-[#E50914]"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Make this offer active and available right now
                  </span>
                </label>
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Terms & Conditions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formTermsConditions}
                  onChange={(e) => setFormTermsConditions(e.target.value)}
                  placeholder="e.g. Valid on prepaid orders only. Cannot be combined with other clearance discounts."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c70811] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? 'Saving Offer...' : editingOffer ? 'Update Offer' : 'Save & Publish Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
