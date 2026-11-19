'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import {
  CreditCard,
  QrCode,
  UploadSimple,
  CheckCircle,
  Copy,
  Clock,
  Sparkle,
} from '@phosphor-icons/react';

export default function PesertaPembayaranPage() {
  const { currentUser, registrations, uploadPaymentProof, systemSettings } = useAppStore();
  const myRegistrations = registrations.filter((r) => r.user_id === currentUser.id && r.payment);

  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const selectedReg = registrations.find((r) => r.id === selectedRegId);
  const activeQrUrl = selectedReg?.competition?.payment_qr_url || systemSettings.qris_image_url;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(systemSettings.bank_account_number.replace(/\s+/g, ''));
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setProofUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegId) return;
    setIsSubmitting(true);
    setErrorBanner(null);
    try {
      const fileName = proofFileName || `bukti_transfer_${Date.now()}.png`;
      const url = proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600';
      await uploadPaymentProof(selectedRegId, url, fileName);
      setSelectedRegId(null);
      setProofUrl('');
      setProofFileName('');
      setSuccessBanner('Bukti pembayaran berhasil diunggah! Panitia bendahara akan memverifikasi dalam waktu maksimal 24 jam.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah bukti pembayaran';
      setErrorBanner(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Pembayaran &amp; Bukti Transfer"
      subtitle="Selesaikan pembayaran biaya pendaftaran dengan scan QRIS atau transfer ke rekening resmi panitia."
    >
      <div className="space-y-6">
        {successBanner && (
          <Alert variant="success" onClose={() => setSuccessBanner(null)}>
            <AlertTitle>Berhasil Mengunggah</AlertTitle>
            <AlertDescription>{successBanner}</AlertDescription>
          </Alert>
        )}

        {errorBanner && (
          <Alert variant="destructive" onClose={() => setErrorBanner(null)}>
            <AlertTitle>Gagal Memproses</AlertTitle>
            <AlertDescription>{errorBanner}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Panduan Pembayaran & Barcode QRIS Resmi */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader className="text-center pb-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/30 mx-auto mb-2">
                  <Sparkle className="w-3.5 h-3.5" weight="fill" />
                  QRIS RESMI EVENT
                </div>
                <CardTitle className="justify-center text-base">Scan Barcode QRIS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                {/* QR Box Container */}
                <div className="w-56 h-56 mx-auto bg-white p-2.5 rounded-2xl shadow-sm border border-[var(--border)] flex flex-col items-center justify-center">
                  {activeQrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeQrUrl}
                      alt="Barcode QRIS Resmi"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                      <QrCode className="w-24 h-24 text-[var(--primary)] mb-2" weight="duotone" />
                      <span className="text-[10px] font-mono text-[var(--foreground)] font-bold tracking-wider">
                        {systemSettings.event_name.toUpperCase()}
                      </span>
                      <span className="text-[9px] text-[var(--muted-foreground)]">NMID: {systemSettings.qris_nmid}</span>
                    </div>
                  )}
                </div>

                {/* Rekening Transfer Panitia */}
                <div className="p-4 rounded-[var(--radius-md)] bg-[var(--accent)]/30 border border-[var(--border)] text-xs text-left space-y-2.5">
                  <div className="text-[var(--muted-foreground)] text-[11px] font-semibold uppercase tracking-wider">
                    Opsi Transfer Rekening Bank:
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--muted-foreground)]">Bank:</span>
                    <span className="font-semibold text-[var(--foreground)]">{systemSettings.bank_name}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--muted-foreground)]">No. Rekening:</span>
                    <div className="flex items-center gap-1.5 font-mono font-bold text-[var(--foreground)]">
                      <span className="select-all">{systemSettings.bank_account_number}</span>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="p-1 hover:text-[var(--primary)] transition-colors text-[var(--muted-foreground)]"
                        title="Salin No. Rekening"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {copiedBank && (
                    <p className="text-[10px] text-[var(--success-text)] font-medium text-right">No. rekening tersalin!</p>
                  )}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[var(--muted-foreground)]">Atas Nama:</span>
                    <span className="text-[var(--foreground)] font-medium">{systemSettings.bank_account_holder}</span>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  Simpan bukti transfer atau struk Anda, lalu unggah pada kartu tagihan di sebelah kanan.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Daftar Tagihan & Status Pembayaran */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Tagihan &amp; Verifikasi Pembayaran</CardTitle>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Pantau verifikasi biaya per lomba yang telah Anda daftarkan
                </p>
              </CardHeader>
              <CardContent>
                {myRegistrations.length === 0 ? (
                  <EmptyState
                    icon={<CreditCard className="w-7 h-7 text-[var(--primary)]" weight="duotone" />}
                    title="Tidak Ada Tagihan Aktif"
                    description="Anda belum mendaftar perlombaan yang memiliki tagihan biaya. Silakan pilih lomba di menu pendaftaran."
                  />
                ) : (
                  <div className="space-y-4">
                    {myRegistrations.map((reg) => {
                      const payment = reg.payment!;
                      const isRejected = payment.status === 'rejected';
                      const isVerified = payment.status === 'verified';
                      const isUploaded = payment.status === 'uploaded';

                      return (
                        <div
                          key={reg.id}
                          className="p-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] transition-all space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-[var(--foreground)]">{reg.competition?.name}</h4>
                                <StatusBadge status={payment.status} domain="payment" />
                              </div>
                              <div className="text-xs text-[var(--muted-foreground)] flex flex-wrap items-center gap-3">
                                <span>
                                  Nominal Tagihan:{' '}
                                  <strong className="font-mono text-[var(--foreground)] text-sm font-bold tabular-nums">
                                    {formatCurrency(payment.amount)}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>Kategori: {reg.competition?.type === 'academic' ? 'Akademik' : 'E-Sport'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isVerified ? (
                                <div className="flex items-center gap-1.5 text-xs text-[var(--success-text)] font-semibold px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--success-bg)] border border-[var(--success-border)]">
                                  <CheckCircle className="w-4 h-4" weight="fill" />
                                  <span>Lunas &amp; Terverifikasi</span>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant={isRejected ? 'destructive' : 'primary'}
                                  onClick={() => setSelectedRegId(reg.id)}
                                  leftIcon={<UploadSimple className="w-4 h-4" weight="bold" />}
                                >
                                  {isUploaded ? 'Unggah Ulang Bukti' : 'Unggah Bukti Transfer'}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Alert Penolakan (Jika Pembayaran Ditolak Panitia) */}
                          {isRejected && (
                            <Alert variant="destructive">
                              <AlertTitle>Bukti Transfer Ditolak Panitia</AlertTitle>
                              <AlertDescription>
                                &quot;{payment.rejection_reason || 'Bukti transfer tidak terbaca atau nominal tidak sesuai. Silakan unggah bukti yang valid.'}&quot;
                              </AlertDescription>
                            </Alert>
                          )}

                          {isUploaded && (
                            <Alert variant="info">
                              <AlertTitle>Menunggu Verifikasi Panitia</AlertTitle>
                              <AlertDescription>
                                Bukti pembayaran Anda telah diterima sistem dan sedang dalam antrean pemeriksaan oleh panitia bendahara.
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Informasi Bukti Terunggah */}
                          {payment.proof_url && (
                            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                              <span className="truncate max-w-[240px]">
                                File: <strong className="text-[var(--foreground)]">{payment.proof_name || 'bukti_transfer.png'}</strong>
                              </span>
                              <span className="font-mono text-[11px]">
                                Status: {payment.status === 'verified' ? 'Telah Divalidasi' : 'Menunggu Review Panitia'}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Upload Bukti Transfer */}
        <Modal
          isOpen={Boolean(selectedRegId)}
          onClose={() => setSelectedRegId(null)}
          title="Unggah Bukti Transfer QRIS / Bank"
          description="Pastikan nominal transfer, nama pengirim, dan tanggal transaksi terlihat jelas."
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Pilih Berkas Gambar Bukti Transfer (Screenshot/Struk)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full text-xs text-[var(--foreground)] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary)] file:text-white hover:file:opacity-90 cursor-pointer"
              />
            </div>

            <Input
              label="Nama Berkas (Opsional)"
              placeholder="bukti_transfer_bca.png"
              value={proofFileName}
              onChange={(e) => setProofFileName(e.target.value)}
            />

            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--accent)]/30 border border-[var(--border)] text-xs text-[var(--muted-foreground)] space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
                <Clock className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>SLA Verifikasi Panitia</span>
              </div>
              <p>Panitia akan memvalidasi bukti Anda dalam waktu 1x24 jam. Status pendaftaran akan otomatis menjadi Terverifikasi.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedRegId(null)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Kirim Bukti Pembayaran
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
