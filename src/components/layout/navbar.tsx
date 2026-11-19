'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/lib/constants';
import { UserRole } from '@/lib/types';
import { Shield, Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Terminal } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, switchRole } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/kompetisi', label: 'Kompetisi' },
    { href: '/pengumuman', label: 'Pengumuman' },
    { href: '/leaderboard', label: 'Hasil Akhir' },
    { href: '/informasi', label: 'Informasi Event' },
  ];

  const roles: UserRole[] = ['peserta', 'panitia', 'juri', 'super_admin'];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-slate-100 flex items-center gap-1.5">
              <span>PERMIFEST</span>
              <span className="text-cyan-400">×</span>
              <span className="text-slate-300">DEVORKAFEST</span>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono tracking-wider">CYBERSECURITY 2026</div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Role Switcher Demo & Dashboard Button */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* Quick Role Switcher for Demo evaluation */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Role: <strong className="text-cyan-300 capitalize">{ROLE_LABELS[currentUser.role]}</strong></span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800">
                  Ganti Role (Demo)
                </div>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      currentUser.role === r ? 'text-cyan-400 font-semibold bg-cyan-950/20' : 'text-slate-300'
                    }`}
                  >
                    <span>{ROLE_LABELS[r]}</span>
                    {currentUser.role === r && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Go to Dashboard */}
          <Link href={`/dashboard/${currentUser.role === 'super_admin' ? 'admin' : currentUser.role}`}>
            <Button size="sm" variant="primary" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
              Dashboard
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-xs text-slate-400 font-medium">Pilih Role Pengguna:</div>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-md text-xs text-center border ${
                    currentUser.role === r
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>

            <Link href={`/dashboard/${currentUser.role === 'super_admin' ? 'admin' : currentUser.role}`} className="block pt-2">
              <Button size="md" variant="primary" className="w-full">
                Buka Dashboard ({ROLE_LABELS[currentUser.role]})
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
