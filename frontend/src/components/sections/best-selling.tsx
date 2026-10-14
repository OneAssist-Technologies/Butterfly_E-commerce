'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard, TVProduct } from '@/components/cards/product-card';
import { ArrowRight } from 'lucide-react';

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
  onAddToCart?: (product: TVProduct) => void;
  selectedFilterSize?: string | null;
}

export function BestSelling({
  onViewDetails,
  onAddToCart,
}: BestSellingProps) {
  return (
    <section id="best-selling" className="pt-6 lg:pt-8 pb-14 lg:pb-20 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Title and "View All Products ->" */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E50914] block mb-2">
              FEATURED PRODUCTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Our Best Selling TVs
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-[#E50914] transition-colors group"
          >
            View All Products
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Product Cards in a responsive 4-column grid matching reference image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
