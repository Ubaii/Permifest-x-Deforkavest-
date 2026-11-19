'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort, getStatusBadgeVariant, getStatusLabel } from '@/lib/utils';
import { 
  CreditCard, 
  QrCode, 
  CloudArrowUp as UploadCloud, 
  CheckCircle as CheckCircle2, 
  WarningCircle as AlertCircle, 
  ArrowSquareOut as ExternalLink,
  Clock,
  FileText as FileCheck
} from '@phosphor-icons/react';

export default function PesertaPembayaranPage() {
  const { currentUser, registrations, uploadPaymentProof } = useAppStore();
  const myRegistrations = registrations.filter(r => r.user_id === currentUser.id && r.payment);

  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah bukti');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Pembayaran & Bukti Transfer" 
      subtitle="Selesaikan pembayaran biaya pendaftaran dengan scan QRIS atau transfer bank resmi."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Payment Method Guide & QRIS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-cyan-500/40 glow-cyan">
            <CardHeader className="text-center pb-2">
              <Badge variant="cyber" className="mx-auto mb-2">QRIS NASIONAL</Badge>
              <CardTitle className="justify-center text-base">Scan QRIS Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              
              {/* QR Image Placeholder */}
              <div className="w-52 h-52 mx-auto bg-white p-3 rounded-xl shadow-lg border border-slate-700 flex flex-col items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                  <QrCode className="w-24 h-24 text-cyan-400 mb-2" />
                  <span className="text-[10px] font-mono text-cyan-300 font-bold tracking-wider">PERMIFEST x DEFORKA</span>
                  <span className="text-[9px] text-slate-400">NMID: ID10293847561</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-left space-y-2">
                <div className="text-slate-400 text-[11px] font-semibold uppercase">Atau Transfer Rekening Resmi:</div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Bank BCA:</span>
                  <span className="font-mono text-cyan-400 font-bold select-all">8820 1928 37</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Atas Nama:</span>
                  <span className="text-slate-200 font-medium">Panitia Bersama Permifest</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                * Simpan bukti transfer atau screenshot QRIS Anda untuk diunggah pada formulir di sebelah kanan.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: List of User's Registrations & Payments */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Tagihan & Bukti Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myRegistrations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada tagihan pembayaran aktif saat ini.
                </div>
              ) : (
                myRegistrations.map((reg) => {
                  const pay = reg.payment;
                  const isPending = pay?.status === 'pending';
                  const isUploaded = pay?.status === 'uploaded';
                  const isVerified = pay?.status === 'verified';
                  const isRejected = pay?.status === 'rejected';

                  return (
                    <div key={reg.id} className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-100">{reg.competition?.name}</h4>
                            <Badge variant={getStatusBadgeVariant(pay?.status || 'pending')} size="sm">
                              {getStatusLabel(pay?.status || 'pending')}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            ID Pendaftaran: <span className="font-mono text-cyan-400">{reg.id}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Total Nominal:</span>
                          <span className="text-lg font-bold font-mono text-cyan-400">
                            {formatCurrency(pay?.amount || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Rejection Notice if any */}
                      {isRejected && pay?.rejection_reason && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold block">Pembayaran Ditolak:</span>
                            <span>{pay.rejection_reason}</span>
                            <span className="block text-slate-400 mt-1">Silakan unggah ulang bukti transfer yang jelas dan valid.</span>
                          </div>
                        </div>
                      )}

                      {/* Proof Preview or upload action */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                        {pay?.proof_name ? (
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <FileCheck className="w-4 h-4 text-emerald-400" />
                            <span>Bukti: <strong className="text-cyan-400 font-mono">{pay.proof_name}</strong></span>
                            {pay.uploaded_at && (
                              <span className="text-[11px] text-slate-500">({formatDateShort(pay.uploaded_at)})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Belum ada bukti yang diunggah.</span>
                        )}

                        <div className="flex items-center gap-2">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                              <CheckCircle2 className="w-4 h-4" />
                              Lunas & Terverifikasi
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              variant={isRejected ? 'danger' : 'primary'}
                              leftIcon={<UploadCloud className="w-4 h-4" />}
                              onClick={() => setSelectedRegId(reg.id)}
                            >
                              {isUploaded ? 'Unggah Ulang Bukti' : 'Unggah Bukti Bayar'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={!!selectedRegId}
        onClose={() => setSelectedRegId(null)}
        title="Unggah Bukti Pembayaran"
        description="Unggah foto struk transfer ATM, mobile banking, atau resi QRIS."
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Nama Berkas / Referensi Transfer"
            placeholder="Contoh: bukti_transfer_bca_ahmad.png"
            required
            value={proofFileName}
            onChange={(e) => setProofFileName(e.target.value)}
          />

          <Input
            label="URL Bukti Transfer (Image / Drive URL)"
            placeholder="https://... (atau biarkan default untuk demo simulasi)"
            value={proofUrl}
            onChange={(e) => setProofUrl(e.target.value)}
            helperText="Dalam versi demo, Anda dapat mengisi nama berkas dan menekan tombol konfirmasi."
          />

          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300">
            Panitia akan mengecek kesesuaian nominal dan nomor referensi rekening Anda.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setSelectedRegId(null)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Simpan & Kirim Bukti
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
