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
  Envelope,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react';

export default function AdminPengaturanPage() {
  const { systemSettings, updateSystemSettings } = useAppStore();

  const [formData, setFormData] = useState({ ...systemSettings });
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSystemSettings(formData);
      setAlertSuccess('Pengaturan sistem berhasil disimpan dan diterapkan!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Pengaturan Sistem &amp; Konfigurasi Event"
      subtitle="Kelola rekening tujuan transfer pembayaran, kontak panitia, dan status operasional pendaftaran platform."
    >
      <div className="space-y-6 max-w-4xl">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Operasi Berhasil</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
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
                    <span className="text-[var(--muted-foreground)]">Kunci akses publik untuk perawatan database</span>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Konfigurasi Rekening & QRIS */}
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 font-bold text-base text-[var(--foreground)]">
                <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                <CardTitle className="text-base">Rekening Tujuan Pembayaran &amp; QRIS</CardTitle>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Data ini ditampilkan pada halaman pembayaran peserta saat scan barcode atau transfer ATM
              </p>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
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
                helperText="National Merchant ID yang tertera pada banner QRIS"
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
