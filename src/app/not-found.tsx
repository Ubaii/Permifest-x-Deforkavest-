'use client';

import React from 'react';
import Link from 'next/link';
import { House, Trophy } from '@phosphor-icons/react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0720] px-4 py-16 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#9B6BF2]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#6CC4FF]/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Washi Tape Badge */}
        <div
          className="inline-block px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#0B0720] bg-[#FFE359] shadow-[3px_3px_0px_#0B0720] mb-6 select-none"
          style={{ transform: 'rotate(-2deg)' }}
        >
          ★ 404: Halaman Tidak Ditemukan
        </div>

        {/* Big Glitch-Style Number */}
        <h1 className="text-7xl sm:text-9xl font-black font-[family-name:var(--font-bricolage)] text-transparent bg-clip-text bg-gradient-to-br from-[#9B6BF2] via-[#D56BD9] to-[#6CC4FF] tracking-tighter leading-none select-none">
          404
        </h1>

        <h2 className="mt-4 text-xl sm:text-2xl font-bold font-[family-name:var(--font-bricolage)] text-[#F5F2FF]">
          Waduh! Jalur yang kamu tuju belum terdaftar
        </h2>

        <p className="mt-3 text-sm text-[#A99FD1] leading-relaxed max-w-md mx-auto">
          Halaman yang kamu cari mungkin telah dipindahkan, tautannya salah, atau agenda tersebut belum dibuka oleh panitia.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-[#0B0720] bg-[#C4F15A] hover:bg-[#b5e546] active:translate-y-0.5 shadow-[3px_3px_0px_#0B0720] transition-all min-h-[44px]"
          >
            <House size={18} weight="bold" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href="/kompetisi"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-[#F5F2FF] bg-[#140D33] border-2 border-[#2E2266] hover:border-[#6CC4FF] hover:bg-[#1d1347] transition-all min-h-[44px]"
          >
            <Trophy size={18} weight="bold" />
            <span>Lihat Cabang Lomba</span>
          </Link>
        </div>

        {/* Footer small note */}
        <p className="mt-12 text-[11px] text-[#A99FD1]/60 font-mono">
          Permifest x Deforkafest 2026 • Official Platform
        </p>
      </div>
    </main>
  );
}
