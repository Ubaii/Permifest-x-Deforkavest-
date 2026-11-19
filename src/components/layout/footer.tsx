import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Terminal, Cpu } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-bold text-slate-100 tracking-wide">PERMIFEST × DEVORKAFEST</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Platform satu pintu untuk manajemen kompetisi akademik dan e-sport bertema Cybersecurity.
            </p>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Trust Infrastructure</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Kompetisi</h4>
            <ul className="space-y-2">
              <li><Link href="/kompetisi/esai-ilmiah" className="hover:text-cyan-400 transition-colors">Esai Ilmiah Cybersecurity</Link></li>
              <li><Link href="/kompetisi/ui-ux-design" className="hover:text-cyan-400 transition-colors">UI/UX Design Challenge</Link></li>
              <li><Link href="/kompetisi/it-system-architecture" className="hover:text-cyan-400 transition-colors">IT System Architecture</Link></li>
              <li><Link href="/kompetisi/pro-evolution-soccer" className="hover:text-cyan-400 transition-colors">eFootball / PES Championship</Link></li>
              <li><Link href="/kompetisi/mobile-legends" className="hover:text-cyan-400 transition-colors">Mobile Legends: Bang Bang</Link></li>
            </ul>
          </div>

          {/* Nav Links */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Navigasi</h4>
            <ul className="space-y-2">
              <li><Link href="/pengumuman" className="hover:text-cyan-400 transition-colors">Papan Pengumuman</Link></li>
              <li><Link href="/leaderboard" className="hover:text-cyan-400 transition-colors">Leaderboard & Hasil</Link></li>
              <li><Link href="/informasi" className="hover:text-cyan-400 transition-colors">Guidebook & FAQ</Link></li>
              <li><Link href="/informasi#kontak" className="hover:text-cyan-400 transition-colors">Kontak Panitia</Link></li>
            </ul>
          </div>

          {/* Security & System Info */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Sistem Keamanan</h4>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 font-mono text-[10px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>TIMEZONE:</span>
                <span className="text-cyan-400">UTC / WIB</span>
              </div>
              <div className="flex items-center justify-between">
                <span>AUTH ENGINE:</span>
                <span className="text-emerald-400">RBAC Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span>DEADLINE LOCK:</span>
                <span className="text-cyan-400">Automatic</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Diselenggarakan oleh Panitia Bersama Permifest & Devorkafest 2026.
            </p>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>© 2026 Permifest × Devorkafest. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Server: Vercel Edge</span>
            <span>•</span>
            <span>Security: SHA-256 Verified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
