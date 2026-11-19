'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { List, Sun, Moon } from '@phosphor-icons/react';
import { useAppStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { currentUser } = useAppStore();

  // Sinkronisasi tema dengan localStorage dan DOM class
  useEffect(() => {
    const saved =
      (localStorage.getItem('permifest_admin_theme') as 'dark' | 'light' | null) ||
      'dark';

    const timer = setTimeout(() => {
      setTheme(saved);
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      // Pastikan saat berpindah ke halaman publik kembali ke mode dark default
      document.documentElement.classList.add('dark');
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('permifest_admin_theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-card">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-16 border-b border-border bg-card/85 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Buka Menu Samping"
            >
              <List size={22} weight="bold" />
            </button>
            <div>
              {title && (
                <h1 className="text-base sm:text-lg font-bold font-[family-name:var(--font-bricolage)] text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {actions}

            {/* Tombol Toggle Tema Dark / Light */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground transition-all min-h-[44px] text-xs font-semibold focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
              title={`Mode saat ini: ${theme === 'dark' ? 'Gelap' : 'Terang'}. Klik untuk ganti.`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={18} weight="bold" className="text-brand-gold" />
                  <span className="hidden">Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon size={18} weight="bold" className="text-primary" />
                  <span className="hidden">Mode Gelap</span>
                </>
              )}
            </button>

            {/* RBAC Role Indicator */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
              <span className="text-xs text-muted-foreground font-mono">Role:</span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary/15 border border-primary/30 text-primary">
                {ROLE_LABELS[currentUser.role]}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
