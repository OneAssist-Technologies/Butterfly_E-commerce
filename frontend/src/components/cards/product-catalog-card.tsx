'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Heart, Tv, ShieldCheck, Volume2, ShoppingBag, Check } from 'lucide-react';
import { TVProduct } from './product-card';
import { useCart } from '@/providers';

export interface CatalogCardProps {
  product: TVProduct & {
    buttonLabel?: 'View Details →' | 'Enquire Now' | string;
    technicalSpecs?: any;
  };
  onViewDetails: (product: TVProduct) => void;
  onEnquire?: (product: TVProduct) => void;
  onAddToCart?: (product: TVProduct) => void;
}

export function ProductCatalogCard({
  product,
  onViewDetails,
  onEnquire,
  onAddToCart,
}: CatalogCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, openCart } = useCart();

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const specs = product.technicalSpecs;
  const memoryTag = specs?.ram && specs?.storageRom ? `${specs.ram} / ${specs.storageRom}` : null;

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group relative bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
    >
      {/* Top Row: Badge on Left, Memory / Wishlist on Right */}
      <div className="flex items-center justify-between mb-2 min-h-[28px] gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
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
          ) : null}

          {memoryTag && (
            <span className="text-[10px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
              {memoryTag}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className="p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer shrink-0"
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
            loading="eager"
            priority={true}
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
          <span className="truncate">{specs?.panelType || product.resolution}</span>
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
        <div className="mb-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
            {product.price}
          </span>
          {product.originalPrice && product.originalPrice !== product.price && (
            <span className="text-xs text-zinc-400 line-through">
              {product.originalPrice}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs active:scale-[0.98] ${
            isAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-[#E50914] text-white hover:bg-[#c70811]'
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
