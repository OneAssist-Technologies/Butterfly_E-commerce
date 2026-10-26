import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ALL_PRODUCTS, CatalogProduct, getProductById, getSimilarProducts } from '@/data/products';
import { ProductDetailsClient } from '@/components/products/product-details-client';
import { ArrowLeft, Tv } from 'lucide-react';
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
      title: 'Product Not Found | Butterfly Smart TV',
      description: 'The requested Butterfly Smart TV model could not be found.',
    };
  }

  return {
    title: `${product.model} - ${product.name} | Butterfly Smart TV`,
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
  try {
    const res = await fetch(`${ENV.apiBaseUrl}/products/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to fixture if backend is temporarily unavailable
  }
  return getProductById(id);
}

async function getLiveSimilarProducts(currentProduct: CatalogProduct): Promise<CatalogProduct[]> {
  try {
    const sizeParam = encodeURIComponent(currentProduct.screenSizeCategory || currentProduct.size);
    const res = await fetch(`${ENV.apiBaseUrl}/products?size=${sizeParam}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const items: CatalogProduct[] = await res.json();
      const filtered = items.filter((p) => p.id !== currentProduct.id);
      if (filtered.length > 0) return filtered.slice(0, 4);
    }
    const allRes = await fetch(`${ENV.apiBaseUrl}/products`, {
      cache: 'no-store',
    });
    if (allRes.ok) {
      const allItems: CatalogProduct[] = await allRes.json();
      return allItems.filter((p) => p.id !== currentProduct.id).slice(0, 4);
    }
  } catch {
    // Fall back to fixture
  }
  return getSimilarProducts(currentProduct, 4);
}

async function getAllLiveProducts(): Promise<CatalogProduct[]> {
  try {
    const res = await fetch(`${ENV.apiBaseUrl}/products`, {
      cache: 'no-store',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fall back to fixture
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
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-[#fbfbfd]">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#E50914] flex items-center justify-center mb-4">
          <Tv className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 mb-2">
          Television Model Not Found
        </h1>
        <p className="text-sm text-zinc-500 max-w-md mb-8">
          The Butterfly TV model you are looking for ({id}) is either unavailable or has been discontinued.
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

  const [similarProducts, allProducts] = await Promise.all([
    getLiveSimilarProducts(product),
    getAllLiveProducts(),
  ]);

  return (
    <ProductDetailsClient
      product={product}
      similarProducts={similarProducts}
      allProducts={allProducts}
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
