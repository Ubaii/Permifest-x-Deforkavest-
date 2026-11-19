'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/lib/store';
import {
  Gear,
  CreditCard,
  QrCode,
  WhatsappLogo,
  ShieldCheck,
  CheckCircle,
  UploadSimple,
  Trash,
} from '@phosphor-icons/react';

export default function AdminPengaturanPage() {
  const { systemSettings, updateSystemSettings } = useAppStore();

  const [formData, setFormData] = useState({ ...systemSettings });
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAlertError('File yang dipilih harus berupa format gambar (.png, .jpg, .jpeg, .webp)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        qris_image_url: reader.result as string,
      }));
      setAlertError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQr = () => {
    setFormData((prev) => ({
      ...prev,
      qris_image_url: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertError(null);
    try {
      await updateSystemSettings(formData);
      setAlertSuccess('Pengaturan sistem dan file QRIS resmi berhasil disimpan dan langsung diterapkan ke seluruh portal!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan sistem';
      setAlertError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Pengaturan Sistem &amp; Konfigurasi Event"
      subtitle="Kelola rekening transfer, unggah barcode QRIS resmi, atur kontak panitia, dan status operasional pendaftaran."
    >
      <div className="space-y-6 max-w-4xl">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Pengaturan Tersimpan</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {alertError && (
          <Alert variant="destructive" onClose={() => setAlertError(null)}>
            <AlertTitle>Terjadi Kesalahan</AlertTitle>
            <AlertDescription>{alertError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identitas Event & Status Operasional */}
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 font-bold text-base text-[var(--foreground)]">
                <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
                <CardTitle className="text-base">Identitas &amp; Status Operasional Platform</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <Input
                label="Nama Resmi Event / Platform *"
                required
                value={formData.event_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, event_name: e.target.value }))}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--accent)]/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.registration_open}
                    onChange={(e) => setFormData((prev) => ({ ...prev, registration_open: e.target.checked }))}
                    className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[var(--foreground)] block">Buka Portal Pendaftaran</span>
                    <span className="text-[var(--muted-foreground)]">Peserta baru dapat mendaftar dan memilih lomba</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--accent)]/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.maintenance_mode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maintenance_mode: e.target.checked }))}
                    className="w-4 h-4 rounded text-[var(--destructive-text)] focus:ring-[var(--destructive-text)]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-[var(--foreground)] block">Mode Pemeliharaan (Maintenance)</span>
                    <span className="text-[var(--muted-foreground)]">Kunci akses publik untuk pembaruan sistem</span>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Konfigurasi QRIS & Rekening Transfer */}
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 font-bold text-base text-[var(--foreground)]">
                <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                <CardTitle className="text-base">Rekening Transfer &amp; Barcode QRIS Resmi</CardTitle>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Data dan file barcode ini ditampilkan secara otomatis di dashboard pembayaran peserta
              </p>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              {/* Upload QRIS Section */}
              <div className="p-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--accent)]/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  <QrCode className="w-4 h-4 text-[var(--primary)]" />
                  Berkas Gambar Barcode QRIS Resmi
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {formData.qris_image_url ? (
                    <div className="relative group shrink-0">
                      <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-[var(--primary)]/40 bg-white p-2 flex items-center justify-center shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.qris_image_url}
                          alt="QRIS Resmi Event"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveQr}
                        className="absolute -top-2 -right-2 p-1.5 rounded-full bg-[var(--destructive-bg)] text-[var(--destructive-text)] border border-[var(--destructive-border)] shadow-sm hover:scale-110 transition-transform"
                        title="Hapus gambar QRIS"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] flex flex-col items-center justify-center text-center p-3 text-[var(--muted-foreground)] shrink-0">
                      <QrCode className="w-10 h-10 opacity-40 mb-1" />
                      <span className="text-[11px] font-semibold">Belum Ada File QRIS</span>
                      <span className="text-[9px]">Format .png, .jpg</span>
                    </div>
                  )}

                  <div className="space-y-2 text-xs">
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      Unggah berkas barcode QRIS resmi yang dikeluarkan oleh bank/PJSP (misal QRIS Bank Indonesia, BCA, Gopay, dsb.).
                    </p>
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[var(--radius-sm)] bg-[var(--primary)] text-white font-semibold text-xs cursor-pointer hover:opacity-90 transition-opacity">
                      <UploadSimple className="w-4 h-4" weight="bold" />
                      <span>{formData.qris_image_url ? 'Ganti File Gambar QRIS' : 'Pilih File Gambar QRIS'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Nama Bank Resmi *"
                  placeholder="BCA / Mandiri / BNI"
                  required
                  value={formData.bank_name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bank_name: e.target.value }))}
                />

                <Input
                  label="Nomor Rekening *"
                  placeholder="8820 1928 37"
                  required
                  value={formData.bank_account_number}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bank_account_number: e.target.value }))}
                />

                <Input
                  label="Atas Nama Pemilik Rekening *"
                  placeholder="Panitia Permifest x Deforkafest"
                  required
                  value={formData.bank_account_holder}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bank_account_holder: e.target.value }))}
                />
              </div>

              <Input
                label="Nomor NMID QRIS Resmi"
                placeholder="ID10293847561"
                value={formData.qris_nmid}
                onChange={(e) => setFormData((prev) => ({ ...prev, qris_nmid: e.target.value }))}
                helperText="National Merchant ID yang tertera pada lembar sertifikasi QRIS"
              />
            </CardContent>
          </Card>

          {/* Kontak Helpdesk Panitia */}
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 font-bold text-base text-[var(--foreground)]">
                <WhatsappLogo className="w-5 h-5 text-[var(--primary)]" />
                <CardTitle className="text-base">Kontak Helpdesk &amp; Layanan Bantuan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nomor WhatsApp Helpdesk *"
                  placeholder="0812-3456-7890"
                  required
                  value={formData.whatsapp_helpdesk}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whatsapp_helpdesk: e.target.value }))}
                />

                <Input
                  label="Email Bantuan Resmi *"
                  type="email"
                  placeholder="helpdesk@permifest.id"
                  required
                  value={formData.email_helpdesk}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email_helpdesk: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={<CheckCircle className="w-4 h-4" weight="bold" />}
              isLoading={isSubmitting}
            >
              Simpan Seluruh Pengaturan
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
