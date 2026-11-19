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
import { JudgeAssignment, Submission } from '@/lib/types';
import {
  FileText,
  UserPlus,
  Lock,
  LockOpen,
  X,
  CheckCircle,
  Trophy,
  ClipboardText,
} from '@phosphor-icons/react';

export default function AdminPenilaianPage() {
  const {
    submissions,
    availableUsers,
    judgeAssignments,
    competitions,
    assignJudge,
    removeJudgeAssignment,
    toggleLockSubmissionScore,
  } = useAppStore();

  const [compFilter, setCompFilter] = useState('all');
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [confirmLockSub, setConfirmLockSub] = useState<Submission | null>(null);
  const [deleteAssignTarget, setDeleteAssignTarget] = useState<JudgeAssignment | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const judgesList = availableUsers.filter(
    (u) => u.role === 'juri' || u.role === 'panitia' || u.role === 'super_admin'
  );

  const filteredSubmissions = submissions.filter((s) => {
    if (compFilter === 'all') return true;
    return s.registration?.competition_id === compFilter;
  });

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubId || !selectedJudgeId) return;

    setAssigning(true);
    setModalError(null);
    try {
      await assignJudge(activeSubId, selectedJudgeId);
      setActiveSubId(null);
      setSelectedJudgeId('');
      setAlertSuccess('Karya peserta berhasil ditugaskan ke dewan juri!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menugaskan juri';
      setModalError(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleToggleLockScoreConfirm = async () => {
    if (!confirmLockSub) return;
    const assignments = judgeAssignments.filter((a) => a.submission_id === confirmLockSub.id);
    const isCurrentlyLocked = assignments.some((a) => a.scores?.some((s) => s.is_locked));

    await toggleLockSubmissionScore(confirmLockSub.id, !isCurrentlyLocked);
    setAlertSuccess(
      `Nilai karya "${confirmLockSub.file_name || 'karya'}" berhasil ${
        isCurrentlyLocked ? 'dibuka kembali' : 'dikunci dan disahkan resmi'
      }!`
    );
    setConfirmLockSub(null);
  };

  const handleDeleteAssignConfirm = async () => {
    if (!deleteAssignTarget) return;
    await removeJudgeAssignment(deleteAssignTarget.id);
    setAlertSuccess(`Penugasan juri ${deleteAssignTarget.judge?.full_name} berhasil dicabut.`);
    setDeleteAssignTarget(null);
  };

  return (
    <DashboardLayout
      title="Penilaian Karya, Penugasan Juri &amp; Kunci Nilai"
      subtitle="Distribusikan karya ke dewan juri, pantau matriks penilaian rubrik, dan sahkan skor akhir perlombaan."
    >
      <div className="space-y-6">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Operasi Berhasil</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-semibold">Filter Lomba:</span>
            <select
              value={compFilter}
              onChange={(e) => setCompFilter(e.target.value)}
              aria-label="Filter cabang lomba"
              className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[36px]"
            >
              <option value="all">Semua Cabang Akademik</option>
              {competitions
                .filter((c) => c.type === 'academic')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="text-xs text-[var(--muted-foreground)] font-mono">
            Total Karya: <strong className="text-[var(--foreground)]">{filteredSubmissions.length}</strong> entri
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <EmptyState
            icon={<ClipboardText className="w-7 h-7 text-[var(--primary)]" weight="duotone" />}
            title="Belum Ada Karya yang Dinilai"
            description="Belum ada karya yang dikumpulkan oleh peserta pada cabang lomba akademik yang dipilih."
          />
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => {
              const comp = sub.registration?.competition;
              const assignments = judgeAssignments.filter((a) => a.submission_id === sub.id);
              const isLocked = assignments.some((a) => a.scores?.some((s) => s.is_locked));

              return (
                <Card key={sub.id} className="overflow-hidden border-[var(--border)] bg-[var(--card)]">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="primary">{comp?.name}</Badge>
                          <Badge variant="neutral" size="sm">
                            Versi v{sub.version}
                          </Badge>
                          {isLocked ? (
                            <Badge variant="success" size="sm" className="gap-1">
                              <Lock className="w-3 h-3" weight="bold" />
                              Nilai Terkunci
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              Draf Nilai
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-[var(--foreground)] font-[family-name:var(--font-bricolage)]">
                          {sub.file_name || (sub.link_url ? 'Tautan Desain Figma Peserta' : 'Dokumen Peserta')}
                        </h4>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Peserta:{' '}
                          <strong className="text-[var(--foreground)]">{sub.registration?.user?.full_name}</strong> (
                          {sub.registration?.user?.institution || '-'}) • Waktu:{' '}
                          <span className="font-mono">{formatDateShort(sub.submitted_at)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {sub.final_score !== undefined && (
                          <div className="text-right pr-2">
                            <span className="text-[10px] text-[var(--muted-foreground)] block uppercase font-mono">
                              Nilai Akhir
                            </span>
                            <span className="text-xl font-bold font-mono text-[var(--primary)] tabular-nums">
                              {sub.final_score}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            leftIcon={<UserPlus className="w-4 h-4" weight="bold" />}
                            onClick={() => setActiveSubId(sub.id)}
                            disabled={isLocked}
                          >
                            Tugaskan Juri
                          </Button>

                          <Button
                            size="sm"
                            variant={isLocked ? 'outline' : 'primary'}
                            leftIcon={
                              isLocked ? (
                                <LockOpen className="w-4 h-4" weight="bold" />
                              ) : (
                                <Lock className="w-4 h-4" weight="bold" />
                              )
                            }
                            onClick={() => setConfirmLockSub(sub)}
                          >
                            {isLocked ? 'Buka Kunci' : 'Kunci Nilai'}
                          </Button>
                        </div>
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
                            <div
                              key={assign.id}
                              className="p-3 rounded-[var(--radius-md)] bg-[var(--accent)]/30 border border-[var(--border)] text-xs flex items-center justify-between"
                            >
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
          {modalError && (
            <Alert variant="destructive" onClose={() => setModalError(null)}>
              <AlertTitle>Gagal Menugaskan Juri</AlertTitle>
              <AlertDescription>{modalError}</AlertDescription>
            </Alert>
          )}

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
        isOpen={Boolean(confirmLockSub)}
        onClose={() => setConfirmLockSub(null)}
        onConfirm={handleToggleLockScoreConfirm}
        title="Sahkan &amp; Kunci Nilai Karya?"
        description="Setelah nilai dikunci, dewan juri tidak dapat mengubah nilai lagi. Skor akan menjadi nilai akhir resmi."
        confirmText="Kunci Nilai"
        variant="primary"
      />

      {/* Dialog Konfirmasi Cabut Penugasan Juri */}
      <ConfirmDialog
        isOpen={Boolean(deleteAssignTarget)}
        onClose={() => setDeleteAssignTarget(null)}
        onConfirm={handleDeleteAssignConfirm}
        title="Cabut Penugasan Juri?"
        description={`Anda akan mencabut tugas penilaian dari juri "${deleteAssignTarget?.judge?.full_name}".`}
        confirmText="Cabut Penugasan"
        variant="destructive"
      />
    </DashboardLayout>
  );
}
