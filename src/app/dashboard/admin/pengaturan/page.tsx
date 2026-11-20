'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Bank,
  Envelope,
  Warning,
  Eye,
  Sliders,
} from '@phosphor-icons/react';

export default function AdminPengaturanPage() {
  const { systemSettings, updateSystemSettings } = useAppStore();

  const [activeTab, setActiveTab] = useState<'rekening' | 'identitas' | 'keamanan'>('rekening');
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
      <div className="space-y-6 max-w-5xl">
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

        {/* Tab Navigasi Pengaturan */}
        <div className="flex items-center gap-1 bg-[var(--accent)]/50 p-1 rounded-xl border border-[var(--border)] overflow-x-auto w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('rekening')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rekening'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[var(--primary)]" />
            <span>Rekening Bank &amp; Barcode QRIS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('identitas')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'identitas'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
            <span>Identitas Event &amp; Bantuan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keamanan')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'keamanan'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            <Sliders className="w-4 h-4 text-[var(--warning)]" />
            <span>Status Portal &amp; Pemeliharaan</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TAB 1: REKENING & QRIS DENGAN LIVE PREVIEW */}
          {activeTab === 'rekening' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Input */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-[var(--border)] bg-[var(--card)] shadow-2xs">
                  <CardHeader className="pb-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                      <CardTitle className="text-base">Rekening Transfer Bank Resmi</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-[var(--muted-foreground)]">
                      Informasi rekening tujuan transfer yang akan dilihat peserta saat checkout tiket
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Input
                        label="Nama Bank *"
                        placeholder="Contoh: BCA"
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
                        label="Atas Nama Pemilik *"
                        placeholder="Panitia Permifest"
                        required
                        value={formData.bank_account_holder}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bank_account_holder: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[var(--border)] bg-[var(--card)] shadow-2xs">
                  <CardHeader className="pb-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-[var(--primary)]" />
                      <CardTitle className="text-base">Barcode QRIS Resmi Event</CardTitle>
                    </div>
                    <CardDescription className="text-xs text-[var(--muted-foreground)]">
                      Unggah barcode QRIS standar nasional yang dapat dipindai oleh semua e-wallet
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <Input
                      label="Nomor NMID QRIS Resmi"
                      placeholder="Contoh: ID10293847561"
                      value={formData.qris_nmid}
                      onChange={(e) => setFormData((prev) => ({ ...prev, qris_nmid: e.target.value }))}
                      helperText="National Merchant ID yang tertera pada sertifikat QRIS"
                    />

                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-dashed border-[var(--border)] bg-[var(--accent)]/15">
                      {formData.qris_image_url ? (
                        <div className="relative group shrink-0">
                          <div className="w-36 h-36 rounded-xl overflow-hidden border-2 border-[var(--primary)]/40 bg-white p-2 flex items-center justify-center shadow-xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formData.qris_image_url}
                              alt="QRIS Resmi"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveQr}
                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-[var(--destructive)] text-white shadow-sm hover:scale-110 transition-transform"
                            title="Hapus gambar QRIS"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-36 h-36 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] flex flex-col items-center justify-center text-center p-3 text-[var(--muted-foreground)] shrink-0">
                          <QrCode className="w-10 h-10 opacity-30 mb-1" />
                          <span className="text-[11px] font-semibold">Belum Ada File QRIS</span>
                          <span className="text-[9px]">PNG, JPG, WEBP</span>
                        </div>
                      )}

                      <div className="space-y-2 text-xs">
                        <p className="text-[var(--muted-foreground)] leading-relaxed">
                          Berkas QRIS ini akan ditampilkan di modal instruksi transfer peserta saat pembayaran.
                        </p>
                        <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--primary)] text-white font-semibold text-xs cursor-pointer hover:opacity-95 transition-opacity">
                          <UploadSimple className="w-4 h-4" weight="bold" />
                          <span>{formData.qris_image_url ? 'Ganti File QRIS' : 'Pilih File QRIS'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQrUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                  <Eye className="w-4 h-4 text-[var(--primary)]" />
                  Pratinjau Kartu Pembayaran
                </div>

                {/* Kartu Bank Preview */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,#5a2ab3)] text-white shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider opacity-80">{formData.bank_name || 'BANK'}</span>
                    <Bank className="w-6 h-6 opacity-80" />
                  </div>
                  <div>
                    <span className="text-[10px] opacity-70 block">Nomor Rekening Resmi</span>
                    <span className="font-mono font-bold text-lg tracking-widest">{formData.bank_account_number || '0000 0000 00'}</span>
                  </div>
                  <div className="pt-2 border-t border-white/20 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[9px] opacity-70 block">Atas Nama</span>
                      <strong className="tracking-wide">{formData.bank_account_holder || 'Panitia Event'}</strong>
                    </div>
                    <Badge variant="neutral" size="sm" className="bg-white/20 text-white border-0">
                      Verifikasi 24 Jam
                    </Badge>
                  </div>
                </div>

                {/* QRIS Preview Box */}
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-center space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">
                    Tampilan Barcode QRIS Peserta
                  </span>
                  {formData.qris_image_url ? (
                    <div className="w-28 h-28 mx-auto bg-white rounded-lg p-1 border border-[var(--border)] flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.qris_image_url} alt="QRIS Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-28 h-28 mx-auto border border-dashed border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--muted-foreground)]">
                      <QrCode className="w-8 h-8 opacity-30" />
                    </div>
                  )}
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)] block">
                    NMID: {formData.qris_nmid || '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTITAS EVENT & BANTUAN */}
          {activeTab === 'identitas' && (
            <div className="space-y-6">
              <Card className="border-[var(--border)] bg-[var(--card)] shadow-2xs">
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
                    <CardTitle className="text-base">Identitas Resmi Event</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <Input
                    label="Nama Resmi Event / Platform *"
                    required
                    value={formData.event_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, event_name: e.target.value }))}
                  />
                </CardContent>
              </Card>

              <Card className="border-[var(--border)] bg-[var(--card)] shadow-2xs">
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <WhatsappLogo className="w-5 h-5 text-[var(--primary)]" />
                    <CardTitle className="text-base">Layanan Bantuan &amp; Helpdesk</CardTitle>
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
                      label="Alamat Email Bantuan Resmi *"
                      type="email"
                      placeholder="helpdesk@permifest.id"
                      required
                      value={formData.email_helpdesk}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email_helpdesk: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TAB 3: STATUS PORTAL & PEMELIHARAAN */}
          {activeTab === 'keamanan' && (
            <div className="space-y-6">
              <Card className="border-[var(--border)] bg-[var(--card)] shadow-2xs">
                <CardHeader className="pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[var(--warning)]" />
                    <CardTitle className="text-base">Saklar Operasional Portal Publik</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.registration_open}
                        onChange={(e) => setFormData((prev) => ({ ...prev, registration_open: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-[var(--foreground)] block">Buka Portal Pendaftaran</span>
                        <span className="text-[var(--muted-foreground)] leading-relaxed block">
                          Peserta baru dapat mendaftar akun, memilih cabang kompetisi, dan mengunggah berkas tiket.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--destructive)] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.maintenance_mode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, maintenance_mode: e.target.checked }))}
                        className="w-4 h-4 mt-0.5 rounded text-[var(--destructive)] focus:ring-[var(--destructive)]"
                      />
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-[var(--destructive)] block">Mode Pemeliharaan (Maintenance)</span>
                        <span className="text-[var(--muted-foreground)] leading-relaxed block">
                          Kunci portal publik untuk pemeliharaan berkala atau pembaruan keamanan darurat.
                        </span>
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Submit Button Bar */}
          <div className="flex justify-end pt-3 border-t border-[var(--border)]">
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
