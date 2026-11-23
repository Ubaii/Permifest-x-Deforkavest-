'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { uploadFileDirectly } from '@/lib/supabase/storage-client';
import { submitPaymentProofAction } from '@/features/registrations/actions';
import type { RegistrationWithRelations } from '@/features/registrations/queries';
import { QrCode, UploadSimple, CheckCircle, Clock, Copy } from '@phosphor-icons/react';

interface Props {
  registration: RegistrationWithRelations;
  onSuccess: () => void;
}

export function PaymentUploadCard({ registration: reg, onSuccess }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const comp = reg.competition;
  const payment = reg.payment;

  const canUpload =
    payment &&
    (payment.status === 'awaiting_proof' || payment.status === 'rejected');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText('88201928370').catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Silakan pilih berkas bukti transfer (JPG, PNG, WEBP, atau PDF).');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setUploadProgress(10);

    try {
      const uploadRes = await uploadFileDirectly(selectedFile, {
        bucket: 'payment-proofs',
        registrationId: reg.id,
        onProgress: (pct) => setUploadProgress(pct),
      });

      if (!uploadRes.success || !uploadRes.storagePath) {
        throw new Error(uploadRes.error ?? 'Gagal mengunggah berkas bukti transfer.');
      }

      const result = await submitPaymentProofAction({
        registration_id: reg.id,
        proof_path: uploadRes.storagePath,
      });

      if (!result.success) {
        throw new Error(result.error ?? 'Gagal menyimpan status pembayaran.');
      }

      setSelectedFile(null);
      setUploadProgress(null);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah bukti pembayaran.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-[family-name:var(--font-bricolage)]">
            {comp?.name ?? 'Kompetisi'}
          </CardTitle>
          {payment && <StatusBadge status={payment.status} domain="payment" />}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info tagihan */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
          <span className="text-sm text-muted-foreground">Jumlah Tagihan</span>
          <span className="font-mono font-bold text-primary text-lg">
            {formatCurrency(payment?.amount ?? comp?.registration_fee ?? 0)}
          </span>
        </div>

        {/* Sudah diverifikasi */}
        {payment?.status === 'verified' && (
          <div className="flex items-center gap-2 text-sm text-[var(--success)] bg-[var(--success)]/10 rounded-lg p-3">
            <CheckCircle size={18} weight="fill" />
            <span>Pembayaran telah diverifikasi. Anda resmi terdaftar!</span>
          </div>
        )}

        {/* Menunggu review */}
        {payment?.status === 'pending_review' && (
          <div className="flex flex-col gap-1 text-sm bg-muted/40 rounded-lg p-3">
            <div className="flex items-center gap-2 text-foreground">
              <Clock size={16} className="text-muted-foreground" />
              <span>Menunggu verifikasi panitia (maks. 24 jam kerja).</span>
            </div>
            {payment.proof_uploaded_at && (
              <span className="text-xs text-muted-foreground pl-6">
                Diunggah: {formatDateShort(payment.proof_uploaded_at)}
              </span>
            )}
          </div>
        )}

        {/* Ditolak */}
        {payment?.status === 'rejected' && payment.reject_reason && (
          <Alert variant="destructive">
            <AlertDescription>
              <span className="font-semibold">Pembayaran ditolak: </span>
              {payment.reject_reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Form upload — hanya jika bisa unggah */}
        {canUpload && (
          <>
            {/* Info rekening / QRIS */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Transfer ke:
              </p>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Bank BRI — a.n. Panitia Permifest</p>
                  <p className="font-mono font-bold text-lg tracking-widest">8820-1928-370</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  leftIcon={<Copy size={14} />}
                >
                  {copied ? 'Disalin!' : 'Salin'}
                </Button>
              </div>
              {comp?.payment_qr_url && (
                <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <QrCode size={14} />
                    <span>Atau via QRIS</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={comp.payment_qr_url}
                    alt="QR Code pembayaran"
                    className="max-w-[180px] rounded-lg border border-border"
                  />
                </div>
              )}
            </div>

            {/* Form upload */}
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">
                  Bukti Transfer <span className="text-destructive">*</span>
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileSelect}
                  disabled={isSubmitting}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: JPG, PNG, WEBP, atau PDF. Maks. 5 MB.
                </p>
              </div>

              {selectedFile && (
                <div className="text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2 font-mono">
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </div>
              )}

              {/* Progress bar */}
              {uploadProgress !== null && (
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !selectedFile}
                leftIcon={<UploadSimple size={16} weight="bold" />}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}
