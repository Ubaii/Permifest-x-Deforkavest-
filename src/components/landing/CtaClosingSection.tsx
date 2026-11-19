'use client';

import React from 'react';
import Link from 'next/link';
import { MascotIllustration } from './MascotIllustration';

export function CtaClosingSection() {
  return (
    <section
      aria-label="Ajakan Pendaftaran"
      className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div
        className="rounded-3xl border border-[#2E2266] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 text-left"
        style={{
          background: 'linear-gradient(135deg, #241a57, #33113a)',
        }}
      >
        {/* Maskot Kupu-kupu */}
        <div className="w-48 sm:w-56 shrink-0 aspect-[400/360]">
          <MascotIllustration variant="simple" className="w-full h-full" />
        </div>

        {/* Teks & Tombol */}
        <div className="flex-1 max-w-xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-[family-name:var(--font-bricolage)] text-foreground tracking-tight leading-tight">
            Siap ikut{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              seru-seruan
            </span>
            ?
          </h2>

          <p className="mt-3 text-base sm:text-lg text-[#A99FD1] leading-relaxed">
            Kursi di arena terbatas, semangat nggak. Daftar sekarang sebelum pendaftaran
            ditutup.
          </p>

          <div className="mt-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl px-7 py-3.5 font-bold text-sm text-[#0B0720] transition-opacity hover:opacity-90 min-h-[48px]"
              style={{
                background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
              }}
            >
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
