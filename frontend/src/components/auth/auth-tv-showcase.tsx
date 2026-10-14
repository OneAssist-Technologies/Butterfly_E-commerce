'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Volume2, Wifi } from 'lucide-react';

interface AuthTvShowcaseProps {
  tag?: string;
  title: string;
  subtitle: string;
}

export function AuthTvShowcase({
  tag = 'BUTTERFLY SMART TV',
  title,
  subtitle,
}: AuthTvShowcaseProps) {
  return (
    <div className="relative hidden md:flex md:col-span-6 xl:col-span-7 bg-zinc-950 flex-col justify-between p-8 lg:p-12 xl:p-14 overflow-hidden min-h-screen">
      {/* Background Luxury Room Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/products_hero.jpg"
          alt="Butterfly Smart TV Living Room"
          fill
          priority
          className="object-cover object-center scale-105"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {/* Dark acoustic slatted vignette overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-zinc-950/70" />
      </div>

      {/* Top Brand Tag */}
      <div className="relative z-10">
        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#E50914] bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-red-500/30 inline-block shadow-sm">
          {tag}
        </span>
      </div>

      {/* Center Stage: Title + Wall-Mounted TV with Original Logo on Screen and Under TV */}
      <div className="relative z-10 max-w-xl my-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
            {title}
          </h1>
          <p className="text-sm lg:text-base text-zinc-300 font-light mt-3 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Realistic Wall-Mounted TV Showcase */}
        <div className="pt-2">
          {/* Ambient backlight glow */}
          <div className="relative w-full max-w-md mx-auto aspect-[16/9] rounded-2xl p-2.5 bg-zinc-950 shadow-2xl border-2 border-zinc-700/80 ring-1 ring-white/10 group">
            {/* Ambient backlight aura */}
            <div className="absolute -inset-3 bg-gradient-to-r from-red-600/25 via-amber-500/15 to-blue-600/25 rounded-3xl blur-xl -z-10 opacity-75 group-hover:opacity-100 transition-opacity duration-500" />

            {/* TV Screen Display */}
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center p-6 shadow-inner">
              {/* Vibrant Cinematic Display Background */}
              <Image
                src="/tv_lake.jpg"
                alt="Display Ambient"
                fill
                priority
                className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                sizes="500px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/70" />

              {/* ORIGINAL BUTTERFLY LOGO ON TV DISPLAY SCREEN */}
              <div className="relative z-10 flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <div className="relative h-10 sm:h-12 w-48 sm:w-56 drop-shadow-[0_4px_24px_rgba(255,255,255,0.5)]">
                  <Image
                    src="/brand/butterfly-wordmark-white.png"
                    alt="Butterfly Official Logo"
                    fill
                    sizes="224px"
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-[10px] font-black tracking-[0.3em] text-white/95 uppercase mt-1.5 drop-shadow-md">
                  SMART TV
                </span>
              </div>

              {/* Glossy screen glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            </div>
          </div>

          {/* ORIGINAL BUTTERFLY LOGO UNDER THE TV */}
          <div className="mt-3.5 flex items-center justify-center gap-3">
            <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-zinc-600" />
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-zinc-700/80 shadow-lg">
              <div className="relative h-4 sm:h-5 w-20 sm:w-24">
                <Image
                  src="/brand/butterfly-wordmark-white.png"
                  alt="Butterfly Logo Inscription"
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <div className="border-l border-zinc-600 pl-2">
                <span className="text-[8px] font-black tracking-widest text-zinc-300 uppercase block leading-none">
                  SMART TV
                </span>
              </div>
            </div>
            <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-zinc-600" />
          </div>
        </div>
      </div>

      {/* Bottom Feature Badges */}
      <div className="relative z-10 grid grid-cols-3 gap-4 pt-5 border-t border-white/10 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-[#E50914] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold">Vivid Picture</span>
            <span className="text-[10px] text-zinc-400">4K &amp; HDR10</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-[#E50914] flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold">Immersive Sound</span>
            <span className="text-[10px] text-zinc-400">Dolby Audio</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-[#E50914] flex items-center justify-center flex-shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-xs font-bold">Smart Connection</span>
            <span className="text-[10px] text-zinc-400">Android &amp; Google TV</span>
          </div>
        </div>
      </div>
    </div>
  );
}
