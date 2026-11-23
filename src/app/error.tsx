'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowsClockwise, House, WarningCircle } from '@phosphor-icons/react';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error secara aman tanpa membocorkan kredensial
    console.error('Application Error Boundary Triggered:', error?.message);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0720] px-4 py-16 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Badge */}
        <div
          className="inline-block px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#0B0720] bg-rose-400 shadow-[3px_3px_0px_#0B0720] mb-6 select-none"
          style={{ transform: 'rotate(-2deg)' }}
        >
          Terjadi Gangguan Sementara
        </div>

        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 text-rose-300 flex items-center justify-center mx-auto mb-4">
          <WarningCircle size={32} weight="bold" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-bricolage)] text-[#F5F2FF]">
          Oops! Ada masalah saat memuat data
        </h1>

        <p className="mt-3 text-sm text-[#A99FD1] leading-relaxed max-w-md mx-auto">
          Sistem mendeteksi kendala pada sambungan atau rendering halaman. Jangan khawatir, data akun dan pendaftaranmu tetap aman.
        </p>

        {error?.digest && (
          <p className="mt-2 text-[11px] font-mono text-[#A99FD1]/60">
            ID Masalah: {error.digest}
          </p>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-[#0B0720] bg-[#C4F15A] hover:bg-[#b5e546] active:translate-y-0.5 shadow-[3px_3px_0px_#0B0720] transition-all min-h-[44px] cursor-pointer"
          >
            <ArrowsClockwise size={18} weight="bold" />
            <span>Coba Muat Ulang</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-[#F5F2FF] bg-[#140D33] border-2 border-[#2E2266] hover:border-[#6CC4FF] hover:bg-[#1d1347] transition-all min-h-[44px]"
          >
            <House size={18} weight="bold" />
            <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
