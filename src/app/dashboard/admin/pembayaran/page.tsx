'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ReasonDialog } from '@/components/ui/reason-dialog';
import { ConfirmDialog } from '@/components/ui/modal';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Registration } from '@/lib/types';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Eye,
  WarningCircle,
  Clock,
  User,
  Envelope,
  IdentificationCard,
  Buildings,
  Phone,
  CalendarBlank,
} from '@phosphor-icons/react';

export default function AdminPembayaranPage() {
  const { registrations, verifyPayment } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  const [reviewDrawerReg, setReviewDrawerReg] = useState<Registration | null>(null);
  const [approveConfirmReg, setApproveConfirmReg] = useState<Registration | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const registrationsWithPayment = registrations.filter((r) => r.payment);

  const filtered = registrationsWithPayment.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.payment?.status === filterStatus;
  });

  const handleApproveConfirm = async () => {
    if (!approveConfirmReg) return;
    await verifyPayment(approveConfirmReg.id, 'verified');
    setApproveConfirmReg(null);
    if (reviewDrawerReg?.id === approveConfirmReg.id) {
      setReviewDrawerReg(null);
    }
    setAlertSuccess(`Pembayaran ${approveConfirmReg.user?.full_name} berhasil disetujui! Status pendaftaran kini Terverifikasi.`);
  };

  const openRejectDialog = (regId: string) => {
    setActiveRegId(regId);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!activeRegId) return;
    await verifyPayment(activeRegId, 'rejected', reason);
    setActiveRegId(null);
    if (reviewDrawerReg?.id === activeRegId) {
      setReviewDrawerReg(null);
    }
    setAlertSuccess('Pembayaran telah ditolak. Alasan penolakan telah tercatat dan dikirimkan ke peserta.');
  };

  const pendingReviewCount = registrationsWithPayment.filter((r) => r.payment?.status === 'uploaded').length;

  const columns: Column<Registration & Record<string, unknown>>[] = [
    {
      key: 'peserta',
      header: 'Peserta & Kontak',
      sortable: true,
      accessor: (r) => r.user?.full_name || '',
      cell: (r) => (
        <div>
          <div className="font-bold text-[var(--foreground)]">{r.user?.full_name}</div>
          <div className="text-[11px] text-[var(--muted-foreground)] font-mono">{r.user?.email}</div>
          <div className="text-[10px] text-[var(--muted-foreground)]">{r.user?.institution || '-'}</div>
        </div>
      ),
    },
    {
      key: 'competition',
      header: 'Kompetisi',
      sortable: true,
      accessor: (r) => r.competition?.name || '',
      cell: (r) => <Badge variant="primary">{r.competition?.name}</Badge>,
    },
    {
      key: 'amount',
      header: 'Nominal',
      sortable: true,
      accessor: (r) => r.payment?.amount || 0,
      cell: (r) => (
        <span className="font-mono font-bold text-[var(--foreground)] tabular-nums">
          {formatCurrency(r.payment?.amount || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status Pembayaran',
      sortable: true,
      accessor: (r) => r.payment?.status || '',
      cell: (r) => (
        <div className="space-y-1">
          <StatusBadge status={r.payment?.status || 'pending'} domain="payment" />
          {r.payment?.status === 'rejected' && r.payment?.rejection_reason && (
            <p className="text-[10px] text-[var(--destructive-text)] truncate max-w-[160px]" title={r.payment.rejection_reason}>
              {r.payment.rejection_reason}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Waktu Transaksi',
      sortable: true,
      accessor: (r) => r.payment?.uploaded_at || r.registered_at,
      cell: (r) => (
        <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
          {formatDateShort(r.payment?.uploaded_at || r.registered_at)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      className: 'text-right',
      cell: (r) => {
        const payment = r.payment;
        const isVerified = payment?.status === 'verified';
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReviewDrawerReg(r)}
              className="text-xs gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review</span>
            </Button>

            {!isVerified && payment?.proof_url && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setApproveConfirmReg(r)}
                className="text-xs"
              >
                Setujui
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DashboardLayout
      title="Verifikasi Pembayaran Peserta"
      subtitle="Periksa keabsahan transfer dana, resi QRIS, dan mutasi biaya pendaftaran kompetisi."
    >
      <div className="space-y-6">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Berhasil Diperbarui</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {pendingReviewCount > 0 && (
          <Alert variant="warning">
            <AlertTitle>Perhatian Panitia</AlertTitle>
            <AlertDescription>
              Terdapat <strong>{pendingReviewCount}</strong> pembayaran peserta berstatus <strong>Perlu Review</strong> yang menunggu verifikasi bukti transfer.
            </AlertDescription>
          </Alert>
        )}

        {/* Filter status buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--muted-foreground)] mr-1">Status:</span>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'uploaded', label: 'Perlu Review' },
              { id: 'verified', label: 'Terverifikasi' },
              { id: 'rejected', label: 'Ditolak' },
              { id: 'pending', label: 'Belum Unggah' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors min-h-[36px] ${
                  filterStatus === st.id
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-[var(--accent)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] border border-[var(--border)]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-[var(--muted-foreground)] font-mono">
            Total Transaksi: <strong className="text-[var(--foreground)]">{filtered.length}</strong> entri
          </div>
        </div>

        {/* Tabel Data Pembayaran */}
        <DataTable
          data={filtered as (Registration & Record<string, unknown>)[]}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Cari nama peserta, email, kampus..."
          searchableKeys={['id', 'status', 'registered_at']}
          exportFilename="transaksi_pembayaran_permifest"
          onRowClick={(item) => setReviewDrawerReg(item as Registration)}
          emptyTitle="Tidak Ada Data Transaksi"
          emptyDescription="Tidak ditemukan pembayaran pendaftaran dengan kriteria filter yang Anda pilih."
        />

        {/* PaymentReviewPanel Drawer (Spesifikasi UI_KIT.md Bagian 3) */}
        <Drawer
          isOpen={!!reviewDrawerReg}
          onClose={() => setReviewDrawerReg(null)}
          size="xl"
        >
          {reviewDrawerReg && (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-2">
                  <DrawerTitle>Review Bukti Pembayaran</DrawerTitle>
                  <StatusBadge status={reviewDrawerReg.payment?.status || 'pending'} domain="payment" />
                </div>
                <DrawerDescription>ID Registrasi: {reviewDrawerReg.id}</DrawerDescription>
              </DrawerHeader>

              <DrawerContent className="space-y-6">
                {/* Pratinjau Resi Bukti Transfer Besar */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[var(--primary)]" />
                    Bukti Transfer / Resi QRIS
                  </span>
                  {reviewDrawerReg.payment?.proof_url ? (
                    <div className="border border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--accent)]/20 p-2 flex items-center justify-center overflow-hidden max-h-[380px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reviewDrawerReg.payment.proof_url}
                        alt="Bukti Transfer Peserta"
                        className="max-w-full max-h-[360px] object-contain rounded-md shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed border-[var(--border)] rounded-[var(--radius-lg)] text-center text-xs text-[var(--muted-foreground)]">
                      Peserta belum mengunggah berkas bukti transfer pembayaran.
                    </div>
                  )}
                </div>

                {/* Ringkasan Biaya & Status */}
                <div className="bg-[var(--accent)]/30 border border-[var(--border)] rounded-[var(--radius-md)] p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                    <span className="text-[var(--muted-foreground)]">Nominal Tagihan</span>
                    <span className="font-mono font-bold text-base text-[var(--foreground)]">
                      {formatCurrency(reviewDrawerReg.payment?.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                    <span className="text-[var(--muted-foreground)]">Kompetisi</span>
                    <span className="font-semibold text-[var(--foreground)]">{reviewDrawerReg.competition?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                    <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Waktu Unggah
                    </span>
                    <span className="font-mono text-[var(--foreground)]">
                      {reviewDrawerReg.payment?.uploaded_at ? formatDateShort(reviewDrawerReg.payment.uploaded_at) : '-'}
                    </span>
                  </div>
                  {reviewDrawerReg.payment?.rejection_reason && (
                    <div className="p-3 bg-[var(--destructive-bg)] border border-[var(--destructive-border)] text-[var(--destructive-text)] rounded-md space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <WarningCircle className="w-4 h-4" /> Alasan Penolakan:
                      </div>
                      <p className="text-xs">&quot;{reviewDrawerReg.payment.rejection_reason}&quot;</p>
                    </div>
                  )}
                </div>

                {/* Data Pendaftar */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[var(--primary)]" />
                    Data Pendaftar
                  </span>
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <IdentificationCard className="w-3.5 h-3.5" /> Nama
                      </span>
                      <span className="font-semibold text-[var(--foreground)]">{reviewDrawerReg.user?.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Envelope className="w-3.5 h-3.5" /> Email
                      </span>
                      <span className="font-mono text-[var(--foreground)]">{reviewDrawerReg.user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Buildings className="w-3.5 h-3.5" /> Kampus / Sekolah
                      </span>
                      <span className="font-medium text-[var(--foreground)]">{reviewDrawerReg.user?.institution || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> No. WhatsApp
                      </span>
                      <span className="font-mono text-[var(--foreground)]">{reviewDrawerReg.user?.phone || '-'}</span>
                    </div>
                  </div>
                </div>
              </DrawerContent>

              <DrawerFooter>
                <div className="flex items-center justify-between w-full gap-2">
                  <Button variant="outline" size="sm" onClick={() => setReviewDrawerReg(null)}>
                    Tutup
                  </Button>

                  <div className="flex items-center gap-2">
                    {reviewDrawerReg.payment?.status !== 'rejected' && reviewDrawerReg.payment?.status !== 'verified' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        leftIcon={<XCircle className="w-4 h-4" weight="bold" />}
                        onClick={() => openRejectDialog(reviewDrawerReg.id)}
                      >
                        Tolak Bukti
                      </Button>
                    )}

                    {reviewDrawerReg.payment?.status !== 'verified' && (
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<CheckCircle className="w-4 h-4" weight="bold" />}
                        onClick={() => setApproveConfirmReg(reviewDrawerReg)}
                        disabled={!reviewDrawerReg.payment?.proof_url}
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

        {/* Dialog Konfirmasi Setujui Pembayaran */}
        <ConfirmDialog
          isOpen={!!approveConfirmReg}
          onClose={() => setApproveConfirmReg(null)}
          onConfirm={handleApproveConfirm}
          title="Setujui Pembayaran Ini?"
          description={`Anda akan memvalidasi bukti transfer pendaftar ${approveConfirmReg?.user?.full_name} sejumlah ${formatCurrency(approveConfirmReg?.payment?.amount || 0)}. Status pendaftaran akan langsung berubah menjadi Terverifikasi.`}
          confirmText="Ya, Setujui"
          cancelText="Batal"
          variant="primary"
        />

        {/* Dialog Alasan Penolakan Wajib (ReasonDialog) */}
        <ReasonDialog
          isOpen={rejectDialogOpen}
          onClose={() => setRejectDialogOpen(false)}
          onConfirm={handleConfirmReject}
          title="Konfirmasi Penolakan Bukti Pembayaran"
          description="Sesuai SOP, alasan penolakan wajib dituliskan (minimal 10 karakter) agar peserta dapat memperbaiki bukti transfernya."
          confirmLabel="Tolak Bukti Transfer"
          placeholder="Contoh: Nominal transfer kurang dari tagihan resmi, atau bukti transfer blur/tidak terbaca..."
          isDestructive={true}
        />
      </div>
    </DashboardLayout>
  );
}
