import React from 'react';
import { Metadata } from 'next';
import { AdminPageClient } from '@/components/admin/admin-page-client';

export const metadata: Metadata = {
  title: 'Executive Overview | Butterfly Admin Console',
  description: 'Enterprise administration, inventory control, and customer operations.',
};

export default function AdminRootPage() {
  return <AdminPageClient initialTab="overview" />;
}
