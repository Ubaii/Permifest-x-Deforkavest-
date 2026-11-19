'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy } from '@phosphor-icons/react';

export function StickyBottomBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Muncul setelah scroll lebih dari 450px (melewati hero)
      // dan sembunyikan jika mendekati bagian paling bawah (dekat footer)
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const nearBottom = scrollY + windowHeight > documentHeight - 350;

      if (scrollY > 450 && !nearBottom) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <aside
      aria-label="Aksi Cepat Pendaftaran"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden p-3 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl safe-bottom transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/20 text-brand-violet-300">
            <Trophy size={18} weight="duotone" />
          </div>
          <div>
            <span className="block text-xs font-bold text-foreground leading-tight">
              Pendaftaran Dibuka
            </span>
            <span className="block text-[11px] text-muted-foreground">
              5 Cabang Lomba
            </span>
          </div>
        </div>

        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow min-h-[44px]"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <span>Daftar Sekarang</span>
          <ArrowRight size={15} weight="bold" />
        </Link>
      </div>
    </aside>
  );
}
