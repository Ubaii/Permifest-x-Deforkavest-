import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'cyber';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    error: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    info: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700',
    cyber: 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-full font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5 transition-colors', variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
