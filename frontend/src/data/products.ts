import { TVProduct } from '@/components/cards/product-card';

export interface TechnicalSpecs {
  // Panel & Display (from official catalogue)
  panelType?: string;            // e.g. "Frameless IPS Panel", "LG IPS QLED Panel"
  bezelDesign?: string;          // e.g. "Frameless", "Bezelless design"
  hdrSupport?: string;           // e.g. "HDR10 / HDR", "FULL HD 1080p", "UHD 4K 2160p"
  
  // Performance & Core Hardware (from official catalogue)
  processor?: string;            // e.g. "ARM 4 Core Processor", "2 Core Processor", "4 Core Processor"
  ram?: string;                  // e.g. "1 GB", "2 GB"
  storageRom?: string;           // e.g. "8 GB", "16 GB"
  remoteType?: string;           // e.g. "Scroll Voice Remote (Magic)", "Voice Remote", "Standard Remote"
  screenCasting?: string;        // e.g. "Screen Cast / Mirror Cast"
  
  // Audio & Smart OS (from official catalogue)
  soundOutput?: string;          // e.g. "LG ThinQ 40w Dolby Audio", "30w Speaker", "20w speaker"
  smartPlatform?: string;        // e.g. "Web OS (LG ThinQ)", "Smart Android TV"
  ottSupport?: string;           // e.g. "Supports OTT Apps* with software update up to 5 years"

  // Connectivity & Ports (from official catalogue)
  hdmiPorts?: string;            // e.g. "2 HDMI", "3 HDMI", "1 HDMI"
  usbPorts?: string;             // e.g. "2 USB"
  wireless?: string;             // e.g. "Wi-Fi & Bluetooth", "Wi-Fi"

  // Warranty & Catalogue Exclusive Offers
  standardWarranty?: string;      // e.g. "1 yr warranty + 5 yr service warranty"
  extendedWarranty?: string;      // e.g. "3 yr warranty + 2 yr service warranty"
  extendedWarrantyPrice?: string; // e.g. "₹ 14,500"
  bundleOffer?: string;          // e.g. "Offer Stabilizer or Smart Watch", "Stabilizer, Smart Watch, Sound Bar"
  withoutOfferPrice?: string;    // e.g. "₹ 25,500"
  freeInstallationKit?: string;  // e.g. "Free wall mount kit & installation"
  exchangeOfferAvailable?: boolean; // e.g. true

  // Legacy fallback if present
  refreshRate?: string;
  [key: string]: any;
}

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
  technicalSpecs?: TechnicalSpecs;
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
