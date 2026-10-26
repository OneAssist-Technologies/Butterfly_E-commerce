'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Volume2,
  Tv,
  Eye,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface HeroSlide {
  id: number;
  tag: string;
  titleNormal: string;
  titleHighlight: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  image: string;
  badgeResolution: string;
  quote: string;
  features: {
    icon: React.ReactNode;
    title: string;
    sub: string;
  }[];
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: 'BUTTERFLY SMART TV',
    titleNormal: 'Brighter Colours.',
    titleHighlight: 'Smarter Living.',
    description:
      'Experience stunning visuals, immersive sound and smart features — all in one.',
    primaryCtaText: 'Explore Our TVs',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Enquire Now',
    secondaryCtaLink: '/products',
    image: '/hero_tv_showroom.jpg',
    badgeResolution: '4K UHD',
    quote: 'Designed for a better tomorrow',
    features: [
      {
        icon: (
          <span className="font-black text-xs px-1.5 py-0.5 rounded border border-zinc-500 bg-black/40 text-white">
            4K
          </span>
        ),
        title: '4K UHD',
        sub: 'Resolution',
      },
      {
        icon: <Volume2 className="w-5 h-5 text-zinc-300" />,
        title: 'Dolby Audio',
        sub: 'Immersive Sound',
      },
      {
        icon: <Tv className="w-5 h-5 text-zinc-300" />,
        title: 'Android TV',
        sub: 'Certified OS',
      },
      {
        icon: <Eye className="w-5 h-5 text-zinc-300" />,
        title: 'Wide Viewing',
        sub: '178° Angle',
      },
    ],
  },
  {
    id: 2,
    tag: 'FLAGSHIP OLED SERIES',
    titleNormal: 'Cinematic Brilliance.',
    titleHighlight: 'Infinite Contrast.',
    description:
      'Quantum Dot technology and Dolby Atmos for an uncompromised theatrical experience in your living room.',
    primaryCtaText: 'View 65" Flagship',
    primaryCtaLink: '/products?size=65%22',
    secondaryCtaText: 'About Butterfly',
    secondaryCtaLink: '/about',
    image: '/hero_tv_sunset.jpg',
    badgeResolution: 'OLED 4K',
    quote: 'Engineered for pure immersion',
    features: [
      {
        icon: <Sparkles className="w-5 h-5 text-white" />,
        title: 'Quantum Dot',
        sub: '1 Billion Colors',
      },
      {
        icon: <Volume2 className="w-5 h-5 text-zinc-300" />,
        title: 'Dolby Atmos',
        sub: '3D Spatial Audio',
      },
      {
        icon: <Layers className="w-5 h-5 text-zinc-300" />,
        title: '120Hz VRR',
        sub: 'Smooth Gaming',
      },
      {
        icon: <Tv className="w-5 h-5 text-zinc-300" />,
        title: 'Google TV',
        sub: 'Hands-free Voice',
      },
    ],
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className="relative bg-[#070b12] text-white overflow-hidden min-h-[520px] sm:min-h-[640px] lg:min-h-[740px] flex items-center select-none"
    >
      {/* 1. Full-bleed Living Room Photography with Smooth Cross-fade */}
      {HERO_SLIDES.map((s, idx) => {
        const isActive = currentSlide === idx;
        return (
          <div
            key={s.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={s.image}
              alt={s.titleNormal}
              fill
              priority={idx <= 1}
              sizes="100vw"
              className={`object-cover object-right md:object-center transition-transform duration-7000 ease-out ${
                isActive ? 'scale-105' : 'scale-100'
              }`}
            />

            {/* Left ambient dark gradient overlay so text is crisp and blends into living room wall */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070b12] via-[#070b12]/85 md:via-[#070b12]/65 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b12]/90 via-transparent to-[#070b12]/30 z-10" />

            {/* 4K UHD Badge overlay on the TV screen (top right area of TV) */}
            <div className="hidden lg:flex absolute top-16 right-16 sm:right-24 z-20 bg-black/60 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-lg items-center gap-1.5 shadow-xl">
              <span className="text-xs font-black tracking-wider text-white">
                {s.badgeResolution}
              </span>
            </div>
          </div>
        );
      })}

      {/* 2. Left Hero Content: Headline, CTAs, Feature Badges with Smooth Dissolve */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24 w-full relative z-20">
        <div className="max-w-xl lg:max-w-2xl relative">
          {HERO_SLIDES.map((s, idx) => {
            const isActive = currentSlide === idx;
            return (
              <div
                key={s.id}
                aria-hidden={!isActive}
                className={`transition-all duration-700 ease-in-out ${
                  isActive
                    ? 'opacity-100 translate-y-0 relative z-10 pointer-events-auto'
                    : 'opacity-0 -translate-y-1.5 absolute inset-0 z-0 pointer-events-none'
                } space-y-4 sm:space-y-6 lg:space-y-8`}
              >
                {/* Subheading with red dash */}
                <div className="inline-flex items-center gap-2">
                  <span className="h-0.5 w-6 bg-[#E50914]" />
                  <span className="text-xs font-bold tracking-[0.2em] text-zinc-300 uppercase">
                    {s.tag}
                  </span>
                </div>

                {/* Main Title */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
                  <span className="block text-white">
                    {s.titleNormal}
                  </span>
                  <span className="block text-[#E50914] drop-shadow-[0_0_25px_rgba(229,9,20,0.5)]">
                    {s.titleHighlight}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-base text-zinc-200 max-w-lg leading-relaxed font-normal">
                  {s.description}
                </p>

                {/* CTA Buttons: 1 by 1 on mobile screens with reduced width; next to next on other screens */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 pt-2">
                  <Link
                    href={s.primaryCtaLink}
                    className="group inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#E50914] text-white text-xs sm:text-sm font-semibold tracking-wide hover:bg-[#c70811] shadow-[0_4px_16px_rgba(229,9,20,0.35)] hover:shadow-[0_6px_22px_rgba(229,9,20,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-auto"
                  >
                    <span>{s.primaryCtaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href={s.secondaryCtaLink}
                    className="inline-flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border border-zinc-700 bg-zinc-900/70 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold tracking-wide transition-all duration-200 hover:border-zinc-500 w-auto"
                  >
                    {s.secondaryCtaText}
                  </Link>
                </div>

                {/* 4 Feature Badges in a horizontal row right below CTAs */}
                <div className="pt-4 sm:pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-xl">
                  {s.features.map((feat, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-start p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
                    >
                      <div className="mb-2 text-zinc-300">{feat.icon}</div>
                      <span className="text-xs font-bold text-white tracking-tight">
                        {feat.title}
                      </span>
                      <span className="text-[10px] text-zinc-300 font-medium">
                        {feat.sub}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Bottom Right Quote Badge */}
        <div className="hidden md:flex absolute bottom-8 right-8 lg:right-12 items-center gap-3 bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl shadow-2xl z-20">
          <span className="w-1 h-5 bg-[#E50914] rounded-full" />
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">
            {slide.quote}
          </span>
        </div>

        {/* 4. Carousel Dot Indicators */}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 transition-all duration-500 rounded-full cursor-pointer ${
                currentSlide === idx ? 'w-6 bg-[#E50914]' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
