'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface MegaMenuItem {
  id: string;
  title: string;
  badge?: string;
  tag?: string;
  image: string;
  href: string;
  isLaser?: boolean;
  subtitle: string;
  standType?: 'laser' | 'center' | 'feet';
}

export const MEGA_MENU_ITEMS: MegaMenuItem[] = [
  {
    id: 'rgb-miniled',
    title: 'RGB MiniLED',
    badge: '144Hz PRO',
    tag: 'New',
    image: '/menu_tv_65.jpg',
    href: '/products?q=MiniLED',
    standType: 'feet',
    subtitle: 'Quantum Color Wave',
  },
  {
    id: 'mini-led',
    title: 'Mini-LED TV',
    badge: '1000 NITS',
    image: '/menu_tv_50.jpg',
    href: '/products?q=Mini-LED',
    standType: 'center',
    subtitle: 'Full Array Dimming',
  },
  {
    id: 'qled-tv',
    title: 'QLED 4K',
    badge: 'QUANTUM DOT',
    tag: 'Popular',
    image: '/menu_tv_55.jpg',
    href: '/products?q=QLED',
    standType: 'feet',
    subtitle: 'Dolby Vision & Atmos',
  },
  {
    id: 'uhd-tv',
    title: '4K UHD TV',
    badge: 'ULTRA HD',
    tag: 'Best Seller',
    image: '/menu_tv_43.jpg',
    href: '/products?resolution=4K%20UHD',
    standType: 'feet',
    subtitle: 'AI Picture Clarity',
  },
  {
    id: 'smart-tv',
    title: 'Smart TV',
    badge: 'FHD SMART',
    image: '/menu_tv_32.jpg',
    href: '/products?resolution=Full%20HD',
    standType: 'feet',
    subtitle: 'Android & Google TV',
  },
];

interface ProductsMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function ProductsMegaMenu({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: ProductsMegaMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-t border-b border-zinc-200/90 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {MEGA_MENU_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className="group relative flex flex-col items-center justify-between p-3.5 rounded-xl transition-all duration-300 bg-white hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer overflow-hidden"
            >
              {/* Top Accent Hover Indicator (Butterfly Red) */}
              <div className="absolute top-0 left-3 right-3 h-[2px] bg-[#E50914] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />

              {/* TV Mockup Container */}
              <div className="w-full flex flex-col items-center justify-center my-auto pt-1 pb-2">
                {/* Screen Bezel */}
                <div className="relative w-full aspect-[16/9.5] rounded-xs overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-md border-[2px] border-zinc-900 bg-black group-hover:ring-2 group-hover:ring-[#E50914]/30">
                  {/* Screen Display Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                      className="object-cover transition-opacity duration-300"
                    />

                    {/* Dark Vignette Overlay for Crisp Typography */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

                    {/* On-screen Promotional Badges */}
                    <div className="absolute inset-0 p-1.5 flex flex-col justify-between text-white pointer-events-none select-none">
                      <div className="flex items-start justify-between gap-1">
                        <span className="bg-black/70 backdrop-blur-xs text-white text-[8px] font-bold px-1.5 py-0.5 rounded-xs leading-none drop-shadow-md">
                          {item.badge}
                        </span>
                        {item.tag && (
                          <span className="bg-[#E50914] text-white text-[7px] font-extrabold px-1.5 py-0.5 rounded-xs uppercase leading-none shadow-sm">
                            {item.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stand / Base Unit */}
                {item.standType === 'laser' ? (
                  // Laser TV Projector Console Unit with Red Optical Accent
                  <div className="flex flex-col items-center mt-1.5 w-full">
                    <div className="w-16 h-3 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-xs shadow-md border border-zinc-700/60 flex items-center justify-center relative">
                      <div className="w-6 h-0.5 bg-[#E50914] rounded-full shadow-[0_0_8px_#E50914] animate-pulse" />
                    </div>
                    <span className="text-[7.5px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5 group-hover:text-[#E50914] transition-colors">
                      Laser Console
                    </span>
                  </div>
                ) : item.standType === 'center' ? (
                  // Center Pedestal Stand
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 bg-zinc-800 -mt-0.5" />
                    <div className="w-12 h-1 bg-zinc-800 rounded-xs shadow-xs" />
                  </div>
                ) : (
                  // Dual Slim Angled Feet Stand
                  <div className="w-full flex justify-between px-3 -mt-0.5">
                    <div className="w-1.5 h-2 bg-zinc-800 rounded-b-xs rotate-[-12deg]" />
                    <div className="w-1.5 h-2 bg-zinc-800 rounded-b-xs rotate-[12deg]" />
                  </div>
                )}
              </div>

              {/* Title & Subtitle in Butterfly Theme */}
              <div className="pt-2 text-center w-full">
                <span className="block text-xs sm:text-sm font-bold text-zinc-900 group-hover:text-[#E50914] tracking-tight transition-colors duration-200">
                  {item.title}
                </span>
                <span className="block text-[10.5px] text-zinc-500 group-hover:text-zinc-700 font-medium tracking-tight truncate mt-0.5 transition-colors">
                  {item.subtitle}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Sub-Bar with Quick Size Filters & View All */}
      <div className="border-t border-zinc-200/80 bg-zinc-50/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 sm:gap-3 text-zinc-600 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
              Popular Sizes:
            </span>
            <Link
              href="/products?size=32%22"
              onClick={onClose}
              className="hover:text-[#E50914] font-medium transition-colors"
            >
              32" Compact
            </Link>
            <span className="text-zinc-300">•</span>
            <Link
              href="/products?size=43%22"
              onClick={onClose}
              className="hover:text-[#E50914] font-medium transition-colors"
            >
              43" Living Room
            </Link>
            <span className="text-zinc-300">•</span>
            <Link
              href="/products?size=55%22"
              onClick={onClose}
              className="hover:text-[#E50914] font-medium transition-colors"
            >
              55" Home Theater
            </Link>
            <span className="text-zinc-300">•</span>
            <Link
              href="/products?size=65%22"
              onClick={onClose}
              className="hover:text-[#E50914] font-medium transition-colors"
            >
              65" Cinema Flagship
            </Link>
          </div>

          <Link
            href="/products"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 font-bold text-[#E50914] hover:text-[#b80710] transition-colors py-0.5"
          >
            Explore All Smart TVs
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
