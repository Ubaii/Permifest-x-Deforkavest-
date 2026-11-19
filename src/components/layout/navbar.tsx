'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS } from '@/lib/constants';
import { Shield, Menu, X, LayoutDashboard, LogIn, UserPlus, LogOut, User } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoggedIn, logout } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/kompetisi', label: 'Kompetisi' },
    { href: '/pengumuman', label: 'Pengumuman' },
    { href: '/leaderboard', label: 'Hasil Akhir' },
    { href: '/informasi', label: 'Informasi Event' },
  ];

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const getDashboardUrl = () => {
    if (!currentUser) return '/login';
    return `/dashboard/${currentUser.role === 'super_admin' ? 'admin' : currentUser.role}`;
  };

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

        {/* Right Section: Auth Buttons / Logged-in User Profile */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link href={getDashboardUrl()}>
                <Button size="sm" variant="primary" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                  Dashboard ({ROLE_LABELS[currentUser.role]})
                </Button>
              </Link>

              {/* User Dropdown / Logout */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-colors cursor-pointer"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser.full_name}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1.5 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white truncate">{currentUser.full_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {ROLE_LABELS[currentUser.role]}
                      </span>
                    </div>

                    <Link
                      href={getDashboardUrl()}
                      onClick={() => setUserMenuOpen(false)}
                      className="px-3 py-2 text-xs flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Buka Dashboard</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost" leftIcon={<LogIn className="w-4 h-4" />}>
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary" leftIcon={<UserPlus className="w-4 h-4" />}>
                  Daftar
                </Button>
              </Link>
            </div>
          )}
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
            {isLoggedIn ? (
              <div className="space-y-2">
                <div className="px-3 py-2 rounded-md bg-slate-900 border border-slate-800">
                  <div className="text-xs font-semibold text-white">{currentUser.full_name}</div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                  <div className="text-[10px] text-cyan-400 mt-1">Role: {ROLE_LABELS[currentUser.role]}</div>
                </div>

                <Link href={getDashboardUrl()} onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button size="md" variant="primary" className="w-full">
                    Buka Dashboard
                  </Button>
                </Link>

                <Button
                  size="md"
                  variant="outline"
                  className="w-full text-rose-400 border-rose-900/50 hover:bg-rose-950/20"
                  onClick={handleLogout}
                >
                  Keluar (Logout)
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="md" variant="outline" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="md" variant="primary" className="w-full">
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
