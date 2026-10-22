'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Tv,
  Inbox,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Plus,
  MapPin,
  LayoutGrid,
  List,
  Sparkles,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import {
  AdminMetrics,
  AdminTab,
  AdminUserSession,
  CustomerEnquiry,
  OrderRecord,
} from './types';
import { CatalogProduct } from '@/data/products';

interface OverviewTabProps {
  currentUser: AdminUserSession;
  metrics: AdminMetrics;
  orders: OrderRecord[];
  enquiries: CustomerEnquiry[];
  productsList: CatalogProduct[];
  setActiveTab: (tab: AdminTab) => void;
  onOpenAddEnquiry: () => void;
  onOpenAddOrder: () => void;
}

export function OverviewTab({
  currentUser,
  metrics,
  orders,
  enquiries,
  productsList,
  setActiveTab,
  onOpenAddEnquiry,
  onOpenAddOrder,
}: OverviewTabProps) {
  const [overviewOrderView, setOverviewOrderView] = useState<'cards' | 'table'>('cards');

  const stockPercentage = productsList.length
    ? Math.round((metrics.inStockCount / productsList.length) * 100)
    : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Greeting Bar (Inspired by Reference UI) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Butterfly Smart TV Technologies • Storefront Operations &amp; Inventory Hub
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('products')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer"
          >
            <Tv className="w-4 h-4 text-slate-500" />
            <span>Manage TV Catalog</span>
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-all shadow-md shadow-red-500/20 cursor-pointer active:scale-95"
          >
            <span>View Inquiries</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top Overview Row: 4 Modern Stat Metric Cards (Full Width Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Stat 1: Total TV Products */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              TOTAL TV MODELS
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{productsList.length}</p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.inStockCount} In Stock • {metrics.outOfStockCount} Low/Out
            </p>
          </div>
        </div>

        {/* Stat 2: Active Inventory Rate */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              IN-STOCK RATE
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{stockPercentage}%</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Available for Immediate Dispatch
            </p>
          </div>
        </div>

        {/* Stat 3: Customer Enquiries */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-red-400 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              CUSTOMER LEADS
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-[#E50914] flex items-center justify-center border border-red-100">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{enquiries.length}</p>
            <p className="text-xs mt-1 font-semibold">
              {metrics.newEnquiriesCount > 0 ? (
                <span className="text-[#E50914] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {metrics.newEnquiriesCount} new requiring contact
                </span>
              ) : (
                <span className="text-slate-500">All enquiries attended</span>
              )}
            </p>
          </div>
        </div>

        {/* Stat 4: Total Revenue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              TOTAL REVENUE
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">
              ₹ {metrics.totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {metrics.activeOrdersCount} Active • {metrics.deliveredOrdersCount} Delivered
            </p>
          </div>
        </div>

      </div>

      {/* 3. Valuation & Recent Inquiries Container */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 lg:p-7 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Warehouse Valuation &amp; Customer Inquiries
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Live retail assets &amp; customer pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory Valuation */}
          <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Catalog Retail Asset Value
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Dynamic
                </span>
              </div>
              <p className="text-3xl font-black text-slate-900 mt-3">
                ₹ {metrics.totalCatalogValue.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Calculated across <strong className="text-slate-900">{productsList.length} television models</strong> with an average unit price of{' '}
                <strong className="text-slate-900">₹ {metrics.avgPrice.toLocaleString('en-IN')}</strong>.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('products')}
                className="text-xs font-bold text-[#E50914] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Inventory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-slate-500 font-semibold">
                {metrics.inStockCount} In Stock
              </span>
            </div>
          </div>

          {/* Recent Inquiries List */}
          <div className="lg:col-span-2 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Recent Customer Inquiries</h4>
                  <p className="text-xs text-slate-500">Live incoming customer leads and TV quotes</p>
                </div>
                {enquiries.length > 0 && (
                  <button
                    onClick={() => setActiveTab('enquiries')}
                    className="text-xs font-bold text-[#E50914] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View All ({enquiries.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {enquiries.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-800">No Customer Inquiries Recorded</p>
                  <p className="text-[11px] text-slate-500">
                    Inquiries submitted via product pages or contact forms will appear here in real time.
                  </p>
                  <button
                    onClick={onOpenAddEnquiry}
                    className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record Enquiry</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {enquiries.slice(0, 3).map((enq) => (
                    <div
                      key={enq.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-red-100 text-[#E50914] font-bold text-xs flex items-center justify-center shrink-0">
                              {enq.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{enq.name}</p>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                <span>{enq.city}</span>
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              enq.status === 'New'
                                ? 'bg-red-50 text-[#E50914] border border-red-200'
                                : enq.status === 'Contacted'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {enq.status}
                          </span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 mb-2">
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Interested Model</p>
                          <p className="text-xs font-semibold text-slate-800 truncate">{enq.productModel}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span className="font-mono">{enq.date}</span>
                        <button
                          onClick={() => setActiveTab('enquiries')}
                          className="text-[#E50914] hover:underline font-bold text-[11px] cursor-pointer"
                        >
                          Manage &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 4. Latest Customer Orders & Dispatches Container */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 lg:p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Latest Customer Orders &amp; Dispatches
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {orders.length} Records
                </span>
              </h3>
              <p className="text-xs text-slate-500">Live order records, customer payments, and fulfillment tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher: Cards vs Table */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setOverviewOrderView('cards')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  overviewOrderView === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setOverviewOrderView('table')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  overviewOrderView === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>

            {orders.length > 0 && (
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-[#E50914] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>All Orders ({orders.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Orders Content */}
        {orders.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-12 text-center space-y-2">
            <p className="text-sm font-bold text-slate-800">No Orders Placed Yet</p>
            <p className="text-xs text-slate-500">
              Live transactions from storefront customer checkouts will appear here.
            </p>
            <button
              onClick={onOpenAddOrder}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#E50914] text-white text-xs font-bold hover:bg-[#c70811] transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Manual Order</span>
            </button>
          </div>
        ) : overviewOrderView === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.slice(0, 6).map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black font-mono text-slate-900 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                      {order.id}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'Dispatched'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <h4 className="text-sm font-bold text-slate-900">{order.customerName}</h4>
                    <p className="text-xs text-slate-500">{order.email}</p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1 mb-3">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Model Ordered</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{order.model}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">{order.payment}</p>
                    <p className="text-base font-black text-slate-900">{order.amount}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{order.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Model Ordered</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{order.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{order.customerName}</span>
                        <span className="text-[11px] text-slate-400">{order.email}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{order.model}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{order.amount}</td>
                      <td className="py-3.5 px-4 text-slate-500">{order.payment}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : order.status === 'Dispatched'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
