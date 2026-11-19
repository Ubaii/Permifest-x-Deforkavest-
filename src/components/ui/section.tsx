'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]',
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        {breadcrumbs && <div className="mb-2 text-xs text-[var(--muted-foreground)]">{breadcrumbs}</div>}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)] font-[family-name:var(--font-bricolage)]">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-[var(--muted-foreground)] max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
}

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  actions,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 mb-4', className)}
      {...props}
    >
      <div>
        <h2 className="text-lg font-bold text-[var(--foreground)] font-[family-name:var(--font-bricolage)]">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
}

export function SectionCard({
  header,
  footer,
  noPadding = false,
  className,
  children,
  ...props
}: SectionCardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-xs overflow-hidden transition-colors',
        className
      )}
      {...props}
    >
      {header && (
        <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--card)]">
          {header}
        </div>
      )}
      <div className={cn(noPadding ? 'p-0' : 'p-4 sm:p-5')}>{children}</div>
      {footer && (
        <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--accent)]/20">
          {footer}
        </div>
      )}
    </div>
  );
}
