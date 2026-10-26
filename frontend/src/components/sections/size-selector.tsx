'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SizeCard, SizeOption } from '@/components/cards/size-card';
import { ArrowRight, Layers } from 'lucide-react';
import { productService } from '@/services/product.service';

import { settingsService, SizeSelectorCard } from '@/services/settings.service';

const BASE_SIZE_CONFIGS: { size: string; defaultTagline: string; defaultImage: string }[] = [
  { size: '32"', defaultTagline: 'Compact & Smart', defaultImage: '/menu_tv_32.jpg' },
  { size: '43"', defaultTagline: 'Perfect for Every Home', defaultImage: '/menu_tv_43.jpg' },
  { size: '55"', defaultTagline: 'Bigger Screen, Bigger Joy', defaultImage: '/menu_tv_55.jpg' },
  { size: '65"', defaultTagline: 'The Ultimate Experience', defaultImage: '/menu_tv_65.jpg' },
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

    const loadData = async () => {
      try {
        // Fetch dynamic admin settings and products catalog in parallel
        const [settings, catalog] = await Promise.allSettled([
          settingsService.getSettings(),
          productService.getAll(),
        ]);

        if (!isMounted) return;

        // Dynamic settings cards configured from admin
        const adminCards: SizeSelectorCard[] =
          settings.status === 'fulfilled' && Array.isArray(settings.value?.sizeSelectorCards)
            ? settings.value.sizeSelectorCards
            : [];

        // Count models per size if catalog exists
        const counts: Record<string, number> = {};
        if (catalog.status === 'fulfilled' && Array.isArray(catalog.value)) {
          catalog.value.forEach((p) => {
            const s = p.size || p.screenSizeCategory;
            if (s) {
              counts[s] = (counts[s] || 0) + 1;
            }
          });
        }

        const updated = BASE_SIZE_CONFIGS.map((cfg) => {
          const matchingAdminCard = adminCards.find((c) => c.size === cfg.size);
          const count = counts[cfg.size];
          const dynamicTagline =
            matchingAdminCard?.tagline ||
            (count && count > 0
              ? `${count} Model${count > 1 ? 's' : ''} Available`
              : cfg.defaultTagline);

          const finalImage =
            matchingAdminCard?.image || cfg.defaultImage;

          return {
            size: cfg.size,
            tagline: dynamicTagline,
            image: finalImage,
            href: `/products?size=${encodeURIComponent(cfg.size)}`,
          };
        });

        setSizeOptions(updated);
      } catch {
        // Fallback already in place
      }
    };

    loadData();

    // Listen for live admin settings updates
    const handleSettingsUpdated = () => {
      loadData();
    };

    window.addEventListener('butterfly_settings_updated', handleSettingsUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('butterfly_settings_updated', handleSettingsUpdated);
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

        {/* Responsive Grid: 2x2 on mobile, 4-column on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {sizeOptions.map((item) => (
            <SizeCard key={item.size} item={item} onSelect={onSelectSize} />
          ))}
        </div>
      </div>
    </section>
  );
}
