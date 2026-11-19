'use client';

import React from 'react';
import { Badge } from '@/lib/../components/ui/badge';
import { 
  CheckCircle, 
  Hourglass, 
  XCircle, 
  Clock, 
  Lock, 
  Warning, 
  FileText, 
  Receipt 
} from '@phosphor-icons/react';

export type StatusDomain = 'payment' | 'registration' | 'submission' | 'score';

interface StatusBadgeProps {
  status: string;
  domain?: StatusDomain;
  className?: string;
  customLabel?: string;
}

export function StatusBadge({ status, domain = 'payment', className, customLabel }: StatusBadgeProps) {
  // Payment Status
  if (domain === 'payment' || status === 'uploaded' || status === 'verified' || status === 'rejected' || status === 'pending') {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="success" className={className}>
            <CheckCircle className="w-3.5 h-3.5" weight="fill" />
            <span>{customLabel || 'Terverifikasi'}</span>
          </Badge>
        );
      case 'uploaded':
      case 'pending':
      case 'pending_review':
        return (
          <Badge variant="warning" className={className}>
            <Hourglass className="w-3.5 h-3.5" weight="bold" />
            <span>{customLabel || 'Menunggu Verifikasi'}</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className={className}>
            <XCircle className="w-3.5 h-3.5" weight="fill" />
            <span>{customLabel || 'Ditolak'}</span>
          </Badge>
        );
      case 'awaiting_proof':
      default:
        return (
          <Badge variant="neutral" className={className}>
            <Receipt className="w-3.5 h-3.5" />
            <span>{customLabel || 'Belum Ada Bukti'}</span>
          </Badge>
        );
    }
  }

  // Score Status
  if (domain === 'score' || status === 'locked' || status === 'emergency_override') {
    if (status === 'locked') {
      return (
        <Badge variant="neutral" className={className}>
          <Lock className="w-3.5 h-3.5" weight="bold" />
          <span>{customLabel || 'Terkunci'}</span>
        </Badge>
      );
    }
    if (status === 'emergency_override') {
      return (
        <Badge variant="destructive" className={className}>
          <Warning className="w-3.5 h-3.5" weight="fill" />
          <span>{customLabel || 'Dikoreksi Darurat'}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="info" className={className}>
        <Clock className="w-3.5 h-3.5" />
        <span>{customLabel || 'Terbuka'}</span>
      </Badge>
    );
  }

  // Submission Status
  if (domain === 'submission') {
    if (status === 'submitted' || status === 'latest') {
      return (
        <Badge variant="success" className={className}>
          <CheckCircle className="w-3.5 h-3.5" weight="fill" />
          <span>{customLabel || 'Karya Terunggah'}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" className={className}>
        <FileText className="w-3.5 h-3.5" />
        <span>{customLabel || 'Belum Unggah'}</span>
      </Badge>
    );
  }

  return (
    <Badge variant="neutral" className={className}>
      <span>{customLabel || status}</span>
    </Badge>
  );
}
