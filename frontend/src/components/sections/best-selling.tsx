'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard, TVProduct } from '@/components/cards/product-card';
import { ArrowRight, Sparkles } from 'lucide-react';
import { productService } from '@/services/product.service';

interface BestSellingProps {
  onViewDetails: (product: TVProduct) => void;
  onAddToCart?: (product: TVProduct) => void;
  selectedFilterSize?: string | null;
}

export function BestSelling({
  onViewDetails,
  onAddToCart,
  selectedFilterSize,
}: BestSellingProps) {
  const [products, setProducts] = useState<TVProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLiveFeaturedProducts = async () => {
    try {
      const liveCatalog = await productService.getAll();
      if (Array.isArray(liveCatalog) && liveCatalog.length > 0) {
        // Filter in-stock products
        let candidates = liveCatalog.filter((p) => p.inStock !== false);

        // Filter by size if filter is active
        if (selectedFilterSize) {
          candidates = candidates.filter(
            (p) =>
              p.size === selectedFilterSize ||
              p.screenSizeCategory === selectedFilterSize
          );
        }

        // Sort by featuredRank (lowest first), fallback to price or order
        candidates.sort((a, b) => {
          const rankA = typeof a.featuredRank === 'number' ? a.featuredRank : 99;
          const rankB = typeof b.featuredRank === 'number' ? b.featuredRank : 99;
          return rankA - rankB;
        });

        // Map live catalog item to TVProduct
        const mapped: TVProduct[] = candidates.slice(0, 4).map((p, idx) => ({
          id: p.id,
          model: p.model,
          name: p.name,
          size: p.size,
          badge:
            p.badge ||
            (idx === 0 ? 'Best Seller' : idx === 1 ? 'Popular' : idx === 2 ? 'New' : undefined),
          image: p.image || '/tv_art.jpg',
          resolution: p.resolution,
          os: p.os || p.smartOS || 'Google TV',
          sound: p.sound || '2 x 10W Stereo Speakers',
          price: p.price,
          numericPrice: p.numericPrice || p.priceNumber || 0,
          isFilledButton: idx === 0,
        }));

        setProducts(mapped);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.warn('[BestSelling] Failed to fetch live products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveFeaturedProducts();

    if (typeof window !== 'undefined') {
      window.addEventListener('butterfly_products_updated', fetchLiveFeaturedProducts);
      return () => {
        window.removeEventListener('butterfly_products_updated', fetchLiveFeaturedProducts);
      };
    }
  }, [selectedFilterSize]);

  return (
    <section id="best-selling" className="pt-6 lg:pt-8 pb-14 lg:pb-20 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Title and "View All Products ->" */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E50914] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FEATURED TELEVISIONS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              Our Best Selling TVs
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Top customer choices featuring 4K UHD clarity and smart Google TV features.
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

        {/* Dynamic Product Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs animate-pulse space-y-4"
              >
                <div className="w-full h-48 bg-slate-100 rounded-2xl" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-5 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="pt-2 flex items-center justify-between">
                  <div className="h-6 bg-slate-100 rounded w-1/3" />
                  <div className="h-9 bg-slate-100 rounded-xl w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewDetails}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
            <p className="text-sm text-slate-500 mb-3">No featured televisions available right now.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-colors"
            >
              Browse Full Catalog
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
