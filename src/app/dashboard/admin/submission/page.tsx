'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { JudgeAssignment } from '@/lib/types';
import {
  FileText,
  UserPlus,
  DownloadSimple,
  ArrowSquareOut,
  Lock,
  LockOpen,
  X,
} from '@phosphor-icons/react';

export default function AdminSubmissionPage() {
  const { submissions, availableUsers, judgeAssignments, assignJudge, removeJudgeAssignment } = useAppStore();

  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [lockedSubmissions, setLockedSubmissions] = useState<Record<string, boolean>>({});
  const [confirmLockTarget, setConfirmLockTarget] = useState<string | null>(null);
  const [deleteAssignTarget, setDeleteAssignTarget] = useState<JudgeAssignment | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const judgesList = availableUsers.filter((u) => u.role === 'juri' || u.role === 'panitia' || u.role === 'super_admin');

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubId || !selectedJudgeId) return;

    setAssigning(true);
    try {
      await assignJudge(activeSubId, selectedJudgeId);
      setActiveSubId(null);
      setSelectedJudgeId('');
      setAlertSuccess('Karya peserta berhasil ditugaskan ke dewan juri!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menugaskan juri';
      alert(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleToggleLockScoreConfirm = () => {
    if (!confirmLockTarget) return;
    const isCurrentlyLocked = lockedSubmissions[confirmLockTarget];
    setLockedSubmissions((prev) => ({
      ...prev,
      [confirmLockTarget]: !isCurrentlyLocked,
    }));
    setAlertSuccess(`Nilai karya berhasil ${isCurrentlyLocked ? 'dibuka kembali' : 'dikunci dan disahkan'}!`);
    setConfirmLockTarget(null);
  };

  const handleDeleteAssignConfirm = async () => {
    if (!deleteAssignTarget) return;
    await removeJudgeAssignment(deleteAssignTarget.id);
    setAlertSuccess(`Penugasan juri ${deleteAssignTarget.judge?.full_name} berhasil dicabut.`);
    setDeleteAssignTarget(null);
  };

  return (
    <DashboardLayout
      title="Manajemen Submission & Penugasan Juri"
      subtitle="Distribusikan karya peserta akademik kepada dewan juri, pantau progres evaluasi, dan kunci nilai akhir."
    >
      <div className="space-y-6">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Operasi Berhasil</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {submissions.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-7 h-7 text-[var(--primary)]" weight="duotone" />}
            title="Belum Ada Karya Terkumpul"
            description="Belum ada berkas karya atau tautan Figma yang dikumpulkan oleh peserta saat ini."
          />
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => {
              const comp = sub.registration?.competition;
              const assignments = judgeAssignments.filter((a) => a.submission_id === sub.id);
              const isLocked = lockedSubmissions[sub.id] || assignments.some((a) => a.scores?.some((s) => s.is_locked));

              return (
                <Card key={sub.id} className="overflow-hidden border-[var(--border)] bg-[var(--card)]">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="primary">{comp?.name}</Badge>
                          <Badge variant="neutral" size="sm">Versi v{sub.version}</Badge>
                          {isLocked && (
                            <Badge variant="neutral" size="sm" className="gap-1">
                              <Lock className="w-3 h-3" weight="bold" />
                              Nilai Terkunci
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-[var(--foreground)] font-[family-name:var(--font-bricolage)]">
                          {sub.file_name || (sub.link_url ? 'Tautan Desain Figma Peserta' : 'Dokumen Peserta')}
                        </h4>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Peserta: <strong className="text-[var(--foreground)]">{sub.registration?.user?.full_name}</strong>
                          {' '}({sub.registration?.user?.institution || '-'}) • Diunggah: <span className="font-mono">{formatDateShort(sub.submitted_at)}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {sub.link_url ? (
                          <a href={sub.link_url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" leftIcon={<ArrowSquareOut className="w-4 h-4" />}>
                              Buka Figma
                            </Button>
                          </a>
                        ) : sub.file_url ? (
                          <a href={sub.file_url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" leftIcon={<DownloadSimple className="w-4 h-4" />}>
                              Unduh File
                            </Button>
                          </a>
                        ) : null}

                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<UserPlus className="w-4 h-4" weight="bold" />}
                          onClick={() => setActiveSubId(sub.id)}
                        >
                          Tugaskan Juri
                        </Button>

                        <Button
                          size="sm"
                          variant={isLocked ? 'outline' : 'primary'}
                          leftIcon={isLocked ? <LockOpen className="w-4 h-4" weight="bold" /> : <Lock className="w-4 h-4" weight="bold" />}
                          onClick={() => setConfirmLockTarget(sub.id)}
                        >
                          {isLocked ? 'Buka Kunci Nilai' : 'Kunci Nilai'}
                        </Button>
                      </div>
                    </div>

                    {/* Matriks Juri yang Ditugaskan */}
                    <div className="mt-4 pt-3.5 border-t border-[var(--border)]">
                      <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-2 font-mono">
                        Dewan Juri yang Ditugaskan ({assignments.length}):
                      </span>

                      {assignments.length === 0 ? (
                        <p className="text-xs text-[var(--muted-foreground)] italic">
                          Belum ada juri yang ditugaskan untuk karya ini. Klik &quot;Tugaskan Juri&quot; di atas.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {assignments.map((assign) => (
                            <div key={assign.id} className="p-3 rounded-[var(--radius-md)] bg-[var(--accent)]/30 border border-[var(--border)] text-xs flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-[var(--foreground)] block">
                                  {assign.judge?.full_name || 'Dewan Juri'}
                                </span>
                                <span className="text-[11px] text-[var(--muted-foreground)]">
                                  Status: {assign.status === 'completed' ? 'Selesai Dinilai' : 'Sedang Menilai'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <StatusBadge
                                  status={assign.status === 'completed' ? 'completed' : 'assigned'}
                                  customLabel={assign.status === 'completed' ? 'Selesai' : 'Ditugaskan'}
                                />
                                {!isLocked && (
                                  <button
                                    type="button"
                                    onClick={() => setDeleteAssignTarget(assign)}
                                    className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)] transition-colors"
                                    title="Cabut Penugasan Juri"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Penugasan Juri */}
      <Modal
        isOpen={Boolean(activeSubId)}
        onClose={() => setActiveSubId(null)}
        title="Tugaskan Dewan Juri"
        description="Pilih akun juri yang akan bertanggung jawab memberikan penilaian berbasis rubrik untuk karya ini."
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Pilih Dewan Juri <span className="text-[var(--destructive-text)]">*</span>
            </label>
            <select
              required
              value={selectedJudgeId}
              onChange={(e) => setSelectedJudgeId(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[44px]"
            >
              <option value="">Pilih Juri...</option>
              {judgesList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.full_name} ({j.email}) - Peran: {j.role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setActiveSubId(null)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={assigning}>
              Tugaskan Sekarang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Kunci / Buka Nilai */}
      <ConfirmDialog
        isOpen={Boolean(confirmLockTarget)}
        onClose={() => setConfirmLockTarget(null)}
        onConfirm={handleToggleLockScoreConfirm}
        title={confirmLockTarget && lockedSubmissions[confirmLockTarget] ? 'Buka Kunci Nilai?' : 'Kunci Nilai Karya?'}
        description={
          confirmLockTarget && lockedSubmissions[confirmLockTarget]
            ? 'Dewan juri akan dapat kembali merevisi nilai yang telah diinput.'
            : 'Setelah dikunci, dewan juri tidak dapat mengubah nilai lagi demi integritas rekapitulasi penilaian.'
        }
        confirmText={confirmLockTarget && lockedSubmissions[confirmLockTarget] ? 'Ya, Buka Kunci' : 'Ya, Kunci Nilai'}
        variant={confirmLockTarget && lockedSubmissions[confirmLockTarget] ? 'warning' : 'primary'}
      />

      {/* Dialog Konfirmasi Cabut Penugasan Juri */}
      <ConfirmDialog
        isOpen={Boolean(deleteAssignTarget)}
        onClose={() => setDeleteAssignTarget(null)}
        onConfirm={handleDeleteAssignConfirm}
        title="Cabut Penugasan Juri?"
        description={`Anda akan mencabut tugas penilaian dari juri "${deleteAssignTarget?.judge?.full_name}". Karya ini tidak akan lagi muncul di dashboard juri bersangkutan.`}
        confirmText="Cabut Penugasan"
        variant="destructive"
      />
    </DashboardLayout>
  );
}
