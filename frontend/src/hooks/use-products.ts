'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ALL_PRODUCTS,
  CatalogProduct,
  getStoredProducts,
  getProductById,
  getSimilarProducts,
} from '@/data/products';
import { TVProduct } from '@/components/cards/product-card';

export interface DynamicSizeOption {
  size: string;
  tagline: string;
  image: string;
  count: number;
  minPrice: number;
  formattedMinPrice: string;
}

export function useDynamicProducts() {
  const [products, setProducts] = useState<CatalogProduct[]>(() => {
    if (typeof window !== 'undefined') {
      return getStoredProducts();
    }
    return ALL_PRODUCTS;
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshProducts = useCallback(() => {
    const latest = getStoredProducts();
    setProducts(latest);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshProducts();

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || e.key === 'butterfly_admin_products') {
        refreshProducts();
      }
    };

    const handleCustomEvent = () => {
      refreshProducts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('butterfly_products_updated', handleCustomEvent);
    window.addEventListener('focus', refreshProducts);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('butterfly_products_updated', handleCustomEvent);
      window.removeEventListener('focus', refreshProducts);
    };
  }, [refreshProducts]);

  // Dynamically compute distinct screen sizes from active catalog
  const availableSizes = useMemo<DynamicSizeOption[]>(() => {
    const sizeMap: Record<
      string,
      { count: number; minPrice: number; image: string; name: string }
    > = {};

    const defaultTaglines: Record<string, string> = {
      '32"': 'Compact & Smart',
      '43"': 'Perfect for Every Home',
      '50"': 'Immersive Cinema Feel',
      '55"': 'Bigger Screen, Bigger Joy',
      '65"': 'The Ultimate Experience',
      '75"': 'Grand Home Theatre',
      '85"': 'Cinema Pro Flagship',
    };

    products.forEach((p) => {
      const s = p.size || p.screenSizeCategory || '43"';
      const cleanSize = s.trim();
      const current = sizeMap[cleanSize] || {
        count: 0,
        minPrice: Infinity,
        image: p.image || '/products_hero.jpg',
        name: p.name,
      };

      current.count += 1;
      if (p.numericPrice && p.numericPrice < current.minPrice) {
        current.minPrice = p.numericPrice;
        if (p.image) current.image = p.image;
      }
      sizeMap[cleanSize] = current;
    });

    return Object.entries(sizeMap)
      .map(([size, data]) => {
        const num = parseInt(size.replace(/[^0-9]/g, ''), 10) || 999;
        return {
          size,
          tagline: defaultTaglines[size] || `${data.count} models for your room`,
          image: data.image,
          count: data.count,
          minPrice: data.minPrice === Infinity ? 17990 : data.minPrice,
          formattedMinPrice: `₹ ${
            data.minPrice === Infinity ? '17,990' : data.minPrice.toLocaleString('en-IN')
          }`,
          num,
        };
      })
      .sort((a, b) => a.num - b.num)
      .map(({ num, ...rest }) => rest);
  }, [products]);

  // Dynamically get featured best selling TVs, optionally filtered by size
  const getFeaturedProducts = useCallback(
    (sizeFilter?: string | null): TVProduct[] => {
      let pool = products;
      if (sizeFilter && sizeFilter !== 'All') {
        const normalized = sizeFilter.trim().toLowerCase();
        pool = products.filter(
          (p) =>
            (p.size && p.size.toLowerCase() === normalized) ||
            (p.screenSizeCategory && p.screenSizeCategory.toLowerCase() === normalized)
        );
      }

      // If filter matches items, sort by featuredRank or numericPrice
      const sorted = [...pool].sort((a, b) => {
        // prioritize Best Seller / Popular badges
        if (a.badge === 'Best Seller' && b.badge !== 'Best Seller') return -1;
        if (b.badge === 'Best Seller' && a.badge !== 'Best Seller') return 1;
        return (a.featuredRank ?? 99) - (b.featuredRank ?? 99);
      });

      return sorted.slice(0, 4);
    },
    [products]
  );

  // Dynamic helper to find single product by ID
  const getProduct = useCallback(
    (id: string): CatalogProduct | undefined => {
      if (!id) return undefined;
      const normalized = id.toLowerCase().trim();
      return (
        products.find((p) => p.id.toLowerCase() === normalized) ||
        products.find((p) => p.model.toLowerCase() === normalized)
      );
    },
    [products]
  );

  // Dynamic helper to get similar products from active catalog
  const getSimilar = useCallback(
    (product: CatalogProduct, limit: number = 4): CatalogProduct[] => {
      if (!product) return products.slice(0, limit);
      return products
        .filter((p) => p.id.toLowerCase() !== product.id.toLowerCase())
        .map((p) => {
          let score = 0;
          if (p.screenSizeCategory === product.screenSizeCategory) score += 4;
          if (p.resolutionCategory === product.resolutionCategory) score += 3;
          if (p.smartCategory === product.smartCategory) score += 2;
          const priceDiff = Math.abs(p.numericPrice - product.numericPrice);
          score += Math.max(0, 5 - priceDiff / 10000);
          return { product: p, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.product);
    },
    [products]
  );

  return {
    products,
    totalCount: products.length,
    availableSizes,
    getFeaturedProducts,
    getProduct,
    getSimilar,
    refreshProducts,
    isLoaded,
  };
}
