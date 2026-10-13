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
    secondaryCtaLink: '#contact',
    image: '/hero_tv.jpg',
    badgeResolution: '4K UHD',
    quote: 'Designed for a better tomorrow',
    features: [
      {
        icon: (
          <span className="font-extrabold text-xs px-1.5 py-0.5 rounded border border-zinc-600 bg-zinc-900/80">
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
    image: '/hero_tv_2.jpg',
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
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      className="relative bg-[#0b0f17] text-white overflow-hidden min-h-[640px] lg:min-h-[720px] flex items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient light glow matching TV colors */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none -z-0"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none -z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Text, CTAs, Feature Pills */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-left duration-700">
            
            {/* Tagline */}
            <div className="inline-flex items-center gap-2">
              <span className="h-0.5 w-6 bg-[#E50914]"></span>
              <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
                {slide.tag}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              <span className="block text-white transition-opacity duration-500">
                {slide.titleNormal}
              </span>
              <span className="block text-[#E50914] drop-shadow-[0_0_25px_rgba(229,9,20,0.4)]">
                {slide.titleHighlight}
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-zinc-300 max-w-lg leading-relaxed font-normal">
              {slide.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={slide.primaryCtaLink}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#E50914] text-white text-sm font-semibold tracking-wide hover:bg-[#c70811] shadow-[0_4px_20px_rgba(229,9,20,0.4)] hover:shadow-[0_6px_25px_rgba(229,9,20,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                {slide.primaryCtaText}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href={slide.secondaryCtaLink}
                className="inline-flex items-center px-7 py-3.5 rounded-full border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/80 text-white text-sm font-semibold tracking-wide transition-all duration-200 hover:border-zinc-500"
              >
                {slide.secondaryCtaText}
              </a>
            </div>

            {/* Feature Highlights Grid */}
            <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {slide.features.map((feat, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start p-2 rounded-lg hover:bg-white/5 transition-colors duration-200 cursor-default"
                >
                  <div className="mb-2 text-zinc-300">{feat.icon}</div>
                  <span className="text-xs font-semibold text-white tracking-tight">
                    {feat.title}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {feat.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: High-End TV Scene with Backlight & Badges */}
          <div className="lg:col-span-7 relative flex justify-center items-center">
            
            {/* Ambient backlight glow container */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-zinc-800/60 group">
              
              <Image
                src={slide.image}
                alt={slide.titleNormal}
                fill
                priority
                className="object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />

              {/* 4K UHD Badge overlay top right on TV */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                <span className="text-xs font-black tracking-wider text-white">
                  {slide.badgeResolution}
                </span>
              </div>

              {/* Bottom gradient fade for cinematic depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-transparent to-transparent opacity-40"></div>
            </div>

            {/* Bottom-right quote with red vertical accent */}
            <div className="hidden sm:flex absolute -bottom-5 right-4 items-center gap-3 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-lg shadow-xl">
              <span className="w-1 h-5 bg-[#E50914] rounded-full"></span>
              <span className="text-xs font-medium text-zinc-300 tracking-wide">
                {slide.quote}
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Bottom Navigation Controls */}
        <div className="mt-8 pt-4 flex items-center justify-between">
          
          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full h-2 ${
                  currentSlide === idx
                    ? 'w-8 bg-[#E50914]'
                    : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>

          {/* Left / Right Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="p-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
