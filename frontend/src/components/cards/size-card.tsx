'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export interface SizeOption {
  size: string;
  tagline: string;
  image: string;
  idealRoom: string;
  priceFrom: string;
}

interface SizeCardProps {
  item: SizeOption;
  onSelect?: (size: string) => void;
}

export function SizeCard({ item, onSelect }: SizeCardProps) {
  return (
    <div
      onClick={() => onSelect?.(item.size)}
      className="group relative bg-[#f8fafc] dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#E50914]/0 via-transparent to-[#E50914]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* TV Screen Display Mockup */}
      <div className="relative w-full aspect-[16/10] mb-6 rounded-lg overflow-hidden flex items-center justify-center p-2">
        <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
          <Image
            src={item.image}
            alt={`${item.size} Smart TV`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        </div>
      </div>

      {/* Card Details & Action Arrow */}
      <div className="pt-2 flex items-end justify-between border-t border-zinc-200/60 dark:border-zinc-800/80">
        <div>
          <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight group-hover:text-[#E50914] transition-colors">
            {item.size}
          </span>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
            {item.tagline}
          </p>
          <span className="text-[11px] font-semibold text-zinc-400 mt-1 block">
            From {item.priceFrom}
          </span>
        </div>

        {/* Round Arrow Button matching reference image */}
        <div className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 group-hover:bg-[#E50914] group-hover:text-white group-hover:border-[#E50914] transition-all duration-300 shadow-sm group-hover:scale-110">
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}
