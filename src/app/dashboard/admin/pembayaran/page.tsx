'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { ReasonDialog } from '@/components/ui/reason-dialog';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Funnel,
  WarningCircle,
  Receipt
} from '@phosphor-icons/react';

export default function AdminPembayaranPage() {
  const { registrations, verifyPayment } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImgUrl, setPreviewImgUrl] = useState('');

  const registrationsWithPayment = registrations.filter((r) => r.payment);

  const filtered = registrationsWithPayment.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.payment?.status === filterStatus;
  });

  const handleApprove = async (regId: string) => {
    if (confirm('Konfirmasi untuk MENYETUJUI bukti pembayaran ini? Status pendaftaran peserta akan otomatis menjadi Terverifikasi.')) {
      await verifyPayment(regId, 'verified');
      alert('Pembayaran berhasil disetujui! Status peserta kini Terverifikasi.');
    }
  };

  const openRejectDialog = (regId: string) => {
    setActiveRegId(regId);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!activeRegId) return;
    await verifyPayment(activeRegId, 'rejected', reason);
    setActiveRegId(null);
    alert('Pembayaran telah ditolak. Alasan penolakan telah tercatat dan dikirimkan ke dashboard peserta.');
  };

  const openPreview = (url: string) => {
    setPreviewImgUrl(url);
    setPreviewModalOpen(true);
  };

  return (
    <DashboardLayout 
      title="Verifikasi Pembayaran Peserta" 
      subtitle="Periksa keabsahan transfer dana, resi QRIS, dan mutasi biaya pendaftaran kompetisi."
    >
      <div className="space-y-6">
        
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
              <Funnel size={16} className="text-primary" />
              <span>Status Bukti:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[32px] ${
                    filterStatus === st.id 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Total Transaksi: <strong className="text-foreground">{filtered.length}</strong> entri
          </div>
        </div>

        {/* Daftar Transaksi Pembayaran */}
        <Card>
          <CardHeader>
            <CardTitle>Antrean Verifikasi Transaksi</CardTitle>
            <p className="text-xs text-muted-foreground">Panitia memvalidasi kesesuaian nominal dan bukti transfer</p>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Receipt size={28} weight="duotone" className="text-primary" />}
                title="Tidak Ada Data Transaksi"
                description="Tidak ditemukan pembayaran pendaftaran dengan kriteria filter yang Anda pilih."
              />
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((reg) => {
                  const payment = reg.payment!;
                  const isUploaded = payment.status === 'uploaded';
                  const isVerified = payment.status === 'verified';
                  const isRejected = payment.status === 'rejected';

                  return (
                    <div key={reg.id} className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Informasi Pendaftar & Nominal */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">
                            {reg.user?.full_name || 'Peserta Terdaftar'}
                          </h4>
                          <StatusBadge status={payment.status} domain="payment" />
                          <Badge variant="primary">{reg.competition?.name}</Badge>
                        </div>

                        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                          <span>Instansi: <strong className="text-foreground">{reg.user?.institution || '-'}</strong></span>
                          <span>•</span>
                          <span>Email: <span className="font-mono">{reg.user?.email}</span></span>
                          <span>•</span>
                          <span>WA: <span className="font-mono">{reg.user?.phone || '-'}</span></span>
                        </div>

                        <div className="text-xs flex items-center gap-2 pt-0.5">
                          <span className="text-muted-foreground">Nominal Tagihan:</span>
                          <span className="font-mono font-bold text-foreground text-sm tabular-nums">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>

                        {/* Tampilkan Alasan jika ditolak */}
                        {isRejected && payment.rejection_reason && (
                          <div className="mt-2 p-2.5 rounded-lg bg-destructive/15 border border-destructive/30 text-xs text-destructive flex items-center gap-2">
                            <WarningCircle size={15} weight="fill" className="shrink-0" />
                            <span>Alasan Penolakan: &quot;{payment.rejection_reason}&quot;</span>
                          </div>
                        )}
                      </div>

                      {/* Aksi Panitia */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {payment.proof_url ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<Eye size={16} />}
                            onClick={() => openPreview(payment.proof_url!)}
                          >
                            Lihat Resi
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic px-2">
                            Belum ada bukti
                          </span>
                        )}

                        {!isVerified && (
                          <Button
                            size="sm"
                            variant="primary"
                            leftIcon={<CheckCircle size={16} weight="bold" />}
                            onClick={() => handleApprove(reg.id)}
                            disabled={!payment.proof_url}
                          >
                            Setujui
                          </Button>
                        )}

                        {!isRejected && !isVerified && (
                          <Button
                            size="sm"
                            variant="destructive"
                            leftIcon={<XCircle size={16} weight="bold" />}
                            onClick={() => openRejectDialog(reg.id)}
                          >
                            Tolak
                          </Button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Modal Pratinjau Resi Bukti Transfer */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Pratinjau Bukti Pembayaran"
        description="Periksa stempel tanggal, nama pemilik rekening, dan nominal transfer."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="max-h-[60vh] overflow-auto rounded-xl border border-border bg-muted/40 p-2 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImgUrl}
              alt="Bukti Transfer Peserta"
              className="max-w-full h-auto rounded-lg object-contain shadow-sm"
            />
          </div>

          <div className="flex items-center justify-end">
            <Button size="sm" variant="secondary" onClick={() => setPreviewModalOpen(false)}>
              Tutup Pratinjau
            </Button>
          </div>
        </div>
      </Modal>

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
    </DashboardLayout>
  );
}
