'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SakugaButton } from '@/components/ui/sakuga-button';
import {
  getNearestRegistrationClose,
  getNextDeadline,
} from '@/lib/landing-data';
import { MascotIllustration } from './MascotIllustration';

// ─── Countdown helpers ─────────────────────────────────────────────────────

interface TimeLeft {
  hari: number;
  jam: number;
  menit: number;
  detik: number;
}

function computeTimeLeft(targetIso: string): TimeLeft {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const totalSec = Math.floor(diff / 1000);
  return {
    hari: Math.floor(totalSec / 86400),
    jam: Math.floor((totalSec % 86400) / 3600),
    menit: Math.floor((totalSec % 3600) / 60),
    detik: totalSec % 60,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// ─── Component ─────────────────────────────────────────────────────────────

export function HeroSection() {
  const nextDeadline = getNextDeadline();
  const nearestClose = getNearestRegistrationClose();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!nextDeadline) return;

    const timer = setTimeout(() => {
      setTimeLeft(computeTimeLeft(nextDeadline.date));
    }, 0);

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      return () => clearTimeout(timer);
    }

    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(nextDeadline.date));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [nextDeadline]);

  const registrationDateLabel = nearestClose?.dateFormatted ?? '10 Desember 2026';

  return (
    <section
      id="beranda"
      className="relative overflow-clip pt-12 pb-16 lg:pt-16 lg:pb-24"
      aria-labelledby="hero-heading"
    >
      {/* ── Blob latar poster ── */}
      <div className="blob-bg" aria-hidden="true">
        <div
          className="absolute -top-36 -left-44 w-[560px] h-[560px] rounded-full"
          style={{
            background: 'var(--brand-violet-500)',
            opacity: 0.35,
            filter: 'blur(120px)',
          }}
        />
        <div
          className="absolute top-96 -right-48 w-[520px] h-[520px] rounded-full"
          style={{
            background: 'var(--brand-pink)',
            opacity: 0.2,
            filter: 'blur(120px)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          {/* ── Kolom Kiri: Teks & Aksi ── */}
          <div className="flex-1 max-w-2xl text-left">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#33113a] text-[#F0A6F2] border border-[#5c2466]/40 mb-4">
              Lomba teknologi mahasiswa
            </span>

            <h1
              id="hero-heading"
              className="font-[family-name:var(--font-bricolage)] font-extrabold text-foreground tracking-tight leading-[1.05]"
              style={{ fontSize: 'clamp(40px, 7vw, 76px)' }}
            >
              Permifest{' '}
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
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
              Dua komunitas, satu arena. Pilih cabangmu, ajak timmu, lalu panjat papan
              peringkat. Santai aja, kami yang urus jadwalnya.
            </p>

            {/* CTA Buttons dengan Sakuga Impact VFX */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <SakugaButton
                href="/register"
                variant="brand"
                size="lg"
                sfxText="GASSS!!"
              >
                Daftar sekarang
              </SakugaButton>

              <SakugaButton
                href="#lomba"
                variant="secondary"
                size="lg"
                sfxText="IKUZO!!"
              >
                Lihat cabang lomba
              </SakugaButton>
            </div>

            {/* Badges Info */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#2a2108] text-[#E6C978] border border-[#524112]/40">
                Daftar: {registrationDateLabel}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#082436] text-[#6CC4FF] border border-[#144766]/40">
                Biaya: Mulai Rp 35.000
              </span>
            </div>

            {/* Countdown Box */}
            {nextDeadline && timeLeft && (
              <div className="mt-6 p-3.5 rounded-xl bg-[#140D33]/90 border border-[#2E2266] inline-block">
                <span className="text-[11px] font-semibold text-[#A99FD1] block mb-1.5 uppercase tracking-wider">
                  Hitung Mundur Deadline Pendaftaran
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Hari', val: timeLeft.hari },
                    { label: 'Jam', val: timeLeft.jam },
                    { label: 'Menit', val: timeLeft.menit },
                    { label: 'Detik', val: timeLeft.detik },
                  ].map(({ label, val }) => (
                    <div
                      key={label}
                      className="px-2.5 py-1 rounded-lg bg-[#0B0720] border border-[#2E2266] text-center min-w-[50px]"
                    >
                      <span className="tabular-nums text-lg font-bold font-[family-name:var(--font-jetbrains)] text-[#F5F2FF] leading-none block">
                        {pad(val)}
                      </span>
                      <span className="text-[9px] text-[#A99FD1] uppercase">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Kolom Kanan: Maskot Ilustrasi Kupu-kupu (docs HTML) ── */}
          <div className="flex-1 w-full max-w-[500px] flex justify-center items-center">
            <div className="w-full max-w-[460px] aspect-[520/480]">
              <MascotIllustration className="w-full h-full fl" variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
