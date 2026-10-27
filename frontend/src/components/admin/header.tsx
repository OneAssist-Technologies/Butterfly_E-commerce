'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  RefreshCw,
  ExternalLink,
  Menu,
} from 'lucide-react';
import { AdminTab, AdminUserSession } from './types';

interface AdminHeaderProps {
  activeTab: AdminTab;
  currentUser: AdminUserSession;
  isRefreshing: boolean;
  onRefresh: () => void;
  // Contextual primary actions
  onOpenAddProduct?: () => void;
  onOpenAddOffer?: () => void;
  onOpenAddEnquiry?: () => void;
  onOpenAddOrder?: () => void;
  onOpenAddUser?: () => void;
  onSaveSettings?: () => void;
  settingsSaving?: boolean;
  globalSearchQuery?: string;
  setGlobalSearchQuery?: (q: string) => void;
  onToggleMobileSidebar?: () => void;
}

export function AdminHeader({
  activeTab,
  currentUser,
  isRefreshing,
  onRefresh,
  onOpenAddProduct,
  onOpenAddOffer,
  onOpenAddEnquiry,
  onOpenAddOrder,
  onOpenAddUser,
  onSaveSettings,
  settingsSaving,
  globalSearchQuery,
  setGlobalSearchQuery,
  onToggleMobileSidebar,
}: AdminHeaderProps) {
  const getTabTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return 'Executive Overview';
      case 'products':
        return 'TV Catalog & Inventory';
      case 'offers':
        return 'Offers & Dynamic Promotions';
      case 'enquiries':
        return 'CustomerEnquiries & Quotes';
      case 'orders':
        return 'Orders & Dispatch Management';
      case 'users':
        return 'Staff Accounts & Privileges';
      case 'settings':
        return 'Company & Storefront Settings';
      default:
        return 'Admin Dashboard';
    }
  };

  const getBreadcrumbLabel = (tab: AdminTab) => {
    switch (tab) {
      case 'products':
        return 'TV Inventory';
      case 'offers':
        return 'Offers & Deals';
      case 'enquiries':
        return 'Enquiries';
      case 'orders':
        return 'Orders & Fulfillment';
      case 'users':
        return 'User Accounts';
      case 'settings':
        return 'Company Settings';
      default:
        return 'Overview';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 sticky top-0 z-10 shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            aria-label="Toggle navigation"
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Admin Portal</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">{getBreadcrumbLabel(activeTab)}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
            {getTabTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Input inspired by Reference UI */}
      <div className="flex-1 max-w-md hidden lg:block mx-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search across inventory, orders, customer enquiries..."
            value={globalSearchQuery || ''}
            onChange={(e) => setGlobalSearchQuery && setGlobalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E50914]/30 focus:border-[#E50914] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile Badge */}
      <div className="flex items-center gap-3">
        {/* Sync Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          title="Refresh live data from server"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
        </button>

        {/* View Store */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs"
        >
          <span>View Store</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Notification Bell Outline Icon (matching reference screenshot) */}
        <div className="relative p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer" title="Notifications">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#E50914] absolute top-1.5 right-1.5 ring-2 ring-white" />
        </div>





        {/* User Pill (inspired by reference image top right) */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-red-100 text-[#E50914] font-bold text-xs flex items-center justify-center border border-red-200 shrink-0">
            {getInitials(currentUser.name)}
          </div>
          <span className="text-xs font-bold text-slate-800 hidden sm:inline-block max-w-[120px] truncate">
            {currentUser.name}
          </span>
        </div>
      </div>
    </header>
  );
}
