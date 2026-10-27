import { TVProduct } from '@/components/cards/product-card';

export interface CatalogProduct extends TVProduct {
  screenSizeCategory: string;
  resolutionCategory: string;
  smartCategory: string;
  priceCategory: string;
  brand: 'Butterfly';
  buttonLabel?: 'View Details →' | 'Enquire Now' | string;
  featuredRank?: number;
  isTopSelling?: boolean;
  inStock?: boolean;
  priceNumber?: number;
  displayTech?: string;
  smartOS?: string;
  features?: string[];
  keyFeatures?: string[];
  technicalSpecs?: {
    refreshRate?: string;
    panelType?: string;
    hdmiPorts?: string;
    usbPorts?: string;
    wireless?: string;
    [key: string]: any;
  };
  warrantyInstallation?: string;
  images?: string[];
  whatsIncluded?: string[];
}

/**
 * Empty catalog products array - all products are loaded dynamically from the database.
 */
export const ALL_PRODUCTS: CatalogProduct[] = [];

/**
 * Helper to fetch stored products from localStorage if in browser
 */
export function getStoredProducts(): CatalogProduct[] {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('butterfly_admin_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
  }
  return [];
}

/**
 * Retrieve a single product by its unique model/id
 */
export function getProductById(id: string): CatalogProduct | undefined {
  if (!id) return undefined;
  const normalizedId = id.toLowerCase().trim();
  const pool = getStoredProducts();
  return (
    pool.find((p) => p.id.toLowerCase() === normalizedId) ||
    pool.find((p) => p.model.toLowerCase() === normalizedId)
  );
}

/**
 * Find similar TVs based on screen size, resolution, and price proximity
 */
export function getSimilarProducts(product: CatalogProduct, limit: number = 4): CatalogProduct[] {
  const pool = getStoredProducts();
  if (!product) return pool.slice(0, limit);

  return pool
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
}
