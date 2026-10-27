import React from 'react';
import { Metadata } from 'next';
import { AdminPageClient } from '@/components/admin/admin-page-client';
import { ADMIN_TABS_CONFIG, AdminTab } from '@/components/admin/types';

interface PageProps {
  params: Promise<{
    tab: string;
  }>;
}

export function generateStaticParams() {
  const tabs = Object.values(ADMIN_TABS_CONFIG).map((c) => ({
    tab: c.route.replace('/admin/', ''),
  }));
  return [...tabs, { tab: 'products' }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tab } = await params;
  const cleanTab = tab?.toLowerCase();
  const config =
    ADMIN_TABS_CONFIG[cleanTab as AdminTab] ||
    Object.values(ADMIN_TABS_CONFIG).find((c) => c.route.replace('/admin/', '') === cleanTab);

  const title = config ? config.label : 'Admin Dashboard';
  return {
    title: `${title} | Butterfly Admin Console`,
    description: config?.description || `Manage Butterfly Smart TV operations - ${title}.`,
  };
}

export default async function AdminTabPage({ params }: PageProps) {
  const { tab } = await params;
  return <AdminPageClient initialTab={tab} />;
}
