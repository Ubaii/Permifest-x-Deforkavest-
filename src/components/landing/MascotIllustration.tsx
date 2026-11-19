import React from 'react';

interface MascotIllustrationProps {
  className?: string;
  variant?: 'hero' | 'simple';
}

export function MascotIllustration({
  className = '',
  variant = 'hero',
}: MascotIllustrationProps) {
  if (variant === 'simple') {
    return (
      <svg
        viewBox="0 0 400 360"
        className={className}
        role="img"
        aria-label="Maskot Kupu-kupu Deforkafest"
      >
        <defs>
          <linearGradient id="g-mascot-s" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#9B6BF2" />
            <stop offset="1" stopColor="#D56BD9" />
          </linearGradient>
          <g id="wg-s">
            <path
              d="M200 170C120 30 10 40 28 130C40 200 120 215 200 190Z"
              fill="url(#g-mascot-s)"
              stroke="#F5F2FF"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M200 192C135 212 70 250 95 312C120 352 188 292 200 232Z"
              fill="#7C4DDB"
              stroke="#F5F2FF"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <circle cx="90" cy="120" r="22" fill="#F5F2FF" opacity="0.55" />
            <circle cx="130" cy="170" r="11" fill="#F5F2FF" opacity="0.55" />
            <circle cx="118" cy="272" r="13" fill="#C4F15A" />
          </g>
          <g id="bf-s">
            <use href="#wg-s" />
            <use href="#wg-s" transform="translate(400 0) scale(-1 1)" />
            <rect x="182" y="130" width="36" height="170" rx="18" fill="#F5F2FF" />
            <circle
              cx="200"
              cy="138"
              r="40"
              fill="#F5F2FF"
              stroke="#0B0720"
              strokeWidth="6"
            />
            <path
              d="M176 128h20v16h-20zM204 128h20v16h-20z"
              fill="#0B0720"
              stroke="#0B0720"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path d="M196 134h8" stroke="#0B0720" strokeWidth="5" />
            <path
              d="M186 156q14 14 28 0"
              fill="none"
              stroke="#0B0720"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M186 104Q170 60 140 54M214 104Q230 60 260 54"
              fill="none"
              stroke="#F5F2FF"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="140" cy="54" r="9" fill="#C4F15A" />
            <circle cx="260" cy="54" r="9" fill="#C4F15A" />
          </g>
        </defs>
        <use href="#bf-s" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 520 480"
      className={className}
      role="img"
      aria-label="Ilustrasi kupu-kupu maskot berkacamata hitam dikelilingi stiker perisai, stik game, kursor, dan jaringan saraf"
    >
      <defs>
        <linearGradient id="g1-mascot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9B6BF2" />
          <stop offset="1" stopColor="#D56BD9" />
        </linearGradient>
        <path
          id="sp-star"
          d="M0-14C2-4 4-2 14 0C4 2 2 4 0 14C-2 4-4 2-14 0C-4-2-2-4 0-14Z"
        />
        <symbol id="i-cur-mascot" viewBox="0 0 32 32">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 5v19l5-5 4 8 3-1.5-4-8h7z" />
          </g>
        </symbol>
        <symbol id="i-arch-mascot" viewBox="0 0 32 32">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="5" width="22" height="7" rx="2" />
            <rect x="5" y="20" width="10" height="7" rx="2" />
            <rect x="17" y="20" width="10" height="7" rx="2" />
            <path d="M16 12v4M10 20v-4h12v4" />
          </g>
        </symbol>
        <symbol id="i-sh-mascot" viewBox="0 0 32 32">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 4l10 4v8c0 6-4 10-10 12C10 26 6 22 6 16V8z" />
            <path d="M11 16l4 4 6-8" />
          </g>
        </symbol>
        <symbol id="i-net-mascot" viewBox="0 0 32 32">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="7" cy="9" r="3" />
            <circle cx="7" cy="23" r="3" />
            <circle cx="16" cy="16" r="3" />
            <circle cx="25" cy="16" r="3" />
            <path d="M10 9l3.5 5M10 23l3.5-5M19 16h3" />
          </g>
        </symbol>
        <symbol id="i-pad-mascot" viewBox="0 0 32 32">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="9" width="26" height="15" rx="7" />
            <path d="M10 13v7M6.5 16.5h7" />
            <circle cx="21" cy="14.5" r="1" />
            <circle cx="24" cy="18.5" r="1" />
          </g>
        </symbol>

        <g id="wg-hero">
          <path
            d="M200 170C120 30 10 40 28 130C40 200 120 215 200 190Z"
            fill="url(#g1-mascot)"
            stroke="#F5F2FF"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d="M200 192C135 212 70 250 95 312C120 352 188 292 200 232Z"
            fill="#7C4DDB"
            stroke="#F5F2FF"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <circle cx="90" cy="120" r="22" fill="#F5F2FF" opacity="0.55" />
          <circle cx="130" cy="170" r="11" fill="#F5F2FF" opacity="0.55" />
          <circle cx="118" cy="272" r="13" fill="#C4F15A" />
        </g>

        <g id="bf-hero">
          <use href="#wg-hero" />
          <use href="#wg-hero" transform="translate(400 0) scale(-1 1)" />
          <rect x="182" y="130" width="36" height="170" rx="18" fill="#F5F2FF" />
          <circle
            cx="200"
            cy="138"
            r="40"
            fill="#F5F2FF"
            stroke="#0B0720"
            strokeWidth="6"
          />
          <path
            d="M176 128h20v16h-20zM204 128h20v16h-20z"
            fill="#0B0720"
            stroke="#0B0720"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path d="M196 134h8" stroke="#0B0720" strokeWidth="5" />
          <path
            d="M186 156q14 14 28 0"
            fill="none"
            stroke="#0B0720"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M186 104Q170 60 140 54M214 104Q230 60 260 54"
            fill="none"
            stroke="#F5F2FF"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="140" cy="54" r="9" fill="#C4F15A" />
          <circle cx="260" cy="54" r="9" fill="#C4F15A" />
        </g>
      </defs>

      <use href="#bf-hero" transform="translate(60 70)" />

      {/* Badges / Stickers floating around */}
      <g transform="translate(70 84) rotate(-12)">
        <rect
          x="-38"
          y="-38"
          width="76"
          height="76"
          rx="22"
          fill="#6CC4FF"
          stroke="#F5F2FF"
          strokeWidth="4"
        />
        <use
          href="#i-sh-mascot"
          x="-22"
          y="-22"
          width="44"
          height="44"
          color="#0B0720"
        />
      </g>

      <g transform="translate(452 110) rotate(10)">
        <rect
          x="-38"
          y="-38"
          width="76"
          height="76"
          rx="22"
          fill="#E6C978"
          stroke="#F5F2FF"
          strokeWidth="4"
        />
        <use
          href="#i-cur-mascot"
          x="-22"
          y="-22"
          width="44"
          height="44"
          color="#0B0720"
        />
      </g>

      <g transform="translate(66 396) rotate(8)">
        <rect
          x="-38"
          y="-38"
          width="76"
          height="76"
          rx="22"
          fill="#C4F15A"
          stroke="#F5F2FF"
          strokeWidth="4"
        />
        <use
          href="#i-pad-mascot"
          x="-22"
          y="-22"
          width="44"
          height="44"
          color="#0B0720"
        />
      </g>

      <g transform="translate(456 390) rotate(-10)">
        <rect
          x="-38"
          y="-38"
          width="76"
          height="76"
          rx="22"
          fill="#F0A6F2"
          stroke="#F5F2FF"
          strokeWidth="4"
        />
        <use
          href="#i-net-mascot"
          x="-22"
          y="-22"
          width="44"
          height="44"
          color="#0B0720"
        />
      </g>

      {/* Sparkles */}
      <use href="#sp-star" transform="translate(260 30) scale(1.2)" fill="#E6C978" />
      <use href="#sp-star" transform="translate(500 250)" fill="#C4F15A" />
      <use href="#sp-star" transform="translate(20 250) scale(.8)" fill="#F0A6F2" />
      <use href="#sp-star" transform="translate(260 455) scale(.9)" fill="#6CC4FF" />
    </svg>
  );
}
