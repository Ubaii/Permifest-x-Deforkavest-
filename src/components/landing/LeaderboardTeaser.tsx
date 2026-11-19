'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

export function LeaderboardTeaser() {
  return (
    <section
      id="peringkat"
      aria-labelledby="leaderboard-heading"
      className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mb-10 text-left">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#1b2a07] text-[#C4F15A] border border-[#3b5912]/40 mb-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#C4F15A] mr-2 live-dot" aria-hidden="true" />
          Live
        </span>
        <h2
          id="leaderboard-heading"
          className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-bricolage)] text-foreground tracking-tight"
        >
          Papan peringkat,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            tanpa nunggu
          </span>
        </h2>
        <p className="mt-3 text-[#A99FD1] text-base leading-relaxed">
          Skor masuk, posisi langsung berubah. Kalau belum ada skor, papannya masih bersih dan
          siap diperebutkan.
        </p>
      </div>

      {/* Podium Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end max-w-5xl mx-auto">
        {/* Juara 2 (Kiri) */}
        <div className="rounded-2xl border border-[#2E2266] bg-[#140D33] p-6 text-center order-2 md:order-1 transition-all hover:border-[#7c4ddb]">
          <p
            className="font-[family-name:var(--font-jetbrains)] font-bold text-4xl mb-2"
            style={{ color: '#C9C3E0' }}
          >
            2
          </p>
          <h3 className="text-lg font-bold font-[family-name:var(--font-bricolage)] text-[#F5F2FF]">
            Tim Contoh B
          </h3>
          <p className="text-xs text-[#A99FD1] mt-1 font-medium">
            Menunggu skor
          </p>
        </div>

        {/* Juara 1 (Tengah - Elevated) */}
        <div
          className="rounded-2xl border bg-[#140D33] p-8 sm:py-12 text-center order-1 md:order-2 shadow-xl transition-all"
          style={{ borderColor: '#C9A04A' }}
        >
          <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#2a2108] text-[#E6C978] mb-3">
            Peringkat Pertama
          </span>
          <p
            className="font-[family-name:var(--font-jetbrains)] font-bold leading-none mb-3"
            style={{ color: '#E6C978', fontSize: '56px' }}
          >
            1
          </p>
          <h3 className="text-xl font-bold font-[family-name:var(--font-bricolage)] text-[#F5F2FF]">
            Tim Contoh A
          </h3>
          <p className="text-xs text-[#A99FD1] mt-1 font-medium">
            Menunggu skor
          </p>
        </div>

        {/* Juara 3 (Kanan) */}
        <div className="rounded-2xl border border-[#2E2266] bg-[#140D33] p-6 text-center order-3 transition-all hover:border-[#7c4ddb]">
          <p
            className="font-[family-name:var(--font-jetbrains)] font-bold text-4xl mb-2"
            style={{ color: '#D98A5B' }}
          >
            3
          </p>
          <h3 className="text-lg font-bold font-[family-name:var(--font-bricolage)] text-[#F5F2FF]">
            Tim Contoh C
          </h3>
          <p className="text-xs text-[#A99FD1] mt-1 font-medium">
            Menunggu skor
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/leaderboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-[#F5F2FF] bg-[#1d1347] border border-[#2E2266] hover:bg-[#25195c] hover:border-[#7c4ddb] transition-all min-h-[44px]"
        >
          <span>Buka Halaman Papan Peringkat Lengkap</span>
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </section>
  );
}
