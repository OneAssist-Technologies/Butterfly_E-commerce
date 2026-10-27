'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Tv,
  ShieldCheck,
  Volume2,
  ArrowRight,
  Heart,
  ShoppingBag,
  Truck,
  Wrench,
  RotateCcw,
  Star,
  Check,
  ChevronRight,
  Share2,
  Sparkles,
  Zap,
  Radio,
  Wifi,
  Sliders,
  Award,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  MessageSquare,
  Loader2,
  Cpu,
  Box,
} from 'lucide-react';
import { CatalogProduct } from '@/data/products';
import { ProductCatalogCard } from '@/components/cards/product-catalog-card';
import { EnquiryModal } from '@/components/shared/enquiry-modal';
import { useCart } from '@/providers';
import { TVProduct } from '@/components/cards/product-card';
import { productService, normalizeProductImageUrl } from '@/services/product.service';

interface ProductDetailsClientProps {
  product: CatalogProduct;
  similarProducts: CatalogProduct[];
  allProducts?: CatalogProduct[];
}

export function ProductDetailsClient({
  product,
  similarProducts,
  allProducts = [],
}: ProductDetailsClientProps) {
  const router = useRouter();
  const { addToCart, openCart } = useCart();

  // Dynamic Gallery Images from Database (zero hardcoded mock images)
  const galleryImages: Array<{ src: string; label: string }> = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.map((src: string, idx: number) => ({
        src: normalizeProductImageUrl(src),
        label: idx === 0 ? 'Front Display' : `View ${idx + 1}`,
      }));
    }
    return [{ src: normalizeProductImageUrl(product.image), label: 'Front Display' }];
  }, [product.image, product.images]);

  const [activeImage, setActiveImage] = useState(() => normalizeProductImageUrl(product.image));

  useEffect(() => {
    if (galleryImages.length > 0) {
      setActiveImage(galleryImages[0].src);
    }
  }, [galleryImages]);

  // Interaction States
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'highlights' | 'specs' | 'installation' | 'reviews'>('highlights');

  // Customer Reviews State (Dynamic from Database)
  const [reviews, setReviews] = useState<Array<{
    id: string;
    rating: number;
    title?: string;
    comment: string;
    userName: string;
    userEmail?: string;
    createdAt: string;
  }>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);

  // Review Modals & Submission
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Check login and fetch live reviews from backend
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('butterfly_user') || localStorage.getItem('butterfly_admin_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch {
          // ignore
        }
      }
    }

    const fetchLiveReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await productService.getReviews(product.id);
        if (data && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.warn('Backend reviews fetch notice:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchLiveReviews();
  }, [product.id]);

  // Dynamic reviews metrics
  const totalReviewsCount = reviews.length;
  const dynamicAverageRating = totalReviewsCount > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1))
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { star, count, percentage };
  });

  const handleOpenReviewModal = () => {
    const userStr = typeof window !== 'undefined'
      ? localStorage.getItem('butterfly_user') || localStorage.getItem('butterfly_admin_user')
      : null;
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('butterfly_user_token') || localStorage.getItem('butterfly_admin_token')
      : null;

    if (!userStr || !token) {
      setShowLoginRequiredModal(true);
    } else {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch {
        // ignore
      }
      setShowReviewModal(true);
      setReviewErrorMsg('');
      setReviewSuccessMsg('');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewErrorMsg('Please write your review feedback.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewErrorMsg('');

    try {
      const created = await productService.addReview(product.id, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
      });

      const newRev = created || {
        id: `rev-${Date.now()}`,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        userName: currentUser?.name || currentUser?.email || 'Verified Customer',
        createdAt: new Date().toISOString(),
      };

      const updated = [newRev, ...reviews.filter((r) => r.id !== newRev.id)];
      setReviews(updated);
      setReviewSuccessMsg('Thank you! Your verified review has been published.');
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewTitle('');
        setReviewComment('');
        setReviewRating(5);
        setReviewSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setReviewErrorMsg(
        err?.response?.data?.message || err?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Enquiry Modal state
  const [enquiryProduct, setEnquiryProduct] = useState<TVProduct | null>(null);

  // Pricing calculations
  const originalMrp = Math.round((product.numericPrice * 1.33) / 100) * 100;
  const savings = originalMrp - product.numericPrice;
  const discountPercent = Math.round((savings / originalMrp) * 100);
  const emiAmount = Math.round(product.numericPrice / 12);

  // Screen size switcher options dynamically from database products
  const productSource = allProducts && allProducts.length > 0 ? allProducts : similarProducts;
  const availableSizes: Array<{ label: '32"' | '43"' | '50"' | '55"' | '65"'; targetId?: string }> = [
    { label: '32"', targetId: productSource.find((p) => p.screenSizeCategory === '32"' || p.size?.includes('32'))?.id },
    { label: '43"', targetId: productSource.find((p) => p.screenSizeCategory === '43"' || p.size?.includes('43'))?.id },
    { label: '50"', targetId: productSource.find((p) => p.screenSizeCategory === '50"' || p.size?.includes('50'))?.id },
    { label: '55"', targetId: productSource.find((p) => p.screenSizeCategory === '55"' || p.size?.includes('55'))?.id },
    { label: '65"', targetId: productSource.find((p) => p.screenSizeCategory === '65"' || p.size?.includes('65'))?.id },
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  return (
    <div className="bg-[#fbfbfd] min-h-screen pb-20">
      {/* Toast Notification when added */}
      {addedToast && (
        <div className="fixed top-20 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-zinc-700 animate-in slide-in-from-top-4 duration-300">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Added to Cart!</p>
            <p className="text-[11px] text-zinc-400">{product.name} ({quantity} item{quantity > 1 ? 's' : ''})</p>
          </div>
          <Link
            href="/cart"
            className="text-xs font-bold text-white bg-[#E50914] hover:bg-[#c70811] px-3 py-1.5 rounded-lg ml-2 transition-colors"
          >
            View Cart
          </Link>
        </div>
      )}

      {/* Top Breadcrumbs & Back Navigation */}
      <div className="border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/products" className="hover:text-zinc-900 transition-colors">
              Products
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-900 truncate max-w-[220px] sm:max-w-xs">
              {product.model} - {product.name}
            </span>
          </nav>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 font-semibold text-[#E50914] hover:text-[#b80710] transition-colors"
          >
            <span>← Back to TV Catalog</span>
          </Link>
        </div>
      </div>

      {/* Main Product Showcase: 2 Columns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Visual Showcase & Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Main Stage Image with Sleek TV Bezel */}
            <div className="relative bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden group">
              {/* Top Badges & Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {product.badge && (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        product.badge === 'Popular'
                          ? 'bg-zinc-900 text-white'
                          : 'bg-[#E50914] text-white'
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2.5 py-1 rounded-full">
                    Official Butterfly TV
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    title="Share TV details"
                    className="p-2 rounded-full border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isWishlisted
                          ? 'fill-[#E50914] text-[#E50914] scale-110'
                          : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Main Product Image Display (Clean, borderless) */}
              <div className="relative w-full aspect-[16/10] overflow-hidden flex items-center justify-center">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  loading="eager"
                  className="object-contain transition-all duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  unoptimized={true}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (target) target.src = '/menu_tv_43.jpg';
                  }}
                />
              </div>
            </div>

            {/* Gallery Thumbnails (renders only if multiple images exist in database) */}
            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {galleryImages.map((thumb, index) => {
                  const isActive = activeImage === thumb.src;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(thumb.src)}
                      className={`relative aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer ${
                        isActive
                          ? 'border-[#E50914] ring-2 ring-red-100 shadow-md scale-[1.02]'
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="relative w-full h-full rounded-lg overflow-hidden bg-zinc-50 flex items-center justify-center">
                        <Image
                          src={thumb.src}
                          alt={thumb.label}
                          fill
                          className="object-contain p-1"
                          sizes="(max-width: 768px) 25vw, 15vw"
                          unoptimized={true}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 4 Quick Highlights Feature Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 text-center">
                <Tv className="w-5 h-5 text-[#E50914] mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-zinc-900">Bezel-Less</span>
                <span className="text-[10px] text-zinc-500">Infinity Screen</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 text-center">
                <Volume2 className="w-5 h-5 text-[#E50914] mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-zinc-900">{product.sound}</span>
                <span className="text-[10px] text-zinc-500">Cinema Sound</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 text-center">
                <Wifi className="w-5 h-5 text-[#E50914] mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-zinc-900">Dual Wi-Fi</span>
                <span className="text-[10px] text-zinc-500">+ Bluetooth 5.0</span>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 text-center">
                <ShieldCheck className="w-5 h-5 text-[#E50914] mx-auto mb-1.5" />
                <span className="block text-xs font-bold text-zinc-900">3 Yrs Total</span>
                <span className="text-[10px] text-zinc-500">Brand Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Specs & Purchase Actions (5 cols, Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
            
            {/* Header Titles */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#E50914] bg-red-50 border border-red-100 px-2.5 py-1 rounded-md">
                  {product.model}
                </span>
                <span className="text-xs font-semibold text-zinc-400">
                  Butterfly Living Series
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Dynamic Rating & Review stats */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  <span>{dynamicAverageRating > 0 ? dynamicAverageRating.toFixed(1) : 'New'}</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors font-medium cursor-pointer"
                >
                  {totalReviewsCount > 0
                    ? `${totalReviewsCount} Verified Customer ${totalReviewsCount === 1 ? 'Review' : 'Reviews'}`
                    : 'Be the first to review'}
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                  {product.price}
                </span>
                <span className="text-sm sm:text-base text-zinc-400 line-through">
                  ₹ {originalMrp.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  {discountPercent}% OFF
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Inclusive of all taxes &bull; Save ₹ {savings.toLocaleString('en-IN')} today
              </p>

              {/* Special Promotion Pill */}
              <div className="mt-3.5 pt-3 border-t border-zinc-200 flex items-start gap-2.5 text-xs text-zinc-700">
                <Sparkles className="w-4 h-4 text-[#E50914] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900">Special Offer:</span> Free wall mount bracket & standard doorstep installation included.
                </div>
              </div>

              {/* No Cost EMI */}
              <div className="mt-2 flex items-start gap-2.5 text-xs text-zinc-700">
                <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-900">No Cost EMI:</span> Available from ₹{emiAmount.toLocaleString('en-IN')}/month on major banks.
                </div>
              </div>
            </div>

            {/* Screen Size Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Select Screen Size
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  Currently: <strong className="text-zinc-900">{product.size}</strong>
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {availableSizes.map((sizeOption) => {
                  const isCurrent = sizeOption.label === product.screenSizeCategory;
                  return (
                    <button
                      key={sizeOption.label}
                      type="button"
                      onClick={() => {
                        if (!isCurrent && sizeOption.targetId) {
                          router.push(`/products/${sizeOption.targetId}`);
                        }
                      }}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                        isCurrent
                          ? 'bg-[#E50914] text-white border-[#E50914] shadow-sm'
                          : sizeOption.targetId
                          ? 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
                          : 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed'
                      }`}
                    >
                      {sizeOption.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Specs Overview Table */}
            <div className="space-y-2 text-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 block mb-1">
                Specifications At A Glance
              </span>
              <div className="grid grid-cols-2 gap-2 text-zinc-700">
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Resolution</span>
                  <span className="font-bold text-zinc-900">{product.resolution}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Operating System</span>
                  <span className="font-bold text-zinc-900">{product.os}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Audio Output</span>
                  <span className="font-bold text-zinc-900">{product.sound}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Smart Ecosystem</span>
                  <span className="font-bold text-zinc-900">{product.smartCategory}</span>
                </div>
              </div>
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-zinc-300 rounded-xl bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-zinc-900 text-xs">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-100 text-sm font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-5 rounded-xl border border-zinc-900 bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart ({quantity})</span>
                </button>
              </div>

              {/* Buy Now Button -> directly navigates to /cart for instant checkout */}
              <button
                type="button"
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart(product);
                  }
                  router.push('/cart');
                }}
                className="w-full py-3.5 px-5 rounded-xl bg-[#E50914] text-white hover:bg-[#c70811] text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-lg shadow-red-600/25 active:scale-[0.99]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now &bull; Instant Checkout</span>
              </button>

              {/* Secondary Action: Request a Quote / Enquire Now */}
              <button
                type="button"
                onClick={() => setEnquiryProduct(product)}
                className="w-full py-2.5 px-5 rounded-xl border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              >
                <span>Request Best Price / Bulk Enquiry</span>
              </button>
            </div>

            {/* Trust & Delivery Badges */}
            <div className="border-t border-zinc-100 pt-5 space-y-3">
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span><strong>Free Delivery</strong> in 2-4 business days across India</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <Wrench className="w-4 h-4 text-[#E50914] flex-shrink-0" />
                <span><strong>Free Installation</strong> by Butterfly engineer within 48h</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span><strong>7 Days Replacement</strong> for manufacturing defects</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-600">
                <Award className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span><strong>100% Genuine</strong> brand sealed product with GST invoice</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Key Highlights & In-The-Box Showcase (2 Balanced Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Key Visual & Smart Capabilities */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E50914]" />
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-900">
                    Engineered Highlights & Performance
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-zinc-400">Butterfly Living Tech</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-100 space-y-1">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-[#E50914]" />
                    <span className="text-xs font-bold text-zinc-900">{product.resolution} Vivid Engine</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Over a billion rich colors with dynamic contrast enhancement & 178° wide viewing angles.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-100 space-y-1">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#E50914]" />
                    <span className="text-xs font-bold text-zinc-900">Acoustic Cinema Audio</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {product.sound} with high-definition digital sound processing & deep bass resonance.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-100 space-y-1">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#E50914]" />
                    <span className="text-xs font-bold text-zinc-900">{product.os} Smart Platform</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Instant access to 10,000+ apps, voice assistant remote, and seamless smartphone casting.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-100 space-y-1">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-[#E50914]" />
                    <span className="text-xs font-bold text-zinc-900">Dual Wi-Fi & Bluetooth</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Lag-free 5GHz Wi-Fi streaming plus Bluetooth 5.0 for wireless soundbars and headphones.
                  </p>
                </div>
              </div>
            </div>

            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <div className="pt-3 border-t border-zinc-100">
                <span className="text-[11px] font-bold text-zinc-700 block mb-2">Key Model Features:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.keyFeatures.slice(0, 4).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* In-the-Box & Official Inclusions Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#E50914]" />
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-900">
                    What&apos;s Included In The Box
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  All-Inclusive Kit
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{product.size} Smart TV</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Voice Remote + AAA</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Wall Mount Bracket</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Table Top Stands</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Power Cable & Adapter</span>
                </div>
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Warranty Card & Guide</span>
                </div>
              </div>
            </div>

            {/* Official Support & Installation Note */}
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 flex items-center gap-3 text-xs text-zinc-800">
              <div className="w-8 h-8 rounded-xl bg-[#E50914] text-white flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-zinc-900">Standard On-Site Installation Included</p>
                <p className="text-[11px] text-zinc-500">Official Butterfly technician will coordinate delivery & mounting demo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep-Dive Detailed Tabs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm overflow-hidden">
          {/* Tab Navigation Header */}
          <div className="flex border-b border-zinc-200 bg-zinc-50/70 overflow-x-auto scrollbar-none">
            <button
              id="tab-btn-highlights"
              type="button"
              onClick={() => setActiveTab('highlights')}
              className={`py-4 px-6 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'highlights'
                  ? 'border-[#E50914] text-[#E50914] bg-white'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Key Features
            </button>
            <button
              id="tab-btn-specs"
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-6 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'specs'
                  ? 'border-[#E50914] text-[#E50914] bg-white'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Technical Specifications
            </button>
            <button
              id="tab-btn-installation"
              type="button"
              onClick={() => setActiveTab('installation')}
              className={`py-4 px-6 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'installation'
                  ? 'border-[#E50914] text-[#E50914] bg-white'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Installation & Warranty
            </button>
            <button
              id="tab-btn-reviews"
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#E50914] text-[#E50914] bg-white'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Customer Reviews ({reviews.length})
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 sm:p-10">
            {/* Dynamic Tab 1: Key Features */}
            {activeTab === 'highlights' && (
              <div className="space-y-6">
                {product.keyFeatures && product.keyFeatures.length > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]" />
                      <h3 className="text-lg font-bold text-zinc-900">
                        Highlights & Engineered Features for {product.name}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.keyFeatures.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 transition-colors"
                        >
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-zinc-800 leading-relaxed">
                              {feat}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-zinc-900">
                        Cinema-Grade Visuals & Brilliant Contrast
                      </h3>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        Powered by Butterfly’s proprietary VividColour Engine, this {product.size} {product.resolution} Smart TV delivers over a billion shades of lifelike colours with dynamic frame-by-frame optimization. Every movie, sporting event, and gaming title unfolds with crystal clarity and razor-sharp contrast.
                      </p>
                      <ul className="space-y-2 text-xs text-zinc-700">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Ultra-wide 178° viewing angle for everyone in the room</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>HDR10 and HLG decoding for stunning highlights</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>MEMC Motion Engine prevents blur during fast sports</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-zinc-900">
                        Smart Ecosystem with {product.os}
                      </h3>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        Access over 10,000+ apps directly from Google Play / Smart Store, including Netflix, Prime Video, YouTube, Hotstar, and Zee5. Built-in Chromecast allows seamless casting from your smartphone or tablet with single-tap ease.
                      </p>
                      <ul className="space-y-2 text-xs text-zinc-700">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Voice Remote with built-in Assistant microphone</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Bluetooth 5.0 two-way audio for wireless headphones</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>Auto low-latency Game Mode for console gaming</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Tab 2: Technical Specifications */}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                <div>
                  <h4 className="font-bold text-zinc-900 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-200">
                    Display & Video
                  </h4>
                  <dl className="space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Screen Diagonal</dt>
                      <dd className="font-bold text-zinc-900">{product.size}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Resolution</dt>
                      <dd className="font-bold text-zinc-900">{product.resolution}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Refresh Rate</dt>
                      <dd className="font-bold text-zinc-900">
                        {product.technicalSpecs?.refreshRate || '60 Hz Native'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Panel Type</dt>
                      <dd className="font-bold text-zinc-900">
                        {product.technicalSpecs?.panelType || product.displayTech || 'A+ Grade IPS Bezel-Less'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-200">
                    Audio & Connectivity
                  </h4>
                  <dl className="space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Audio Configuration</dt>
                      <dd className="font-bold text-zinc-900">{product.sound || '2 x 10W Stereo Speakers'}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">HDMI Ports</dt>
                      <dd className="font-bold text-zinc-900">
                        {product.technicalSpecs?.hdmiPorts || '3 x HDMI (ARC Supported)'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">USB Ports</dt>
                      <dd className="font-bold text-zinc-900">
                        {product.technicalSpecs?.usbPorts || '2 x USB 2.0 High Speed'}
                      </dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Wireless</dt>
                      <dd className="font-bold text-zinc-900">
                        {product.technicalSpecs?.wireless || 'Dual-band Wi-Fi & Bluetooth 5.0'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Dynamic Tab 3: Installation & Warranty */}
            {activeTab === 'installation' && (
              <div className="space-y-5 text-xs text-zinc-700">
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-amber-900">
                  <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    Complimentary Doorstep Installation Process & Official Warranty
                  </h4>
                  <p className="text-xs leading-relaxed text-amber-800">
                    {product.warrantyInstallation ||
                      'Once your Butterfly TV arrives at your doorstep, a certified Butterfly brand technician will contact you to schedule an installation time slot within 48 hours. Both tabletop setup and standard wall-mount installations are 100% free of cost with 1 Year Comprehensive Brand Warranty + 1 Year Additional on Display Panel.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                    <span className="font-bold text-zinc-900 block mb-1">1. Delivery</span>
                    <p className="text-zinc-500">Safe doorstep delivery with unboxing verification.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                    <span className="font-bold text-zinc-900 block mb-1">2. Mounting</span>
                    <p className="text-zinc-500">Technician visits with official wall-mount bracket & tools.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                    <span className="font-bold text-zinc-900 block mb-1">3. Demo & Warranty</span>
                    <p className="text-zinc-500">Complete walkthrough of features and digital warranty registration.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Tab 4: Customer Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Header Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200/80 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
                      <span>Customer Reviews</span>
                      <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                        {totalReviewsCount} {totalReviewsCount === 1 ? 'review' : 'reviews'}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Ratings and real feedback from verified Butterfly Smart TV owners
                    </p>
                  </div>

                  <button
                    id="btn-write-review"
                    type="button"
                    onClick={handleOpenReviewModal}
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-zinc-900 hover:bg-[#E50914] text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 self-start sm:self-auto"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Write a Review</span>
                  </button>
                </div>

                {reviewsLoading ? (
                  <div className="py-14 text-center space-y-3">
                    <Loader2 className="w-7 h-7 animate-spin text-[#E50914] mx-auto" />
                    <p className="text-xs font-semibold text-zinc-500">Loading verified customer reviews...</p>
                  </div>
                ) : totalReviewsCount === 0 ? (
                  <div className="text-center py-14 px-6 bg-zinc-50 rounded-3xl border border-zinc-200/80 max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center mx-auto mb-4 border border-red-100">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-extrabold text-zinc-900 mb-1">
                      No reviews yet for {product.name}
                    </h4>
                    <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                      Be the first verified customer to share your thoughts and help others make the best choice.
                    </p>
                    <button
                      id="btn-write-first-review"
                      type="button"
                      onClick={handleOpenReviewModal}
                      className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Write the First Review</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Overall Score & Distribution Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 items-center">
                      {/* Left: Overall Score */}
                      <div className="md:col-span-4 text-center md:text-left md:border-r md:border-zinc-200/80 md:pr-6 space-y-2">
                        <span className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight">
                          {dynamicAverageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(dynamicAverageRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">
                          Based on {totalReviewsCount} verified {totalReviewsCount === 1 ? 'rating' : 'ratings'}
                        </p>
                      </div>

                      {/* Right: Distribution Bars */}
                      <div className="md:col-span-8 space-y-2">
                        {ratingDistribution.map((dist) => (
                          <div key={dist.star} className="flex items-center gap-3 text-xs">
                            <span className="w-12 font-bold text-zinc-600 flex items-center gap-1">
                              <span>{dist.star}</span>
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${dist.percentage}%` }}
                              />
                            </div>
                            <span className="w-10 text-right font-medium text-zinc-400 text-[11px]">
                              {dist.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Review Cards List */}
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-red-50 text-[#E50914] font-black text-xs flex items-center justify-center border border-red-100 uppercase">
                                {rev.userName ? rev.userName.charAt(0) : 'U'}
                              </div>
                              <div>
                                <h5 className="font-extrabold text-xs text-zinc-900 leading-tight">
                                  {rev.userName}
                                </h5>
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-100">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  <span>Verified Buyer</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex text-amber-400">
                                {[1, 2, 3, 4, 5].map((st) => (
                                  <Star
                                    key={st}
                                    className={`w-3.5 h-3.5 ${
                                      st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-zinc-400 text-[11px]">
                                {rev.createdAt
                                  ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'Recent'}
                              </span>
                            </div>
                          </div>

                          {rev.title && (
                            <h6 className="font-bold text-zinc-900 text-xs sm:text-sm">
                              {rev.title}
                            </h6>
                          )}

                          <p className="text-xs text-zinc-600 leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= MODAL: CUSTOMER LOGIN REQUIRED ================= */}
      {showLoginRequiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95 text-center">
            <button
              onClick={() => setShowLoginRequiredModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Lock className="w-7 h-7" />
            </div>

            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" />
              <span className="text-[11px] font-bold text-[#E50914] uppercase tracking-wider">
                Customer Authentication
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-zinc-900 mb-2">
              Sign In to Write a Review
            </h3>

            <p className="text-xs text-zinc-600 leading-relaxed mb-6 max-w-sm mx-auto">
              To guarantee that all reviews come from real customers, you must be logged into your Butterfly customer account to share your verified review.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowLoginRequiredModal(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <Link
                id="btn-login-to-review"
                href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : `/products/${product.id}`)}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95"
              >
                <span>Customer Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUBMIT CUSTOMER REVIEW ================= */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-zinc-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#E50914]" />
              <span className="text-[11px] font-bold text-[#E50914] uppercase tracking-wider">
                Verified Customer Feedback
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-zinc-900 mb-1">
              Review {product.name}
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Model: <span className="font-mono font-bold text-zinc-700">{product.model}</span> • Posting as{' '}
              <span className="font-semibold text-zinc-800">{currentUser?.name || currentUser?.email || 'Verified Customer'}</span>
            </p>

            {reviewSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {reviewErrorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[#E50914] flex items-center gap-2 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-[#E50914] shrink-0" />
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star Rating Selector */}
              <div>
                <label className="block font-bold text-zinc-800 mb-1.5">Overall Rating *</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isHighlighted = (reviewHoverRating || reviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(star)}
                          className="p-1 rounded-md hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isHighlighted ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-bold text-zinc-700 ml-2">
                    {reviewRating === 5 && '★★★★★ Outstanding'}
                    {reviewRating === 4 && '★★★★ Very Good'}
                    {reviewRating === 3 && '★★★ Good'}
                    {reviewRating === 2 && '★★ Fair'}
                    {reviewRating === 1 && '★ Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block font-bold text-zinc-800 mb-1">Review Headline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Cinema sound and crisp 4K display!"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914]"
                />
              </div>

              {/* Review Comment */}
              <div>
                <label className="block font-bold text-zinc-800 mb-1">Your Detailed Experience *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us about the colors, black levels, audio clarity, app experience, and doorstep installation..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 focus:border-[#E50914] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2 rounded-xl bg-[#E50914] hover:bg-[#c70811] text-white font-bold cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Similar Products Section (Explicit User Request) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E50914] block mb-1">
              RECOMMENDED FOR YOU
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Similar Products
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Explore other Butterfly Smart TVs with matching screen dimensions, resolutions, and smart features.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:text-[#E50914] transition-colors group flex-shrink-0"
          >
            <span>View All {allProducts && allProducts.length > 0 ? allProducts.length : '30+'} TVs</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Similar Products 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {similarProducts.map((simProduct) => (
            <ProductCatalogCard
              key={simProduct.id}
              product={simProduct}
              onViewDetails={(p) => router.push(`/products/${p.id}`)}
              onEnquire={(p) => setEnquiryProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Enquiry Modal if triggered from quick enquire */}
      <EnquiryModal
        product={enquiryProduct}
        onClose={() => setEnquiryProduct(null)}
      />
    </div>
  );
}
