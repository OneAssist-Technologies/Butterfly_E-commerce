'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SizeCard, SizeOption } from '@/components/cards/size-card';
import { ArrowRight, Layers } from 'lucide-react';
import { productService } from '@/services/product.service';

const BASE_SIZE_CONFIGS: { size: string; defaultTagline: string; defaultImage: string }[] = [
  { size: '32"', defaultTagline: 'Compact & Smart', defaultImage: '/tv_lake.jpg' },
  { size: '43"', defaultTagline: 'Perfect for Every Home', defaultImage: '/tv_art.jpg' },
  { size: '55"', defaultTagline: 'Bigger Screen, Bigger Joy', defaultImage: '/tv_space.jpg' },
  { size: '65"', defaultTagline: 'The Ultimate Experience', defaultImage: '/tv_city.jpg' },
];

interface SizeSelectorProps {
  onSelectSize?: (size: string) => void;
}

export function SizeSelector({ onSelectSize }: SizeSelectorProps) {
  const [sizeOptions, setSizeOptions] = useState<SizeOption[]>(
    BASE_SIZE_CONFIGS.map((c) => ({
      size: c.size,
      tagline: c.defaultTagline,
      image: c.defaultImage,
      href: `/products?size=${encodeURIComponent(c.size)}`,
    }))
  );

  useEffect(() => {
    let isMounted = true;
    productService
      .getAll()
      .then((catalog) => {
        if (!isMounted || !Array.isArray(catalog) || catalog.length === 0) return;

        // Group counts by size
        const counts: Record<string, number> = {};
        const images: Record<string, string> = {};

        catalog.forEach((p) => {
          const s = p.size || p.screenSizeCategory;
          if (s) {
            counts[s] = (counts[s] || 0) + 1;
            if (!images[s] && p.image) {
              images[s] = p.image;
            }
          }
        });

        const updated = BASE_SIZE_CONFIGS.map((cfg) => {
          const count = counts[cfg.size];
          const dynamicTagline =
            count && count > 0
              ? `${count} Model${count > 1 ? 's' : ''} Available`
              : cfg.defaultTagline;

          return {
            size: cfg.size,
            tagline: dynamicTagline,
            image: images[cfg.size] || cfg.defaultImage,
            href: `/products?size=${encodeURIComponent(cfg.size)}`,
          };
        });

        setSizeOptions(updated);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="size-selector" className="pt-12 lg:pt-16 pb-6 lg:pb-8 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row with Title and "View All Products ->" link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E50914] mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>CHOOSE YOUR PERFECT SIZE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              TVs for Every Space
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              From compact bedroom displays to cinematic living room centerpieces.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-700 hover:text-[#E50914] transition-colors group self-start sm:self-auto"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Responsive 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sizeOptions.map((item) => (
            <SizeCard key={item.size} item={item} onSelect={onSelectSize} />
          ))}
        </div>
      </div>
    </section>
  );
}
