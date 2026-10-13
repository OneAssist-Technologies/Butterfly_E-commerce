'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Heart, Tv, Volume2, ShieldCheck, Check } from 'lucide-react';

export interface TVProduct {
  id: string;
  model: string;
  name: string;
  size: string;
  badge?: 'Best Seller' | 'Popular' | 'New';
  image: string;
  resolution: string;
  os: string;
  sound: string;
  price: string;
  numericPrice: number;
  isFilledButton?: boolean;
}

interface ProductCardProps {
  product: TVProduct;
  onViewDetails: (product: TVProduct) => void;
  onAddToCart?: (product: TVProduct) => void;
}

export function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
    >
      {/* Top row: Badge and Wishlist Heart */}
      <div className="flex items-center justify-between mb-4 min-h-[26px]">
        {product.badge ? (
          <span
            className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              product.badge === 'Popular'
                ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-200'
                : 'bg-[#E50914] text-white shadow-sm'
            }`}
          >
            {product.badge}
          </span>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsWishlisted(!isWishlisted);
          }}
          aria-label="Wishlist"
          className="p-1.5 rounded-full text-zinc-400 hover:text-[#E50914] transition-colors hover:scale-110 active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#E50914] text-[#E50914]' : ''
            }`}
          />
        </button>
      </div>

      {/* TV Product Image Mockup */}
      <div className="relative w-full aspect-[16/10] my-3 overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
      </div>

      {/* Product Titles */}
      <div className="mt-3">
        <span className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight block">
          {product.model}
        </span>
        <h3 className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
          {product.name}
        </h3>
      </div>

      {/* Specs List with mini bullet icons */}
      <div className="my-4 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 border-t border-b border-zinc-100 dark:border-zinc-800/80 py-3">
        <div className="flex items-center gap-2">
          <Tv className="w-3.5 h-3.5 text-zinc-400" />
          <span>{product.resolution}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span>{product.os}</span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>{product.sound}</span>
        </div>
      </div>

      {/* Price & CTA Button */}
      <div className="pt-1">
        <div className="mb-3">
          <span className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
            {product.price}
          </span>
          <span className="text-[11px] text-zinc-400 block">Inclusive of all taxes</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(product)}
            className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
              product.isFilledButton
                ? 'bg-[#E50914] text-white hover:bg-[#c70811] shadow-sm hover:shadow-md'
                : 'border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-400'
            }`}
          >
            View Details
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Quick Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label="Add to cart"
            className="p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-[#E50914] hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-600 dark:text-zinc-300 hover:text-[#E50914] transition-all cursor-pointer"
          >
            {isAdded ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <span className="text-[11px] font-bold">+1</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
