'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Volume2,
  Tv,
  Eye,
  Sparkles,
  ChevronLeft,
  ChevronRight,
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
    primaryCtaLink: '#size-selector',
    secondaryCtaText: 'Enquire Now',
    secondaryCtaLink: '#best-selling',
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
    primaryCtaLink: '#best-selling',
    secondaryCtaText: 'Watch Demo',
    secondaryCtaLink: '#about-section',
    image: '/hero_tv_sunset.jpg',
    badgeResolution: 'OLED 4K',
    quote: 'Engineered for pure immersion',
    features: [
      {
        icon: <Sparkles className="w-5 h-5 text-amber-400" />,
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

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 8000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      className="relative bg-[#070b12] text-white overflow-hidden min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] flex items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Full-bleed Living Room Photography with Smooth Cross-fade */}
      {HERO_SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            currentSlide === idx ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
          }`}
        >
          <Image
            src={s.image}
            alt={s.titleNormal}
            fill
            priority={idx === 0}
            className="object-cover object-right md:object-center transform scale-100 transition-transform duration-10000 ease-out"
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
      ))}

      {/* 2. Left Hero Content: Headline, CTAs, Feature Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full relative z-20">
        <div className="max-w-xl lg:max-w-2xl space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-left duration-700">
          
          {/* Subheading with red dash */}
          <div className="inline-flex items-center gap-2">
            <span className="h-0.5 w-6 bg-[#E50914]" />
            <span className="text-xs font-bold tracking-[0.2em] text-zinc-300 uppercase">
              {slide.tag}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
            <span className="block text-white">
              {slide.titleNormal}
            </span>
            <span className="block text-[#E50914] drop-shadow-[0_0_25px_rgba(229,9,20,0.5)]">
              {slide.titleHighlight}
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base text-zinc-200 max-w-lg leading-relaxed font-normal">
            {slide.description}
          </p>

          {/* CTA Buttons matching reference design */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href={slide.primaryCtaLink}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#E50914] text-white text-sm font-semibold tracking-wide hover:bg-[#c70811] shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:shadow-[0_6px_25px_rgba(229,9,20,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {slide.primaryCtaText}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>

            <a
              href={slide.secondaryCtaLink}
              className="inline-flex items-center px-8 py-3.5 rounded-full border border-white/30 bg-black/40 backdrop-blur-sm hover:bg-white/10 text-white text-sm font-semibold tracking-wide transition-all duration-200"
            >
              {slide.secondaryCtaText}
            </a>
          </div>

          {/* 4 Feature Badges in a horizontal row right below CTAs */}
          <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
            {slide.features.map((feat, index) => (
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

        {/* 3. Bottom Right Quote Badge matching reference design */}
        <div className="hidden md:flex absolute bottom-8 right-8 lg:right-12 items-center gap-3 bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl shadow-2xl z-20">
          <span className="w-1 h-5 bg-[#E50914] rounded-full" />
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">
            {slide.quote}
          </span>
        </div>

        {/* 4. Carousel Dot & Arrow Controls */}
        <div className="mt-8 pt-4 flex items-center justify-between max-w-xl relative z-20">
          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full h-2 cursor-pointer ${
                  currentSlide === idx
                    ? 'w-8 bg-[#E50914]'
                    : 'w-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>

          {/* Left / Right Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-zinc-200 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-zinc-200 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
