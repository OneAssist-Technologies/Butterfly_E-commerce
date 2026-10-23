'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ALL_PRODUCTS, CatalogProduct } from '@/data/products';
import { productService } from '@/services/product.service';
import { ProductCatalogCard } from '@/components/cards/product-catalog-card';
import { EnquiryModal } from '@/components/shared/enquiry-modal';
import { TVProduct } from '@/components/cards/product-card';
import { useCart } from '@/providers';

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

function ProductsCatalogContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const resolutionParam = searchParams.get('resolution');
  const filterParam = searchParams.get('filter');
  const queryParam = searchParams.get('q');
  const sizeParam = searchParams.get('size');

  const router = useRouter();
  // State for enquiry modal
  const [enquiryProduct, setEnquiryProduct] = useState<TVProduct | null>(null);

  // Filter states
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>([]);
  const [selectedSmarts, setSelectedSmarts] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  // Sort & Pagination state
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9; // Exactly 9 cards per page matching the 3x3 grid in screenshot

  // Mobile filter drawer state
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accordion open/close states
  const [openSections, setOpenSections] = useState({
    size: true,
    resolution: true,
    smart: true,
    price: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Sync search parameters from URL into filter state
  useEffect(() => {
    const sizeVal = searchParams.get('size');
    if (sizeVal) {
      setSelectedSizes(sizeVal.split(',').map((s) => s.trim()).filter(Boolean));
    } else {
      setSelectedSizes([]);
    }

    const resVal = searchParams.get('resolution');
    if (resVal === '4K UHD') {
      setSelectedResolutions(['4K UHD']);
    } else if (resVal === 'Full HD') {
      setSelectedResolutions(['Full HD', 'HD']);
    } else if (resVal) {
      setSelectedResolutions(resVal.split(',').map((r) => r.trim()).filter(Boolean));
    } else {
      setSelectedResolutions([]);
    }

    const smartVal = searchParams.get('smart');
    if (smartVal) {
      setSelectedSmarts(smartVal.split(',').map((s) => s.trim()).filter(Boolean));
    } else {
      setSelectedSmarts([]);
    }

    const priceVal = searchParams.get('price');
    if (priceVal) {
      setSelectedPrices(priceVal.split(',').map((p) => p.trim()).filter(Boolean));
    } else {
      setSelectedPrices([]);
    }

    const sortVal = searchParams.get('sort') as SortOption;
    if (sortVal && ['featured', 'price-asc', 'price-desc', 'name-asc'].includes(sortVal)) {
      setSortBy(sortVal);
    } else {
      setSortBy('featured');
    }

    const pageVal = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(!isNaN(pageVal) && pageVal > 0 ? pageVal : 1);
  }, [searchParams]);

  // Synchronize state changes back to URL query parameters
  const updateUrl = useCallback(
    (newParams: {
      sizes?: string[];
      resolutions?: string[];
      smarts?: string[];
      prices?: string[];
      sort?: SortOption;
      page?: number;
      reset?: boolean;
    }) => {
      const next = new URLSearchParams();

      if (!newParams.reset) {
        if (queryParam) next.set('q', queryParam);

        const finalSizes = newParams.sizes !== undefined ? newParams.sizes : selectedSizes;
        const finalResolutions =
          newParams.resolutions !== undefined ? newParams.resolutions : selectedResolutions;
        const finalSmarts = newParams.smarts !== undefined ? newParams.smarts : selectedSmarts;
        const finalPrices = newParams.prices !== undefined ? newParams.prices : selectedPrices;
        const finalSort = newParams.sort !== undefined ? newParams.sort : sortBy;
        const finalPage = newParams.page !== undefined ? newParams.page : currentPage;

        if (finalSizes.length > 0) next.set('size', finalSizes.join(','));
        if (finalResolutions.length > 0) next.set('resolution', finalResolutions.join(','));
        if (finalSmarts.length > 0) next.set('smart', finalSmarts.join(','));
        if (finalPrices.length > 0) next.set('price', finalPrices.join(','));
        if (finalSort && finalSort !== 'featured') next.set('sort', finalSort);
        if (finalPage && finalPage > 1) next.set('page', String(finalPage));
      }

      const qs = next.toString();
      router.push(qs ? `/products?${qs}` : '/products', { scroll: false });
    },
    [
      queryParam,
      selectedSizes,
      selectedResolutions,
      selectedSmarts,
      selectedPrices,
      sortBy,
      currentPage,
      router,
    ]
  );

  const toggleFilter = (
    type: 'size' | 'resolution' | 'smart' | 'price',
    value: string
  ) => {
    let nextSizes = [...selectedSizes];
    let nextResolutions = [...selectedResolutions];
    let nextSmarts = [...selectedSmarts];
    let nextPrices = [...selectedPrices];

    if (type === 'size') {
      nextSizes = nextSizes.includes(value)
        ? nextSizes.filter((i) => i !== value)
        : [...nextSizes, value];
      setSelectedSizes(nextSizes);
      updateUrl({ sizes: nextSizes, page: 1 });
    } else if (type === 'resolution') {
      nextResolutions = nextResolutions.includes(value)
        ? nextResolutions.filter((i) => i !== value)
        : [...nextResolutions, value];
      setSelectedResolutions(nextResolutions);
      updateUrl({ resolutions: nextResolutions, page: 1 });
    } else if (type === 'smart') {
      nextSmarts = nextSmarts.includes(value)
        ? nextSmarts.filter((i) => i !== value)
        : [...nextSmarts, value];
      setSelectedSmarts(nextSmarts);
      updateUrl({ smarts: nextSmarts, page: 1 });
    } else if (type === 'price') {
      nextPrices = nextPrices.includes(value)
        ? nextPrices.filter((i) => i !== value)
        : [...nextPrices, value];
      setSelectedPrices(nextPrices);
      updateUrl({ prices: nextPrices, page: 1 });
    }
  };

  const handleResetFilters = () => {
    setSelectedSizes([]);
    setSelectedResolutions([]);
    setSelectedSmarts([]);
    setSelectedPrices([]);
    setSortBy('featured');
    setCurrentPage(1);
    updateUrl({ reset: true });
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
    updateUrl({ sort: newSort, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrl({ page: newPage });
  };

  // Dynamic Product Catalog State (fetched from backend API)
  const [productsList, setProductsList] = useState<CatalogProduct[]>(ALL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const liveData = await productService.getAll();
        if (isMounted && Array.isArray(liveData)) {
          setProductsList(liveData);
          if (typeof window !== 'undefined') {
            localStorage.setItem('butterfly_admin_products', JSON.stringify(liveData));
          }
          setIsLoadingProducts(false);
          return;
        }
      } catch (e: any) {
        console.error('[ProductsPage] Error fetching products from backend API:', e?.message || e);
        const stored = typeof window !== 'undefined' ? localStorage.getItem('butterfly_admin_products') : null;
        if (stored && isMounted) {
          try {
            setProductsList(JSON.parse(stored));
          } catch {}
        }
      }
      if (isMounted) {
        setIsLoadingProducts(false);
      }
    };

    fetchLiveProducts();

    window.addEventListener('butterfly_products_updated', fetchLiveProducts);

    return () => {
      isMounted = false;
      window.removeEventListener('butterfly_products_updated', fetchLiveProducts);
    };
  }, [searchParams]);

  // Helper functions for dynamic attributes & categorization
  const getProductSizeLabel = (p: CatalogProduct): string => {
    if (p.size) return p.size.trim();
    if (p.screenSizeCategory) return p.screenSizeCategory.trim();
    const match = p.name.match(/(\d{2,3})["'”]/) || p.model.match(/BF(\d{2,3})/i);
    return match ? `${match[1]}"` : 'Other';
  };

  const getProductResolutionLabel = (p: CatalogProduct): string => {
    const r = (p.resolutionCategory || p.resolution || '').toLowerCase();
    if (r.includes('4k') || r.includes('uhd')) return '4K UHD';
    if (r.includes('full') || r.includes('1080')) return 'Full HD';
    if (r.includes('hd') || r.includes('720')) return 'HD';
    return p.resolutionCategory || 'HD';
  };

  const getProductSmartLabel = (p: CatalogProduct): string => {
    const s = (p.smartCategory || p.smartOS || p.os || '').toLowerCase();
    if (s.includes('google')) return 'Google TV';
    if (s.includes('android')) return 'Android TV';
    if (s.includes('webos')) return 'WebOS';
    if (s.includes('tizen')) return 'Tizen';
    return p.smartCategory || p.os || 'Smart TV';
  };

  const getProductPriceNumber = (p: CatalogProduct): number => {
    if (typeof p.numericPrice === 'number' && !isNaN(p.numericPrice) && p.numericPrice > 0) {
      return p.numericPrice;
    }
    if (typeof p.priceNumber === 'number' && !isNaN(p.priceNumber) && p.priceNumber > 0) {
      return p.priceNumber;
    }
    const cleaned = String(p.price || '').replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
  };

  const getProductPriceCategory = (price: number): string => {
    if (price < 20000) return 'Under ₹20,000';
    if (price <= 40000) return '₹20,000 – ₹40,000';
    if (price <= 60000) return '₹40,000 – ₹60,000';
    return 'Above ₹60,000';
  };

  // Dynamic filter options and counts computed in real-time from productsList
  const filterCounts = useMemo(() => {
    // 1. Dynamic Screen Sizes
    const sizeMap: Record<string, number> = {};
    productsList.forEach((p) => {
      const s = getProductSizeLabel(p);
      sizeMap[s] = (sizeMap[s] || 0) + 1;
    });
    const sizes = Object.entries(sizeMap)
      .map(([label, count]) => ({
        label,
        count,
        num: parseInt(label.replace(/[^0-9]/g, ''), 10) || 999,
      }))
      .sort((a, b) => a.num - b.num)
      .map(({ label, count }) => ({ label, count }));

    // 2. Dynamic Resolutions
    const resMap: Record<string, number> = {};
    productsList.forEach((p) => {
      const r = getProductResolutionLabel(p);
      resMap[r] = (resMap[r] || 0) + 1;
    });
    const resOrder = ['HD', 'Full HD', '4K UHD'];
    const resolutions: { label: string; count: number }[] = [];
    resOrder.forEach((r) => {
      if (resMap[r] !== undefined) resolutions.push({ label: r, count: resMap[r] });
    });
    Object.entries(resMap).forEach(([r, count]) => {
      if (!resOrder.includes(r)) resolutions.push({ label: r, count });
    });

    // 3. Dynamic Smart Features
    const smartMap: Record<string, number> = {};
    productsList.forEach((p) => {
      const sm = getProductSmartLabel(p);
      smartMap[sm] = (smartMap[sm] || 0) + 1;
    });
    const smartOrder = ['Android TV', 'Google TV', 'WebOS', 'Tizen'];
    const smartFeatures: { label: string; count: number }[] = [];
    smartOrder.forEach((sm) => {
      if (smartMap[sm] !== undefined) smartFeatures.push({ label: sm, count: smartMap[sm] });
    });
    Object.entries(smartMap).forEach(([sm, count]) => {
      if (!smartOrder.includes(sm)) smartFeatures.push({ label: sm, count });
    });

    // 4. Dynamic Price Ranges
    const priceMap: Record<string, number> = {
      'Under ₹20,000': 0,
      '₹20,000 – ₹40,000': 0,
      '₹40,000 – ₹60,000': 0,
      'Above ₹60,000': 0,
    };
    productsList.forEach((p) => {
      const cat = getProductPriceCategory(getProductPriceNumber(p));
      priceMap[cat] = (priceMap[cat] || 0) + 1;
    });
    const prices = [
      { label: 'Under ₹20,000', count: priceMap['Under ₹20,000'] },
      { label: '₹20,000 – ₹40,000', count: priceMap['₹20,000 – ₹40,000'] },
      { label: '₹40,000 – ₹60,000', count: priceMap['₹40,000 – ₹60,000'] },
      { label: 'Above ₹60,000', count: priceMap['Above ₹60,000'] },
    ];

    return { sizes, resolutions, smartFeatures, prices };
  }, [productsList]);

  // Dynamically Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((prod) => {
        // Keyword search from header search bar
        if (queryParam) {
          const q = queryParam.toLowerCase().trim();
          const matches =
            prod.model.toLowerCase().includes(q) ||
            prod.name.toLowerCase().includes(q) ||
            (prod.resolution && prod.resolution.toLowerCase().includes(q)) ||
            (prod.os && prod.os.toLowerCase().includes(q)) ||
            (prod.sound && prod.sound.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // Screen Size filter
        if (selectedSizes.length > 0) {
          const size = getProductSizeLabel(prod);
          const rawSize = prod.size || '';
          const catSize = prod.screenSizeCategory || '';
          const match =
            selectedSizes.includes(size) ||
            selectedSizes.includes(rawSize) ||
            selectedSizes.includes(catSize);
          if (!match) return false;
        }

        // Resolution filter
        if (selectedResolutions.length > 0) {
          const res = getProductResolutionLabel(prod);
          if (
            !selectedResolutions.includes(res) &&
            !selectedResolutions.includes(prod.resolutionCategory)
          ) {
            return false;
          }
        }

        // Smart features filter
        if (selectedSmarts.length > 0) {
          const smart = getProductSmartLabel(prod);
          if (!selectedSmarts.includes(smart) && !selectedSmarts.includes(prod.smartCategory)) {
            return false;
          }
        }

        // Price range filter
        if (selectedPrices.length > 0) {
          const cat = getProductPriceCategory(getProductPriceNumber(prod));
          if (!selectedPrices.includes(cat) && !selectedPrices.includes(prod.priceCategory)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = getProductPriceNumber(a);
        const priceB = getProductPriceNumber(b);
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'name-asc') return a.model.localeCompare(b.model);
        return (a.featuredRank ?? 99) - (b.featuredRank ?? 99);
      });
  }, [
    productsList,
    selectedSizes,
    selectedResolutions,
    selectedSmarts,
    selectedPrices,
    sortBy,
    queryParam,
  ]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredProducts.slice(startIndex, endIndex);

  // Sidebar Filter Content component (reused for desktop & mobile drawer)
  const FilterSidebarContent = (
    <div className="space-y-6">
      {/* Screen Size Accordion */}
      <div className="border-b border-zinc-100 pb-5">
        <button
          onClick={() => toggleSection('size')}
          className="w-full flex items-center justify-between text-sm font-bold text-zinc-900 mb-3 cursor-pointer select-none"
        >
          <span>Screen Size</span>
          {openSections.size ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {openSections.size && (
          <div className="space-y-2.5">
            {filterCounts.sizes.map(({ label, count }) => {
              const checked = selectedSizes.includes(label);
              return (
                <label
                  key={label}
                  className="flex items-center gap-3 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFilter('size', label)}
                    className="w-4 h-4 rounded border-zinc-300 text-[#E50914] focus:ring-[#E50914] accent-[#E50914]"
                  />
                  <span className={checked ? 'font-semibold text-zinc-900' : ''}>
                    {label} ({count})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolution Accordion */}
      <div className="border-b border-zinc-100 pb-5">
        <button
          onClick={() => toggleSection('resolution')}
          className="w-full flex items-center justify-between text-sm font-bold text-zinc-900 mb-3 cursor-pointer select-none"
        >
          <span>Resolution</span>
          {openSections.resolution ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {openSections.resolution && (
          <div className="space-y-2.5">
            {filterCounts.resolutions.map(({ label, count }) => {
              const checked = selectedResolutions.includes(label);
              return (
                <label
                  key={label}
                  className="flex items-center gap-3 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFilter('resolution', label)}
                    className="w-4 h-4 rounded border-zinc-300 text-[#E50914] focus:ring-[#E50914] accent-[#E50914]"
                  />
                  <span className={checked ? 'font-semibold text-zinc-900' : ''}>
                    {label} ({count})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Smart Features Accordion */}
      <div className="border-b border-zinc-100 pb-5">
        <button
          onClick={() => toggleSection('smart')}
          className="w-full flex items-center justify-between text-sm font-bold text-zinc-900 mb-3 cursor-pointer select-none"
        >
          <span>Smart Features</span>
          {openSections.smart ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {openSections.smart && (
          <div className="space-y-2.5">
            {filterCounts.smartFeatures.map(({ label, count }) => {
              const checked = selectedSmarts.includes(label);
              return (
                <label
                  key={label}
                  className="flex items-center gap-3 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFilter('smart', label)}
                    className="w-4 h-4 rounded border-zinc-300 text-[#E50914] focus:ring-[#E50914] accent-[#E50914]"
                  />
                  <span className={checked ? 'font-semibold text-zinc-900' : ''}>
                    {label} ({count})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range Accordion */}
      <div className="border-b border-zinc-100 pb-5">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-sm font-bold text-zinc-900 mb-3 cursor-pointer select-none"
        >
          <span>Price Range</span>
          {openSections.price ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </button>

        {openSections.price && (
          <div className="space-y-2.5">
            {filterCounts.prices.map(({ label, count }) => {
              const checked = selectedPrices.includes(label);
              return (
                <label
                  key={label}
                  className="flex items-center gap-3 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFilter('price', label)}
                    className="w-4 h-4 rounded border-zinc-300 text-[#E50914] focus:ring-[#E50914] accent-[#E50914]"
                  />
                  <span className={checked ? 'font-semibold text-zinc-900' : ''}>
                    {label} ({count})
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Reset Filters Button */}
      <button
        onClick={handleResetFilters}
        className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-white text-[#E50914] hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset Filters
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* 1. HERO BANNER: "Explore Our Smart TVs" */}
      <section className="relative w-full bg-[#0a0e14] overflow-hidden">
        {/* Background TV Living Room Image */}
        <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[500px]">
          <Image
            src="/products_hero.jpg"
            alt="Butterfly Smart TVs Collection"
            fill
            sizes="100vw"
            priority
            className="object-cover object-[75%_center]"
          />

          {/* Left Dark Gradient Overlay for Typography Contrast */}
          <div className="absolute inset-y-0 left-0 w-full sm:w-3/5 lg:w-1/2 bg-gradient-to-r from-[#0a0e14] via-[#0a0e14]/85 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e14]/40 via-transparent to-transparent z-10" />

          {/* Left Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center z-20">
            <div className="max-w-xl space-y-4 py-8">
              <span className="inline-block text-xs sm:text-sm font-black tracking-wider uppercase text-[#E50914]">
                OUR PRODUCTS
              </span>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Explore Our <br />
                Smart TVs
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-lg">
                Discover a world of immersive visuals, powerful performance and smart features
                – designed for your every moment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN CATALOG SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-4 select-none">
          <Link href="/" className="hover:text-zinc-900 transition-colors">
            Home
          </Link>
          <span>›</span>
          <span className="text-zinc-900 font-medium">Products</span>
        </nav>

        {/* Catalog Header: Title + Subtitle + Showing Count + Sort Dropdown */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between pb-8 border-b border-zinc-100 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Smart TVs
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl">
              Find the perfect TV for your home. Explore our wide range of smart TVs with
              stunning picture quality and advanced features.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 flex-wrap">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>

            <span className="text-xs text-zinc-500">
              Showing {totalItems === 0 ? 0 : startIndex + 1}-{endIndex} of {totalItems} products
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 font-medium hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-zinc-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-zinc-800 focus:outline-none focus:ring-1 focus:ring-[#E50914] cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Model: A to Z</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. TWO COLUMN LAYOUT: SIDEBAR FILTERS + PRODUCTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          
          {/* Desktop Left Sidebar Filters (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] sticky top-28">
              {FilterSidebarContent}
            </div>
          </aside>

          {/* Right Product Grid (9 cols) */}
          <main className="lg:col-span-9 flex flex-col justify-between">
            {currentItems.length === 0 ? (
              <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-zinc-100 p-8">
                <h3 className="text-base font-bold text-zinc-800 mb-2">No Smart TVs Match Your Filters</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
                  Try unchecking some filter options or reset all filters to view our full collection of TVs.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#E50914] text-white text-xs font-semibold hover:bg-[#c70811] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((product) => (
                  <ProductCatalogCard
                    key={product.id}
                    product={product}
                    onViewDetails={(prod) => router.push(`/products/${prod.id}`)}
                    onEnquire={(prod) => setEnquiryProduct(prod)}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-12 pb-4 select-none">
                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Previous Page"
                  className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#E50914] text-white shadow-xs'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Next Page"
                  className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-100">
                <span className="text-base font-bold text-zinc-900">Filters</span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {FilterSidebarContent}
            </div>

            <div className="pt-6">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-xl bg-[#E50914] text-white text-xs font-bold"
              >
                Apply Filters ({totalItems} TVs)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Enquiry Modal */}
      <EnquiryModal
        product={enquiryProduct}
        onClose={() => setEnquiryProduct(null)}
      />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductsCatalogContent />
    </Suspense>
  );
}
