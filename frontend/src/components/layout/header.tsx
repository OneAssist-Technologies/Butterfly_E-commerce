'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, User, ShoppingBag, ChevronDown, Menu, X } from 'lucide-react';
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

  if (pathname === '/login' || pathname === '/signup' || pathname?.startsWith('/admin')) {
    return null;
  }

  const isProductsActive = pathname?.startsWith('/products');
  const isHomeActive = pathname === '/';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else if (searchTerm.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-zinc-200/80 shadow-xs">
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
        <nav className="hidden lg:flex items-center gap-8">
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

          {/* Products Nav & Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('products')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="flex items-center">
              <Link
                href="/products"
                onClick={() => setActiveDropdown(null)}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors py-2 cursor-pointer ${
                  isProductsActive
                    ? 'text-[#E50914] relative after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#E50914]'
                    : 'text-zinc-700 hover:text-[#E50914]'
                }`}
              >
                Products
              </Link>
              <button
                type="button"
                aria-label="Toggle Products Dropdown"
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

            {activeDropdown === 'products' && (
              <div className="absolute top-full left-0 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <Link
                  href="/products?filter=all"
                  onClick={() => setActiveDropdown(null)}
                  className="block px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#E50914] transition-colors"
                >
                  <span className="font-semibold block">All Smart TVs</span>
                  <span className="text-xs text-zinc-500">Explore complete TV line-up</span>
                </Link>
                <Link
                  href="/products?resolution=4K%20UHD"
                  onClick={() => setActiveDropdown(null)}
                  className="block px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#E50914] transition-colors"
                >
                  <span className="font-semibold block">4K UHD Smart Series</span>
                  <span className="text-xs text-zinc-500">Ultra-sharp Dolby sound</span>
                </Link>
                <Link
                  href="/products?resolution=Full%20HD"
                  onClick={() => setActiveDropdown(null)}
                  className="block px-4 py-2.5 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#E50914] transition-colors"
                >
                  <span className="font-semibold block">Full HD &amp; HD Ready</span>
                  <span className="text-xs text-zinc-500">Budget-friendly smart models</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/#about-section"
            className="text-sm font-medium text-zinc-700 hover:text-[#E50914] transition-colors py-2"
          >
            About Us
          </Link>

          {/* Support Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('support')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'support' ? null : 'support')}
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 hover:text-[#E50914] transition-colors py-2 cursor-pointer"
            >
              Support
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                activeDropdown === 'support' ? 'rotate-180 text-[#E50914]' : 'text-zinc-400'
              }`} />
            </button>

            {activeDropdown === 'support' && (
              <div className="absolute top-full left-0 w-56 bg-white border border-zinc-200 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <Link
                  href="/#trust-bar"
                  onClick={() => setActiveDropdown(null)}
                  className="block px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#E50914] transition-colors"
                >
                  Warranty Registration
                </Link>
                <Link
                  href="/#trust-bar"
                  onClick={() => setActiveDropdown(null)}
                  className="block px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#E50914] transition-colors"
                >
                  Service Centers (Pan India)
                </Link>
                <Link
                  href="/#footer"
                  onClick={() => setActiveDropdown(null)}
                  className="block px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-50 hover:text-[#E50914] transition-colors"
                >
                  User Manuals &amp; Downloads
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/#footer"
            className="text-sm font-medium text-zinc-700 hover:text-[#E50914] transition-colors py-2"
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
            <span className="absolute top-0.5 right-0.5 bg-[#E50914] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
              {activeCount}
            </span>
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
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-semibold ${
              isProductsActive ? 'text-[#E50914]' : 'text-zinc-800 hover:text-[#E50914]'
            }`}
          >
            Products
          </Link>
          <Link
            href="/#about-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base text-zinc-800 hover:text-[#E50914]"
          >
            About Us
          </Link>
          <Link
            href="/#trust-bar"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base text-zinc-800 hover:text-[#E50914]"
          >
            Support
          </Link>
          <Link
            href="/#footer"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base text-zinc-800 hover:text-[#E50914]"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
