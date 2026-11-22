'use client';

import React, { useState, useEffect } from 'react';
import { SakugaButton } from '@/components/ui/sakuga-button';

export function StickyBottomBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroEl = document.getElementById('beranda');
    if (!heroEl) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Tampilkan sticky bar hanya saat user sudah scroll melewati hero section
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <aside
      aria-label="Aksi Cepat Pendaftaran"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden p-3 bg-[#140D33] border-t border-[#2E2266] shadow-2xl safe-bottom transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto select-none">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C4F15A]" />
            <span className="text-xs font-bold text-foreground leading-tight">
              Pendaftaran Dibuka
            </span>
          </div>
          <span className="block text-[11px] text-muted-foreground mt-0.5">
            5 Cabang Kompetisi
          </span>
        </div>

        <SakugaButton
          href="/register"
          variant="brand"
          size="sm"
          className="px-4 py-2 text-xs"
        >
          Daftar Sekarang
        </SakugaButton>
      </div>
    </aside>
  );
}
