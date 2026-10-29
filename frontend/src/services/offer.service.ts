import { apiClient } from '@/lib/api';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Offer {
  id: string;
  title: string;
  code: string;
  description: string;
  offerType?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  badge?: string | null;
  badgeColor?: string | null;
  bannerText?: string | null;
  showInAnnouncement: boolean;
  showInHomepage: boolean;
  applyAutomatically?: boolean;
  stackable?: boolean;
  applicableSize?: string | null;
  targetProducts?: string | null;
  maxUsageLimit?: number | null;
  usagePerCustomer?: number;
  termsConditions?: string | null;
  configuration?: any;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  usageCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OfferValidationResult {
  valid: boolean;
  message: string;
  offer?: Offer;
  discountAmount?: number;
  discountPercent?: number;
}

export interface ProductPricingCalculation {
  actualPrice: number; // Base selling price set in admin
  originalPrice: number; // Strikethrough slash price (MRP) set in admin
  finalPrice: number; // Final selling price after applicable offer on actualPrice
  offerDiscount: number; // Amount saved from active offer
  totalSavings: number; // Total savings compared to original MRP
  discountPercent: number; // Total discount % off MRP
  appliedOffer?: Offer;
  isOfferApplied: boolean;
}

/**
 * Calculates accurate pricing without hardcoding.
 * The offer discount is strictly applied on actual selling price (not original MRP).
 */
export function calculateProductPricing(
  product: {
    price?: string;
    numericPrice?: number;
    originalPrice?: string;
    originalNumericPrice?: number;
    size?: string;
    screenSizeCategory?: string;
    model?: string;
    name?: string;
  },
  availableOffers: Offer[] = []
): ProductPricingCalculation {
  // 1. Actual Base Selling Price
  const actualPrice =
    typeof product.numericPrice === 'number' && !isNaN(product.numericPrice) && product.numericPrice > 0
      ? product.numericPrice
      : parseInt(String(product.price || '').replace(/[^0-9]/g, ''), 10) || 0;

  // 2. Original MRP / Slash Price (Admin defined, no hardcoded multipliers)
  let originalPrice =
    typeof product.originalNumericPrice === 'number' && !isNaN(product.originalNumericPrice) && product.originalNumericPrice > 0
      ? product.originalNumericPrice
      : parseInt(String(product.originalPrice || '').replace(/[^0-9]/g, ''), 10) || 0;

  // Fallback to actual price if no MRP was provided (ensures no arbitrary markup)
  if (originalPrice <= 0) {
    originalPrice = actualPrice;
  }

  // 3. Match eligible active offers
  const now = new Date();
  const eligibleOffers = availableOffers.filter((o) => {
    if (!o.isActive) return false;
    if (o.startDate && new Date(o.startDate) > now) return false;
    if (o.endDate && new Date(o.endDate) < now) return false;

    // Check specific TV model match
    if (o.targetProducts && o.targetProducts.trim()) {
      const target = o.targetProducts.trim().toLowerCase();
      const model = (product.model || '').toLowerCase();
      const name = (product.name || '').toLowerCase();
      return model === target || model.includes(target) || name.includes(target);
    }

    // Check screen size match
    if (o.applicableSize && o.applicableSize !== 'ALL') {
      const targetSize = o.applicableSize.replace(/[^0-9]/g, '');
      const productSize = (product.size || product.screenSizeCategory || '').replace(/[^0-9]/g, '');
      return targetSize === productSize;
    }

    // Storewide automatic offer
    return Boolean(o.applyAutomatically) && actualPrice >= (o.minOrderAmount || 0);
  });

  let bestOffer: Offer | undefined;
  let maxDiscount = 0;

  for (const offer of eligibleOffers) {
    let discount = 0;
    if (offer.discountType === 'PERCENTAGE') {
      // CRITICAL: Offer applies on the actual selling price, NOT the original MRP
      discount = Math.round((actualPrice * offer.discountValue) / 100);
      if (offer.maxDiscountAmount && discount > offer.maxDiscountAmount) {
        discount = offer.maxDiscountAmount;
      }
    } else {
      discount = Math.min(offer.discountValue, actualPrice);
    }

    if (discount > maxDiscount) {
      maxDiscount = discount;
      bestOffer = offer;
    }
  }

  const finalPrice = Math.max(0, actualPrice - maxDiscount);
  const totalSavings = Math.max(0, originalPrice - finalPrice);
  const discountPercent =
    originalPrice > 0 && totalSavings > 0
      ? Math.round((totalSavings / originalPrice) * 100)
      : 0;

  return {
    actualPrice,
    originalPrice,
    finalPrice,
    offerDiscount: maxDiscount,
    totalSavings,
    discountPercent,
    appliedOffer: bestOffer,
    isOfferApplied: maxDiscount > 0,
  };
}

export interface CreateOfferPayload {
  title: string;
  code: string;
  description: string;
  offerType?: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  badge?: string;
  badgeColor?: string;
  bannerText?: string;
  showInAnnouncement?: boolean;
  showInHomepage?: boolean;
  applyAutomatically?: boolean;
  stackable?: boolean;
  applicableSize?: string;
  targetProducts?: string;
  maxUsageLimit?: number | null;
  usagePerCustomer?: number;
  termsConditions?: string;
  configuration?: any;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

const DEFAULT_OFFERS: Offer[] = [];

export const offerService = {
  /**
   * Fetch active offers for customer store or ticker
   */
  async getActiveOffers(): Promise<Offer[]> {
    try {
      const response = await apiClient.get<Offer[]>('/offers');
      if (Array.isArray(response.data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('butterfly_active_offers', JSON.stringify(response.data));
        }
        return response.data;
      }
    } catch (e) {
      console.warn('API getActiveOffers warning, checking cache:', e);
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('butterfly_active_offers');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_OFFERS.filter((o) => o.isActive);
  },

  /**
   * Fetch all offers for admin panel (active & inactive)
   */
  async getAdminOffers(): Promise<Offer[]> {
    try {
      const response = await apiClient.get<Offer[]>('/offers/admin');
      if (Array.isArray(response.data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('butterfly_admin_offers', JSON.stringify(response.data));
        }
        return response.data;
      }
    } catch {
      // Fallback try public endpoint with ?all=true
      try {
        const fallback = await apiClient.get<Offer[]>('/offers?all=true');
        if (Array.isArray(fallback.data)) {
          return fallback.data;
        }
      } catch (err) {
        console.warn('API getAdminOffers warning, checking storage:', err);
      }
    }

    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('butterfly_admin_offers');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_OFFERS;
  },

  /**
   * Create new offer
   */
  async createOffer(payload: CreateOfferPayload): Promise<Offer> {
    const formatted = {
      ...payload,
      code: payload.code.trim().toUpperCase(),
    };
    try {
      const response = await apiClient.post<Offer>('/offers', formatted);
      this.notifyUpdate();
      return response.data;
    } catch (e) {
      console.warn('Create offer API failed, saving locally:', e);
      const newOffer: Offer = {
        ...formatted,
        id: `local-${Date.now()}`,
        minOrderAmount: formatted.minOrderAmount ?? 0,
        showInAnnouncement: formatted.showInAnnouncement ?? true,
        showInHomepage: formatted.showInHomepage ?? true,
        usageCount: 0,
        isActive: formatted.isActive ?? true,
        createdAt: new Date().toISOString(),
      };
      this.saveLocalOffer(newOffer);
      this.notifyUpdate();
      return newOffer;
    }
  },

  /**
   * Update existing offer
   */
  async updateOffer(id: string, payload: Partial<CreateOfferPayload>): Promise<Offer> {
    try {
      const response = await apiClient.put<Offer>(`/offers/${id}`, payload);
      this.notifyUpdate();
      return response.data;
    } catch (e) {
      console.warn('Update offer API failed, updating locally:', e);
      this.updateLocalOffer(id, payload);
      this.notifyUpdate();
      return { id, ...payload } as any;
    }
  },

  /**
   * Toggle offer active state
   */
  async toggleActive(id: string): Promise<Offer> {
    try {
      const response = await apiClient.patch<Offer>(`/offers/${id}/toggle-active`);
      this.notifyUpdate();
      return response.data;
    } catch (e) {
      console.warn('Toggle active API failed, toggling locally:', e);
      this.toggleLocalActive(id);
      this.notifyUpdate();
      return { id } as any;
    }
  },

  /**
   * Delete offer
   */
  async deleteOffer(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/offers/${id}`);
      this.deleteLocalOffer(id);
      this.notifyUpdate();
      return true;
    } catch (e) {
      console.warn('Delete offer API failed, removing locally:', e);
      this.deleteLocalOffer(id);
      this.notifyUpdate();
      return true;
    }
  },

  /**
   * Validate coupon code dynamically against server or local rules
   */
  async validateCoupon(code: string, orderAmount: number, productSize?: string): Promise<OfferValidationResult> {
    const cleanCode = code.trim().toUpperCase();
    try {
      const response = await apiClient.post<OfferValidationResult>('/offers/validate', {
        code: cleanCode,
        orderAmount,
        productSize,
      });
      return response.data;
    } catch (err: any) {
      if (err?.response?.data?.message) {
        return {
          valid: false,
          message: err.response.data.message,
        };
      }
    }

    // Local client-side evaluation fallback
    const allOffers = await this.getAdminOffers();
    const offer = allOffers.find((o) => o.code.toUpperCase() === cleanCode);

    if (!offer) {
      return {
        valid: false,
        message: `Promo code '${cleanCode}' is invalid or does not exist.`,
      };
    }

    if (!offer.isActive) {
      return {
        valid: false,
        message: `Promo code '${cleanCode}' is currently inactive.`,
      };
    }

    if (offer.endDate && new Date(offer.endDate) < new Date()) {
      return {
        valid: false,
        message: `Promo code '${cleanCode}' has expired.`,
      };
    }

    if (orderAmount < offer.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum cart value of ₹${offer.minOrderAmount.toLocaleString('en-IN')} required for '${cleanCode}'.`,
      };
    }

    let discountAmount = 0;
    let discountPercent = 0;

    if (offer.discountType === 'PERCENTAGE') {
      discountPercent = offer.discountValue;
      discountAmount = Math.round((orderAmount * offer.discountValue) / 100);
      if (offer.maxDiscountAmount && discountAmount > offer.maxDiscountAmount) {
        discountAmount = offer.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(offer.discountValue, orderAmount);
    }

    return {
      valid: true,
      message: `Coupon '${cleanCode}' applied successfully!`,
      offer,
      discountAmount,
      discountPercent,
    };
  },

  // Helpers
  saveLocalOffer(offer: Offer) {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('butterfly_admin_offers');
      const list: Offer[] = stored ? JSON.parse(stored) : DEFAULT_OFFERS;
      const updated = [offer, ...list.filter((o) => o.code !== offer.code)];
      localStorage.setItem('butterfly_admin_offers', JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  updateLocalOffer(id: string, payload: Partial<CreateOfferPayload>) {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('butterfly_admin_offers');
      const list: Offer[] = stored ? JSON.parse(stored) : DEFAULT_OFFERS;
      const updated = list.map((o) => (o.id === id ? { ...o, ...payload } : o));
      localStorage.setItem('butterfly_admin_offers', JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  toggleLocalActive(id: string) {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('butterfly_admin_offers');
      const list: Offer[] = stored ? JSON.parse(stored) : DEFAULT_OFFERS;
      const updated = list.map((o) => (o.id === id ? { ...o, isActive: !o.isActive } : o));
      localStorage.setItem('butterfly_admin_offers', JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  deleteLocalOffer(id: string) {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('butterfly_admin_offers');
      const list: Offer[] = stored ? JSON.parse(stored) : DEFAULT_OFFERS;
      const updated = list.filter((o) => o.id !== id);
      localStorage.setItem('butterfly_admin_offers', JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  notifyUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('butterfly_offers_updated'));
    }
  },
};
