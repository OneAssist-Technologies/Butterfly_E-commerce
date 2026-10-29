'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Tv, ShieldCheck, Volume2, ShoppingBag, Check, Cpu } from 'lucide-react';
import { useCart } from '@/providers';

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
  originalPrice?: string;
  originalNumericPrice?: number;
  isFilledButton?: boolean;
  isTopSelling?: boolean;
  technicalSpecs?: any;
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
  const [imgSrc, setImgSrc] = React.useState(product.image || '/menu_tv_43.jpg');
  const [isAdded, setIsAdded] = useState(false);
  const { addToCart, openCart } = useCart();

  React.useEffect(() => {
    setImgSrc(product.image || '/menu_tv_43.jpg');
  }, [product.image]);

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
      className="group relative bg-white border border-slate-200/90 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
    >
      {/* Top row: Badge and Inclusions */}
      <div className="flex items-center justify-between mb-3 min-h-[26px] gap-2">
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

        {memoryTag && (
          <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
            {memoryTag}
          </span>
        )}
      </div>

      {/* TV Product Image Mockup */}
      <div className="relative w-full aspect-[16/10] my-2 overflow-hidden flex items-center justify-center p-2">
        <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            loading="eager"
            priority={true}
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 25vw"
            unoptimized={true}
            onError={() => setImgSrc('/menu_tv_43.jpg')}
          />
        </div>
      </div>

      {/* Product Titles */}
      <div className="mt-3">
        <h3 className="text-sm font-bold text-zinc-900 tracking-tight line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-zinc-500 font-medium mt-0.5">
          {product.size} Display
        </p>
      </div>

      {/* Specs List with icons */}
      <div className="my-4 space-y-1.5 text-xs text-zinc-600 border-t border-b border-zinc-100 py-3">
        <div className="flex items-center gap-2">
          <Tv className="w-3.5 h-3.5 text-zinc-400" />
          <span className="truncate">{specs?.panelType || product.resolution}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span className="truncate">{product.os}</span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
          <span className="truncate">{product.sound}</span>
        </div>
      </div>

      {/* Price & CTA Button */}
      <div className="pt-1">
        <div className="mb-3 flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-black text-zinc-900 tracking-tight">
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
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.98] ${
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
