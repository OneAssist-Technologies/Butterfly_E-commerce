'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface SizeOption {
  size: string;
  tagline: string;
  image: string;
  href?: string;
}

interface SizeCardProps {
  item: SizeOption;
  onSelect?: (size: string) => void;
}

export function SizeCard({ item, onSelect }: SizeCardProps) {
  const targetHref = item.href || `/products?size=${encodeURIComponent(item.size)}`;
  const [imgSrc, setImgSrc] = React.useState<string>(item.image);

  React.useEffect(() => {
    setImgSrc(item.image);
  }, [item.image]);

  const isDataOrExternal = imgSrc?.startsWith('data:') || imgSrc?.startsWith('http');

  return (
    <div
      onClick={() => onSelect?.(item.size)}
      className="group relative bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden block shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] w-full"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#E50914]/0 via-transparent to-[#E50914]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* TV Screen Mockup Display with fixed 16:10 aspect ratio */}
      <div className="relative w-full aspect-[16/10] mb-2 sm:mb-5 rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center p-1 sm:p-2 bg-slate-50/60">
        <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
          <Image
            src={imgSrc || '/menu_tv_32.jpg'}
            alt={`${item.size} Smart TV`}
            fill
            loading="eager"
            priority={true}
            unoptimized={isDataOrExternal}
            onError={() => {
              // fallback to working local TV photo if broken
              const fallbackMap: Record<string, string> = {
                '32"': '/menu_tv_32.jpg',
                '43"': '/menu_tv_43.jpg',
                '55"': '/menu_tv_55.jpg',
                '65"': '/menu_tv_65.jpg',
              };
              setImgSrc(fallbackMap[item.size] || '/menu_tv_32.jpg');
            }}
            className="object-contain"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
          />
        </div>
      </div>

      {/* Card Details: Size, Tagline, Round Arrow Button */}
      <div className="pt-1.5 sm:pt-2 flex items-center justify-between border-t border-zinc-200/70 gap-1.5">
        <div className="min-w-0">
          <span className="text-base sm:text-2xl font-black text-zinc-900 tracking-tight group-hover:text-[#E50914] transition-colors block">
            {item.size}
          </span>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-medium mt-0.5 line-clamp-1">
            {item.tagline}
          </p>
        </div>

        {/* Round Arrow Button matching reference design */}
        <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 group-hover:bg-[#E50914] group-hover:text-white group-hover:border-[#E50914] transition-all duration-300 shadow-sm group-hover:scale-105 flex-shrink-0">
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
      </div>
    </div>
  );
}
