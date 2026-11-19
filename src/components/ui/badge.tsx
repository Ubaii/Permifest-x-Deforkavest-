import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'destructive' | 'info' | 'neutral' | 'primary' | 'gold' | 'cyber';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30',
    warning: 'bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/30',
    error: 'bg-[var(--destructive)]/15 text-[var(--destructive)] border border-[var(--destructive)]/30',
    destructive: 'bg-[var(--destructive)]/15 text-[var(--destructive)] border border-[var(--destructive)]/30',
    info: 'bg-[var(--info)]/15 text-[var(--info)] border border-[var(--info)]/30',
    neutral: 'bg-[var(--muted)] text-[var(--foreground)]/80 border border-[var(--border)]',
    primary: 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30',
    gold: 'bg-[var(--brand-gold)]/15 text-[var(--brand-gold-soft)] border border-[var(--brand-gold)]/40',
    cyber: 'bg-[var(--accent)] text-[var(--accent-foreground)] border border-[var(--primary)]/40 shadow-sm shadow-[var(--primary)]/20',
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
