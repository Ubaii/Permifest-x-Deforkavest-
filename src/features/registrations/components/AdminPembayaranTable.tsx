'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ReasonDialog } from '@/components/ui/reason-dialog';
import { ConfirmDialog } from '@/components/ui/modal';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { getFileDownloadUrl } from '@/lib/supabase/storage-client';
import { verifyPaymentAction } from '@/features/registrations/actions';
import type { AdminPaymentRow } from '@/features/registrations/queries';
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  Envelope,
  IdentificationCard,
  Buildings,
  ArrowSquareOut,
  FileText,
  DownloadSimple,
  WarningCircle,
} from '@phosphor-icons/react';

interface Props {
  initialPayments: AdminPaymentRow[];
}

export function AdminPembayaranTable({ initialPayments }: Props) {
  const [payments, setPayments] = useState<AdminPaymentRow[]>(initialPayments);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [reviewDrawer, setReviewDrawer] = useState<AdminPaymentRow | null>(null);
  const [proofSignedUrl, setProofSignedUrl] = useState<string | null>(null);
  const [loadingProof, setLoadingProof] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState<AdminPaymentRow | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<AdminPaymentRow | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load signed URL untuk bukti pembayaran saat drawer dibuka
  useEffect(() => {
    let cancelled = false;
    const proofPath = reviewDrawer?.proof_path;

    if (!proofPath) return;

    getFileDownloadUrl('payment-proofs', proofPath, { expiresInSeconds: 1800 })
      .then((res) => {
        if (!cancelled && res.success && res.url) {
          setProofSignedUrl(res.url);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProof(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reviewDrawer?.proof_path]);

  const openReviewDrawer = (row: AdminPaymentRow) => {
    setProofSignedUrl(null);
    setLoadingProof(Boolean(row.proof_path));
    setReviewDrawer(row);
  };

  const handleApprove = useCallback(async () => {
    if (!approveConfirm) return;
    setIsProcessing(true);
    try {
      const result = await verifyPaymentAction({
        payment_id: approveConfirm.payment_id,
        action: 'approve',
      });

      if (!result.success) {
        setAlertError(result.error ?? 'Gagal menyetujui pembayaran.');
      } else {
        setAlertSuccess(`Pembayaran ${approveConfirm.user_name} berhasil disetujui.`);
        setPayments((prev) =>
          prev.map((p) =>
            p.payment_id === approveConfirm.payment_id
              ? { ...p, payment_status: 'verified', registration_status: 'registered' }
              : p
          )
        );
        if (reviewDrawer?.payment_id === approveConfirm.payment_id) {
          setReviewDrawer(null);
        }
      }
    } finally {
      setIsProcessing(false);
      setApproveConfirm(null);
    }
  }, [approveConfirm, reviewDrawer]);

  const handleReject = useCallback(async (reason: string) => {
    if (!rejectTarget) return;
    setIsProcessing(true);
    try {
      const result = await verifyPaymentAction({
        payment_id: rejectTarget.payment_id,
        action: 'reject',
        reject_reason: reason,
      });

      if (!result.success) {
        setAlertError(result.error ?? 'Gagal menolak pembayaran.');
      } else {
        setAlertSuccess(`Bukti pembayaran ${rejectTarget.user_name} telah ditolak.`);
        setPayments((prev) =>
          prev.map((p) =>
            p.payment_id === rejectTarget.payment_id
              ? { ...p, payment_status: 'rejected', reject_reason: reason }
              : p
          )
        );
        if (reviewDrawer?.payment_id === rejectTarget.payment_id) {
          setReviewDrawer(null);
        }
      }
    } finally {
      setIsProcessing(false);
      setRejectDialogOpen(false);
      setRejectTarget(null);
    }
  }, [rejectTarget, reviewDrawer]);

  const filtered = payments.filter((p) =>
    filterStatus === 'all' ? true : p.payment_status === filterStatus
  );

  const columns: Column<AdminPaymentRow>[] = [
    {
      key: 'user_name',
      header: 'Peserta',
      cell: (p: AdminPaymentRow) => (
        <div>
          <p className="font-medium text-sm">{p.user_name}</p>
          <p className="text-xs text-muted-foreground font-mono">{p.user_email}</p>
        </div>
      ),
    },
    {
      key: 'competition_name',
      header: 'Kompetisi',
      cell: (p: AdminPaymentRow) => (
        <span className="text-sm">{p.competition_name}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Tagihan',
      cell: (p: AdminPaymentRow) => (
        <span className="font-mono text-sm font-semibold">{formatCurrency(p.amount)}</span>
      ),
    },
    {
      key: 'payment_status',
      header: 'Status',
      cell: (p: AdminPaymentRow) => <StatusBadge status={p.payment_status} domain="payment" />,
    },
    {
      key: 'registered_at',
      header: 'Tgl. Daftar',
      cell: (p: AdminPaymentRow) => (
        <span className="text-xs text-muted-foreground font-mono">
          {formatDateShort(p.registered_at)}
        </span>
      ),
    },
    {
      key: 'payment_id',
      header: 'Aksi',
      cell: (p: AdminPaymentRow) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<Eye size={15} />}
            onClick={() => openReviewDrawer(p)}
          >
            Review
          </Button>
          {(p.payment_status === 'pending_review') && (
            <>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<XCircle size={15} className="text-destructive" />}
                onClick={() => { setRejectTarget(p); setRejectDialogOpen(true); }}
                disabled={isProcessing}
              >
                Tolak
              </Button>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<CheckCircle size={15} weight="bold" />}
                onClick={() => setApproveConfirm(p)}
                disabled={isProcessing || !p.proof_path}
              >
                Setujui
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const statusFilters = [
    { label: 'Semua', value: 'all' },
    { label: 'Menunggu', value: 'pending_review' },
    { label: 'Terverifikasi', value: 'verified' },
    { label: 'Ditolak', value: 'rejected' },
    { label: 'Belum Unggah', value: 'awaiting_proof' },
  ];

  return (
    <div className="space-y-4">
      {alertSuccess && (
        <Alert variant="success" onClose={() => setAlertSuccess(null)}>
          <AlertTitle>Berhasil</AlertTitle>
          <AlertDescription>{alertSuccess}</AlertDescription>
        </Alert>
      )}
      {alertError && (
        <Alert variant="destructive" onClose={() => setAlertError(null)}>
          <AlertTitle>Gagal</AlertTitle>
          <AlertDescription>{alertError}</AlertDescription>
        </Alert>
      )}

      {/* Filter status */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === f.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            }`}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">
              ({f.value === 'all' ? payments.length : payments.filter((p) => p.payment_status === f.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Tabel */}
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(p) => p.payment_id}
        emptyTitle="Tidak Ada Transaksi"
        emptyDescription="Tidak ada data pembayaran yang cocok dengan filter."
      />

      {/* Drawer Detail Review */}
      <Drawer isOpen={Boolean(reviewDrawer)} onClose={() => setReviewDrawer(null)}>
        {reviewDrawer && (
          <>
            <DrawerHeader>
              <DrawerTitle>Review Bukti Pembayaran</DrawerTitle>
              <DrawerDescription>
                {reviewDrawer.competition_name} — {reviewDrawer.user_name}
              </DrawerDescription>
            </DrawerHeader>

            <DrawerContent>
              <div className="space-y-4">
                {/* Info Peserta */}
                <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2.5 text-sm">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Informasi Peserta
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <User size={14} /> Nama
                    </span>
                    <span className="font-medium">{reviewDrawer.user_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Envelope size={14} /> Email
                    </span>
                    <span className="font-mono text-xs">{reviewDrawer.user_email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Buildings size={14} /> Institusi
                    </span>
                    <span>{reviewDrawer.user_institution || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <IdentificationCard size={14} /> ID Pendaftaran
                    </span>
                    <span className="font-mono text-xs">{reviewDrawer.registration_id}</span>
                  </div>
                </div>

                {/* Info Tagihan */}
                <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2.5 text-sm">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Rincian Pembayaran
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tagihan</span>
                    <span className="font-mono font-bold text-primary">{formatCurrency(reviewDrawer.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={reviewDrawer.payment_status} domain="payment" />
                  </div>
                  {reviewDrawer.proof_uploaded_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Diunggah</span>
                      <span className="font-mono text-xs">{formatDateShort(reviewDrawer.proof_uploaded_at)}</span>
                    </div>
                  )}
                  {reviewDrawer.reject_reason && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2 text-xs text-destructive">
                      <span className="font-semibold">Alasan penolakan: </span>
                      {reviewDrawer.reject_reason}
                    </div>
                  )}
                </div>

                {/* Bukti Transfer */}
                <div className="rounded-xl border border-border p-4 space-y-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={13} /> Bukti Transfer
                  </p>

                  {!reviewDrawer.proof_path ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={16} />
                      <span>Peserta belum mengunggah bukti transfer.</span>
                    </div>
                  ) : loadingProof ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock size={16} className="animate-spin" />
                      <span>Memuat pratinjau...</span>
                    </div>
                  ) : proofSignedUrl ? (
                    <div className="space-y-2">
                      {proofSignedUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={proofSignedUrl}
                          alt="Bukti transfer"
                          className="rounded-lg border border-border max-h-64 object-contain w-full"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg p-3">
                          <FileText size={16} />
                          <span>Berkas PDF tidak dapat dipratinjau.</span>
                        </div>
                      )}
                      <a href={proofSignedUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" leftIcon={<DownloadSimple size={14} />}>
                          Unduh / Buka Berkas
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <WarningCircle size={16} />
                      <span>Gagal memuat pratinjau.</span>
                    </div>
                  )}
                </div>

                {/* Data formulir */}
                {reviewDrawer.form_data && Object.keys(reviewDrawer.form_data).length > 0 && (
                  <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-2 text-sm">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Data Formulir
                    </p>
                    {Object.entries(reviewDrawer.form_data).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-baseline gap-2">
                        <span className="text-muted-foreground capitalize text-xs">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-xs">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Link ke halaman kompetisi */}
                <a
                  href={`/kompetisi/${reviewDrawer.competition_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  Panduan Kompetisi <ArrowSquareOut size={12} />
                </a>
              </div>
            </DrawerContent>

            <DrawerFooter>
              <div className="flex items-center justify-between w-full gap-2">
                <Button variant="outline" size="sm" onClick={() => setReviewDrawer(null)}>
                  Tutup
                </Button>

                <div className="flex items-center gap-2">
                  {reviewDrawer.payment_status !== 'rejected' &&
                    reviewDrawer.payment_status !== 'verified' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        leftIcon={<XCircle size={15} weight="bold" />}
                        onClick={() => {
                          setRejectTarget(reviewDrawer);
                          setRejectDialogOpen(true);
                        }}
                        disabled={isProcessing}
                      >
                        Tolak Bukti
                      </Button>
                    )}
                  {reviewDrawer.payment_status !== 'verified' && (
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<CheckCircle size={15} weight="bold" />}
                      onClick={() => setApproveConfirm(reviewDrawer)}
                      disabled={isProcessing || !reviewDrawer.proof_path}
                    >
                      Setujui Pembayaran
                    </Button>
                  )}
                </div>
              </div>
            </DrawerFooter>
          </>
        )}
      </Drawer>

      {/* Dialog Konfirmasi Setujui */}
      <ConfirmDialog
        isOpen={Boolean(approveConfirm)}
        onClose={() => setApproveConfirm(null)}
        onConfirm={handleApprove}
        title="Setujui Pembayaran Ini?"
        description={`Anda akan memvalidasi bukti transfer ${approveConfirm?.user_name} sejumlah ${formatCurrency(approveConfirm?.amount ?? 0)}. Status pendaftaran akan berubah menjadi Terverifikasi.`}
        confirmText="Ya, Setujui"
        cancelText="Batal"
        variant="primary"
      />

      {/* Dialog Alasan Penolakan */}
      <ReasonDialog
        isOpen={rejectDialogOpen}
        onClose={() => { setRejectDialogOpen(false); setRejectTarget(null); }}
        onConfirm={handleReject}
        title="Konfirmasi Penolakan Bukti Pembayaran"
        description="Alasan penolakan wajib dituliskan (minimal 10 karakter) agar peserta dapat memperbaiki bukti transfernya."
        confirmLabel="Tolak Bukti Transfer"
        placeholder="Contoh: Nominal transfer kurang dari tagihan, atau bukti blur/tidak terbaca."
        isDestructive
      />
    </div>
  );
}
