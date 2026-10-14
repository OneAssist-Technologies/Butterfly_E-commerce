'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Tv, ShieldCheck, Volume2 } from 'lucide-react';

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
}: ProductCardProps) {
  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative bg-white border border-zinc-200/90 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
    >
      {/* Top row: Badge */}
      <div className="flex items-center justify-start mb-3 min-h-[26px]">
        {product.badge ? (
          <span
            className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              product.badge === 'Popular'
                ? 'bg-zinc-900 text-white'
                : 'bg-[#E50914] text-white'
            }`}
          >
            {product.badge}
          </span>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* TV Product Image Mockup */}
      <div className="relative w-full aspect-[16/10] my-2 overflow-hidden flex items-center justify-center p-2">
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
        <span className="text-sm font-bold text-zinc-900 uppercase tracking-tight block">
          {product.model}
        </span>
        <h3 className="text-xs text-zinc-500 font-medium mt-0.5">
          {product.name}
        </h3>
      </div>

      {/* Specs List with icons */}
      <div className="my-4 space-y-1.5 text-xs text-zinc-600 border-t border-b border-zinc-100 py-3">
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
          <span className="text-lg font-black text-zinc-900 tracking-tight">
            {product.price}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(product)}
          className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer bg-[#E50914] text-white hover:bg-[#c70811] shadow-xs hover:shadow-md"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
