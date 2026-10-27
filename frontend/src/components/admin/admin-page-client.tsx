'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(
  () =>
    import('./admin-dashboard-client').then((mod) => mod.AdminDashboardClient),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen bg-[#F8FAFC] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-800">
              Butterfly Admin Console
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
            <div className="w-4 h-4 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
            <span>Loading workspace...</span>
          </div>
        </div>
      </div>
    ),
  },
);

interface AdminPageClientProps {
  initialTab?: string;
}

export function AdminPageClient({ initialTab }: AdminPageClientProps) {
  return <AdminDashboard initialTab={initialTab} />;
}
