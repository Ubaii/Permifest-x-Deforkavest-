'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { SakugaButton } from '@/components/ui/sakuga-button';
import { List, X, UserCircle } from '@phosphor-icons/react';

const NAV_LINKS = [
  { href: '/#lomba', label: 'Lomba' },
  { href: '/#jadwal', label: 'Jadwal' },
  { href: '/#peringkat', label: 'Hadiah & Benefit' },
  { href: '/#faq', label: 'FAQ' },
];

export function Navbar() {
  const { currentUser } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Lock scroll saat mobile menu terbuka
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isLoggedIn = !!currentUser?.role;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#2E2266] bg-[#0B0720]/95 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo Brand */}
          <Link
            href="/"
            className="flex items-center gap-1 group font-[family-name:var(--font-bricolage)] font-extrabold text-xl text-[#F5F2FF] tracking-tight hover:scale-105 transition-transform"
            aria-label="Permifest x Deforkafest Halaman Utama"
          >
            <span>Permifest</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              x
            </span>
            <span>Deforkafest</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-bold text-[#A99FD1] hover:text-[#F5F2FF] hover:underline decoration-[#9B6BF2] decoration-2 underline-offset-8 transition-colors min-h-[44px] flex items-center"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA dengan Sakuga Button Anime */}
          <div className="hidden md:flex items-center gap-3">
            <SakugaButton
              href="/login"
              variant="secondary"
              size="sm"
              sfxText="MASUK!!"
              className="text-xs px-4"
            >
              Masuk
            </SakugaButton>

            <SakugaButton
              href={isLoggedIn ? '/dashboard' : '/register'}
              variant="brand"
              size="sm"
              sfxText="GASSS!!"
              className="text-xs px-5"
              leftIcon={isLoggedIn ? <UserCircle size={16} weight="bold" /> : undefined}
            >
              {isLoggedIn ? 'Dashboard' : 'Daftar Sekarang'}
            </SakugaButton>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex md:hidden items-center justify-center w-11 h-11 rounded-xl text-[#F5F2FF] hover:bg-[#140D33] border border-[#2E2266] transition-colors"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileOpen ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </div>
      </header>

      {/* Mobile sheet overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/85 md:hidden animate-in fade-in"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sheet panel */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Menu navigasi"
        aria-modal="true"
        className={[
          'fixed bottom-0 left-0 right-0 z-40 md:hidden',
          'bg-[#140D33] border-t-2 border-[#9B6BF2] rounded-t-3xl',
          'transition-transform duration-300 safe-bottom p-5 shadow-2xl',
          mobileOpen ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        <div className="flex justify-center pb-3">
          <div className="w-12 h-1.5 rounded-full bg-[#2E2266]" />
        </div>

        <nav className="space-y-1 mb-5" aria-label="Navigasi mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-base font-bold text-[#F5F2FF] hover:bg-[#1d1347] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="pt-3 border-t border-[#2E2266] space-y-3">
          <SakugaButton
            href="/login"
            variant="secondary"
            size="md"
            sfxText="MASUK!!"
            className="w-full justify-center"
            onClick={() => setMobileOpen(false)}
          >
            Masuk ke Akun
          </SakugaButton>
          <SakugaButton
            href={isLoggedIn ? '/dashboard' : '/register'}
            variant="brand"
            size="md"
            sfxText="GASSS!!"
            className="w-full justify-center"
            onClick={() => setMobileOpen(false)}
          >
            {isLoggedIn ? 'Buka Dashboard' : 'Daftar Sekarang'}
          </SakugaButton>
        </div>
      </div>
    </>
  );
}
