'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Tv,
  Inbox,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { AdminTab, AdminUserSession } from './types';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  currentUser: AdminUserSession;
  onSignOut: () => void;
}

export function AdminSidebar({
  activeTab,
  setActiveTab,
  currentUser,
  onSignOut,
}: AdminSidebarProps) {
  const getInitials = (name: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="w-full md:w-64 h-auto md:h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between p-5 flex-shrink-0 shadow-sm z-20 select-none md:overflow-y-auto text-slate-800">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-7 w-32">
              <Image
                src="/brand/butterfly-wordmark-red.png"
                alt="Butterfly Logo"
                fill
                sizes="128px"
                className="object-contain object-left group-hover:opacity-90 transition-opacity"
                priority
              />
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#E50914] text-white font-black text-[9px] tracking-wider uppercase shadow-xs">
              ADMIN
            </span>
          </Link>
        </div>

        {/* Section 1: Main Navigation */}
        <div className="mt-6">
          <p className="px-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            MAIN NAVIGATION
          </p>
          <nav className="mt-2.5 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#E50914] text-white shadow-sm shadow-red-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#E50914] text-white shadow-sm shadow-red-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>TV Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('enquiries')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'enquiries'
                  ? 'bg-[#E50914] text-white shadow-sm shadow-red-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Customer Enquiries</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-[#E50914] text-white shadow-sm shadow-red-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Fulfillment</span>
            </button>
          </nav>
        </div>

        {/* Section 2: Administration & Security */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="px-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
            ADMINISTRATION & SECURITY
          </p>
          <nav className="mt-2.5 space-y-1">
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#E50914] text-white shadow-sm shadow-red-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Accounts</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#E50914] text-white shadow-sm shadow-red-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Company Settings</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Sidebar Footer with Active Admin Identity & Sign Out */}
      <div className="pt-5 border-t border-slate-100 space-y-3 mt-4">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-[#E50914] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {getInitials(currentUser.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.email || 'Admin Console'}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200/60">
            <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
            <span className="font-mono text-slate-500 font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-[9px]">
              {currentUser.role}
            </span>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-[#E50914] hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
