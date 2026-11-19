'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { 
  CreditCard, 
  QrCode, 
  UploadSimple, 
  CheckCircle, 
  WarningCircle, 
  Copy,
  Clock,
  Sparkle
} from '@phosphor-icons/react';

export default function PesertaPembayaranPage() {
  const { currentUser, registrations, uploadPaymentProof } = useAppStore();
  const myRegistrations = registrations.filter((r) => r.user_id === currentUser.id && r.payment);

  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('8820192837');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegId) return;
    setIsSubmitting(true);
    try {
      const fileName = proofFileName || `bukti_transfer_${Date.now()}.png`;
      const url = proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600';
      await uploadPaymentProof(selectedRegId, url, fileName);
      setSelectedRegId(null);
      setProofUrl('');
      setProofFileName('');
      alert('Bukti pembayaran berhasil diunggah! Panitia akan memverifikasi dalam waktu maksimal 24 jam.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengunggah bukti';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Pembayaran & Bukti Transfer" 
      subtitle="Selesaikan pembayaran biaya pendaftaran dengan scan QRIS atau transfer rekening resmi panitia."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Panduan Pembayaran & QRIS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-border bg-card">
            <CardHeader className="text-center pb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/30 mx-auto mb-2">
                <Sparkle size={14} weight="fill" />
                QRIS RESMI EVENT
              </div>
              <CardTitle className="justify-center text-base">Scan QRIS Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              
              {/* QR Box */}
              <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl shadow-sm border border-border flex flex-col items-center justify-center">
                <div className="w-full h-full bg-[#0b0720] rounded-xl p-3 flex flex-col items-center justify-center text-center">
                  <QrCode size={96} className="text-[#9b6bf2] mb-2" weight="duotone" />
                  <span className="text-[10px] font-mono text-white font-bold tracking-wider">PERMIFEST x DEFORKAFEST</span>
                  <span className="text-[9px] text-[#a99fd1]">NMID: ID10293847561</span>
                </div>
              </div>

              {/* Rekening Transfer Panitia */}
              <div className="p-4 rounded-xl bg-muted/60 border border-border text-xs text-left space-y-2.5">
                <div className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                  Opsi Transfer Rekening Bank:
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-semibold text-foreground">BCA (Bank Central Asia)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">No. Rekening:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                    <span className="select-all">8820 1928 37</span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="p-1 hover:text-primary transition-colors text-muted-foreground"
                      title="Salin No. Rekening"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                {copiedBank && (
                  <p className="text-[10px] text-[var(--success)] font-medium text-right">No. rekening tersalin!</p>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Atas Nama:</span>
                  <span className="text-foreground font-medium">Panitia Permifest</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Simpan screenshot atau struk bukti pembayaran Anda, lalu unggah pada panel tagihan di sebelah kanan.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Daftar Tagihan & Status Pembayaran */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Tagihan &amp; Verifikasi Pembayaran</CardTitle>
              <p className="text-xs text-muted-foreground">
                Pantau verifikasi biaya per lomba yang telah Anda daftarkan
              </p>
            </CardHeader>
            <CardContent>
              {myRegistrations.length === 0 ? (
                <EmptyState
                  icon={<CreditCard size={28} weight="duotone" className="text-primary" />}
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
                        className={`p-5 rounded-2xl border transition-all ${
                          isRejected
                            ? 'bg-destructive/10 border-destructive/30'
                            : isVerified
                            ? 'bg-[var(--success)]/10 border-[var(--success)]/30'
                            : isUploaded
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'bg-card border-border'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground">{reg.competition?.name}</h4>
                              <StatusBadge status={payment.status} domain="payment" />
                            </div>
                            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                              <span>Nominal Tagihan: <strong className="font-mono text-foreground text-sm font-bold tabular-nums">{formatCurrency(payment.amount)}</strong></span>
                              <span>•</span>
                              <span>Kategori: {reg.competition?.type === 'academic' ? 'Akademik' : 'E-Sport'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isVerified ? (
                              <div className="flex items-center gap-1.5 text-xs text-[var(--success)] font-semibold px-3 py-1.5 rounded-xl bg-[var(--success)]/15 border border-[var(--success)]/30">
                                <CheckCircle size={16} weight="fill" />
                                <span>Lunas &amp; Terverifikasi</span>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant={isRejected ? 'destructive' : 'primary'}
                                onClick={() => setSelectedRegId(reg.id)}
                                leftIcon={<UploadSimple size={16} weight="bold" />}
                              >
                                {isUploaded ? 'Unggah Ulang Bukti' : 'Unggah Bukti Transfer'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Banner Penolakan (Jika Pembayaran Ditolak Panitia) */}
                        {isRejected && (
                          <div className="mt-4 p-3.5 rounded-xl bg-destructive/15 border border-destructive/30 text-xs flex items-start gap-2.5">
                            <WarningCircle size={18} className="text-destructive shrink-0 mt-0.5" weight="fill" />
                            <div className="space-y-1 text-destructive">
                              <span className="font-bold">Bukti Transfer Ditolak Panitia:</span>
                              <p className="text-foreground/90 font-medium leading-relaxed">
                                &quot;{payment.rejection_reason || 'Bukti transfer tidak terbaca atau nominal tidak sesuai. Silakan unggah bukti yang valid.'}&quot;
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Informasi Bukti Terunggah */}
                        {payment.proof_url && (
                          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="truncate max-w-[240px]">
                              File: <strong className="text-foreground">{payment.proof_name || 'bukti_transfer.png'}</strong>
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
          <Input
            label="Nama File / Judul Bukti"
            placeholder="Contoh: bukti_transfer_bca_budi.png"
            value={proofFileName}
            onChange={(e) => setProofFileName(e.target.value)}
            helperText="Format gambar (.png, .jpg, .jpeg) atau scan dokumen"
          />

          <Input
            label="Tautan / URL Gambar Bukti (Opsional)"
            placeholder="https://drive.google.com/... atau URL file"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            helperText="Kosongkan untuk menggunakan file simulasi default"
          />

          <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock size={14} className="text-primary" />
              <span>SLA Verifikasi Panitia</span>
            </div>
            <p>Panitia akan memvalidasi bukti Anda dalam waktu 1x24 jam. Status akan otomatis berganti ke Terverifikasi.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedRegId(null)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Kirim Bukti Pembayaran
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
