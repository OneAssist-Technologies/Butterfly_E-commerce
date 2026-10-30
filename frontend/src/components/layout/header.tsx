'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, User, ShoppingBag, ChevronDown, Menu, X, ArrowRight, MessageSquare, Shield, LogOut } from 'lucide-react';
import { useCart } from '@/providers';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onSearch?: (term: string) => void;
}

export function Header({ cartCount, onOpenCart, onSearch }: HeaderProps) {
  const { cartCount: contextCount, openCart: contextOpenCart } = useCart();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeCount = mounted ? (cartCount ?? contextCount) : 0;
  const handleOpenCart = onOpenCart ?? contextOpenCart;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [authUser, setAuthUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const isAdmin = Boolean(
    authUser && ['SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'CATALOG_MANAGER'].includes(authUser.role || '')
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkUser = () => {
      const token =
        localStorage.getItem('butterfly_admin_token') ||
        localStorage.getItem('butterfly_user_token');
      const raw =
        localStorage.getItem('butterfly_admin_user') ||
        localStorage.getItem('butterfly_user');
      if (token && raw) {
        try {
          setAuthUser(JSON.parse(raw));
        } catch {
          setAuthUser(null);
        }
      } else {
        setAuthUser(null);
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [pathname]);

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Synchronize search term from URL query parameter 'q'
  React.useEffect(() => {
    const q = searchParams?.get('q') || '';
    setSearchTerm((prev) => (prev !== q ? q : prev));
  }, [searchParams]);

  // Prevent background scrolling when mobile menu drawer is open (bulletproof for mobile & desktop)
  React.useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [mobileMenuOpen]);

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
    setMobileMenuOpen(false);
    if (onSearch) {
      onSearch(searchTerm);
    } else if (searchTerm.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    } else if (pathname === '/products') {
      router.push('/products');
    }
  };

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-zinc-200/80 shadow-xs relative"
      onMouseLeave={() => setActiveDropdown(null)}
    >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Official Butterfly Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0 py-1">
            <div className="relative h-7 sm:h-8 md:h-9 w-32 xs:w-40 sm:w-48 md:w-56 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/brand/butterfly-wordmark-red.png"
                alt="Butterfly Logo"
                fill
                sizes="(max-width: 480px) 140px, (max-width: 640px) 192px, 224px"
                className="object-contain object-left"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col border-l border-zinc-300 pl-2 py-0.5">
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-zinc-900 uppercase leading-none whitespace-nowrap">
                SMART TV
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 h-full">
            <Link
              href="/"
              className={`text-sm font-semibold relative py-2 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#E50914] after:transition-all after:duration-200 ${
                isHomeActive
                  ? 'text-[#E50914] after:w-full'
                  : 'text-zinc-700 hover:text-[#E50914] after:w-0 hover:after:w-full'
              }`}
            >
              Home
            </Link>

            {/* Products Nav Item */}
            <div
              className="relative py-2 flex items-center group"
              onMouseEnter={handleMouseEnterProducts}
              onMouseLeave={handleMouseLeaveProducts}
            >
              <div className="flex items-center">
                <Link
                  href="/products"
                  onClick={() => setActiveDropdown(null)}
                  className={`flex items-center gap-1.5 text-sm font-semibold relative py-2 cursor-pointer transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#E50914] after:transition-all after:duration-200 ${
                    isProductsActive || activeDropdown === 'products'
                      ? 'text-[#E50914] after:w-full'
                      : 'text-zinc-700 hover:text-[#E50914] group-hover:text-[#E50914] after:w-0 hover:after:w-full group-hover:after:w-full'
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
                  className={`py-2 pl-0.5 pr-1 cursor-pointer transition-colors ${
                    activeDropdown === 'products' || isProductsActive
                      ? 'text-[#E50914]'
                      : 'text-zinc-400 hover:text-[#E50914] group-hover:text-[#E50914]'
                  }`}
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === 'products' ? 'rotate-180 text-[#E50914]' : isProductsActive ? 'text-[#E50914]' : 'text-zinc-400 group-hover:text-[#E50914]'
                  }`} />
                </button>
              </div>
            </div>

            <Link
              href="/about"
              className={`text-sm font-semibold relative py-2 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#E50914] after:transition-all after:duration-200 ${
                isAboutActive
                  ? 'text-[#E50914] after:w-full'
                  : 'text-zinc-700 hover:text-[#E50914] after:w-0 hover:after:w-full'
              }`}
            >
              About Us
            </Link>

            <Link
              href="/support"
              className={`text-sm font-semibold relative py-2 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#E50914] after:transition-all after:duration-200 ${
                isSupportActive
                  ? 'text-[#E50914] after:w-full'
                  : 'text-zinc-700 hover:text-[#E50914] after:w-0 hover:after:w-full'
              }`}
            >
              Support
            </Link>

            <Link
              href="/contact"
              className={`text-sm font-semibold relative py-2 transition-colors after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#E50914] after:transition-all after:duration-200 ${
                isContactActive
                  ? 'text-[#E50914] after:w-full'
                  : 'text-zinc-700 hover:text-[#E50914] after:w-0 hover:after:w-full'
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
              placeholder="Search TVs (e.g. 55&quot;, 4K, QLED)..."
              className="w-56 lg:w-68 pl-4 pr-16 py-2 rounded-full border border-zinc-200 bg-zinc-100/80 text-sm text-zinc-900 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] focus:bg-white transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    if (pathname === '/products') {
                      router.push('/products');
                    }
                  }}
                  className="p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                aria-label="Search"
                className="text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer p-1"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* User Profile Link - directly redirects to /profile */}
          <Link
            href={isAdmin ? "/admin/overview" : "/profile"}
            aria-label={isAdmin ? "Admin Dashboard" : "User Profile"}
            title={isAdmin ? "Admin Dashboard" : (authUser ? (authUser.name || "My Profile") : "Sign In / Profile")}
            className="p-2 rounded-full text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer relative"
          >
            <User className="w-5 h-5" />
            {authUser && (
              <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </Link>

          {/* Cart Icon with badge linking to full-page cart */}
          <Link
            href="/cart"
            aria-label="Shopping Cart"
            className="relative p-2 rounded-full text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && activeCount > 0 && (
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
                {/* <span>View All Smart TVs (36 Models)</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" /> */}
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

      {/* Mobile Slide-Over Drawer Popup (slides from left to right, fixed background) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
          {/* Dimmed Background Overlay (Fixed & non-scrollable) */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 touch-none overscroll-none"
            onClick={() => setMobileMenuOpen(false)}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
          />

          {/* Left Popup Drawer (slides left to right) */}
          <div className="relative w-full max-w-[340px] sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
            {/* Top Drawer Header (matching official Butterfly mobile design) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="relative h-7 w-32"
              >
                <Image
                  src="/brand/butterfly-wordmark-red.png"
                  alt="Butterfly Logo"
                  fill
                  sizes="128px"
                  className="object-contain object-left"
                  priority
                />
              </Link>
              <div className="flex items-center gap-2.5 text-zinc-700">
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Cart"
                  className="relative p-1.5 hover:text-[#E50914] transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {mounted && activeCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#E50914] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body Content */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search TVs, models, features..."
                  className="w-full pl-4 pr-11 py-2.5 rounded-full border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/40 focus:border-[#E50914] focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Navigation Links */}
              <div className="divide-y divide-zinc-100 text-sm font-semibold pt-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 transition-colors ${
                    isHomeActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
                  }`}
                >
                  Home
                </Link>

                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`group flex items-center justify-between py-3 transition-colors ${
                    isProductsActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
                  }`}
                >
                  <span>Products Catalog</span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm transition-colors ${
                      isProductsActive
                        ? 'bg-red-50 text-[#E50914]'
                        : 'bg-zinc-100 text-zinc-500 group-hover:bg-red-50 group-hover:text-[#E50914]'
                    }`}
                  >
                    ALL MODELS
                  </span>
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 transition-colors ${
                    isAboutActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
                  }`}
                >
                  About Us
                </Link>

                <Link
                  href="/support"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 transition-colors ${
                    isSupportActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
                  }`}
                >
                  Customer Support
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 transition-colors ${
                    isContactActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
                  }`}
                >
                  Contact &amp; Showrooms
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-3 text-zinc-800 hover:text-[#E50914] transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="w-4 h-4 text-[#E50914]" />
                    <span>My Cart</span>
                  </span>
                  {mounted && activeCount > 0 && (
                    <span className="bg-[#E50914] text-white text-[11px] font-bold rounded-full px-2 py-0.5">
                      {activeCount} items
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Separate User Profile Section at Bottom */}
            <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/70 shrink-0">
              <Link
                href={isAdmin ? "/admin/overview" : "/profile"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-zinc-200/80 shadow-2xs hover:border-[#E50914]/40 hover:bg-red-50/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-[#E50914] group-hover:bg-[#E50914] group-hover:text-white transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-zinc-900 group-hover:text-[#E50914] transition-colors">
                      {isAdmin ? 'Admin Dashboard' : (authUser ? (authUser.name || 'My Profile') : 'User Profile')}
                    </span>
                    <span className="block text-[11px] text-zinc-500 font-medium">
                      {isAdmin ? 'Manage inventory, orders & settings' : (authUser ? authUser.email : 'View orders & personal details')}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-[#E50914] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
