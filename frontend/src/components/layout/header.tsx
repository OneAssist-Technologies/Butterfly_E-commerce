'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, User, ShoppingBag, ChevronDown, Menu, X } from 'lucide-react';
import { useCart } from '@/providers';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onSearch?: (term: string) => void;
}

export function Header({ cartCount, onOpenCart, onSearch }: HeaderProps) {
  const { cartCount: contextCount, openCart: contextOpenCart } = useCart();
  const activeCount = cartCount ?? contextCount;
  const handleOpenCart = onOpenCart ?? contextOpenCart;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/brand/butterfly-red.png"
              alt="Butterfly Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white leading-tight">
              Butterfly
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase -mt-0.5">
              SMART TV
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-900 dark:text-white relative py-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#E50914] transition-colors"
          >
            Home
          </Link>

          {/* Products Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('products')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors py-2 cursor-pointer">
              Products
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#E50914]" />
            </button>

            {activeDropdown === 'products' && (
              <div className="absolute top-full left-0 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <a
                  href="#size-selector"
                  className="block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:text-[#E50914]"
                >
                  <span className="font-semibold block">TVs by Screen Size</span>
                  <span className="text-xs text-zinc-500">32&quot;, 43&quot;, 55&quot;, 65&quot; series</span>
                </a>
                <a
                  href="#best-selling"
                  className="block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:text-[#E50914]"
                >
                  <span className="font-semibold block">4K UHD Smart Series</span>
                  <span className="text-xs text-zinc-500">Ultra-sharp Dolby sound</span>
                </a>
                <a
                  href="#best-selling"
                  className="block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:text-[#E50914]"
                >
                  <span className="font-semibold block">Full HD &amp; HD Ready</span>
                  <span className="text-xs text-zinc-500">Budget-friendly smart models</span>
                </a>
              </div>
            )}
          </div>

          <a
            href="#about-section"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors py-2"
          >
            About Us
          </a>

          {/* Support Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('support')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors py-2 cursor-pointer">
              Support
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {activeDropdown === 'support' && (
              <div className="absolute top-full left-0 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <a
                  href="#trust-bar"
                  className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:text-[#E50914]"
                >
                  Warranty Registration
                </a>
                <a
                  href="#trust-bar"
                  className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:text-[#E50914]"
                >
                  Service Centers (Pan India)
                </a>
                <a
                  href="#contact"
                  className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 hover:text-[#E50914]"
                >
                  User Manuals &amp; Downloads
                </a>
              </div>
            )}
          </div>

          <a
            href="#footer"
            className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#E50914] dark:hover:text-[#E50914] transition-colors py-2"
          >
            Contact
          </a>
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
              className="w-56 lg:w-64 pl-4 pr-10 py-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 focus:border-[#E50914] transition-all"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* User Account Icon */}
          <button
            aria-label="User Account"
            className="p-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Cart Icon with badge */}
          <button
            onClick={handleOpenCart}
            aria-label="Shopping Cart"
            className="relative p-2 rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 bg-[#E50914] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
              {activeCount}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-700 dark:text-zinc-300"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-[#E50914]"
          >
            Home
          </Link>
          <a
            href="#size-selector"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base text-zinc-700 dark:text-zinc-300"
          >
            Products
          </a>
          <a
            href="#about-section"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base text-zinc-700 dark:text-zinc-300"
          >
            About Us
          </a>
          <a
            href="#trust-bar"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base text-zinc-700 dark:text-zinc-300"
          >
            Support
          </a>
          <a
            href="#footer"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base text-zinc-700 dark:text-zinc-300"
          >
            Contact
          </a>
        </div>
      )}
    </header>
  );
}
