'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { CaretRight } from '@phosphor-icons/react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  trend?: {
    label: string;
    positive?: boolean;
  };
}

export function StatCard({ title, value, description, icon, href, trend }: StatCardProps) {
  const content = (
    <Card className="hover:border-[var(--primary)]/40 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">{title}</p>
          {icon && <div className="p-2 rounded-lg bg-[var(--accent)] text-[var(--primary)]">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-[var(--foreground)]">{value}</span>
          {trend && (
            <span className={`text-xs font-medium ${trend.positive ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
              {trend.label}
            </span>
          )}
        </div>
        {(description || href) && (
          <div className="mt-3 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>{description}</span>
            {href && (
              <span className="inline-flex items-center gap-0.5 text-[var(--primary)] font-medium">
                Lihat detail <CaretRight className="w-3 h-3" />
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}
