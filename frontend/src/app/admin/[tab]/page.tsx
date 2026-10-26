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

export default async function AdminTabPage({ params }: PageProps) {
  const { tab } = await params;
  return <AdminDashboardClient initialTab={tab} />;
}
