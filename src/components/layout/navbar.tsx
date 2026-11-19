'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { List, X, SignIn, UserCircle } from '@phosphor-icons/react';

const NAV_LINKS = [
  { href: '/#lomba', label: 'Lomba' },
  { href: '/#jadwal', label: 'Jadwal' },
  { href: '/#peringkat', label: 'Peringkat' },
  { href: '/#faq', label: 'FAQ' },
];

export function Navbar() {
  const { currentUser } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 8);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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
      <header
        className={[
          'sticky top-0 z-40 w-full transition-all duration-200',
          scrolled
            ? 'border-b border-[#2E2266] bg-[#0B0720]/85 backdrop-blur-md'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 group font-[family-name:var(--font-bricolage)] font-extrabold text-xl text-[#F5F2FF] tracking-tight"
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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#A99FD1] hover:text-[#F5F2FF] transition-colors min-h-[44px] flex items-center"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#F5F2FF] border border-[#2E2266] hover:bg-[#140D33] transition-colors min-h-[44px]"
            >
              <SignIn size={16} weight="bold" />
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold text-[#0B0720] transition-opacity hover:opacity-90 min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
              }}
            >
              {isLoggedIn ? (
                <>
                  <UserCircle size={16} weight="bold" />
                  Dashboard
                </>
              ) : (
                'Daftar'
              )}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex md:hidden items-center justify-center w-11 h-11 rounded-lg text-[#F5F2FF] hover:bg-[#140D33] transition-colors"
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
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
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
          'bg-[#140D33] border-t border-[#2E2266] rounded-t-2xl',
          'transition-transform duration-300 safe-bottom',
          mobileOpen ? 'translate-y-0' : 'translate-y-full',
        ].join(' ')}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#2E2266]" />
        </div>

        <nav className="px-4 pb-2 space-y-1" aria-label="Navigasi mobile">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-4 py-3.5 rounded-xl text-base font-semibold text-[#F5F2FF] hover:bg-[#1d1347] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="px-4 pb-4 pt-2 border-t border-[#2E2266] space-y-2 mt-1">
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-base font-semibold text-[#F5F2FF] border border-[#2E2266] hover:bg-[#1d1347] transition-colors"
          >
            <SignIn size={18} weight="bold" />
            Masuk
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-base font-bold text-[#0B0720] hover:opacity-90 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
            }}
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </>
  );
}
