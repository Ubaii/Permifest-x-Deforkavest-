'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            {label} {props.required && <span className="text-[var(--primary)]">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--muted-foreground)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]',
              'focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors min-h-[44px]',
              leftIcon ? 'pl-10' : '',
              error ? 'border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-[var(--destructive)]' : '',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[var(--destructive)] mt-1">{error}</p>}
        {!error && helperText && <p className="text-xs text-[var(--muted-foreground)] mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
