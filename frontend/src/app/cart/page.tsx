'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2, Clock,
  AlertCircle,
  Tag,
  Sparkles,
  ArrowLeft,
  Loader2,
  Info,
} from 'lucide-react';
import { useCart } from '@/providers';
import { ALL_PRODUCTS, CatalogProduct } from '@/data/products';
import { orderService } from '@/services/order.service';
import { offerService, Offer } from '@/services/offer.service';
import { productService } from '@/services/product.service';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, clearCart, addToCart, closeCart, isHydrated } = useCart();

  // Local state for quantities if item doesn't have internal qty
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number; amount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [showOffersDrawer, setShowOffersDrawer] = useState(false);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [liveCatalog, setLiveCatalog] = useState<CatalogProduct[]>([]);

  // Checkout form details
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'COD'>('UPI');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    customerName?: string;
    email?: string;
    phone?: string;
    address?: string;
    general?: string;
  }>({});
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Close slide-over drawer when viewing the full cart page
  useEffect(() => {
    closeCart();
  }, [closeCart]);

  // Initialize customer information from session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('butterfly_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setCustomerName(u.name);
        if (u.email) setEmail(u.email);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync item quantities
  useEffect(() => {
    const qMap: { [key: number]: number } = {};
    cartItems.forEach((item, idx) => {
      qMap[idx] = (item as any).quantity || 1;
    });
    setQuantities(qMap);
  }, [cartItems]);

  const handleQtyChange = (index: number, delta: number) => {
    const current = quantities[index] || (cartItems[index] as any)?.quantity || 1;
    const next = current + delta;
    if (next <= 0) {
      removeFromCart(index);
    } else {
      setQuantities((prev) => ({ ...prev, [index]: next }));
      updateQuantity(index, next);
    }
  };

  const getItemPrice = (item: any) => {
    if (typeof item?.numericPrice === 'number' && !isNaN(item.numericPrice) && item.numericPrice > 0) {
      return item.numericPrice;
    }
    const parsed = parseInt(String(item?.price || '').replace(/[^0-9]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item, idx) => {
    const qty = quantities[idx] || (item as any).quantity || 1;
    return sum + getItemPrice(item) * qty;
  }, 0);

  const discountAmount = appliedDiscount
    ? appliedDiscount.percent > 0
      ? Math.round((subtotal * appliedDiscount.percent) / 100)
      : appliedDiscount.amount
    : 0;

  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Fetch active store offers for the cart
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await offerService.getActiveOffers();
        const active = data.filter((o) => o.isActive);
        setAvailableOffers(active);

        // Auto-apply best automatic offer if eligible and no coupon applied yet
        if (!appliedDiscount && subtotal > 0) {
          const autoOffer = active.find((o) => {
            if (!o.applyAutomatically) return false;
            if (subtotal < (o.minOrderAmount || 0)) return false;

            if (o.targetProducts && o.targetProducts.trim()) {
              const target = o.targetProducts.trim().toLowerCase();
              return cartItems.some(
                (ci) => ci.model?.toLowerCase() === target || ci.model?.toLowerCase().includes(target)
              );
            }

            if (o.applicableSize && o.applicableSize !== 'ALL') {
              const targetSize = o.applicableSize.replace(/[^0-9]/g, '');
              return cartItems.some(
                (ci) => (ci.size || (ci as any).screenSizeCategory || '').replace(/[^0-9]/g, '') === targetSize
              );
            }

            return true;
          });

          if (autoOffer) {
            let eligibleBaseAmount = subtotal;
            if (autoOffer.targetProducts && autoOffer.targetProducts.trim()) {
              const target = autoOffer.targetProducts.trim().toLowerCase();
              eligibleBaseAmount = cartItems
                .filter((ci) => ci.model?.toLowerCase() === target || ci.model?.toLowerCase().includes(target))
                .reduce((sum, ci, idx) => sum + getItemPrice(ci) * (quantities[idx] || (ci as any).quantity || 1), 0);
            } else if (autoOffer.applicableSize && autoOffer.applicableSize !== 'ALL') {
              const targetSize = autoOffer.applicableSize.replace(/[^0-9]/g, '');
              eligibleBaseAmount = cartItems
                .filter((ci) => (ci.size || (ci as any).screenSizeCategory || '').replace(/[^0-9]/g, '') === targetSize)
                .reduce((sum, ci, idx) => sum + getItemPrice(ci) * (quantities[idx] || (ci as any).quantity || 1), 0);
            }

            if (eligibleBaseAmount > 0) {
              const calculatedSavings = autoOffer.discountType === 'PERCENTAGE'
                ? Math.min(Math.round((eligibleBaseAmount * autoOffer.discountValue) / 100), autoOffer.maxDiscountAmount || Infinity)
                : Math.min(autoOffer.discountValue, eligibleBaseAmount);
              setAppliedDiscount({
                code: autoOffer.code,
                percent: autoOffer.discountType === 'PERCENTAGE' ? autoOffer.discountValue : 0,
                amount: calculatedSavings,
              });
              setCouponCode(autoOffer.code);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to load active offers in cart:', e);
      }
    };
    fetchOffers();

    // Fetch live catalog products for dynamic suggestions
    productService.getAll().then((data) => {
      if (Array.isArray(data) && data.length > 0) setLiveCatalog(data);
    }).catch(() => {});

    const handleUpdate = () => {
      fetchOffers();
      productService.getAll().then((data) => {
        if (Array.isArray(data) && data.length > 0) setLiveCatalog(data);
      }).catch(() => {});
    };
    window.addEventListener('butterfly_offers_updated', handleUpdate);
    window.addEventListener('butterfly_products_updated', handleUpdate);
    return () => {
      window.removeEventListener('butterfly_offers_updated', handleUpdate);
      window.removeEventListener('butterfly_products_updated', handleUpdate);
    };
  }, [subtotal, appliedDiscount, cartItems, quantities]);

  // Dynamic Coupon handling
  const handleApplyCoupon = async (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    setCouponError('');
    const code = (directCode || couponCode).trim().toUpperCase();

    if (!code) return;
    setIsValidatingCoupon(true);

    try {
      const result = await offerService.validateCoupon(code, subtotal);
      if (result.valid && result.offer) {
        let eligibleAmount = subtotal;
        if (result.offer.targetProducts && result.offer.targetProducts.trim()) {
          const target = result.offer.targetProducts.trim().toLowerCase();
          const matchingItems = cartItems.filter(
            (ci) => ci.model?.toLowerCase() === target || ci.model?.toLowerCase().includes(target)
          );
          if (matchingItems.length === 0) {
            setCouponError(`This offer only applies to model '${result.offer.targetProducts}'.`);
            return;
          }
          eligibleAmount = matchingItems.reduce(
            (sum, ci, idx) => sum + getItemPrice(ci) * (quantities[idx] || (ci as any).quantity || 1),
            0
          );
        } else if (result.offer.applicableSize && result.offer.applicableSize !== 'ALL') {
          const targetSize = result.offer.applicableSize.replace(/[^0-9]/g, '');
          const matchingItems = cartItems.filter(
            (ci) => (ci.size || (ci as any).screenSizeCategory || '').replace(/[^0-9]/g, '') === targetSize
          );
          if (matchingItems.length === 0) {
            setCouponError(`This offer only applies to ${result.offer.applicableSize} TVs.`);
            return;
          }
          eligibleAmount = matchingItems.reduce(
            (sum, ci, idx) => sum + getItemPrice(ci) * (quantities[idx] || (ci as any).quantity || 1),
            0
          );
        }

        const calculatedAmount = result.offer.discountType === 'PERCENTAGE'
          ? Math.min(Math.round((eligibleAmount * result.offer.discountValue) / 100), result.offer.maxDiscountAmount || Infinity)
          : Math.min(result.offer.discountValue, eligibleAmount);

        setAppliedDiscount({
          code: result.offer.code,
          percent: result.offer.discountType === 'PERCENTAGE' ? result.offer.discountValue : 0,
          amount: calculatedAmount,
        });
        setCouponCode(result.offer.code);
        setCouponError('');
      } else {
        setCouponError(result.message || 'Invalid or expired promo code.');
      }
    } catch (err: any) {
      setCouponError(err?.message || 'Could not validate promo code.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponCode('');
    setCouponError('');
  };

  // Handle Checkout Order Submission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    const errors: { customerName?: string; email?: string; phone?: string; address?: string } = {};

    if (!customerName.trim()) {
      errors.customerName = 'Full Name is required.';
    }
    if (!email.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) {
      errors.phone = 'Phone Number is mandatory for order verification.';
    } else if (phone.trim().replace(/[^0-9]/g, '').length < 10) {
      errors.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!address.trim()) {
      errors.address = 'Delivery Address & PIN Code are mandatory.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsPlacingOrder(true);
    try {
      const firstTv = cartItems[0];
      const itemsPayload = cartItems.map((item, idx) => ({
        productId: item.id,
        model: item.model,
        name: item.name,
        price: item.price,
        quantity: quantities[idx] || (item as any).quantity || 1,
      }));

      const createdOrder = await orderService.create({
        customerName: customerName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        model: firstTv ? `${firstTv.model} (${firstTv.name})` : 'Smart TV Order',
        amount: `₹ ${totalAmount.toLocaleString('en-IN')}`,
        payment: paymentMethod === 'UPI' ? 'Prepaid (UPI)' : 'Cash on Delivery (COD)',
        items: itemsPayload,
      });

      // Save to local customer history
      try {
        const history = JSON.parse(localStorage.getItem('butterfly_customer_orders') || '[]');
        localStorage.setItem('butterfly_customer_orders', JSON.stringify([createdOrder, ...history]));
      } catch {
        // ignore
      }

      setOrderSuccess(createdOrder);
      clearCart();
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      let msg = 'Failed to submit order request. Please check connection.';
      if (Array.isArray(raw)) {
        msg = raw.join(', ');
      } else if (typeof raw === 'string') {
        msg = raw;
      }
      setFieldErrors({ general: msg });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Suggested products (exclude current cart models, dynamically from DB)
  const cartModelSet = new Set(cartItems.map((i) => i.model));
  const suggestedProducts = (liveCatalog.length > 0 ? liveCatalog : ALL_PRODUCTS)
    .filter((p) => !cartModelSet.has(p.model))
    .slice(0, 3);

  // If order was successfully placed
  if (orderSuccess) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-zinc-200/80 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
            <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
          </div>

          <span className="text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100/70 px-3.5 py-1.5 rounded-full border border-amber-300 inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            Order Request Submitted &bull; Pending Verification
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mt-4 tracking-tight">
            Order Request Sent to Admin!
          </h1>
          <p className="text-sm text-zinc-600 mt-2 max-w-lg mx-auto">
            Your order request has been forwarded to the administration team for verification. Once approved and processed, fulfillment and dispatch will begin.
          </p>

          {/* Verification Notice Card */}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Admin Verification in Progress:</strong> Our dispatch team is reviewing your contact, address, and requested items. You can view real-time status updates anytime in your customer profile.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="mt-6 p-6 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-left space-y-3">
            <div className="flex justify-between items-center text-sm pb-3 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">Request Number:</span>
              <span className="font-extrabold text-zinc-900">#{orderSuccess.orderNumber || orderSuccess.id}</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-3 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">Customer:</span>
              <span className="font-semibold text-zinc-900">{customerName}</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-3 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">Contact Phone:</span>
              <span className="font-semibold text-zinc-900">{phone}</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-3 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">Confirmation Email:</span>
              <span className="font-semibold text-zinc-900">{email}</span>
            </div>
            <div className="flex justify-between items-start text-sm pb-3 border-b border-zinc-200 gap-4">
              <span className="text-zinc-500 font-medium shrink-0">Delivery Address:</span>
              <span className="font-semibold text-zinc-900 text-right">{address}</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-3 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">Payment Mode:</span>
              <span className="font-semibold text-zinc-900">{paymentMethod === 'UPI' ? 'Prepaid (UPI)' : 'Cash on Delivery (COD)'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500 font-medium">Total Amount:</span>
              <span className="font-black text-lg text-[#E50914]">{orderSuccess.amount}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>Track in My Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-bold transition-all"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[#F1F5F9] flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#E50914]" />
          <p className="text-xs font-semibold text-zinc-500">Loading your cart...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-zinc-900">
      {/* Top Banner / Breadcrumbs */}
      <div className="bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
                <span>/</span>
                <span className="text-zinc-900 font-medium">Shopping Cart</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
                <span>Shopping Cart</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-[#E50914] border border-red-100">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </span>
              </h1>
            </div>

            {cartItems.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#E50914] hover:underline"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Cart Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-16 text-center max-w-2xl mx-auto shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
            <div className="w-20 h-20 bg-red-50 text-[#E50914] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100">
              <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Your cart is empty
            </h2>
            <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">
              You haven&apos;t added any Butterfly Smart TVs to your shopping cart yet. Discover our premium television collection designed for vivid living.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Browse All Smart TVs</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-bold transition-all"
              >
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Cart with Items Layout: 8 cols items + 4 cols order summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Items List (8 Columns) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] divide-y divide-zinc-100">
                {cartItems.map((item, idx) => {
                  const qty = quantities[idx] || (item as any).quantity || 1;
                  const itemTotal = (item.numericPrice || 0) * qty;

                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 ${
                        idx === 0 ? 'pt-0' : ''
                      }`}
                    >
                      {/* Product Image & Info */}
                      <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0">
                        <div className="relative w-24 h-20 sm:w-28 sm:h-24 rounded-xl bg-zinc-50 border border-zinc-100 p-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="112px"
                            className="object-contain p-1"
                            unoptimized={true}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                              {item.size} Display
                            </span>
                            {item.badge && (
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {item.resolution} &bull; Butterfly Smart Engine
                          </p>
                          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                            <Truck className="w-3 h-3" />
                            <span>Free Doorstep Delivery &amp; Installation</span>
                          </p>
                        </div>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50/70 p-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(idx, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-extrabold text-zinc-900">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(idx, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[90px]">
                          <span className="text-base sm:text-lg font-black text-zinc-900 block">
                            ₹ {itemTotal.toLocaleString('en-IN')}
                          </span>
                          {item.originalNumericPrice && item.originalNumericPrice > (item.numericPrice || 0) && (
                            <span className="text-[11px] text-zinc-400 line-through block">
                              ₹ {(item.originalNumericPrice * qty).toLocaleString('en-IN')}
                            </span>
                          )}
                          {qty > 1 && (
                            <span className="text-[10px] text-zinc-400 block">
                              ₹ {item.numericPrice.toLocaleString('en-IN')} each
                            </span>
                          )}
                        </div>

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(idx)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Service & Guarantee Badges Card */}
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] flex-shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">3 Years Warranty</h4>
                    <p className="text-[11px] text-zinc-500">Comprehensive on-site service</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Free Express Delivery</h4>
                    <p className="text-[11px] text-zinc-500">Includes wall mounting demo</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">7-Day Replacement</h4>
                    <p className="text-[11px] text-zinc-500">Direct brand replacement guarantee</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Order Summary & Checkout (4 Columns, Sticky) */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                <h2 className="text-lg font-extrabold text-zinc-900 pb-4 border-b border-zinc-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-bold text-zinc-500">
                    {cartItems.length} {cartItems.length === 1 ? 'Product' : 'Products'}
                  </span>
                </h2>

                {/* Subtotal & Breakdown */}
                <div className="py-4 space-y-3 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Item Subtotal</span>
                    <span className="font-bold text-zinc-900">₹ {subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <span>Delivery &amp; Installation</span>
                      <Info className="w-3.5 h-3.5 text-zinc-400" />
                    </span>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">
                      FREE
                    </span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between items-center text-emerald-600 bg-emerald-50/60 p-2 rounded-lg text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Promo ({appliedDiscount.code})</span>
                      </span>
                      <span>- ₹ {discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-500 text-xs pt-1">
                    <span>GST (18%) &amp; Local Taxes</span>
                    <span>Included</span>
                  </div>
                </div>

                {/* Coupon & Available Offers Section */}
                <div className="pt-3 pb-4 border-t border-zinc-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="coupon" className="block text-xs font-bold text-zinc-700">
                      Have a promo coupon?
                    </label>

                    {availableOffers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowOffersDrawer(!showOffersDrawer)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E50914] hover:text-[#c70811] transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{showOffersDrawer ? 'Hide Offers' : `View Offers (${availableOffers.length})`}</span>
                      </button>
                    )}
                  </div>

                  {appliedDiscount ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-mono font-black text-emerald-900 tracking-wider">
                            {appliedDiscount.code}
                          </span>
                          <span className="text-emerald-700 ml-1.5 font-bold">
                            Applied (-₹{discountAmount.toLocaleString('en-IN')})
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          id="coupon"
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="e.g. BUTTERFLY2026"
                          className="flex-1 px-3 py-2 border border-zinc-300 rounded-xl text-xs uppercase placeholder:normal-case font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                        />
                        <button
                          type="submit"
                          disabled={isValidatingCoupon || !couponCode.trim()}
                          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          {isValidatingCoupon ? 'Validating...' : 'Apply'}
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>
                      )}
                    </form>
                  )}

                  {/* Available Offers Drawer */}
                  {showOffersDrawer && (
                    <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <p className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                        Applicable Store Discounts
                      </p>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {availableOffers.map((offer) => {
                          const isEligible = subtotal >= offer.minOrderAmount;
                          const isCurrentlyApplied = appliedDiscount?.code === offer.code;

                          return (
                            <div
                              key={offer.id}
                              className={`p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 ${
                                isCurrentlyApplied
                                  ? 'bg-emerald-50 border-emerald-300'
                                  : 'bg-white border-zinc-200 hover:border-red-200'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono font-black text-zinc-900 uppercase tracking-wider">
                                    {offer.code}
                                  </span>
                                  <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-red-50 text-[#E50914] border border-red-100">
                                    {offer.discountType === 'PERCENTAGE'
                                      ? `${offer.discountValue}% OFF`
                                      : `₹${offer.discountValue.toLocaleString('en-IN')} OFF`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                                  {offer.description}
                                </p>
                                {!isEligible && (
                                  <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                                    Add ₹{(offer.minOrderAmount - subtotal).toLocaleString('en-IN')} more to unlock
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                disabled={!isEligible || isCurrentlyApplied}
                                onClick={() => handleApplyCoupon(undefined, offer.code)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed ${
                                  isCurrentlyApplied
                                    ? 'bg-emerald-600 text-white'
                                    : isEligible
                                    ? 'bg-[#E50914] text-white hover:bg-[#c70811]'
                                    : 'bg-zinc-200 text-zinc-400'
                                }`}
                              >
                                {isCurrentlyApplied ? 'Applied' : isEligible ? 'Apply' : 'Min Spend'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Line */}
                <div className="py-4 border-t border-zinc-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-base font-extrabold text-zinc-900 block">Total Amount</span>
                    <span className="text-[11px] text-zinc-500">Inclusive of all taxes &amp; delivery</span>
                  </div>
                  <span className="text-2xl font-black text-[#E50914]">
                    ₹ {totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Shipping & Customer Details Form */}
                <form noValidate onSubmit={handlePlaceOrder} className="pt-4 border-t border-zinc-100 space-y-3">
                  <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider mb-2">
                    Shipping &amp; Contact Details
                  </h3>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                      Full Name <span className="text-[#E50914] font-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (fieldErrors.customerName) setFieldErrors((prev) => ({ ...prev, customerName: undefined }));
                        if (fieldErrors.general) setFieldErrors((prev) => ({ ...prev, general: undefined }));
                      }}
                      placeholder="e.g. Rajesh Kumar"
                      className={`w-full px-3 py-2 border rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all ${
                        fieldErrors.customerName
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                          : 'border-zinc-300 focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white'
                      }`}
                    />
                    {fieldErrors.customerName && (
                      <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.customerName}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                      Email Address <span className="text-[#E50914] font-black">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                        if (fieldErrors.general) setFieldErrors((prev) => ({ ...prev, general: undefined }));
                      }}
                      placeholder="e.g. rajesh@example.com"
                      className={`w-full px-3 py-2 border rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all ${
                        fieldErrors.email
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                          : 'border-zinc-300 focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                      Phone Number <span className="text-[#E50914] font-black">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                        if (fieldErrors.general) setFieldErrors((prev) => ({ ...prev, general: undefined }));
                      }}
                      placeholder="+91 98765 43210"
                      className={`w-full px-3 py-2 border rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none transition-all ${
                        fieldErrors.phone
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                          : 'border-zinc-300 focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white'
                      }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.phone}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                      Delivery Address &amp; PIN Code <span className="text-[#E50914] font-black">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: undefined }));
                        if (fieldErrors.general) setFieldErrors((prev) => ({ ...prev, general: undefined }));
                      }}
                      placeholder="Door No, Street, Landmark, City & PIN code"
                      className={`w-full px-3 py-2 border rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none resize-none transition-all ${
                        fieldErrors.address
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                          : 'border-zinc-300 focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] bg-white'
                      }`}
                    />
                    {fieldErrors.address && (
                      <p className="text-[11px] text-red-600 font-bold mt-1 flex items-center gap-1 animate-in fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fieldErrors.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-zinc-600 mb-1.5">
                      Payment Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                          paymentMethod === 'UPI'
                            ? 'border-[#E50914] bg-red-50/50 text-zinc-900'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'UPI'}
                          onChange={() => setPaymentMethod('UPI')}
                          className="text-[#E50914] focus:ring-[#E50914]"
                        />
                        <span>Prepaid UPI</span>
                      </label>

                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                          paymentMethod === 'COD'
                            ? 'border-[#E50914] bg-red-50/50 text-zinc-900'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="text-[#E50914] focus:ring-[#E50914]"
                        />
                        <span>Cash on Delivery</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  {fieldErrors.general && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <strong className="block font-bold">Please check your details:</strong>
                        <span>{fieldErrors.general}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all cursor-pointer disabled:opacity-70 mt-3"
                  >
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Order Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Order Request &bull; ₹ {totalAmount.toLocaleString('en-IN')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Security Guarantee Notice */}
                <div className="pt-4 mt-2 text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Official Butterfly Safe Checkout &bull; 256-Bit SSL Secured</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Suggested Smart TVs Section */}
        {suggestedProducts.length > 0 && (
          <section className="mt-16 pt-10 border-t border-zinc-200/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#E50914]">
                  RECOMMENDED FOR YOU
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                  Popular Smart TVs
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-[#E50914] hover:underline flex items-center gap-1"
              >
                <span>View All TVs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full h-44 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center overflow-hidden mb-4 p-2">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-contain"
                        unoptimized={true}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-zinc-500">
                        {prod.size} Display
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 mt-1 line-clamp-1">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{prod.resolution}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-base font-black text-zinc-900">{prod.price}</span>
                    <button
                      type="button"
                      onClick={() => addToCart(prod)}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-[#E50914] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
