'use client';

import React from 'react';
import { ShieldCheck, Truck, Headphones, Star } from 'lucide-react';

export function TrustBar() {
  const trustItems = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />,
      title: '1 Year Warranty',
      subtitle: 'Peace of mind with every purchase',
    },
    {
      icon: <Truck className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />,
      title: 'Pan India Support',
      subtitle: 'Service centers across India',
    },
    {
      icon: <Headphones className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />,
      title: 'Dedicated Support',
      subtitle: "We're here when you need us",
    },
    {
      icon: <Star className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />,
      title: 'Trusted Brand',
      subtitle: 'Quality you can rely on',
    },
  ];

  return (
    <section id="trust-bar" className="bg-white dark:bg-zinc-950 border-t border-b border-zinc-200/80 dark:border-zinc-800 py-8 lg:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {trustItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 group hover:translate-x-1 transition-transform duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-red-50 dark:group-hover:bg-red-950/40 group-hover:border-red-200 dark:group-hover:border-red-900/60 transition-colors">
                {item.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
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
