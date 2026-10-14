'use client';

import React from 'react';
import { ShieldCheck, Truck, Headphones, Star } from 'lucide-react';

export function TrustBar() {
  const trustItems = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-zinc-900" />,
      title: '1 Year Warranty',
      subtitle: 'Peace of mind with every purchase',
    },
    {
      icon: <Truck className="w-6 h-6 text-zinc-900" />,
      title: 'Pan India Support',
      subtitle: 'Service centers across India',
    },
    {
      icon: <Headphones className="w-6 h-6 text-zinc-900" />,
      title: 'Dedicated Support',
      subtitle: "We're here when you need us",
    },
    {
      icon: <Star className="w-6 h-6 text-zinc-900" />,
      title: 'Trusted Brand',
      subtitle: 'Quality you can rely on',
    },
  ];

  return (
    <section id="trust-bar" className="bg-white border-t border-b border-zinc-200 py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 group hover:translate-x-1 transition-transform duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center flex-shrink-0 group-hover:bg-red-50 group-hover:border-red-200 transition-colors">
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 tracking-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
