'use client';

import React from 'react';
import Image from 'next/image';
import { SakugaButton } from '@/components/ui/sakuga-button';
import { SakugaHeroBackground } from './SakugaHeroBackground';

export function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative overflow-hidden pt-10 pb-12 lg:pt-16 lg:pb-20"
      aria-labelledby="hero-heading"
    >
      {/* ── Ambient Background Canvas CSS ── */}
      <SakugaHeroBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          {/* ── Kolom Kiri: Teks & Aksi ── */}
          <div className="flex-1 max-w-2xl text-left">
            {/* Washi-Tape Status Pill (Playful Manga Style) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#140D33] text-[#FFE359] border-2 border-[#524112] shadow-[3px_3px_0px_#0B0720] mb-5 -rotate-1 hover:rotate-0 transition-transform cursor-default">
              <span className="w-2 h-2 rounded-full bg-[#C4F15A]" />
              <span>Pendaftaran Gelombang 1 Dibuka</span>
              <span className="text-[#A99FD1]/40">·</span>
              <span className="text-[#6CC4FF]">Yogyakarta</span>
            </div>

            <h1
              id="hero-heading"
              className="font-[family-name:var(--font-bricolage)] font-extrabold text-foreground tracking-tight leading-[1.04]"
              style={{ fontSize: 'clamp(42px, 7.5vw, 82px)' }}
            >
              Permifest{' '}
              <span
                className="inline-block relative"
                style={{
                  background: 'linear-gradient(135deg, #9B6BF2 0%, #D56BD9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                x
              </span>{' '}
              Deforkafest
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#A99FD1] leading-relaxed max-w-xl">
              Dua komunitas, satu arena pertarungan teknologi &amp; e-sport mahasiswa. Pilih cabangmu, ajak tim andalanmu, lalu kibarkan karyamu di panggung tertinggi.
            </p>

            {/* CTA Buttons: Pop-Art CSS Murni */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <SakugaButton
                href="/register"
                variant="brand"
                size="lg"
              >
                Daftar sekarang
              </SakugaButton>

              <SakugaButton
                href="#panduan"
                variant="secondary"
                size="lg"
              >
                Panduan pendaftaran
              </SakugaButton>
            </div>

            {/* Badges Info Ringkas Tanpa Ikon Menumpuk */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold bg-[#2a2108] text-[#E6C978] border border-[#524112]/60 shadow-[2px_2px_0px_#0B0720]">
                Batas Daftar: 11 Desember 2026
              </span>
              <span className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold bg-[#082436] text-[#6CC4FF] border border-[#144766]/60 shadow-[2px_2px_0px_#0B0720]">
                Biaya: Mulai Rp 35.000
              </span>
            </div>
          </div>

          {/* ── Kolom Kanan: Ilustrasi Maskot Playful dengan Stiker Manga Interaktif ── */}
          <div className="flex-1 w-full max-w-[560px] lg:max-w-[620px] flex justify-center items-center relative group">
            {/* Ambient Radial Atmosphere */}
            <div
              className="absolute w-[440px] h-[440px] rounded-full pointer-events-none opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(155, 107, 242, 0.45) 0%, rgba(213, 107, 217, 0.2) 50%, transparent 70%)',
              }}
            />

            {/* ── Playful Sticker 1: 5 Cabang Lomba (Kanan Atas) ── */}
            <div className="absolute -top-3 right-4 sm:right-8 z-20 transform rotate-6 hover:rotate-2 hover:scale-110 transition-all duration-200 cursor-pointer select-none">
              <div className="px-3.5 py-1.5 rounded-xl bg-[#C4F15A] text-[#0B0720] font-black text-xs uppercase tracking-wider border-2 border-[#0B0720] shadow-[4px_4px_0px_#0B0720]">
                5 Cabang Lomba!
              </div>
            </div>

            {/* ── Playful Sticker 2: Total Hadiah (Kiri Bawah) ── */}
            <div className="absolute -bottom-2 -left-2 sm:left-4 z-20 transform -rotate-6 hover:-rotate-1 hover:scale-110 transition-all duration-200 cursor-pointer select-none">
              <div className="px-3.5 py-1.5 rounded-xl bg-[#FFE359] text-[#0B0720] font-black text-xs uppercase tracking-wider border-2 border-[#0B0720] shadow-[4px_4px_0px_#0B0720]">
                Total Hadiah Puluhan Juta!
              </div>
            </div>

            {/* ── Playful Sticker 3: Venue UST (Kanan Bawah) ── */}
            <div className="absolute bottom-6 right-2 sm:right-6 z-20 transform rotate-3 hover:rotate-0 hover:scale-110 transition-all duration-200 cursor-pointer select-none">
              <div className="px-3 py-1.5 rounded-xl bg-[#6CC4FF] text-[#0B0720] font-black text-[11px] uppercase tracking-wider border-2 border-[#0B0720] shadow-[4px_4px_0px_#0B0720]">
                Arena Kampus UST
              </div>
            </div>

            {/* Ilustrasi Maskot Utama (Megah & Halus Hover 3D) */}
            <div className="w-full relative z-10 flex justify-center items-center transition-transform duration-300 ease-out group-hover:scale-[1.03] group-hover:-rotate-1">
              <Image
                src="/ilustrasi.png"
                alt="Ilustrasi Resmi Permifest x Deforkafest 2026"
                width={640}
                height={640}
                priority
                className="w-full h-auto max-h-[520px] lg:max-h-[580px] object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.6)] select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
