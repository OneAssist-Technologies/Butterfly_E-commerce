'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Heart, Tv, ShieldCheck, Volume2 } from 'lucide-react';
import { TVProduct } from './product-card';

export interface CatalogCardProps {
  product: TVProduct & {
    buttonLabel?: 'View Details →' | 'Enquire Now' | string;
  };
  onViewDetails: (product: TVProduct) => void;
  onEnquire?: (product: TVProduct) => void;
}

export function ProductCatalogCard({
  product,
  onViewDetails,
  onEnquire,
}: CatalogCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.isFilledButton) {
      onViewDetails(product);
    } else {
      if (onEnquire) {
        onEnquire(product);
      } else {
        onViewDetails(product);
      }
    }
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Row: Badge on Left, Wishlist Heart on Right */}
      <div className="flex items-center justify-between mb-2 min-h-[28px]">
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

        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 ${
              isLiked
                ? 'fill-[#E50914] text-[#E50914] scale-110'
                : 'stroke-[1.6]'
            }`}
          />
        </button>
      </div>

      {/* TV Screen Display Mockup */}
      <div className="relative w-full aspect-[16/10] my-2 overflow-hidden flex items-center justify-center p-2">
        <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={true}
          />
        </div>
      </div>

      {/* Model & Name */}
      <div className="mt-2">
        <span className="text-sm font-bold text-zinc-900 uppercase tracking-tight block">
          {product.model}
        </span>
        <h3 className="text-xs text-zinc-500 font-medium mt-0.5">
          {product.name}
        </h3>
      </div>

      {/* Specs List with subtle icons */}
      <div className="my-3.5 space-y-1.5 text-xs text-zinc-600 border-t border-b border-zinc-100 py-2.5">
        <div className="flex items-center gap-2">
          <Tv className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span className="truncate">{product.resolution}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span className="truncate">{product.os}</span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span className="truncate">{product.sound}</span>
        </div>
      </div>

      {/* Price & CTA Button */}
      <div className="pt-1">
        <div className="mb-3">
          <span className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
            {product.price}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product);
          }}
          className="w-full py-2.5 px-4 rounded-lg bg-[#E50914] text-white hover:bg-[#c70811] text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
