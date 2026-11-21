'use client';

import React from 'react';

/**
 * Background bernuansa Anime Cyber Grid yang telah dioptimasi 100% menggunakan CSS murni.
 * Bebas dari canvas looping dan event listener JS berat sehingga konsumsi CPU mendekati 0%.
 */
export function SakugaHeroBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
    >
      {/* ── Layer 1: Ambient Manga Cyber Grid (Ringan & Statis) ── */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #9B6BF2 1px, transparent 1px),
            linear-gradient(to bottom, #9B6BF2 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Layer 2: Deep Color Atmosphere Orbs (Soft Gradient murni tanpa filter blur berat) ── */}
      <div
        className="absolute -top-32 -left-32 w-[540px] h-[540px] rounded-full pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(155, 107, 242, 0.28) 0%, rgba(124, 77, 219, 0.1) 45%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-48 -right-32 w-[520px] h-[520px] rounded-full pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(213, 107, 217, 0.22) 0%, rgba(108, 196, 255, 0.08) 45%, transparent 70%)',
        }}
      />

      {/* ── Layer 3: Manga Diagonal Speed Slash Bars (Anime Sakuga Accent) ── */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-1/4 -left-12 w-[180%] h-px bg-gradient-to-r from-transparent via-[#9B6BF2]/60 to-transparent transform -rotate-12" />
        <div className="absolute top-1/2 -left-12 w-[180%] h-[1.5px] bg-gradient-to-r from-transparent via-[#D56BD9]/40 to-transparent transform -rotate-12" />
        <div className="absolute top-3/4 -left-12 w-[180%] h-px bg-gradient-to-r from-transparent via-[#6CC4FF]/50 to-transparent transform -rotate-12" />
      </div>

      {/* ── Layer 4: Static Shimmering Anime Sparkles (Diproses GPU di Compositor Thread) ── */}
      <div className="absolute inset-0">
        <span
          className="absolute top-[18%] left-[12%] w-1.5 h-1.5 rounded-full bg-[#FFE359] animate-pulse opacity-70"
          style={{ animationDuration: '3s' }}
        />
        <span
          className="absolute top-[28%] right-[18%] w-2 h-2 rounded-full bg-[#6CC4FF] animate-pulse opacity-60"
          style={{ animationDuration: '4s' }}
        />
        <span
          className="absolute top-[65%] left-[8%] w-1.5 h-1.5 rounded-full bg-[#D56BD9] animate-pulse opacity-65"
          style={{ animationDuration: '3.5s' }}
        />
        <span
          className="absolute top-[75%] right-[22%] w-2 h-2 rounded-full bg-[#9B6BF2] animate-pulse opacity-75"
          style={{ animationDuration: '4.5s' }}
        />
        <span
          className="absolute top-[42%] left-[48%] w-1 h-1 rounded-full bg-[#FFFFFF] animate-pulse opacity-50"
          style={{ animationDuration: '2.5s' }}
        />
      </div>
    </div>
  );
}
