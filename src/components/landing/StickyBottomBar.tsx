'use client';

import React, { useState, useEffect } from 'react';
import { SakugaButton } from '@/components/ui/sakuga-button';
import { ArrowRight, Trophy } from '@phosphor-icons/react';

export function StickyBottomBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 500);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <aside
      aria-label="Aksi Cepat Pendaftaran"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden p-3 bg-[#140D33] border-t border-[#2E2266] shadow-2xl safe-bottom transition-all duration-200"
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

        <SakugaButton
          href="/register"
          variant="brand"
          size="sm"
          sfxText="GASSS!!"
          className="px-4 py-2 text-xs"
          rightIcon={<ArrowRight size={15} weight="bold" />}
        >
          Daftar Sekarang
        </SakugaButton>
      </div>
    </aside>
  );
}
