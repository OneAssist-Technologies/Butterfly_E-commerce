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
  Star,
  Check,
  ChevronRight,
  Share2,
  Sparkles,
  Zap,
  Wifi,
  Lock,
  CheckCircle2,
  X,
  MessageSquare,
  Loader2,
  Cpu,
  Box,
  Tag,
  Wrench,
} from 'lucide-react';
import { CatalogProduct } from '@/data/products';
import { ProductCatalogCard } from '@/components/cards/product-catalog-card';
import { EnquiryModal } from '@/components/shared/enquiry-modal';
import { useCart } from '@/providers';
import { TVProduct } from '@/components/cards/product-card';
import { productService, normalizeProductImageUrl } from '@/services/product.service';
import { offerService, calculateProductPricing, Offer } from '@/services/offer.service';

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
  const { addToCart } = useCart();

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

  // Determine dynamic tabs based strictly on entered admin data
  const hasKeyFeatures = Boolean(Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0);
  const hasWarranty = Boolean(
    product.warrantyInstallation ||
    product.technicalSpecs?.standardWarranty ||
    product.technicalSpecs?.extendedWarranty
  );

  const [activeTab, setActiveTab] = useState<'highlights' | 'specs' | 'installation' | 'reviews'>(() => {
    if (hasKeyFeatures) return 'highlights';
    return 'specs';
  });

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

  // Active Store Offers
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);

  useEffect(() => {
    offerService.getActiveOffers()
      .then((offers) => setActiveOffers(offers.filter((o) => o.isActive)))
      .catch(() => {});

    const handleOffersUpdated = () => {
      offerService.getActiveOffers()
        .then((offers) => setActiveOffers(offers.filter((o) => o.isActive)))
        .catch(() => {});
    };

    window.addEventListener('butterfly_offers_updated', handleOffersUpdated);
    return () => {
      window.removeEventListener('butterfly_offers_updated', handleOffersUpdated);
    };
  }, []);

  // Pricing calculations
  const pricing = useMemo(() => {
    return calculateProductPricing(product, activeOffers);
  }, [product, activeOffers]);

  const {
    actualPrice,
    originalPrice: originalMrp,
    finalPrice: displaySellingPrice,
    offerDiscount,
    totalSavings,
    discountPercent,
    appliedOffer,
    isOfferApplied,
  } = pricing;

  // Screen size switcher options dynamically from database products
  const productSource = allProducts && allProducts.length > 0 ? allProducts : similarProducts;
  const availableSizes: Array<{ label: string; targetId?: string }> = useMemo(() => {
    const sizeKeys = ['32"', '43"', '50"', '55"', '65"'];
    return sizeKeys.map((lbl) => ({
      label: lbl,
      targetId: productSource.find((p) => p.screenSizeCategory === lbl || p.size?.includes(lbl.replace('"', '')) || p.size === lbl)?.id,
    }));
  }, [productSource]);

  // Dynamic In-The-Box items: ONLY if entered by admin
  const dynamicIncludedItems: string[] = useMemo(() => {
    if (Array.isArray(product.whatsIncluded) && product.whatsIncluded.length > 0) {
      return product.whatsIncluded.map((s) => String(s).trim()).filter(Boolean);
    }
    return [];
  }, [product.whatsIncluded]);

  // Dynamic Quick Feature Tiles below image: ONLY from actual entered data
  const quickTiles = useMemo(() => {
    const list: Array<{ icon: any; title: string; subtitle: string }> = [];
    if (product.displayTech || product.technicalSpecs?.panelType) {
      list.push({
        icon: Tv,
        title: (product.displayTech || product.technicalSpecs?.panelType || '').trim(),
        subtitle: 'Display Panel',
      });
    }
    if (product.sound || product.technicalSpecs?.soundOutput) {
      list.push({
        icon: Volume2,
        title: (product.sound || product.technicalSpecs?.soundOutput || '').trim(),
        subtitle: 'Audio Output',
      });
    }
    if (product.technicalSpecs?.processor) {
      list.push({
        icon: Cpu,
        title: product.technicalSpecs.processor.trim(),
        subtitle: 'Processor',
      });
    }
    if (product.technicalSpecs?.wireless) {
      list.push({
        icon: Wifi,
        title: product.technicalSpecs.wireless.trim(),
        subtitle: 'Connectivity',
      });
    } else if (product.technicalSpecs?.standardWarranty || product.warrantyInstallation) {
      list.push({
        icon: ShieldCheck,
        title: (product.technicalSpecs?.standardWarranty || product.warrantyInstallation || '').trim(),
        subtitle: 'Warranty',
      });
    }
    return list;
  }, [product]);

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      price: `₹ ${displaySellingPrice.toLocaleString('en-IN')}`,
      numericPrice: displaySellingPrice,
      originalPrice: `₹ ${originalMrp.toLocaleString('en-IN')}`,
      originalNumericPrice: originalMrp,
    };
    for (let i = 0; i < quantity; i++) {
      addToCart(itemToAdd);
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

              {/* Main Product Image Display */}
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

            {/* Quick Highlights Feature Tiles - Strictly from actual product data */}
            {quickTiles.length > 0 && (
              <div className={`grid gap-3 pt-2 ${
                quickTiles.length === 1
                  ? 'grid-cols-1 max-w-xs'
                  : quickTiles.length === 2
                  ? 'grid-cols-2'
                  : quickTiles.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2 sm:grid-cols-4'
              }`}>
                {quickTiles.map((tile, idx) => {
                  const Icon = tile.icon;
                  return (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-zinc-200/80 text-center">
                      <Icon className="w-5 h-5 text-[#E50914] mx-auto mb-1.5" />
                      <span className="block text-xs font-bold text-zinc-900 truncate">{tile.title}</span>
                      <span className="text-[10px] text-zinc-500">{tile.subtitle}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Specs & Purchase Actions (5 cols, Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-6">
            
            {/* Header Titles */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#E50914] bg-red-50 border border-red-100 px-2.5 py-1 rounded-md">
                  {product.model}
                </span>
                {product.resolution && (
                  <span className="text-xs font-semibold text-zinc-500">
                    {product.resolution}
                  </span>
                )}
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
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
                  ₹ {displaySellingPrice.toLocaleString('en-IN')}
                </span>
                {originalMrp > displaySellingPrice && (
                  <span className="text-sm sm:text-base text-zinc-400 line-through">
                    ₹ {originalMrp.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Offer Highlight Box when active promotional offer applies on actual price */}
              {isOfferApplied && appliedOffer && (
                <div className="mt-3 p-3 rounded-xl bg-red-50/90 border border-red-200 text-xs text-[#E50914] flex items-start gap-2.5 animate-in fade-in">
                  <Tag className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">
                      {appliedOffer.title} ({appliedOffer.discountType === 'PERCENTAGE' ? `${appliedOffer.discountValue}% OFF` : `₹${appliedOffer.discountValue.toLocaleString('en-IN')} OFF`}) Applied!
                    </span>
                    <span className="text-zinc-600 font-medium">
                      Applied on actual price ₹{actualPrice.toLocaleString('en-IN')} (-₹{offerDiscount.toLocaleString('en-IN')} savings).
                    </span>
                  </div>
                </div>
              )}

              {totalSavings > 0 && (
                <p className="text-[11px] text-zinc-500 mt-2">
                  Inclusive of all taxes &bull; Save ₹ {totalSavings.toLocaleString('en-IN')} today off MRP
                </p>
              )}

              {/* Installation & Warranty note only if entered by admin */}
              {product.warrantyInstallation && (
                <div className="mt-3.5 pt-3 border-t border-zinc-200 flex items-start gap-2.5 text-xs text-zinc-700">
                  <Sparkles className="w-4 h-4 text-[#E50914] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-900">Installation & Warranty:</span>{' '}
                    {product.warrantyInstallation}
                  </div>
                </div>
              )}
            </div>

            {/* Screen Size Switcher */}
            {availableSizes.some((s) => s.targetId) && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Select Screen Size
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    Currently: <strong className="text-zinc-900">{product.size}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {availableSizes.map((sizeOption) => {
                    const isCurrent = sizeOption.label === product.screenSizeCategory || sizeOption.label === product.size;
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
            )}

            {/* Quick Specs Overview Table strictly from actual catalogue entries */}
            <div className="space-y-2 text-xs">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-900 block mb-1">
                Specifications At A Glance
              </span>
              <div className="grid grid-cols-2 gap-2 text-zinc-700">
                {(product.technicalSpecs?.panelType || product.resolution || product.displayTech) && (
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Display &amp; Panel</span>
                    <span className="font-bold text-zinc-900 truncate block">
                      {product.technicalSpecs?.panelType || product.resolution || product.displayTech}
                    </span>
                  </div>
                )}
                {(product.technicalSpecs?.processor || product.technicalSpecs?.ram) && (
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Core Hardware</span>
                    <span className="font-bold text-zinc-900 truncate block">
                      {[product.technicalSpecs?.processor, product.technicalSpecs?.ram ? `(${product.technicalSpecs.ram} RAM)` : null].filter(Boolean).join(' ')}
                    </span>
                  </div>
                )}
                {(product.technicalSpecs?.soundOutput || product.sound) && (
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Audio System</span>
                    <span className="font-bold text-zinc-900 truncate block">
                      {product.technicalSpecs?.soundOutput || product.sound}
                    </span>
                  </div>
                )}
                {(product.technicalSpecs?.standardWarranty || product.warrantyInstallation) && (
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Brand Warranty</span>
                    <span className="font-bold text-emerald-700 truncate block">
                      {product.technicalSpecs?.standardWarranty || product.warrantyInstallation}
                    </span>
                  </div>
                )}
              </div>

              {/* Catalogue Gift Offer Banner if configured by admin */}
              {product.technicalSpecs?.bundleOffer && (
                <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="font-bold text-[11px] truncate">
                      Catalogue Offer: {product.technicalSpecs.bundleOffer}
                    </span>
                  </div>
                  {product.technicalSpecs.withoutOfferPrice && (
                    <span className="text-[10px] text-amber-700 shrink-0 font-medium">
                      Without offer: {product.technicalSpecs.withoutOfferPrice}
                    </span>
                  )}
                </div>
              )}
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

          </div>
        </div>
      </section>

      {/* What's Included In The Box Showcase - Strictly if added by admin */}
      {dynamicIncludedItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#E50914]" />
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-zinc-900">
                  What&apos;s Included In The Box
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                Official Package
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {dynamicIncludedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-800 font-semibold flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="line-clamp-2">{item}</span>
                </div>
              ))}
            </div>

            {product.warrantyInstallation && (
              <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 flex items-center gap-3 text-xs text-zinc-800">
                <div className="w-8 h-8 rounded-xl bg-[#E50914] text-white flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-zinc-900">Installation Guidelines</p>
                  <p className="text-[11px] text-zinc-600">{product.warrantyInstallation}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Deep-Dive Detailed Tabs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm overflow-hidden">
          {/* Tab Navigation Header */}
          <div className="flex border-b border-zinc-200 bg-zinc-50/70 overflow-x-auto scrollbar-none">
            {hasKeyFeatures && (
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
            )}
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
            {hasWarranty && (
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
                Installation &amp; Warranty
              </button>
            )}
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
            {/* Dynamic Tab 1: Key Features (Strictly admin data, zero fake marketing text) */}
            {activeTab === 'highlights' && hasKeyFeatures && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E50914]" />
                    <h3 className="text-lg font-bold text-zinc-900">
                      Highlights &amp; Features for {product.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.keyFeatures!.map((feat, idx) => (
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
              </div>
            )}

            {/* Dynamic Tab 2: Technical Specifications - Strictly from entered catalogue fields */}
            {activeTab === 'specs' && (
              <div className="space-y-8 text-xs">
                {/* Row 1: Display & Hardware */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Display & Picture */}
                  <div>
                    <h4 className="font-black text-zinc-900 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-200 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-[#E50914]" />
                      <span>Display &amp; Panel</span>
                    </h4>
                    <dl className="space-y-2.5">
                      {product.size && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Screen Diagonal</dt>
                          <dd className="font-bold text-zinc-900">{product.size}</dd>
                        </div>
                      )}
                      {product.resolution && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Display Resolution</dt>
                          <dd className="font-bold text-zinc-900">{product.resolution}</dd>
                        </div>
                      )}
                      {product.displayTech && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Display Technology</dt>
                          <dd className="font-bold text-zinc-900">{product.displayTech}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.panelType && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Panel Architecture</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.panelType}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.bezelDesign && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Bezel / Frame Style</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.bezelDesign}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.hdrSupport && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">High Dynamic Range (HDR)</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.hdrSupport}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Hardware & Performance */}
                  <div>
                    <h4 className="font-black text-zinc-900 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-200 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#E50914]" />
                      <span>Hardware &amp; Performance</span>
                    </h4>
                    <dl className="space-y-2.5">
                      {product.technicalSpecs?.processor && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Processor (CPU)</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.processor}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.ram && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">System RAM (Memory)</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.ram}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.storageRom && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Internal Storage (ROM)</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.storageRom}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.remoteType && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Remote Control</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.remoteType}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.screenCasting && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Screen Mirroring</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.screenCasting}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Row 2: Audio & Connectivity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Audio & Smart OS */}
                  <div>
                    <h4 className="font-black text-zinc-900 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-200 flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#E50914]" />
                      <span>Smart Platform &amp; Audio</span>
                    </h4>
                    <dl className="space-y-2.5">
                      {(product.smartOS || product.os) && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Operating System</dt>
                          <dd className="font-bold text-zinc-900">{product.smartOS || product.os}</dd>
                        </div>
                      )}
                      {(product.technicalSpecs?.soundOutput || product.sound) && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Audio Output</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs?.soundOutput || product.sound}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.ottSupport && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">OTT &amp; Software Support</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.ottSupport}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Ports & Connectivity */}
                  <div>
                    <h4 className="font-black text-zinc-900 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-200 flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-[#E50914]" />
                      <span>Connectivity &amp; Ports</span>
                    </h4>
                    <dl className="space-y-2.5">
                      {product.technicalSpecs?.hdmiPorts && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">HDMI Ports</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.hdmiPorts}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.usbPorts && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">USB Ports</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.usbPorts}</dd>
                        </div>
                      )}
                      {product.technicalSpecs?.wireless && (
                        <div className="flex justify-between py-1 border-b border-zinc-100">
                          <dt className="text-zinc-500">Wireless Connectivity</dt>
                          <dd className="font-bold text-zinc-900">{product.technicalSpecs.wireless}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>

                {/* Catalogue Warranty & Offers Card: Only if at least one warranty/offer field exists */}
                {(product.technicalSpecs?.standardWarranty ||
                  product.technicalSpecs?.extendedWarranty ||
                  product.technicalSpecs?.bundleOffer ||
                  product.technicalSpecs?.withoutOfferPrice) && (
                  <div className="p-5 rounded-3xl bg-zinc-50/80 border border-zinc-200/90 space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#E50914]" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                          Warranty Plans &amp; Offers
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1 text-xs">
                      {product.technicalSpecs?.standardWarranty && (
                        <div className="bg-white p-3 rounded-2xl border border-zinc-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            Standard Warranty
                          </span>
                          <span className="font-black text-zinc-900 text-sm mt-0.5 block">
                            {product.technicalSpecs.standardWarranty}
                          </span>
                        </div>
                      )}

                      {product.technicalSpecs?.extendedWarranty && (
                        <div className="bg-white p-3 rounded-2xl border border-zinc-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            Extended Warranty
                          </span>
                          <span className="font-black text-[#E50914] text-sm mt-0.5 block">
                            {product.technicalSpecs.extendedWarranty}
                          </span>
                          {product.technicalSpecs?.extendedWarrantyPrice && (
                            <span className="text-[11px] font-bold text-zinc-800 mt-0.5 block">
                              Price: {product.technicalSpecs.extendedWarrantyPrice}
                            </span>
                          )}
                        </div>
                      )}

                      {product.technicalSpecs?.bundleOffer && (
                        <div className="bg-white p-3 rounded-2xl border border-zinc-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            Bundle Offer
                          </span>
                          <span className="font-black text-emerald-700 text-sm mt-0.5 block">
                            {product.technicalSpecs.bundleOffer}
                          </span>
                        </div>
                      )}
                    </div>

                    {product.technicalSpecs?.withoutOfferPrice && (
                      <div className="pt-2 text-[11px] text-zinc-600 flex items-center justify-between border-t border-zinc-200/60">
                        <span>Direct purchase price without offer:</span>
                        <span className="font-bold text-zinc-900">{product.technicalSpecs.withoutOfferPrice}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Tab 3: Installation & Warranty Guidelines */}
            {activeTab === 'installation' && hasWarranty && (
              <div className="space-y-5 text-xs text-zinc-700">
                {product.warrantyInstallation && (
                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-amber-900">
                    <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      Installation &amp; Warranty Guidelines
                    </h4>
                    <p className="text-xs leading-relaxed text-amber-800">
                      {product.warrantyInstallation}
                    </p>
                  </div>
                )}

                {/* Official Terms and Conditions directly from Butterfly Catalogue */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
                  <h4 className="font-black text-xs uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#E50914]" />
                    <span>Official Warranty Terms (Butterfly Enterprises)</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-zinc-600 leading-relaxed text-[11px]">
                    <li>
                      <strong>Manufacturing Defects:</strong> Warranty covers only for manufacturing defects and does not cover physical damage, liquid damage, or unauthorized handling.
                    </li>
                    <li>
                      <strong>Service Warranty:</strong> Service warranty covers service charges; spare parts cost is payable by the consumer.
                    </li>
                    <li>
                      <strong>Logistics:</strong> Delivery and installation charges are applicable extra for service warranty products.
                    </li>
                  </ol>
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
                      <div className="md:col-span-4 text-center md:border-r md:border-zinc-200/80 pr-0 md:pr-6">
                        <span className="text-5xl font-black text-zinc-900 tracking-tight">
                          {dynamicAverageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center justify-center gap-1 my-2">
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              className={`w-4 h-4 ${
                                st <= Math.round(dynamicAverageRating)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500 font-medium">
                          Based on {totalReviewsCount} verified rating{totalReviewsCount > 1 ? 's' : ''}
                        </p>
                      </div>

                      <div className="md:col-span-8 space-y-2">
                        {ratingDistribution.map((row) => (
                          <div key={row.star} className="flex items-center gap-3 text-xs">
                            <span className="w-8 font-semibold text-zinc-700 flex items-center gap-1">
                              <span>{row.star}</span>
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-zinc-200 overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                style={{ width: `${row.percentage}%` }}
                              />
                            </div>
                            <span className="w-12 text-right text-zinc-500 text-[11px]">
                              {row.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-2 hover:border-zinc-300 transition-colors"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-red-50 text-[#E50914] font-black text-xs flex items-center justify-center border border-red-100 uppercase">
                                {(rev.userName || 'U').charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-zinc-900 text-xs block">
                                  {rev.userName}
                                </span>
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
                Verified Purchase Review
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-zinc-900 mb-1">
              Write a Review for {product.name}
            </h3>
            <p className="text-xs text-zinc-500 mb-5">
              Reviewing as <strong className="text-zinc-800">{currentUser?.name || currentUser?.email}</strong>
            </p>

            {reviewSuccessMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {reviewErrorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
                <X className="w-4 h-4 text-red-600 shrink-0" />
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Star Rating Selector */}
              <div>
                <label className="block font-bold text-zinc-800 mb-2">Overall Rating *</label>
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
                          className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
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
                    {reviewRating === 4 && '★★★★☆ Very Good'}
                    {reviewRating === 3 && '★★★☆☆ Good'}
                    {reviewRating === 2 && '★★☆☆☆ Fair'}
                    {reviewRating === 1 && '★☆☆☆☆ Needs Improvement'}
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

      {/* Similar Products Section */}
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
