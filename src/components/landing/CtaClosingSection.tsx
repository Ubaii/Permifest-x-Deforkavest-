'use client';

import React from 'react';
import Image from 'next/image';
import { SakugaButton } from '@/components/ui/sakuga-button';

export function CtaClosingSection() {
  return (
    <section
      aria-label="Ajakan Pendaftaran"
      className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div
        className="rounded-3xl border border-[#2E2266] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 text-left bg-gradient-to-br from-[#241a57] to-[#33113a]"
      >
        {/* Ilustrasi Maskot (PNG Teroptimasi) */}
        <div className="w-44 sm:w-52 shrink-0 aspect-square flex items-center justify-center">
          <Image
            src="/ilustrasi.png"
            alt="Maskot Permifest x Deforkafest 2026"
            width={240}
            height={240}
            className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)] pointer-events-none select-none"
          />
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
            <SakugaButton
              href="/register"
              variant="brand"
              size="lg"
            >
              Daftar sekarang
            </SakugaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
