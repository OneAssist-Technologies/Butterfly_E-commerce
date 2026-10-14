'use client';

import React from 'react';
import { SizeCard, SizeOption } from '@/components/cards/size-card';
import { ArrowRight } from 'lucide-react';

const SIZE_OPTIONS: SizeOption[] = [
  {
    size: '32"',
    tagline: 'Compact & Smart',
    image: '/tv_lake.jpg',
  },
  {
    size: '43"',
    tagline: 'Perfect for Every Home',
    image: '/tv_art.jpg',
  },
  {
    size: '55"',
    tagline: 'Bigger Screen, Bigger Joy',
    image: '/tv_space.jpg',
  },
  {
    size: '65"',
    tagline: 'The Ultimate Experience',
    image: '/tv_city.jpg',
  },
];

interface SizeSelectorProps {
  onSelectSize?: (size: string) => void;
}

export function SizeSelector({ onSelectSize }: SizeSelectorProps) {
  return (
    <section id="size-selector" className="pt-12 lg:pt-16 pb-6 lg:pb-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header row with Title and "View All Products ->" link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E50914] block mb-2">
              CHOOSE YOUR PERFECT SIZE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              TVs for Every Space
            </h2>
          </div>

          <a
            href="#best-selling"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-[#E50914] transition-colors group"
          >
            View All Products
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Responsive 4-Column Grid matching reference image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SIZE_OPTIONS.map((item) => (
            <SizeCard
              key={item.size}
              item={item}
              onSelect={onSelectSize}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
