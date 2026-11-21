'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getSakugaVfx, SakugaConfig } from '@/lib/sakuga/sakuga-engine';

export interface SakugaButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Rute URL Next.js jika tombol bertindak sebagai link navigasi */
  href?: string;
  /** Varian visual tombol bergaya Sakuga Anime */
  variant?: 'brand' | 'primary' | 'secondary' | 'gold' | 'outline';
  /** Ukuran tombol */
  size?: 'sm' | 'md' | 'lg';
  /** Teks efek onomatopoeia manga (contoh: "GASSS!!", "BOOM!!", "IKUZO!!") */
  sfxText?: string;
  /** Konfigurasi warna atau intensitas partikel */
  vfxConfig?: Partial<SakugaConfig>;
  /** Nonaktifkan efek sakuga jika diinginkan */
  disableVfx?: boolean;
  /** Status loading */
  isLoading?: boolean;
  /** Ikon kiri atau kanan */
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const SakugaButton = React.forwardRef<HTMLButtonElement, SakugaButtonProps>(
  (
    {
      className,
      children,
      href,
      variant = 'brand',
      size = 'md',
      sfxText = 'GASSS!!',
      vfxConfig,
      disableVfx = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);

    const handleTrigger = (e: React.MouseEvent<any>) => {
      if (disabled || isLoading) return;

      if (!disableVfx && internalRef.current) {
        let palette: string[] | undefined = vfxConfig?.colors;
        if (!palette) {
          if (variant === 'brand') {
            palette = ['#9B6BF2', '#D56BD9', '#FFE359', '#FFFFFF', '#6CC4FF'];
          } else if (variant === 'gold') {
            palette = ['#FFE359', '#FFB703', '#FFFFFF', '#FB8500', '#D56BD9'];
          } else if (variant === 'primary') {
            palette = ['#6CC4FF', '#9B6BF2', '#00F0FF', '#FFFFFF'];
          }
        }

        getSakugaVfx().trigger(internalRef.current, {
          sfxText,
          colors: palette,
          intensity: vfxConfig?.intensity ?? 1,
          showSfxText: vfxConfig?.showSfxText ?? true,
        });
      }

      onClick?.(e);
    };

    // Styling Sakuga VFX sejati: Hard Anime Border, Manga Solid Pop Shadow, Tilt & Skew Hover
    const baseStyles = cn(
      'relative inline-flex items-center justify-center font-black select-none cursor-pointer',
      'rounded-xl transition-all duration-150',
      'ease-[cubic-bezier(0.34,1.56,0.64,1)]', // Spring snappy curve
      // Efek Anime Hover: miring, skew, terangkat ke kiri atas
      'hover:-translate-y-1 hover:-translate-x-0.5 hover:-rotate-1.5 hover:skew-x-[-2deg]',
      // Efek Anime Active (Press): menekan ke kanan bawah, kembali tegak, shadow mengecil
      'active:translate-y-0.5 active:translate-x-0.5 active:rotate-0 active:skew-x-0 active:scale-95',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9B6BF2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0720]',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
      'motion-reduce:transform-none motion-reduce:transition-none'
    );

    const variants = {
      brand: cn(
        'text-[#0B0720] border-2 border-[#0B0720]',
        'shadow-[4px_4px_0px_#0B0720]',
        'hover:shadow-[7px_7px_0px_#0B0720,10px_10px_0px_#FFE359]',
        'active:shadow-[1px_1px_0px_#0B0720]'
      ),
      primary: cn(
        'bg-[#6CC4FF] text-[#082436] border-2 border-[#082436]',
        'shadow-[4px_4px_0px_#082436]',
        'hover:bg-[#85cfff] hover:shadow-[7px_7px_0px_#082436,10px_10px_0px_#9B6BF2]',
        'active:shadow-[1px_1px_0px_#082436]'
      ),
      gold: cn(
        'bg-[#FFE359] text-[#2A2108] border-2 border-[#2A2108]',
        'shadow-[4px_4px_0px_#2A2108]',
        'hover:bg-[#ffea75] hover:shadow-[7px_7px_0px_#2A2108,10px_10px_0px_#D56BD9]',
        'active:shadow-[1px_1px_0px_#2A2108]'
      ),
      secondary: cn(
        'bg-[#140D33] text-[#F5F2FF] border-2 border-[#2E2266]',
        'shadow-[4px_4px_0px_#0B0720]',
        'hover:bg-[#1D1347] hover:border-[#9B6BF2] hover:shadow-[7px_7px_0px_#0B0720,10px_10px_0px_#9B6BF2]',
        'active:shadow-[1px_1px_0px_#0B0720]'
      ),
      outline: cn(
        'bg-transparent text-[#F5F2FF] border-2 border-[#9B6BF2]',
        'shadow-[3px_3px_0px_#9B6BF2]',
        'hover:bg-[#9B6BF2]/20 hover:shadow-[6px_6px_0px_#9B6BF2,9px_9px_0px_#D56BD9]',
        'active:shadow-[1px_1px_0px_#9B6BF2]'
      ),
    };

    const brandGradientStyle =
      variant === 'brand'
        ? {
            background: 'linear-gradient(135deg, #9B6BF2 0%, #D56BD9 100%)',
          }
        : undefined;

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 min-h-[38px]',
      md: 'text-sm px-5 py-2.5 gap-2 min-h-[44px]',
      lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]',
    };

    const content = (
      <>
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </>
    );

    if (href && !disabled) {
      return (
        <Link
          href={href}
          ref={(node) => {
            internalRef.current = node;
          }}
          onClick={handleTrigger}
          className={cn(baseStyles, variants[variant], sizes[size], className)}
          style={brandGradientStyle}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
        }}
        type={props.type || 'button'}
        onClick={handleTrigger}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={brandGradientStyle}
        {...props}
      >
        {content}
      </button>
    );
  }
);

SakugaButton.displayName = 'SakugaButton';
