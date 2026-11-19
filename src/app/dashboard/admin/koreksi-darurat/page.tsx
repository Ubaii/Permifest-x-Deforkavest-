'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import {
  WarningOctagon,
  ShieldWarning,
  Lock,
  ArrowRight,
  ClockCounterClockwise,
} from '@phosphor-icons/react';

export default function AdminKoreksiDaruratPage() {
  const { submissions, scoreChanges, overrideScore, currentUser } = useAppStore();

  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [newScoreInput, setNewScoreInput] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSub = submissions.find((s) => s.id === selectedSubId);
  const oldScore = selectedSub?.final_score || 0;

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId) {
      alert('Pilih karya peserta yang ingin dikoreksi terlebih dahulu.');
      return;
    }
    if (reason.trim().length < 20) {
      alert('Alasan koreksi darurat wajib diisi minimal 20 karakter demi kepatuhan audit forensik.');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmOverride = async () => {
    if (!selectedSubId) return;
    setIsSubmitting(true);
    try {
      await overrideScore(selectedSubId, Number(newScoreInput), reason);
      setAlertSuccess(
        `Koreksi darurat berhasil dieksekusi! Nilai karya "${selectedSub?.file_name || 'karya'}" diubah dari ${oldScore} menjadi ${newScoreInput}. Tercatat di audit trail permanen.`
      );
      setSelectedSubId('');
      setNewScoreInput(0);
      setReason('');
      setConfirmOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengeksekusi koreksi darurat';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Koreksi Darurat Nilai Juri (Break-Glass Protocol)"
      subtitle="Protokol eskalasi super admin untuk mengoreksi nilai karya yang telah dikunci. Setiap tindakan diaudit secara permanen."
    >
      <div className="space-y-6">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Override Berhasil Dicatat</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Banner Peringatan Keamanan Kritis */}
        <Alert variant="destructive" icon={<WarningOctagon className="w-5 h-5 text-[var(--destructive-text)]" weight="fill" />}>
          <AlertTitle>PERINGATAN PROTOKOL BREAK-GLASS SUPER ADMIN</AlertTitle>
          <AlertDescription>
            Fitur ini secara sepihak menimpa (*override*) nilai akhir hasil pertimbangan dewan juri. Sesuai kontrak keamanan sistem (SECURITY.md), alasan penulisan wajib minimal 20 karakter dan seluruh detail pergantian nilai akan disimpan ke rekam jejak append-only tanpa dapat dihapus.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulir Break Glass */}
          <Card className="border-[var(--destructive-border)] bg-[var(--card)]">
            <CardHeader className="pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2 text-[var(--destructive-text)] font-bold text-base">
                <ShieldWarning className="w-5 h-5" weight="fill" />
                <CardTitle className="text-base text-inherit">Formulir Koreksi Darurat</CardTitle>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Pilih karya target dan masukkan nilai baru beserta justifikasi resmi
              </p>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleOpenConfirm} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                    Pilih Karya Peserta Target *
                  </label>
                  <select
                    required
                    value={selectedSubId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedSubId(id);
                      const sub = submissions.find((s) => s.id === id);
                      if (sub) {
                        setNewScoreInput(sub.final_score || 0);
                      }
                    }}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--destructive-text)] min-h-[40px]"
                  >
                    <option value="">Pilih Karya...</option>
                    {submissions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.registration?.competition?.name} • {s.registration?.user?.full_name} (Nilai Saat Ini: {s.final_score ?? 'Belum ada'})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSub && (
                  <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--accent)]/30 border border-[var(--border)] text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-foreground)]">Karya Target:</span>
                      <span className="font-bold text-[var(--foreground)]">{selectedSub.file_name || selectedSub.link_url}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-foreground)]">Peserta:</span>
                      <span className="font-semibold text-[var(--foreground)]">{selectedSub.registration?.user?.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted-foreground)]">Nilai Awal Terkunci:</span>
                      <span className="font-mono font-bold text-base text-[var(--primary)]">{oldScore}</span>
                    </div>
                  </div>
                )}

                <Input
                  label="Nilai Baru Pengganti (Skala 0 - 100) *"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={newScoreInput}
                  onChange={(e) => setNewScoreInput(Number(e.target.value))}
                />

                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5 flex justify-between">
                    <span>Alasan &amp; Justifikasi Resmi (Minimal 20 Karakter) *</span>
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                      {reason.length} / 20 karakter
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Contoh: Berdasarkan klarifikasi banding juri pleno terdapat kesalahan input kriteria penilaian ke-3 yang seharusnya mendapat nilai 85..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--destructive-text)] resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    disabled={!selectedSubId || reason.trim().length < 20}
                  >
                    Tinjau &amp; Eksekusi Override
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Riwayat Override Skor (Log Forensik) */}
          <div className="space-y-4">
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader className="pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 font-bold text-sm text-[var(--foreground)]">
                  <ClockCounterClockwise className="w-4 h-4 text-[var(--primary)]" />
                  <CardTitle className="text-sm">Riwayat Koreksi Darurat Terakhir</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {scoreChanges.length === 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)] italic text-center py-8">
                    Belum ada tindakan koreksi darurat yang tercatat. Sistem dalam kondisi bersih dan stabil.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {scoreChanges.map((sc) => (
                      <div
                        key={sc.id}
                        className="p-3.5 rounded-[var(--radius-md)] bg-[var(--accent)]/30 border border-[var(--border)] text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                            {formatDateShort(sc.created_at)}
                          </span>
                          <span className="font-mono text-xs font-bold text-[var(--foreground)] flex items-center gap-1.5">
                            <span className="line-through text-[var(--muted-foreground)]">{sc.old_score}</span>
                            <ArrowRight className="w-3 h-3 text-[var(--destructive-text)]" />
                            <span className="text-[var(--success-text)]">{sc.new_score}</span>
                          </span>
                        </div>
                        <p className="text-xs text-[var(--foreground)] italic leading-relaxed">
                          &quot;{sc.reason}&quot;
                        </p>
                        <div className="text-[10px] text-[var(--muted-foreground)] font-mono">
                          Oleh: {sc.changed_by}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog Konfirmasi Eksekusi Override */}
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmOverride}
          title="Konfirmasi Tindakan Darurat Break-Glass"
          description={`Anda akan menimpa nilai karya dari ${oldScore} menjadi ${newScoreInput}. Tindakan ini atas wewenang Super Admin (${currentUser.email}) dan tercatat di audit trail permanen.`}
          confirmText="Ya, Terapkan Nilai Baru"
          variant="destructive"
          isLoading={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
