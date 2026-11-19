'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';
import { UserRole } from '@/lib/types';
import { 
  Shield, 
  LayoutDashboard, 
  Trophy, 
  CreditCard, 
  UploadCloud, 
  Award, 
  UserCheck, 
  Users, 
  ClipboardCheck, 
  FileCheck2, 
  Gamepad2, 
  Bell, 
  History, 
  Layers, 
  Sliders, 
  ArrowLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

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
          { label: 'Overview', href: '/dashboard/peserta', icon: LayoutDashboard },
          { label: 'Kompetisi Saya', href: '/dashboard/peserta/kompetisi', icon: Trophy },
          { label: 'Pembayaran', href: '/dashboard/peserta/pembayaran', icon: CreditCard },
          { label: 'Submission Karya', href: '/dashboard/peserta/submission', icon: UploadCloud },
          { label: 'Hasil & Pengumuman', href: '/dashboard/peserta/hasil', icon: Award },
          { label: 'Profil Saya', href: '/dashboard/peserta/profil', icon: UserCheck },
        ];
      case 'juri':
        return [
          { label: 'Overview Penugasan', href: '/dashboard/juri', icon: LayoutDashboard },
          { label: 'Karya Ditugaskan', href: '/dashboard/juri/penugasan', icon: ClipboardCheck },
          { label: 'Riwayat Penilaian', href: '/dashboard/juri/riwayat', icon: History },
        ];
      case 'panitia':
      case 'super_admin':
      default:
        return [
          { label: 'Admin Overview', href: '/dashboard/admin', icon: LayoutDashboard },
          { label: 'Manajemen Kompetisi', href: '/dashboard/admin/kompetisi', icon: Layers },
          { label: 'Verifikasi Pembayaran', href: '/dashboard/admin/pembayaran', icon: CreditCard },
          { label: 'Data Peserta', href: '/dashboard/admin/peserta', icon: Users },
          { label: 'Submission & Juri', href: '/dashboard/admin/submission', icon: FileCheck2 },
          { label: 'Input Hasil E-Sport', href: '/dashboard/admin/hasil', icon: Gamepad2 },
          { label: 'Pengumuman', href: '/dashboard/admin/pengumuman', icon: Bell },
          { label: 'Audit Trail', href: '/dashboard/admin/audit-log', icon: History },
        ];
    }
  };

  const menuItems = getMenuItems();
  const roles: UserRole[] = ['peserta', 'panitia', 'juri', 'super_admin'];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col h-screen shrink-0">
      
      {/* Brand */}
      <div className="p-4 border-b border-slate-900 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="font-bold text-xs tracking-wide text-slate-100">PERMIFEST × DEVORKA</span>
        </Link>
        <Link href="/" className="text-slate-500 hover:text-slate-300" title="Kembali ke Website">
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* User Card */}
      <div className="p-4 border-b border-slate-900 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-200 truncate">{currentUser.full_name}</div>
            <div className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              {ROLE_LABELS[currentUser.role]}
            </div>
          </div>
        </div>

        {/* Demo Switcher */}
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="text-[10px] text-slate-500 font-medium uppercase mb-1">Ganti Role Demo:</div>
          <div className="grid grid-cols-2 gap-1">
            {roles.map(r => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`text-[10px] py-1 px-1.5 rounded text-left transition-colors truncate ${
                  currentUser.role === r
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800'
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
        <div className="text-[10px] font-semibold text-slate-500 uppercase px-3 py-1.5 tracking-wider">
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
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
        <Link href="/" className="hover:text-slate-300 flex items-center gap-1.5">
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar ke Home</span>
        </Link>
        <span className="font-mono text-[10px] text-slate-600">v2.0-MVP</span>
      </div>

    </aside>
  );
}
