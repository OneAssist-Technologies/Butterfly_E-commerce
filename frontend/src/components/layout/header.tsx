'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, User, ShoppingBag, ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/providers';
import { usePathname, useRouter } from 'next/navigation';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onSearch?: (term: string) => void;
}

export function Header({ cartCount, onOpenCart, onSearch }: HeaderProps) {
  const { cartCount: contextCount, openCart: contextOpenCart } = useCart();
  const activeCount = cartCount ?? contextCount;
  const handleOpenCart = onOpenCart ?? contextOpenCart;
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on route change
  React.useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnterProducts = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown('products');
  };

  const handleMouseLeaveProducts = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleMouseEnterSupport = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown('support');
  };

  const handleMouseLeaveSupport = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  if (pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/admin')) {
    return null;
  }

  const isProductsActive = pathname?.startsWith('/products');
  const isHomeActive = pathname === '/';
  const isAboutActive = pathname === '/about';
  const isSupportActive = pathname === '/support';
  const isContactActive = pathname === '/contact';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else if (searchTerm.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-zinc-200/80 shadow-xs relative"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Official Butterfly Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0 py-1">
          <div className="relative h-8 sm:h-9 w-48 sm:w-56 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/brand/butterfly-wordmark-red.png"
              alt="Butterfly Logo"
              fill
              sizes="(max-width: 640px) 192px, 224px"
              className="object-contain object-left"
              priority
            />
          </div>
          <div className="flex flex-col border-l border-zinc-300 pl-2 py-0.5">
            <span className="text-[11px] sm:text-xs font-black tracking-wider text-zinc-900 uppercase leading-none whitespace-nowrap">
              SMART TV
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 h-full">
          <Link
            href="/"
            className={`text-sm font-semibold relative py-2 transition-colors ${
              isHomeActive
                ? 'text-zinc-900 after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#E50914]'
                : 'text-zinc-700 hover:text-[#E50914]'
            }`}
          >
            Home
          </Link>

          {/* Products Nav Item */}
          <div
            className="relative py-2"
            onMouseEnter={handleMouseEnterProducts}
            onMouseLeave={handleMouseLeaveProducts}
          >
            <div className="flex items-center">
              <Link
                href="/products"
                onClick={() => setActiveDropdown(null)}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-2 cursor-pointer ${
                  isProductsActive || activeDropdown === 'products'
                    ? 'text-[#E50914] relative after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#E50914]'
                    : 'text-zinc-700 hover:text-[#E50914]'
                }`}
              >
                Products
              </Link>
              <button
                type="button"
                aria-label="Toggle Products Mega Menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'products' ? null : 'products');
                }}
                className="py-2 pl-0.5 pr-1 text-zinc-400 hover:text-[#E50914] cursor-pointer"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === 'products' ? 'rotate-180 text-[#E50914]' : isProductsActive ? 'text-[#E50914]' : 'text-zinc-400'
                }`} />
              </button>
            </div>
          </div>

          <Link
            href="/about"
            className={`text-sm font-semibold relative py-2 transition-colors ${
              isAboutActive
                ? 'text-[#E50914] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#E50914]'
                : 'text-zinc-700 hover:text-[#E50914]'
            }`}
          >
            About Us
          </Link>

          {/* Support Dropdown */}
          <div
            className="h-full flex items-center relative"
            onMouseEnter={handleMouseEnterSupport}
            onMouseLeave={handleMouseLeaveSupport}
          >
            <div className="flex items-center">
              <Link
                href="/support"
                onClick={() => setActiveDropdown(null)}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-2 cursor-pointer ${
                  isSupportActive
                    ? 'text-[#E50914] relative after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#E50914]'
                    : 'text-zinc-700 hover:text-[#E50914]'
                }`}
              >
                Support
              </Link>
              <button
                type="button"
                aria-label="Toggle Support Dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'support' ? null : 'support');
                }}
                className="py-2 pl-0.5 pr-1 text-zinc-400 hover:text-[#E50914] cursor-pointer"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === 'support' ? 'rotate-180 text-[#E50914]' : isSupportActive ? 'text-[#E50914]' : 'text-zinc-400'
                }`} />
              </button>
            </div>

            {activeDropdown === 'support' && (
              <div
                onMouseEnter={handleMouseEnterSupport}
                onMouseLeave={handleMouseLeaveSupport}
                className="absolute top-full left-0 w-60 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50"
              >
                <Link
                  href="/support"
                  onClick={() => setActiveDropdown(null)}
                  className="block px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#E50914] transition-colors"
                >
                  <span className="font-semibold block">Help Center &amp; FAQs</span>
                  <span className="text-xs text-zinc-500">Guides, manuals &amp; setup</span>
                </Link>
                <Link
                  href="/support#service-centers"
                  onClick={() => setActiveDropdown(null)}
                  className="block px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#E50914] transition-colors"
                >
                  <span className="font-semibold block">Service Centers</span>
                  <span className="text-xs text-zinc-500">Pan-India authorized support</span>
                </Link>
                <Link
                  href="/support#warranty"
                  onClick={() => setActiveDropdown(null)}
                  className="block px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#E50914] transition-colors"
                >
                  <span className="font-semibold block">Warranty Registration</span>
                  <span className="text-xs text-zinc-500">Register &amp; claim warranty</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/contact"
            className={`text-sm font-semibold relative py-2 transition-colors ${
              isContactActive
                ? 'text-[#E50914] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#E50914]'
                : 'text-zinc-700 hover:text-[#E50914]'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Right Action Icons & Search */}
        <div className="flex items-center gap-4 sm:gap-6">
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search TVs, features..."
              className="w-56 lg:w-64 pl-4 pr-10 py-2 rounded-full border border-zinc-200 bg-zinc-100/80 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] focus:bg-white transition-all"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* User Account Link */}
          <Link
            href="/login"
            aria-label="User Account"
            className="p-2 rounded-full text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <User className="w-5 h-5" />
          </Link>

          {/* Cart Icon with badge linking to full-page cart */}
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="relative p-2 rounded-full text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {activeCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#E50914] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {activeCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-700 hover:text-zinc-900"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Hisense-Style Full-Width TV Inches Mega Menu Drawer */}
      {activeDropdown === 'products' && (
        <div
          onMouseEnter={handleMouseEnterProducts}
          onMouseLeave={handleMouseLeaveProducts}
          className="hidden lg:block absolute top-full left-0 right-0 w-full bg-white border-b border-zinc-200 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            {/* Header bar of mega menu with quick title and "View All" */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-[#E50914]">
                  SMART TV LINEUP
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-xs text-zinc-500 font-medium">
                  Select by screen size &amp; technology
                </span>
              </div>
              <Link
                href="/products"
                onClick={() => setActiveDropdown(null)}
                className="text-xs font-bold text-zinc-600 hover:text-[#E50914] flex items-center gap-1.5 transition-colors group"
              >
                <span>View All Smart TVs (36 Models)</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* 5 Column Horizontal TV Cards Grid */}
            <div className="grid grid-cols-5 gap-3 lg:gap-4 items-stretch">

              {/* 32" Smart TV */}
              <Link
                href="/products?size=32%22"
                onClick={() => setActiveDropdown(null)}
                className="group flex flex-col justify-between p-3 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
              >
                <div className="relative aspect-[16/10] w-full mb-2">
                  <Image
                    src="/menu_tv_32.jpg"
                    alt='32" Smart TV'
                    fill
                    sizes="200px"
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="pt-1">
                  <span className="block text-sm font-black text-zinc-900 group-hover:text-[#E50914] transition-colors">
                    32&quot; Smart TV
                  </span>
                  <span className="block text-[11px] text-zinc-500 font-medium mt-0.5">
                    HD Ready • Android TV
                  </span>
                </div>
              </Link>

              {/* 43" UHD TV */}
              <Link
                href="/products?size=43%22"
                onClick={() => setActiveDropdown(null)}
                className="group flex flex-col justify-between p-3 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
              >
                <div className="relative aspect-[16/10] w-full mb-2">
                  <Image
                    src="/menu_tv_43.jpg"
                    alt='43" UHD TV'
                    fill
                    sizes="200px"
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="pt-1">
                  <span className="block text-sm font-black text-zinc-900 group-hover:text-[#E50914] transition-colors">
                    43&quot; UHD TV
                  </span>
                  <span className="block text-[11px] text-zinc-500 font-medium mt-0.5">
                    4K UHD • HDR10
                  </span>
                </div>
              </Link>

              {/* 50" UHD TV */}
              <Link
                href="/products?size=50%22"
                onClick={() => setActiveDropdown(null)}
                className="group flex flex-col justify-between p-3 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
              >
                <div className="relative aspect-[16/10] w-full mb-2">
                  <Image
                    src="/menu_tv_50.jpg"
                    alt='50" UHD TV'
                    fill
                    sizes="200px"
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="pt-1">
                  <span className="block text-sm font-black text-zinc-900 group-hover:text-[#E50914] transition-colors">
                    50&quot; UHD TV
                  </span>
                  <span className="block text-[11px] text-zinc-500 font-medium mt-0.5">
                    4K UHD • Dolby Audio
                  </span>
                </div>
              </Link>

              {/* 55" QLED TV */}
              <Link
                href="/products?size=55%22"
                onClick={() => setActiveDropdown(null)}
                className="group flex flex-col justify-between p-3 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
              >
                <div className="relative aspect-[16/10] w-full mb-2">
                  <Image
                    src="/menu_tv_55.jpg"
                    alt='55" QLED TV'
                    fill
                    sizes="200px"
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="pt-1">
                  <span className="block text-sm font-black text-zinc-900 group-hover:text-[#E50914] transition-colors">
                    55&quot; QLED TV
                  </span>
                  <span className="block text-[11px] text-zinc-500 font-medium mt-0.5">
                    Quantum Dot • Google TV
                  </span>
                </div>
              </Link>

              {/* 65" QLED TV */}
              <Link
                href="/products?size=65%22"
                onClick={() => setActiveDropdown(null)}
                className="group flex flex-col justify-between p-3 rounded-2xl bg-white hover:bg-zinc-50 border border-zinc-100 hover:border-zinc-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center"
              >
                <div className="relative aspect-[16/10] w-full mb-2">
                  <Image
                    src="/menu_tv_65.jpg"
                    alt='65" QLED TV'
                    fill
                    sizes="200px"
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="pt-1">
                  <span className="block text-sm font-black text-zinc-900 group-hover:text-[#E50914] transition-colors">
                    65&quot; QLED TV
                  </span>
                  <span className="block text-[11px] text-zinc-500 font-medium mt-0.5">
                    Cinema • Dolby Atmos
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-zinc-200 px-6 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-semibold ${
              isHomeActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
            }`}
          >
            Home
          </Link>

          {/* Mobile Products with TV Inches Quick Select */}
          <div>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className={`block py-2 text-base font-semibold ${
                isProductsActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
              }`}
            >
              Products
            </Link>
            <div className="grid grid-cols-3 gap-2 py-2 pl-2 border-l-2 border-red-200 mb-2">
              <Link
                href="/products?size=32%22"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-zinc-600 hover:text-[#E50914] bg-zinc-50 p-2 rounded-lg text-center"
              >
                32&quot; TV
              </Link>
              <Link
                href="/products?size=43%22"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-zinc-600 hover:text-[#E50914] bg-zinc-50 p-2 rounded-lg text-center"
              >
                43&quot; TV
              </Link>
              <Link
                href="/products?size=50%22"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-zinc-600 hover:text-[#E50914] bg-zinc-50 p-2 rounded-lg text-center"
              >
                50&quot; TV
              </Link>
              <Link
                href="/products?size=55%22"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-zinc-600 hover:text-[#E50914] bg-zinc-50 p-2 rounded-lg text-center"
              >
                55&quot; TV
              </Link>
              <Link
                href="/products?size=65%22"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-zinc-600 hover:text-[#E50914] bg-zinc-50 p-2 rounded-lg text-center"
              >
                65&quot; TV
              </Link>
            </div>
          </div>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-semibold ${
              isAboutActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
            }`}
          >
            About Us
          </Link>
          <Link
            href="/support"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-semibold ${
              isSupportActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
            }`}
          >
            Support
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-semibold ${
              isContactActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
            }`}
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
