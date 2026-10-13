'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Award, Cpu, ShieldCheck } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about-section" className="py-20 lg:py-28 bg-[#0b0f17] text-white relative overflow-hidden">
      
      {/* Ambient background glow & neon aura */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-red-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Brand Story */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#E50914]" />
              <span className="text-xs font-bold tracking-[0.2em] text-[#E50914] uppercase">
                ABOUT BUTTERFLY
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              A Legacy of Quality, <br />
              <span className="text-zinc-300">A Vision for Tomorrow</span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
              Butterfly Smart TV brings you innovative technology, reliable performance
              and elegant design. We are committed to making your home entertainment
              experience better, brighter and smarter.
            </p>

            {/* Pillar highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
              <div>
                <div className="flex items-center gap-1.5 text-red-500 mb-1">
                  <Cpu className="w-4 h-4" />
                  <span className="font-bold text-xs text-white">Advanced Engine</span>
                </div>
                <p className="text-[11px] text-zinc-400">Quad-core 64-bit processors</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-red-500 mb-1">
                  <Award className="w-4 h-4" />
                  <span className="font-bold text-xs text-white">Grade A+ Panel</span>
                </div>
                <p className="text-[11px] text-zinc-400">Zero dead pixel warranty</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-red-500 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-bold text-xs text-white">Trust &amp; Service</span>
                </div>
                <p className="text-[11px] text-zinc-400">Trusted in 2M+ Indian homes</p>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#size-selector"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-500 text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200"
              >
                Learn More
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Right Column: Scene with TV and Neon Butterfly on Wall */}
          <div className="lg:col-span-6 relative">
            
            {/* TV Image Setup */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <Image
                src="/hero_tv.jpg"
                alt="Butterfly TV Interior Ambiance"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17]/80 via-transparent to-transparent" />
            </div>

            {/* Glowing Neon Butterfly Sign floating top-right (matching reference image) */}
            <div className="absolute -top-6 -right-4 sm:-right-6 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/60 backdrop-blur-xl border border-red-500/40 p-4 shadow-[0_0_35px_rgba(229,9,20,0.6)] animate-pulse-glow flex items-center justify-center">
              <Image
                src="/brand/butterfly-red.png"
                alt="Neon Butterfly"
                width={80}
                height={80}
                className="object-contain filter drop-shadow-[0_0_15px_#E50914]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
