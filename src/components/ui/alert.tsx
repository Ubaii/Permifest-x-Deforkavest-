'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Info, CheckCircle, Warning, XCircle, X } from '@phosphor-icons/react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive';
  icon?: React.ReactNode;
  onClose?: () => void;
}

export function Alert({
  className,
  variant = 'default',
  icon,
  onClose,
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    default: 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] shadow-2xs',
    info: 'bg-[var(--info)]/10 text-[var(--foreground)] border-[var(--info)]/30 shadow-2xs',
    success: 'bg-[var(--success)]/10 text-[var(--foreground)] border-[var(--success)]/30 shadow-2xs',
    warning: 'bg-[var(--warning)]/10 text-[var(--foreground)] border-[var(--warning)]/30 shadow-2xs',
    destructive: 'bg-[var(--destructive)]/10 text-[var(--foreground)] border-[var(--destructive)]/30 shadow-2xs',
  };

  const defaultIcons = {
    default: <Info className="w-5 h-5 text-[var(--primary)] shrink-0" weight="bold" />,
    info: <Info className="w-5 h-5 text-[var(--info)] shrink-0" weight="bold" />,
    success: <CheckCircle className="w-5 h-5 text-[var(--success)] shrink-0" weight="bold" />,
    warning: <Warning className="w-5 h-5 text-[var(--warning)] shrink-0" weight="bold" />,
    destructive: <XCircle className="w-5 h-5 text-[var(--destructive)] shrink-0" weight="bold" />,
  };

  const renderedIcon = icon !== undefined ? icon : defaultIcons[variant];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 w-full p-4 rounded-[var(--radius-md)] border text-sm transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {renderedIcon && <div className="mt-0.5 shrink-0">{renderedIcon}</div>}
      <div className="flex-1 min-w-0">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="p-1 -mr-1 -mt-1 rounded-md text-inherit opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function AlertTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn('font-semibold text-sm leading-none tracking-tight mb-1 text-inherit', className)}
      {...props}
    >
      {children}
    </h5>
  );
}

export function AlertDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn('text-xs md:text-sm opacity-90 leading-relaxed text-inherit', className)}
      {...props}
    >
      {children}
    </div>
  );
}
