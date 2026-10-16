'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin,
  Target,
  Eye,
  Gem,
  Tv,
  Volume2,
  Cpu,
  ShieldCheck,
  Leaf,
  Heart,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      
      {/* 1. HERO SECTION (Dark Ambient Living Room with TV) */}
      <section className="relative bg-[#070b12] text-white pt-6 pb-20 overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-radial-at-c from-zinc-900/60 via-[#070b12] to-[#070b12] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-zinc-200 font-medium">About Us</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-block text-xs font-black tracking-widest text-[#E50914] uppercase">
                ABOUT US
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Bringing the World <br />
                <span className="text-white">Closer to Your Home</span>
              </h1>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Butterfly Smart TV is more than just a television brand. We are a Coimbatore-based company committed to delivering innovative, high-quality and affordable smart TVs for every home.
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E50914] hover:bg-[#c70811] text-white text-sm font-bold shadow-lg shadow-red-900/30 hover:scale-105 transition-all"
                >
                  Explore Our Products
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#story"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-sm font-bold border border-zinc-700 transition-colors"
                >
                  Our Story
                </Link>
              </div>
            </div>

            {/* Right Display: TV in Living Room */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/hero_tv.jpg"
                    alt="Butterfly Smart TV Living Room Display"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-zinc-300 bg-zinc-950/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-zinc-800">
                  <span className="font-semibold text-white">Butterfly Smart TV</span>
                  <span className="text-zinc-400">Engineered for Indian Homes</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. OUR STORY: "From Coimbatore With a Vision" */}
      <section id="story" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black tracking-widest text-[#E50914] uppercase block">
              OUR STORY
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 leading-tight">
              From Coimbatore <br />
              With a Vision
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-zinc-600 leading-relaxed">
              <p>
                Established with a passion for innovation and a deep understanding of Indian homes, Butterfly Smart TV was born in Coimbatore — a city known for its entrepreneurial spirit and quality craftsmanship.
              </p>
              <p>
                We started with a simple belief: everyone deserves a premium viewing experience, without compromise. Today, we bring you a range of smart TVs that combine cutting-edge technology, stunning visuals and trusted reliability — all under the Butterfly name.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#E50914] hover:bg-[#c70811] text-white text-sm font-bold shadow-lg shadow-red-900/20 hover:scale-105 transition-all"
              >
                Our Journey
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Corporate HQ Image with Coimbatore Location Pin Card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 group">
              <div className="relative aspect-[4/3] w-full bg-zinc-100">
                <Image
                  src="/about_hq.jpg"
                  alt="Butterfly Technology Campus Coimbatore"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Genuine Butterfly Smart TV Badge On Building Header */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-zinc-200/80 flex items-center gap-2">
                <div className="relative h-5 w-24">
                  <Image
                    src="/brand/butterfly-wordmark-red.png"
                    alt="Butterfly Brand"
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
                <span className="text-[10px] font-black tracking-wider text-zinc-800 border-l border-zinc-300 pl-2">
                  CAMPUS
                </span>
              </div>

              {/* Coimbatore Location Card Overlay on Bottom Right */}
              <div className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl shadow-xl border border-zinc-200 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#E50914] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900">
                    Coimbatore
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Our Home. Our Strength.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. OUR MISSION, VISION & VALUES: "Built on Trust. Driven by Innovation." */}
      <section className="py-20 bg-zinc-50/80 border-y border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-black tracking-widest text-[#E50914] uppercase block mb-2">
                OUR MISSION, VISION &amp; VALUES
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
                Built on Trust. <br />
                Driven by Innovation.
              </h2>
            </div>
            <p className="text-sm text-zinc-600 max-w-md leading-relaxed">
              We aim to create exceptional smart TV experiences that enrich everyday life, through innovation, quality and customer satisfaction.
            </p>
          </div>

          {/* 3 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Our Mission */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl border-2 border-red-100 bg-red-50/50 flex items-center justify-center text-[#E50914]">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-zinc-900">
                Our Mission
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                To make smart entertainment accessible to every home in India and beyond.
              </p>
            </div>

            {/* Card 2: Our Vision */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl border-2 border-red-100 bg-red-50/50 flex items-center justify-center text-[#E50914]">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-zinc-900">
                Our Vision
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                To be a globally recognized smart TV brand, known for quality, innovation and trust.
              </p>
            </div>

            {/* Card 3: Our Values */}
            <div className="bg-white p-8 rounded-3xl border border-zinc-200/90 shadow-sm hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl border-2 border-red-100 bg-red-50/50 flex items-center justify-center text-[#E50914]">
                <Gem className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-zinc-900">
                Our Values
              </h3>
              <div className="text-sm font-bold text-zinc-800 space-y-1">
                <p>Quality &nbsp;/&nbsp; Innovation</p>
                <p>Customer First &nbsp;/&nbsp; Integrity</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. WHY CHOOSE US: "More Than Just a TV" */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Dark Card with TV Blossom Art Visual */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden bg-[#0A0E17] text-white p-8 sm:p-10 flex flex-col justify-between shadow-xl min-h-[460px]">
            {/* Background image of TV flower art */}
            <div className="absolute inset-0 z-0 opacity-50">
              <Image
                src="/tv_art.jpg"
                alt="Butterfly 4K UHD Art Display"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/70 to-black/30" />
            </div>

            <div className="relative z-10 space-y-3">
              <span className="text-xs font-black tracking-widest text-[#E50914] uppercase">
                WHY CHOOSE US
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                More Than Just a TV
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-sm pt-2">
                At Butterfly, we combine cutting-edge technology, creative design and reliable service to give you an unmatched viewing experience.
              </p>
            </div>

            <div className="relative z-10 pt-8">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-bold transition-all shadow-md"
              >
                View Smart TV Lineup
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right 2x3 Grid of Features */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-zinc-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-8">
            
            {/* 1. Stunning Picture Quality */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-[#E50914] font-black text-xs">
                4K
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                Stunning Picture Quality
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Experience lifelike visuals with 4K UHD and vibrant colours.
              </p>
            </div>

            {/* 2. Immersive Sound */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-[#E50914]">
                <Volume2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                Immersive Sound
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Feel every moment with powerful and crystal-clear audio.
              </p>
            </div>

            {/* 3. Smart Technology */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-[#E50914]">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                Smart Technology
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Access your favourite apps, streaming platforms and more.
              </p>
            </div>

            {/* 4. Reliable Support */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-[#E50914]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                Reliable Support
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Dedicated customer support and trusted warranty.
              </p>
            </div>

            {/* 5. Energy Efficient */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-[#E50914]">
                <Leaf className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                Energy Efficient
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Designed for a better tomorrow with lower power consumption.
              </p>
            </div>

            {/* 6. Proudly Indian */}
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl border border-red-200 bg-red-50 flex items-center justify-center text-[#E50914]">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                Proudly Indian
              </h4>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Rooted in Coimbatore, serving homes across India.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
