'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from './sidebar';
import { List, Sun, Moon, CaretRight, House, User } from '@phosphor-icons/react';
import { useAppStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';

const ROUTE_SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  admin: 'Admin Panel',
  peserta: 'Peserta',
  juri: 'Dewan Juri',
  overview: 'Overview',
  kompetisi: 'Kompetisi',
  rubrik: 'Rubrik Penilaian',
  pembayaran: 'Verifikasi Pembayaran',
  submission: 'Submission Karya',
  penilaian: 'Penilaian & Juri',
  hasil: 'Hasil E-Sport',
  timeline: 'Timeline & Kalender',
  pengumuman: 'Pengumuman Resmi',
  pengguna: 'Manajemen Pengguna',
  'koreksi-darurat': 'Koreksi Darurat',
  'audit-log': 'Audit Trail',
  pengaturan: 'Pengaturan Sistem',
  profil: 'Profil Saya',
  riwayat: 'Riwayat Penilaian',
  penugasan: 'Penugasan Karya',
};

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
  breadcrumbs,
}: DashboardLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const pathname = usePathname();
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

  // Tentukan path profil berdasarkan role pengguna
  const profileHref = useMemo(() => {
    if (currentUser.role === 'peserta') return '/dashboard/peserta/profil';
    if (currentUser.role === 'juri') return '/dashboard/juri/profil';
    return '/dashboard/admin/profil';
  }, [currentUser.role]);

  // Base Dashboard Href
  const baseDashboardHref = useMemo(() => {
    if (currentUser.role === 'peserta') return '/dashboard/peserta';
    if (currentUser.role === 'juri') return '/dashboard/juri';
    return '/dashboard/admin';
  }, [currentUser.role]);

  // Generate Otomatis Breadcrumbs jika tidak dioper manual
  const resolvedBreadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      return breadcrumbs;
    }

    if (!pathname) return [];

    const segments = pathname.split('/').filter(Boolean);
    // segments: ['dashboard', 'admin', 'kompetisi']
    if (segments.length <= 1) return [];

    const items: BreadcrumbItem[] = [];
    let accumulatedPath = '';

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      accumulatedPath += `/${seg}`;

      // Lewati segmen pertama 'dashboard' karena sudah diwakili oleh icon Home
      if (i === 0 && seg === 'dashboard') continue;

      const isLast = i === segments.length - 1;
      const label = ROUTE_SEGMENT_LABELS[seg] || seg.replace(/-/g, ' ');

      items.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        href: isLast ? undefined : accumulatedPath,
      });
    }

    return items;
  }, [breadcrumbs, pathname]);

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
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors shrink-0"
              aria-label="Buka Menu Samping"
            >
              <List size={22} weight="bold" />
            </button>
            
            <div className="min-w-0">
              {/* Breadcrumbs Navigation */}
              {resolvedBreadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium mb-0.5 overflow-hidden">
                  <Link href={baseDashboardHref} className="hover:text-foreground transition-colors flex items-center gap-1 shrink-0" title="Ke Dashboard Utama">
                    <House size={12} weight="fill" />
                    <span>Home</span>
                  </Link>
                  {resolvedBreadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={idx}>
                      <CaretRight size={10} className="text-muted-foreground/60 shrink-0" />
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[200px]">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-foreground font-semibold truncate max-w-[140px] sm:max-w-[220px]">
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              )}

              {title && (
                <h1 className="text-sm sm:text-base md:text-lg font-bold font-[family-name:var(--font-bricolage)] text-foreground truncate">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground hidden md:block truncate max-w-xl">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {actions}

            {/* Tombol Toggle Tema Dark / Light */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-border bg-muted/60 hover:bg-muted text-foreground transition-all min-h-[38px] sm:min-h-[44px] text-xs font-semibold focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Ganti ke mode ${theme === 'dark' ? 'terang' : 'gelap'}`}
              title={`Mode saat ini: ${theme === 'dark' ? 'Gelap' : 'Terang'}. Klik untuk ganti.`}
            >
              {theme === 'dark' ? (
                <Sun size={18} weight="bold" className="text-brand-gold" />
              ) : (
                <Moon size={18} weight="bold" className="text-primary" />
              )}
            </button>

            {/* User Profile & Role Indicator */}
            <Link
              href={profileHref}
              className="hidden sm:flex items-center gap-2 pl-3 border-l border-border hover:opacity-85 transition-opacity"
              title="Buka Pengaturan Profil Saya"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.full_name?.charAt(0) || <User size={14} />}
              </div>
              <div className="text-left hidden lg:block">
                <span className="text-xs font-bold text-foreground block leading-tight truncate max-w-[110px]">
                  {currentUser.full_name}
                </span>
                <span className="text-[10px] font-bold text-primary block leading-tight">
                  {ROLE_LABELS[currentUser.role]}
                </span>
              </div>
            </Link>
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
