'use client';

import React, { useState, useEffect } from 'react';
import { ProductCard, TVProduct } from '@/components/cards/product-card';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FEATURED_PRODUCTS: TVProduct[] = [
  {
    id: 'bf43s1',
    model: 'BF43S1',
    name: '43" Full HD Smart TV',
    size: '43"',
    badge: 'Best Seller',
    image: '/tv_art.jpg',
    resolution: 'Full HD (1080p)',
    os: 'Android 11',
    sound: '2 x 10W Speakers',
    price: '₹ 24,990',
    numericPrice: 24990,
    isFilledButton: true, // Red filled button in reference image
  },
  {
    id: 'bf55u1',
    model: 'BF55U1',
    name: '55" 4K UHD Smart TV',
    size: '55"',
    badge: 'Popular',
    image: '/tv_lake.jpg',
    resolution: '4K UHD Resolution',
    os: 'Android 11',
    sound: 'Dolby Audio',
    price: '₹ 34,990',
    numericPrice: 34990,
    isFilledButton: false, // Outline button in reference image
  },
  {
    id: 'bf65u1',
    model: 'BF65U1',
    name: '65" 4K UHD Smart TV',
    size: '65"',
    badge: 'New',
    image: '/tv_space.jpg',
    resolution: '4K UHD Resolution',
    os: 'Android 11',
    sound: '2 x 15W Speakers',
    price: '₹ 44,990',
    numericPrice: 44990,
    isFilledButton: false, // Outline button in reference image
  },
  {
    id: 'bf32s1',
    model: 'BF32S1',
    name: '32" HD Ready Smart TV',
    size: '32"',
    image: '/tv_abstract.jpg',
    resolution: 'HD Ready 720p',
    os: 'Android 11',
    sound: '2 x 8W Speakers',
    price: '₹ 17,990',
    numericPrice: 17990,
    isFilledButton: false, // Outline button in reference image
  },
];

interface BestSellingProps {
  onViewDetails: (product: TVProduct) => void;
  onAddToCart: (product: TVProduct) => void;
  selectedFilterSize?: string | null;
}

export function BestSelling({
  onViewDetails,
  onAddToCart,
  selectedFilterSize,
}: BestSellingProps) {
  const [activeFilter, setActiveFilter] = useState<string>(selectedFilterSize || 'All');

  useEffect(() => {
    if (selectedFilterSize) {
      setActiveFilter(selectedFilterSize);
    }
  }, [selectedFilterSize]);

  const filterTabs = ['All', '32"', '43"', '55"', '65"'];

  const filteredList =
    activeFilter === 'All'
      ? FEATURED_PRODUCTS
      : FEATURED_PRODUCTS.filter((p) => p.size === activeFilter);

  return (
    <section id="best-selling" className="py-16 lg:py-24 bg-[#f8fafc] dark:bg-zinc-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Title and "View All Products ->" */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E50914] block mb-2">
              FEATURED PRODUCTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Our Best Selling TVs
            </h2>
          </div>

          <a
            href="#best-selling"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors group"
          >
            View All Products
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                activeFilter === tab
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
              }`}
            >
              {tab === 'All' ? 'All Models' : `${tab} TVs`}
            </button>
          ))}
        </div>

        {/* 4 Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredList.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* Low latency delivery banner */}
        <div className="mt-12 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 text-[#E50914] dark:bg-red-950/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-white block">
                Free Express Delivery &amp; Demo Installation
              </span>
              <span className="text-zinc-500">
                Scheduled delivery within 24-48 hours across major Indian cities
              </span>
            </div>
          </div>
          <span className="font-semibold text-[#E50914]">T&amp;C Apply*</span>
        </div>
      </div>
    </section>
  );
}
