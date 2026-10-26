import React from 'react';
import { Metadata } from 'next';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client';


interface PageProps {
  params: Promise<{
    tab: string;
  }>;
}

export function generateStaticParams() {
  return [
    { tab: 'overview' },
    { tab: 'inventory' },
    { tab: 'products' },
    { tab: 'offers' },
    { tab: 'enquiries' },
    { tab: 'orders' },
    { tab: 'users' },
    { tab: 'settings' },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tab } = await params;
  const titles: Record<string, string> = {
    overview: 'Executive Overview',
    inventory: 'TV Catalog & Inventory',
    products: 'TV Catalog & Inventory',
    offers: 'Offers & Deals',
    enquiries: 'Customer Inquiries & Quotes',
    orders: 'Orders & Fulfillment',
    users: 'Staff Accounts & Privileges',
    settings: 'Company & Storefront Settings',
  };

  const title = titles[tab?.toLowerCase()] || 'Admin Dashboard';
  return {
    title: `${title} | Butterfly Admin Console`,
    description: `Manage Butterfly Smart TV operations - ${title}.`,
  };
}

async function AdminTabContent({ paramsPromise }: { paramsPromise: Promise<{ tab: string }> }) {
  const { tab } = await paramsPromise;
  return <AdminDashboardClient initialTab={tab} />;
}

export default function AdminTabPage({ params }: PageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="h-screen w-screen bg-[#F8FAFC] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600 text-sm font-semibold">
            <div className="w-5 h-5 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
            <span>Loading Console...</span>
          </div>
        </div>
      }
    >
      <AdminTabContent paramsPromise={params} />
    </React.Suspense>
  );
}
