'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SakugaButton } from '@/components/ui/sakuga-button';
import { SakugaHeroBackground } from './SakugaHeroBackground';
import { CountdownTimer } from './CountdownTimer';
import {
  getNearestRegistrationClose,
  getNextDeadline,
} from '@/lib/landing-data';

export function HeroSection() {
  const nextDeadline = getNextDeadline();
  const nearestClose = getNearestRegistrationClose();
  const registrationDateLabel = nearestClose?.dateFormatted ?? '11 Desember 2026';

  return (
    <section
      id="beranda"
      className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-28"
      aria-labelledby="hero-heading"
    >
      {/* ── Sakuga & Parallax Ambient Canvas Background ── */}
      <SakugaHeroBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* ── Kolom Kiri: Teks & Aksi ── */}
          <div className="flex-1 max-w-2xl text-left">
            {/* Badge Status Resmi */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#140D33] text-[#F5F2FF] border border-[#2E2266] mb-5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#C4F15A]" />
              <span className="tracking-wide">Pendaftaran Gelombang 1 Dibuka</span>
              <span className="text-[#A99FD1]/40">·</span>
              <span className="text-[#C4F15A] font-bold">Yogyakarta</span>
            </div>

            <h1
              id="hero-heading"
              className="font-[family-name:var(--font-bricolage)] font-extrabold text-foreground tracking-tight leading-[1.04]"
              style={{ fontSize: 'clamp(42px, 7.5vw, 80px)' }}
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
              Dua komunitas, satu arena pertarungan teknologi & e-sport. Pilih cabangmu,
              ajak tim andalanmu, lalu kibarkan karyamu di panggung tertinggi.
            </p>

            {/* CTA Buttons: Pop-Art CSS Murni (Super Enteng & Kinetik) */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <SakugaButton
                href="/register"
                variant="brand"
                size="lg"
              >
                Daftar sekarang
              </SakugaButton>

              <SakugaButton
                href="#lomba"
                variant="secondary"
                size="lg"
              >
                Lihat cabang lomba
              </SakugaButton>
            </div>

            {/* Badges Info Ringkas */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2a2108] text-[#E6C978] border border-[#524112]/50">
                Batas Daftar: {registrationDateLabel}
              </span>
              <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-[#082436] text-[#6CC4FF] border border-[#144766]/50">
                Biaya: Mulai Rp 35.000
              </span>
            </div>

            {/* Countdown Box Mandiri (Terisolasi dari re-render HeroSection) */}
            {nextDeadline && (
              <CountdownTimer
                deadlineDate={nextDeadline.date}
                registrationDateLabel={registrationDateLabel}
              />
            )}
          </div>

          {/* ── Kolom Kanan: Ilustrasi Maskot Resmi (PNG Teroptimasi & Ringan GPU) ── */}
          <div className="flex-1 w-full max-w-[480px] flex justify-center items-center relative group">
            {/* Anime Aura Glow di belakang maskot (soft radial statis) */}
            <div
              className="absolute w-[360px] h-[360px] rounded-full pointer-events-none opacity-50"
              style={{
                background: 'radial-gradient(circle, rgba(155, 107, 242, 0.35) 0%, rgba(213, 107, 217, 0.15) 50%, transparent 70%)',
              }}
            />

            {/* Container Ilustrasi: Statis & Ringan tanpa loop animation */}
            <div className="w-full relative z-10 flex justify-center items-center transition-transform duration-300 ease-out group-hover:scale-[1.02]">
              <Image
                src="/ilustrasi.png"
                alt="Ilustrasi Resmi Permifest x Deforkafest 2026"
                width={520}
                height={520}
                priority
                className="w-full h-auto max-h-[460px] object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.45)] select-none pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
