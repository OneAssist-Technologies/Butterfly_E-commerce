import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusCardProps {
  title: string;
  subtitle: string;
  status: 'online' | 'offline' | 'pending';
  icon: React.ReactNode;
  details?: string;
}

export function StatusCard({ title, subtitle, status, icon, details }: StatusCardProps) {
  const badgeVariants = {
    online: 'success',
    offline: 'error',
    pending: 'warning',
  } as const;

  return (
    <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
          {icon}
        </div>
        <Badge variant={badgeVariants[status]}>
          {status.toUpperCase()}
        </Badge>
      </div>
      <div className="mt-4">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>
        {details && (
          <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {details}
          </p>
        )}
      </div>
    </div>
  );
}
