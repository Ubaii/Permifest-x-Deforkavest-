'use client';

import React, { useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { X, Warning, Info, CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface ModalContextType {
  onClose: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal subcomponents must be used within a Modal component');
  }
  return context;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <ModalContext.Provider value={{ onClose }}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={cn(
            'w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-lg)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]',
            maxWidths[maxWidth],
            className
          )}
        >
          {title ? (
            <ModalHeader>
              <div>
                <ModalTitle>{title}</ModalTitle>
                {description && <ModalDescription>{description}</ModalDescription>}
              </div>
            </ModalHeader>
          ) : null}
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

export function ModalHeader({
  className,
  children,
  showClose = true,
}: {
  className?: string;
  children: React.ReactNode;
  showClose?: boolean;
}) {
  const { onClose } = useModalContext();

  return (
    <div
      className={cn(
        'flex items-center justify-between p-5 border-b border-[var(--border)] bg-[var(--card)] shrink-0',
        className
      )}
    >
      <div className="flex-1 min-w-0 pr-2">{children}</div>
      {showClose && (
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          aria-label="Tutup dialog"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export function ModalTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      className={cn(
        'text-lg font-bold text-[var(--foreground)] font-[family-name:var(--font-bricolage)] truncate',
        className
      )}
    >
      {children}
    </h3>
  );
}

export function ModalDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn('text-xs md:text-sm text-[var(--muted-foreground)] mt-0.5', className)}>
      {children}
    </p>
  );
}

export function ModalContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('p-5 overflow-y-auto flex-1 space-y-4 text-sm text-[var(--foreground)]', className)}>
      {children}
    </div>
  );
}

export function ModalFooter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-end gap-3 p-4 border-t border-[var(--border)] bg-[var(--accent)]/30 shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'destructive' | 'warning';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  const iconMap = {
    primary: <Info className="w-6 h-6 text-[var(--primary)]" weight="fill" />,
    warning: <Warning className="w-6 h-6 text-[var(--warning-text)]" weight="fill" />,
    destructive: <Warning className="w-6 h-6 text-[var(--destructive-text)]" weight="fill" />,
  };

  const buttonVariant = variant === 'destructive' ? 'destructive' : 'primary';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="p-6 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--accent)] mb-4 shrink-0">
          {iconMap[variant]}
        </div>
        <h4 className="text-lg font-bold text-[var(--foreground)] font-[family-name:var(--font-bricolage)] mb-2">
          {title}
        </h4>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">
          {description}
        </p>
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-h-[44px]"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={buttonVariant}
            className="flex-1 min-h-[44px]"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
