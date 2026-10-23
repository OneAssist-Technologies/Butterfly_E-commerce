'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroCarousel } from '@/components/sections/hero-carousel';
import { SizeSelector } from '@/components/sections/size-selector';
import { BestSelling } from '@/components/sections/best-selling';
import { AboutSection } from '@/components/sections/about-section';
import { TrustBar } from '@/components/sections/trust-bar';
import { TVProduct } from '@/components/cards/product-card';
import { useCart } from '@/providers';

export default function Home() {
  const router = useRouter();
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string | null>(null);
  const { addToCart } = useCart();

  const handleSelectSize = (size: string) => {
    router.push(`/products?size=${encodeURIComponent(size)}`);
  };

  const handleViewDetails = (product: TVProduct) => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (product: TVProduct) => {
    addToCart(product);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* 1. Hero Carousel with luxury living room TV & cinematic transitions */}
      <HeroCarousel />

      {/* 2. Choose Your Perfect Size (32", 43", 55", 65") */}
      <SizeSelector onSelectSize={handleSelectSize} />

      {/* 3. Featured Products: Our Best Selling TVs */}
      <BestSelling
        onViewDetails={handleViewDetails}
        onAddToCart={handleAddToCart}
        selectedFilterSize={selectedSizeFilter}
      />

      {/* 4. About Butterfly: Legacy of Quality, Vision for Tomorrow */}
      <AboutSection />

      {/* 5. Trust Bar (Warranty, Pan India Support, Dedicated Support, Trusted Brand) */}
      <TrustBar />
    </main>
  );
}
