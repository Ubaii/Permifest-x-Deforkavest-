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
      {/* ── Layer 1: Ambient Vignette & Deep Cosmic Atmosphere (CSS radial statis murni) ── */}
      <div
        className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(155, 107, 242, 0.25) 0%, rgba(124, 77, 219, 0.08) 50%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-36 -right-24 w-[460px] h-[460px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(213, 107, 217, 0.2) 0%, rgba(108, 196, 255, 0.06) 50%, transparent 70%)',
        }}
      />

      {/* ── Layer 2: Subtle Horizontal Ambient Divider (Statis & Halus) ── */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#9B6BF2]/20 to-transparent" />
    </div>
  );
}
