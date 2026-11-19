'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'brand' | 'secondary' | 'outline' | 'danger' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer min-h-[44px]';

    const variants = {
      primary: 'bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-semibold shadow-sm',
      brand: 'bg-[image:var(--gradient-brand)] hover:opacity-95 text-white font-semibold shadow-sm',
      secondary: 'bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)]',
      outline: 'bg-transparent border border-[var(--border)] hover:border-[var(--primary)] text-[var(--foreground)] hover:bg-[var(--accent)]',
      danger: 'bg-[var(--destructive)]/15 border border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/25 text-[var(--destructive)]',
      destructive: 'bg-[var(--destructive)]/15 border border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/25 text-[var(--destructive)]',
      ghost: 'bg-transparent hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
      md: 'text-sm px-4 py-2 gap-2 min-h-[44px]',
      lg: 'text-base px-6 py-2.5 gap-2.5 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
