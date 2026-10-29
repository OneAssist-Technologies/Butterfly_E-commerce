import React from 'react';
import { Metadata } from 'next';
import { ALL_PRODUCTS, CatalogProduct, getProductById, getSimilarProducts } from '@/data/products';
import { ProductDetailWrapper } from '@/components/products/product-detail-wrapper';
import { ENV } from '@/config/env';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getLiveProduct(id);

  if (!product) {
    return {
      title: 'Smart TV Details | Butterfly Smart TV',
      description: 'Explore ultra high definition smart televisions by Butterfly.',
    };
  }

  return {
    title: `${product.name} | Butterfly Smart TV`,
    description: `Discover the Butterfly ${product.name} with ${product.resolution}, ${product.sound}, ${product.os}, and official brand warranty. Free installation across India.`,
    openGraph: {
      title: `${product.model} - ${product.name} | Butterfly Smart TV`,
      description: `Shop ${product.name} at ${product.price}. Enjoy cinema-grade visuals and immersive sound.`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

async function getLiveProduct(id: string): Promise<CatalogProduct | undefined> {
  const candidateBases = [
    process.env.INTERNAL_API_URL,
    process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/v1` : null,
    'http://127.0.0.1:3001/api/v1',
    'http://localhost:3001/api/v1',
    ENV.apiBaseUrl,
    'https://butterflytv.in/api/v1',
  ].filter(Boolean) as string[];

  for (const base of candidateBases) {
    try {
      const res = await fetch(`${base}/products/${encodeURIComponent(id)}`, {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Continue to next candidate endpoint
    }
  }

  return getProductById(id);
}

async function getLiveSimilarProducts(currentProduct: CatalogProduct): Promise<CatalogProduct[]> {
  const candidateBases = [
    process.env.INTERNAL_API_URL,
    process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/v1` : null,
    'http://127.0.0.1:3001/api/v1',
    'http://localhost:3001/api/v1',
    ENV.apiBaseUrl,
    'https://butterflytv.in/api/v1',
  ].filter(Boolean) as string[];

  const sizeParam = encodeURIComponent(currentProduct.screenSizeCategory || currentProduct.size);

  for (const base of candidateBases) {
    try {
      const res = await fetch(`${base}/products?size=${sizeParam}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const items: CatalogProduct[] = await res.json();
        const filtered = items.filter((p) => p.id !== currentProduct.id);
        if (filtered.length > 0) return filtered.slice(0, 4);
      }
      const allRes = await fetch(`${base}/products`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(2000),
      });
      if (allRes.ok) {
        const allItems: CatalogProduct[] = await allRes.json();
        return allItems.filter((p) => p.id !== currentProduct.id).slice(0, 4);
      }
    } catch {
      // Continue to next candidate
    }
  }

  return getSimilarProducts(currentProduct, 4);
}

async function getAllLiveProducts(): Promise<CatalogProduct[]> {
  const candidateBases = [
    process.env.INTERNAL_API_URL,
    process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/$/, '')}/api/v1` : null,
    'http://127.0.0.1:3001/api/v1',
    'http://localhost:3001/api/v1',
    ENV.apiBaseUrl,
    'https://butterflytv.in/api/v1',
  ].filter(Boolean) as string[];

  for (const base of candidateBases) {
    try {
      const res = await fetch(`${base}/products`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Continue to next candidate
    }
  }

  return ALL_PRODUCTS;
}

async function ProductDetailsContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const product = await getLiveProduct(id);

  if (!product) {
    // If SSR could not reach backend via loopback, defer to client wrapper
    // which has direct access to browser network, reverse proxy and local storage
    return <ProductDetailWrapper initialProduct={null} productId={id} />;
  }

  const [similarProducts, allProducts] = await Promise.all([
    getLiveSimilarProducts(product),
    getAllLiveProducts(),
  ]);

  return (
    <ProductDetailWrapper
      initialProduct={product}
      productId={id}
      initialSimilarProducts={similarProducts}
      initialAllProducts={allProducts}
    />
  );
}

export default function ProductDetailPage({ params }: PageProps) {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#fbfbfd]" />}>
      <ProductDetailsContent paramsPromise={params} />
    </React.Suspense>
  );
}
