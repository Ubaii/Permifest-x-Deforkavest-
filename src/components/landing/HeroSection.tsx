'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { SakugaButton } from '@/components/ui/sakuga-button';
import { SakugaHeroBackground } from './SakugaHeroBackground';
import {
  getNearestRegistrationClose,
  getNextDeadline,
} from '@/lib/landing-data';
import { MascotIllustration } from './MascotIllustration';
import { Clock } from '@phosphor-icons/react';

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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotion);

    if (nextDeadline) {
      const timer = setTimeout(() => {
        setTimeLeft(computeTimeLeft(nextDeadline.date));
      }, 0);

      const interval = setInterval(() => {
        setTimeLeft(computeTimeLeft(nextDeadline.date));
      }, 1000);

      return () => {
        mediaQuery.removeEventListener('change', handleMotion);
        clearTimeout(timer);
        clearInterval(interval);
      };
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMotion);
    };
  }, [nextDeadline]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 900) {
        setScrollY(window.scrollY);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (reducedMotion) return;
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2;
      const ny = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x: nx, y: ny });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [reducedMotion]);

  const registrationDateLabel = nearestClose?.dateFormatted ?? '11 Desember 2026';

  // Parallax transform calculations untuk maskot
  const mascotParallaxY = reducedMotion ? 0 : scrollY * -0.12;
  const mascotTiltX = reducedMotion ? 0 : mousePos.y * -5;
  const mascotTiltY = reducedMotion ? 0 : mousePos.x * 6;

  return (
    <section
      ref={heroRef}
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
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#140D33]/90 text-[#F5F2FF] border border-[#2E2266] shadow-sm mb-5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C4F15A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C4F15A]" />
              </span>
              <span className="tracking-wide">Pendaftaran Gelombang 1 Dibuka</span>
              <span className="text-[#A99FD1]/50">|</span>
              <span className="text-[#C4F15A]">Yogyakarta</span>
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

            {/* CTA Buttons dengan Sakuga VFX Web Component Resmi */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <sakuga-button
                onClick={() => {
                  window.location.href = '/register';
                }}
              >
                Daftar sekarang
              </sakuga-button>

              <sakuga-button
                variant="secondary"
                onClick={() => {
                  const el = document.getElementById('lomba');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Lihat cabang lomba
              </sakuga-button>
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

            {/* Countdown Box Bergaya Cyber Anime HUD yang Rapi & Presisi */}
            {nextDeadline && timeLeft && (
              <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#140D33]/95 border border-[#2E2266] shadow-[0_12px_36px_rgba(11,7,32,0.7)] backdrop-blur-md inline-block max-w-full">
                <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-[#2E2266]/70">
                  <span className="text-[11px] font-bold text-[#E6C978] uppercase tracking-wider">
                    Hitung Mundur Deadline Pendaftaran
                  </span>
                  <span className="text-[10px] font-mono text-[#A99FD1] bg-[#0B0720] px-2 py-0.5 rounded border border-[#2E2266]">
                    WIB (UTC+7)
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
                  {[
                    { label: 'Hari', val: timeLeft.hari },
                    { label: 'Jam', val: timeLeft.jam },
                    { label: 'Menit', val: timeLeft.menit },
                    { label: 'Detik', val: timeLeft.detik },
                  ].map(({ label, val }, i) => (
                    <React.Fragment key={label}>
                      <div className="flex flex-col items-center">
                        <div className="w-13 sm:w-16 h-14 sm:h-16 rounded-xl bg-[#0B0720] border border-[#2E2266] flex items-center justify-center shadow-inner group-hover:border-[#9B6BF2] transition-colors">
                          <span className="tabular-nums text-xl sm:text-2xl font-black font-[family-name:var(--font-jetbrains)] text-[#F5F2FF] tracking-tight">
                            {pad(val)}
                          </span>
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-[#A99FD1] font-bold uppercase tracking-wider mt-1.5">
                          {label}
                        </span>
                      </div>

                      {/* Pemisah titik dua digital */}
                      {i < 3 && (
                        <div className="flex flex-col justify-center items-center pb-5 select-none" aria-hidden="true">
                          <span className="text-sm sm:text-base font-bold text-[#9B6BF2] animate-pulse">
                            :
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#2E2266]/70 flex items-center justify-between text-[11px] text-[#A99FD1]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} className="text-[#6CC4FF]" />
                    Batas akhir: {registrationDateLabel}, 23:59 WIB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ── Kolom Kanan: Maskot Ilustrasi Kupu-kupu (Bersih, Proporsional & Elegan) ── */}
          <div className="flex-1 w-full max-w-[480px] flex justify-center items-center relative">
            {/* Anime Aura Glow di belakang maskot */}
            <div
              className="absolute w-[360px] h-[360px] rounded-full pointer-events-none transition-transform duration-300"
              style={{
                background: 'radial-gradient(circle, rgba(155, 107, 242, 0.4) 0%, rgba(213, 107, 217, 0.2) 45%, transparent 70%)',
                filter: 'blur(60px)',
                transform: `translateY(${mascotParallaxY * 0.5}px)`,
              }}
            />

            {/* Container Maskot dengan tilt 3D interaktif yang menyatu */}
            <div
              className="w-full aspect-[520/480] relative z-10 transition-transform duration-200 ease-out"
              style={{
                transform: `translateY(${mascotParallaxY}px) rotateX(${mascotTiltX}deg) rotateY(${mascotTiltY}deg)`,
                perspective: '1000px',
              }}
            >
              <MascotIllustration className="w-full h-full drop-shadow-[0_16px_40px_rgba(155,107,242,0.4)]" variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
