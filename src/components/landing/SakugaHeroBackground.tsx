'use client';

import React from 'react';

/**
 * Background Hero Section yang dioptimasi ultra-ringan (0% CPU, 60 FPS murni).
 * Menghilangkan infinite animation loop, repeating complex grid, dan oversized transformed divs
 * sehingga browser tidak membuang resource GPU untuk repaint terus-menerus.
 */
export function SakugaHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* ── Layer 1: Subtle CSS Diagonal Grid Pattern (Ringan, Murni CSS, Tanpa Repaint) ── */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #9B6BF2 0,
            #9B6BF2 1px,
            transparent 1px,
            transparent 28px
          )`,
        }}
      />

      {/* ── Layer 2: Ambient Atmosphere Gradients (Ringan, Halus & Murni CSS Statis) ── */}
      <div
        className="absolute -top-28 -left-28 w-[520px] h-[520px] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(155, 107, 242, 0.28) 0%, rgba(124, 77, 219, 0.1) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-28 -right-24 w-[500px] h-[500px] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(213, 107, 217, 0.22) 0%, rgba(108, 196, 255, 0.08) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-16 left-1/3 w-[420px] h-[280px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(108, 196, 255, 0.18) 0%, transparent 65%)',
        }}
      />

      {/* ── Layer 3: Subtle Horizontal Ambient Divider (Statis & Halus) ── */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B6BF2]/25 to-transparent" />
    </div>
  );
}
