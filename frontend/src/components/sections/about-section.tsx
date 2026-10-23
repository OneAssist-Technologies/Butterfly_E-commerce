'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about-section" className="relative bg-[#070b14] text-white overflow-hidden py-8 sm:py-10 lg:py-12">
      
      {/* Ambient background glow matching TV & neon sign */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-red-500/15 rounded-full blur-[120px] pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Division 1: Left Side Content */}
          <div className="lg:col-span-5 space-y-4 z-20 py-2 lg:py-4 animate-in fade-in slide-in-from-left duration-700">
            
            {/* Tagline */}
            <div className="inline-flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[#E50914]" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#E50914] uppercase">
                ABOUT BUTTERFLY
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              A Legacy of Quality, <br />
              <span className="text-zinc-200">A Vision for Tomorrow</span>
            </h2>

            {/* Description Paragraph */}
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal max-w-md">
              Butterfly Smart TV brings you innovative technology, reliable performance
              and elegant design. We are committed to making your home entertainment
              experience better, brighter and smarter.
            </p>

            {/* Outline Button */}
            <div className="pt-1">
              <a
                href="#size-selector"
                className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-zinc-600 bg-black/40 hover:bg-black/70 hover:border-zinc-400 text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                Learn More
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Division 2: Right Side Image with Seamless Left Edge Gradient Blend */}
          <div className="lg:col-span-7 relative w-full h-[240px] sm:h-[290px] lg:h-[340px] overflow-hidden rounded-none">
            
            {/* Image Container with CSS Mask Fade on the Left Edge */}
            <div
              className="relative w-full h-full"
              style={{
                maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,0.85) 28%, black 45%, black 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 12%, rgba(0,0,0,0.85) 28%, black 45%, black 100%)',
              }}
            >
              <Image
                src="/hero_tv.jpg"
                alt="Butterfly TV Interior Ambiance"
                fill
                className="object-cover object-center transform scale-100 hover:scale-102 transition-transform duration-1000 ease-out"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />

              {/* Extra gradient overlays for depth and seamless edge blending */}
              <div className="absolute inset-y-0 left-0 w-32 sm:w-44 bg-gradient-to-r from-[#070b14] via-[#070b14]/80 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#070b14] via-[#070b14]/50 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#070b14] via-[#070b14]/50 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#070b14] to-transparent pointer-events-none" />
            </div>

            {/* Glowing Neon Butterfly Art mounted on the wall to the right of the TV */}
            <div className="absolute top-4 sm:top-6 right-8 sm:right-14 lg:right-20 z-20 pointer-events-none animate-pulse-glow w-16 h-16">
              <Image
                src="/brand/butterfly-red.png"
                alt="Neon Butterfly Wall Sign"
                width={64}
                height={64}
                className="w-full h-full object-contain filter drop-shadow-[0_0_10px_#E50914] drop-shadow-[0_0_24px_#E50914]"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
