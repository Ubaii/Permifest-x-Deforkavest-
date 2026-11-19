'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';
import { UserRole } from '@/lib/types';
import {
  House,
  Trophy,
  CreditCard,
  UploadSimple,
  Medal,
  User,
  Users,
  ClipboardText,
  FileText,
  GameController,
  Bell,
  ClockCounterClockwise,
  SquaresFour,
  ArrowLeft,
  CaretRight,
  SignOut,
  ShieldCheck,
} from '@phosphor-icons/react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, switchRole } = useAppStore();

  const getMenuItems = () => {
    switch (currentUser.role) {
      case 'peserta':
        return [
          { label: 'Overview', href: '/dashboard/peserta', icon: House },
          { label: 'Kompetisi Saya', href: '/dashboard/peserta/kompetisi', icon: Trophy },
          { label: 'Pembayaran', href: '/dashboard/peserta/pembayaran', icon: CreditCard },
          { label: 'Submission Karya', href: '/dashboard/peserta/submission', icon: UploadSimple },
          { label: 'Hasil & Pengumuman', href: '/dashboard/peserta/hasil', icon: Medal },
          { label: 'Profil Saya', href: '/dashboard/peserta/profil', icon: User },
        ];
      case 'juri':
        return [
          { label: 'Overview Penugasan', href: '/dashboard/juri', icon: House },
          { label: 'Karya Ditugaskan', href: '/dashboard/juri/penugasan', icon: ClipboardText },
          { label: 'Riwayat Penilaian', href: '/dashboard/juri/riwayat', icon: ClockCounterClockwise },
        ];
      case 'panitia':
      case 'super_admin':
      default:
        return [
          { label: 'Admin Overview', href: '/dashboard/admin', icon: House },
          { label: 'Manajemen Kompetisi', href: '/dashboard/admin/kompetisi', icon: SquaresFour },
          { label: 'Verifikasi Pembayaran', href: '/dashboard/admin/pembayaran', icon: CreditCard },
          { label: 'Manajemen Pengguna', href: '/dashboard/admin/peserta', icon: Users },
          { label: 'Submission & Juri', href: '/dashboard/admin/submission', icon: FileText },
          { label: 'Input Hasil E-Sport', href: '/dashboard/admin/hasil', icon: GameController },
          { label: 'Pengumuman', href: '/dashboard/admin/pengumuman', icon: Bell },
          { label: 'Audit Trail', href: '/dashboard/admin/audit-log', icon: ClockCounterClockwise },
        ];
    }
  };

  const menuItems = getMenuItems();
  const roles: UserRole[] = ['peserta', 'panitia', 'juri', 'super_admin'];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen shrink-0 text-foreground transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary border border-primary/40 flex items-center justify-center">
            <ShieldCheck size={18} weight="bold" />
          </div>
          <span className="font-bold text-xs tracking-tight font-[family-name:var(--font-bricolage)] text-foreground">
            Permifest x Deforkafest
          </span>
        </Link>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
          title="Kembali ke Website Utama"
        >
          <ArrowLeft size={16} weight="bold" />
        </Link>
      </div>

      {/* User Card */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold text-sm">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-foreground truncate">
              {currentUser.full_name}
            </div>
            <div className="text-[11px] text-brand-violet-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-support-lime live-dot" />
              <span>{ROLE_LABELS[currentUser.role]}</span>
            </div>
          </div>
        </div>

        {/* Demo Switcher */}
        <div className="mt-3 pt-3 border-t border-border/70">
          <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
            Ganti Role Demo:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRole(r)}
                className={`text-[10px] py-1 px-2 rounded-md text-left transition-colors truncate min-h-[28px] ${
                  currentUser.role === r
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-muted-foreground uppercase px-3 py-1.5 tracking-wider">
          Menu {ROLE_LABELS[currentUser.role]}
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors min-h-[40px] ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={18}
                  weight={isActive ? 'fill' : 'regular'}
                  className={isActive ? 'text-primary' : 'text-muted-foreground'}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <CaretRight size={14} weight="bold" className="text-primary" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
        <Link href="/" className="hover:text-foreground flex items-center gap-1.5 transition-colors">
          <SignOut size={16} weight="bold" />
          <span>Ke Beranda</span>
        </Link>
        <span className="font-mono text-[10px] text-muted-foreground/70">v2.0-MVP</span>
      </div>
    </aside>
  );
}
