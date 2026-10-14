import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ALL_PRODUCTS, getProductById, getSimilarProducts } from '@/data/products';
import { ProductDetailsClient } from '@/components/products/product-details-client';
import { ArrowLeft, Tv } from 'lucide-react';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return ALL_PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

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

export const instant = false;

async function ProductDetailsContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const product = getProductById(id);

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

  const similarProducts = getSimilarProducts(product, 4);

  return (
    <ProductDetailsClient
      product={product}
      similarProducts={similarProducts}
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
