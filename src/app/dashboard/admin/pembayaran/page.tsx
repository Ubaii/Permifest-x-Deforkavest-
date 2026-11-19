'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort, getStatusBadgeVariant, getStatusLabel } from '@/lib/utils';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  AlertCircle, 
  Eye, 
  Filter,
  FileCheck
} from 'lucide-react';

export default function AdminPembayaranPage() {
  const { registrations, verifyPayment } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewImgUrl, setPreviewImgUrl] = useState('');

  const registrationsWithPayment = registrations.filter(r => r.payment);

  const filtered = registrationsWithPayment.filter(r => {
    if (filterStatus === 'all') return true;
    return r.payment?.status === filterStatus;
  });

  const handleApprove = async (regId: string) => {
    if (confirm('Konfirmasi menyetujui bukti pembayaran ini?')) {
      await verifyPayment(regId, 'verified');
      alert('Pembayaran berhasil disetujui! Status peserta kini Terverifikasi.');
    }
  };

  const openRejectModal = (regId: string) => {
    setActiveRegId(regId);
    setRejectReason('Nominal transfer tidak sesuai atau gambar resi tidak terbaca.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegId) return;
    await verifyPayment(activeRegId, 'rejected', rejectReason);
    setRejectModalOpen(false);
    setActiveRegId(null);
    alert('Pembayaran ditolak. Alasan penolakan telah dikirimkan ke dashboard peserta.');
  };

  const openPreview = (url: string) => {
    setPreviewImgUrl(url);
    setPreviewModalOpen(true);
  };

  return (
    <DashboardLayout 
      title="Verifikasi Pembayaran Peserta" 
      subtitle="Periksa keabsahan transfer dana, mutasi bank, dan scan QRIS pendaftar lomba."
    >
      <div className="space-y-6">
        
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">Filter Status:</span>
            <div className="flex flex-wrap gap-1.5 ml-2">
              {['all', 'uploaded', 'verified', 'rejected', 'pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    filterStatus === st 
                      ? 'bg-cyan-500 text-slate-950 font-semibold' 
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'Semua' : getStatusLabel(st)}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Total Ditampilkan: <strong className="text-cyan-400">{filtered.length}</strong> transaksi
          </div>
        </div>

        {/* Payments Table / List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-xs text-slate-400">
                Tidak ada data pembayaran dengan status ini.
              </CardContent>
            </Card>
          ) : (
            filtered.map((reg) => {
              const pay = reg.payment;
              const isUploaded = pay?.status === 'uploaded';
              const isVerified = pay?.status === 'verified';
              const isRejected = pay?.status === 'rejected';

              return (
                <Card key={reg.id} className="overflow-hidden">
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(pay?.status || 'pending')}>
                          {getStatusLabel(pay?.status || 'pending')}
                        </Badge>
                        <h4 className="text-sm font-bold text-slate-100">{reg.user?.full_name}</h4>
                        <span className="text-xs text-slate-400">({reg.user?.institution || 'Peserta'})</span>
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1">
                        <span>Lomba: <strong className="text-cyan-400">{reg.competition?.name}</strong></span>
                        <span>•</span>
                        <span>Tagihan: <strong className="text-slate-200 font-mono">{formatCurrency(pay?.amount || 0)}</strong></span>
                        <span>•</span>
                        <span>Tgl Daftar: {formatDateShort(reg.registered_at)}</span>
                      </div>

                      {isRejected && pay?.rejection_reason && (
                        <div className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded mt-2 border border-rose-500/20">
                          Alasan Penolakan: {pay.rejection_reason}
                        </div>
                      )}
                    </div>

                    {/* Actions and Proof preview */}
                    <div className="flex items-center gap-3 shrink-0">
                      {pay?.proof_url ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<Eye className="w-4 h-4" />}
                          onClick={() => openPreview(pay.proof_url!)}
                        >
                          Lihat Bukti ({pay.proof_name || 'Struk'})
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Belum unggah bukti</span>
                      )}

                      {!isVerified && (
                        <Button
                          size="sm"
                          variant="primary"
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => handleApprove(reg.id)}
                        >
                          Approve
                        </Button>
                      )}

                      {!isRejected && (
                        <Button
                          size="sm"
                          variant="danger"
                          leftIcon={<XCircle className="w-4 h-4" />}
                          onClick={() => openRejectModal(reg.id)}
                        >
                          Tolak
                        </Button>
                      )}
                    </div>

                  </div>
                </Card>
              );
            })
          )}
        </div>

      </div>

      {/* Reject with reason modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Tolak Bukti Pembayaran"
        description="Berikan penjelasan penolakan agar peserta dapat melakukan perbaikan."
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Alasan Penolakan <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setRejectModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="danger">
              Konfirmasi Tolak
            </Button>
          </div>
        </form>
      </Modal>

      {/* Proof Image Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Pratinjau Bukti Pembayaran"
        maxWidth="lg"
      >
        <div className="space-y-4 text-center">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden max-h-[60vh]">
            <img 
              src={previewImgUrl} 
              alt="Bukti Transfer" 
              className="max-h-full max-w-full object-contain rounded"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setPreviewModalOpen(false)}>
              Tutup Pratinjau
            </Button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
}
