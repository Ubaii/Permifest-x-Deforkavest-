'use client';

import React from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, id, type, ...props }, ref) => {
    const inputId = id || props.name;
    const [passwordVisible, setPasswordVisible] = React.useState(false);
    const isPassword = type === 'password';

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
              isPassword ? 'pr-12' : '',
              error ? 'border-[var(--destructive)] focus:border-[var(--destructive)] focus:ring-[var(--destructive)]' : '',
              className
            )}
            type={isPassword && passwordVisible ? 'text' : type}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              className="absolute inset-y-0 right-0 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-r-[var(--radius-md)] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)] disabled:cursor-not-allowed"
              aria-label={`${passwordVisible ? 'Sembunyikan' : 'Tampilkan'} ${label || 'kata sandi'}`}
              aria-pressed={passwordVisible}
              disabled={props.disabled}
            >
              {passwordVisible ? (
                <EyeSlash size={20} aria-hidden="true" />
              ) : (
                <Eye size={20} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-[var(--destructive)] mt-1">{error}</p>}
        {!error && helperText && <p className="text-xs text-[var(--muted-foreground)] mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
