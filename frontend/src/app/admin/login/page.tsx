'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Admin login is unified inside the existing /login page
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="flex items-center gap-3 text-zinc-600 text-sm font-medium">
        <div className="w-5 h-5 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        <span>Redirecting to sign in...</span>
      </div>
    </div>
  );
}
