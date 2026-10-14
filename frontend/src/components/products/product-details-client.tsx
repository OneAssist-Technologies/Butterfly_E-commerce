'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { CatalogProduct, ALL_PRODUCTS } from '@/data/products';
import { ProductCatalogCard } from '@/components/cards/product-catalog-card';
import { EnquiryModal } from '@/components/shared/enquiry-modal';
import { useCart } from '@/providers';
import { TVProduct } from '@/components/cards/product-card';

interface ProductDetailsClientProps {
  product: CatalogProduct;
  similarProducts: CatalogProduct[];
}

export function ProductDetailsClient({
  product,
  similarProducts,
}: ProductDetailsClientProps) {
  const router = useRouter();
  const { addToCart, openCart } = useCart();

  // Active Gallery Image
  const galleryImages = [
    { src: product.image, label: 'Front Display' },
    { src: '/products_hero.jpg', label: 'Living Room Ambience' },
    { src: '/tv_canyon.jpg', label: 'Cinematic Visuals' },
    { src: '/tv_space.jpg', label: 'Infinite Contrast' },
  ];
  const [activeImage, setActiveImage] = useState(galleryImages[0].src);

  // Interaction States
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'highlights' | 'specs' | 'installation' | 'reviews'>('highlights');

  // Enquiry Modal state
  const [enquiryProduct, setEnquiryProduct] = useState<TVProduct | null>(null);

  // Pricing calculations
  const originalMrp = Math.round((product.numericPrice * 1.33) / 100) * 100;
  const savings = originalMrp - product.numericPrice;
  const discountPercent = Math.round((savings / originalMrp) * 100);
  const emiAmount = Math.round(product.numericPrice / 12);

  // Screen size switcher options
  const availableSizes: Array<{ label: '32"' | '43"' | '55"' | '65"'; targetId?: string }> = [
    { label: '32"', targetId: ALL_PRODUCTS.find((p) => p.screenSizeCategory === '32"')?.id },
    { label: '43"', targetId: ALL_PRODUCTS.find((p) => p.screenSizeCategory === '43"')?.id },
    { label: '55"', targetId: ALL_PRODUCTS.find((p) => p.screenSizeCategory === '55"')?.id },
    { label: '65"', targetId: ALL_PRODUCTS.find((p) => p.screenSizeCategory === '65"')?.id },
  ];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
    openCart();
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
            <div className="relative bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-8 shadow-sm overflow-hidden group">
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

              {/* TV Display Bezel Mockup */}
              <div className="relative w-full aspect-[16/10] bg-zinc-950 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl border-4 border-zinc-800 flex items-center justify-center">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover transition-all duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                  {/* Subtle TV screen gloss reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                </div>
                {/* TV Stand Base */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-2 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-700 rounded-b-md shadow-md" />
              </div>
            </div>

            {/* Gallery Thumbnails */}
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
                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-zinc-900">
                      <Image
                        src={thumb.src}
                        alt={thumb.label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 15vw"
                      />
                    </div>
                  </button>
                );
              })}
            </div>

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

          {/* Right Column: Pricing, Specs & Purchase Actions (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            
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

              {/* Rating & Review stats */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                  <span>4.8</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
                <span className="text-xs text-zinc-500 font-medium">
                  142 Ratings &bull; 38 Verified Reviews
                </span>
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
                  className="flex-1 py-3 px-5 rounded-xl bg-[#E50914] text-white hover:bg-[#c70811] text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart ({quantity})</span>
                </button>
              </div>

              {/* Secondary Action: Request a Quote / Enquire Now */}
              <button
                type="button"
                onClick={() => setEnquiryProduct(product)}
                className="w-full py-3 px-5 rounded-xl border border-zinc-300 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400 text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
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

      {/* Deep-Dive Detailed Tabs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm overflow-hidden">
          {/* Tab Navigation Header */}
          <div className="flex border-b border-zinc-200 bg-zinc-50/70 overflow-x-auto scrollbar-none">
            <button
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
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-6 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-[#E50914] text-[#E50914] bg-white'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Customer Reviews (38)
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-6 sm:p-10">
            {activeTab === 'highlights' && (
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

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                <div>
                  <h4 className="font-bold text-zinc-900 uppercase tracking-wider mb-3 pb-1 border-b border-zinc-200">
                    Display & Video
                  </h4>
                  <dl className="space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Screen Diagonal</dt>
                      <dd className="font-bold text-zinc-900">{product.size} (108 cm)</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Resolution</dt>
                      <dd className="font-bold text-zinc-900">{product.resolution}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Refresh Rate</dt>
                      <dd className="font-bold text-zinc-900">60 Hz Native</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Panel Type</dt>
                      <dd className="font-bold text-zinc-900">A+ Grade IPS Bezel-Less</dd>
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
                      <dd className="font-bold text-zinc-900">{product.sound}</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">HDMI Ports</dt>
                      <dd className="font-bold text-zinc-900">3 x HDMI (ARC Supported)</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">USB Ports</dt>
                      <dd className="font-bold text-zinc-900">2 x USB 2.0 High Speed</dd>
                    </div>
                    <div className="flex justify-between py-1 border-b border-zinc-100">
                      <dt className="text-zinc-500">Wireless</dt>
                      <dd className="font-bold text-zinc-900">Dual-band Wi-Fi & Bluetooth 5.0</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'installation' && (
              <div className="space-y-5 text-xs text-zinc-700">
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-amber-900">
                  <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    Complimentary Doorstep Installation Process
                  </h4>
                  <p className="text-xs leading-relaxed text-amber-800">
                    Once your Butterfly TV arrives at your doorstep, a certified Butterfly brand technician will contact you to schedule an installation time slot within 48 hours. Both tabletop setup and standard wall-mount installations are 100% free of cost.
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

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-200 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-extrabold text-zinc-900">4.8</span>
                      <div className="flex text-amber-400">
                        {'★★★★★'.split('').map((c, i) => (
                          <span key={i} className="text-lg">{c}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">Based on 142 customer reviews</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('Review submission is available after order delivery.')}
                    className="py-2.5 px-4 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
                  >
                    Write a Review
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">Rahul Sharma</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Verified Buyer</span>
                      </div>
                      <span className="text-zinc-400">3 days ago</span>
                    </div>
                    <p className="text-zinc-600">
                      Picture quality on this TV is breathtaking! Colors are vibrant, blacks are deep, and sound fills my whole living room without needing a separate soundbar. Free installation happened on time.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900">Pooja Venkatesh</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">Verified Buyer</span>
                      </div>
                      <span className="text-zinc-400">1 week ago</span>
                    </div>
                    <p className="text-zinc-600">
                      Hands down the best value TV in this price bracket. Android TV runs butter-smooth, Netflix 4K streaming looks amazing, and the slim bezel looks very premium on the wall.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

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
            <span>View All {ALL_PRODUCTS.length} TVs</span>
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
