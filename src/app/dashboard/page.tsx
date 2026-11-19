'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { currentUser } = useAppStore();

  useEffect(() => {
    if (currentUser.role === 'peserta') {
      router.replace('/dashboard/peserta');
    } else if (currentUser.role === 'juri') {
      router.replace('/dashboard/juri');
    } else {
      router.replace('/dashboard/admin');
    }
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-cyan-400 font-mono text-sm">
      Mengalihkan ke Dashboard {currentUser.role.toUpperCase()}...
    </div>
  );
}
