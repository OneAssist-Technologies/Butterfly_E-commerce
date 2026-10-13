'use client';

import React from 'react';
import Image from 'next/image';
import { TVProduct } from '@/components/cards/product-card';
import { X, Check, ShoppingBag, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

interface ProductModalProps {
  product: TVProduct | null;
  onClose: () => void;
  onAddToCart: (product: TVProduct) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* TV Image Display */}
          <div className="relative aspect-[16/10] bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-4 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-2"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              {product.badge && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#E50914] text-white uppercase tracking-wider inline-block mb-2">
                  {product.badge}
                </span>
              )}
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {product.model}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {product.name}
              </p>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300 py-2 border-t border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-400">Resolution</span>
                <span className="font-semibold">{product.resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Operating System</span>
                <span className="font-semibold">{product.os}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Audio Output</span>
                <span className="font-semibold">{product.sound}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Connectivity</span>
                <span className="font-semibold">Wi-Fi, Bluetooth 5.0, 3x HDMI</span>
              </div>
            </div>

            {/* Price & Action */}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  {product.price}
                </span>
                <span className="text-xs text-emerald-600 font-bold">Special Offer</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">Free standard installation included</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#E50914] text-white font-semibold text-xs tracking-wide hover:bg-[#c70811] shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>

              <button
                onClick={onClose}
                className="py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
