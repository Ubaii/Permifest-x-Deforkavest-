/**
 * Utility functions for Permifest x Deforkafest platform
 */

export type ClassValue = string | number | boolean | undefined | null | { [key: string]: unknown } | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat(Infinity as 1)
    .filter(Boolean)
    .map((item) => {
      if (typeof item === 'object' && item !== null) {
        return Object.entries(item)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return String(item);
    })
    .filter(Boolean)
    .join(' ');
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Gratis';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateWIB(dateStr: string | Date | undefined): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(date) + ' WIB';
}

export function formatDateShort(dateStr: string | Date | undefined): string {
  if (!dateStr) return '-';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}

export function generateInviteCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'Menunggu',
    payment_pending: 'Menunggu Pembayaran',
    uploaded: 'Bukti Terunggah',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
    assigned: 'Ditugaskan',
    in_progress: 'Sedang Dinilai',
    completed: 'Selesai',
  };
  return map[status] || status;
}

export function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
  switch (status) {
    case 'verified':
    case 'completed':
      return 'success';
    case 'pending':
    case 'payment_pending':
    case 'uploaded':
    case 'in_progress':
      return 'warning';
    case 'rejected':
    case 'cancelled':
      return 'error';
    case 'assigned':
      return 'info';
    default:
      return 'neutral';
  }
}
