'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from '@phosphor-icons/react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'md' }: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className={cn(
          'w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden',
          maxWidths[maxWidth]
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)] font-[family-name:var(--font-bricolage)]">{title}</h3>
            {description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
