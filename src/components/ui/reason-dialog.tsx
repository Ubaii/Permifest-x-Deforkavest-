'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface ReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  placeholder?: string;
  isDestructive?: boolean;
}

export function ReasonDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Kirim Konfirmasi',
  placeholder = 'Tuliskan alasan lengkap (minimal 10 karakter)...',
  isDestructive = false,
}: ReasonDialogProps) {
  const [reason, setReason] = useState('');
  const minLength = 10;
  const isValid = reason.trim().length >= minLength;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(reason.trim());
    setReason('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} maxWidth="md">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
            Alasan Wajib <span className="text-[var(--destructive)]">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] p-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] resize-none"
          />
          <div className="flex justify-between items-center mt-1 text-xs text-[var(--muted-foreground)]">
            <span>Minimal {minLength} karakter</span>
            <span className={reason.trim().length >= minLength ? 'text-[var(--success)] font-mono' : 'font-mono'}>
              {reason.trim().length} / {minLength}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'primary'}
            size="sm"
            disabled={!isValid}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
