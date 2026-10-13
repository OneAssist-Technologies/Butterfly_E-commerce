'use client';

import React, { useState } from 'react';
import { HeroCarousel } from '@/components/sections/hero-carousel';
import { SizeSelector } from '@/components/sections/size-selector';
import { BestSelling } from '@/components/sections/best-selling';
import { AboutSection } from '@/components/sections/about-section';
import { TrustBar } from '@/components/sections/trust-bar';
import { ProductModal } from '@/components/shared/product-modal';
import { TVProduct } from '@/components/cards/product-card';
import { useCart } from '@/providers';

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<TVProduct | null>(null);
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string | null>(null);
  const { addToCart } = useCart();

  const handleSelectSize = (size: string) => {
    setSelectedSizeFilter(size);
    const targetElement = document.getElementById('best-selling');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewDetails = (product: TVProduct) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = (product: TVProduct) => {
    addToCart(product);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
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

      {/* Interactive Product Quick View Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product) => {
          handleAddToCart(product);
          setSelectedProduct(null);
        }}
      />
    </main>
  );
}
