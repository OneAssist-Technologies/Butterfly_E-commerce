import React from 'react';
import { Metadata } from 'next';
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client';

export const metadata: Metadata = {
  title: 'Executive Overview | Butterfly Admin Console',
  description: 'Enterprise administration, inventory control, and customer operations.',
};

export default function AdminRootPage() {
  return <AdminDashboardClient initialTab="overview" />;
}
