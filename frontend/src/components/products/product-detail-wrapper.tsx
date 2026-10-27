'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tv, ArrowLeft, Loader2 } from 'lucide-react';
import { CatalogProduct, getProductById, getSimilarProducts } from '@/data/products';
import { ProductDetailsClient } from './product-details-client';
import { productService } from '@/services/product.service';

interface ProductDetailWrapperProps {
  initialProduct?: CatalogProduct | null;
  productId: string;
  initialSimilarProducts?: CatalogProduct[];
  initialAllProducts?: CatalogProduct[];
}

export function ProductDetailWrapper({
  initialProduct,
  productId,
  initialSimilarProducts = [],
  initialAllProducts = [],
}: ProductDetailWrapperProps) {
  const [product, setProduct] = useState<CatalogProduct | null>(initialProduct || null);
  const [similarProducts, setSimilarProducts] = useState<CatalogProduct[]>(initialSimilarProducts);
  const [allProducts, setAllProducts] = useState<CatalogProduct[]>(initialAllProducts);
  const [loading, setLoading] = useState<boolean>(!initialProduct);
  const [errorNotFound, setErrorNotFound] = useState<boolean>(false);

  useEffect(() => {
    // If SSR already found the product, we're ready
    if (initialProduct) {
      setProduct(initialProduct);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchClientProduct() {
      setLoading(true);
      setErrorNotFound(false);

      // 1. First check localStorage cache from /products or /admin
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('butterfly_admin_products');
          if (stored) {
            const list: CatalogProduct[] = JSON.parse(stored);
            if (Array.isArray(list)) {
              const matched = list.find(
                (p) =>
                  p.id === productId ||
                  p.model?.toLowerCase() === productId.toLowerCase() ||
                  p.name?.toLowerCase().includes(productId.toLowerCase()),
              );
              if (matched && isMounted) {
                setProduct(matched);
                setSimilarProducts(getSimilarProducts(matched, 4));
                setAllProducts(list);
                setLoading(false);
                return;
              }
            }
          }
        } catch {
          // continue to API fetch
        }
      }

      // 2. Fetch directly from live backend REST API via browser
      try {
        const live = await productService.getById(productId);
        if (live && isMounted) {
          setProduct(live);
          setLoading(false);

          // Background load similar products
          productService.getAll().then((all) => {
            if (isMounted && Array.isArray(all)) {
              setAllProducts(all);
              const similar = all.filter(
                (p) =>
                  p.id !== live.id &&
                  (p.screenSizeCategory === live.screenSizeCategory || p.size === live.size),
              );
              setSimilarProducts(similar.length > 0 ? similar.slice(0, 4) : all.slice(0, 4));
            }
          }).catch(() => {});

          return;
        }
      } catch (err) {
        console.warn(`[ProductDetailWrapper] Direct API lookup failed for ${productId}:`, err);
      }

      // 3. Fall back to local fixtures
      const local = getProductById(productId);
      if (local && isMounted) {
        setProduct(local);
        setSimilarProducts(getSimilarProducts(local, 4));
        setLoading(false);
        return;
      }

      // 4. Truly not found
      if (isMounted) {
        setErrorNotFound(true);
        setLoading(false);
      }
    }

    fetchClientProduct();

    return () => {
      isMounted = false;
    };
  }, [initialProduct, productId]);

  // Loading state (shown when SSR missed and browser is fetching product from API)
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-24 text-center bg-[#fbfbfd]">
        <div className="relative w-16 h-16 flex items-center justify-center mb-5">
          <div className="absolute inset-0 rounded-full border-3 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-3 border-[#E50914] border-t-transparent animate-spin" />
          <Tv className="w-6 h-6 text-[#E50914]" />
        </div>
        <p className="text-sm font-bold text-slate-800 tracking-wide uppercase">
          Loading Television Specifications...
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Fetching live model details from Butterfly Smart TV catalog
        </p>
      </div>
    );
  }

  // Fallback: Product not found
  if (errorNotFound || !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-[#fbfbfd]">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center mb-4">
          <Tv className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-2">
          Television Model Not Found
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mb-8">
          The Butterfly TV model you are looking for ({productId}) is either unavailable or has been discontinued.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Available Smart TVs</span>
        </Link>
      </div>
    );
  }

  return (
    <ProductDetailsClient
      product={product}
      similarProducts={similarProducts}
      allProducts={allProducts}
    />
  );
}
