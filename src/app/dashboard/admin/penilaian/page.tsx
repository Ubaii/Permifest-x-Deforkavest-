'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { JudgeAssignment, Submission, RubricCriteria } from '@/lib/types';
import {
  FileText,
  UserPlus,
  Lock,
  LockOpen,
  X,
  CheckCircle,
  ClipboardText,
  ShieldWarning,
  Sliders,
  Sparkle,
  User,
  Buildings,
} from '@phosphor-icons/react';

function AdminPenilaianContent() {
  const searchParams = useSearchParams();
  const subIdParam = searchParams.get('sub_id');

  const {
    submissions,
    availableUsers,
    judgeAssignments,
    competitions,
    rubricCriteria,
    assignJudge,
    removeJudgeAssignment,
    toggleLockSubmissionScore,
    submitJudgeScore,
    overrideScore,
  } = useAppStore();

  const [compFilter, setCompFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unassigned' | 'in_progress' | 'locked'>('all');
  const [assignDrawerSub, setAssignDrawerSub] = useState<Submission | null>(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [confirmLockSub, setConfirmLockSub] = useState<Submission | null>(null);
  const [deleteAssignTarget, setDeleteAssignTarget] = useState<JudgeAssignment | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  // Direct scoring drawer state
  const [scoringDrawerSub, setScoringDrawerSub] = useState<Submission | null>(null);
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [scoringNotes, setScoringNotes] = useState('');
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  useEffect(() => {
    if (subIdParam) {
      const target = submissions.find((s) => s.id === subIdParam);
      if (target) {
        setAssignDrawerSub(target);
      }
    }
  }, [subIdParam, submissions]);

  const judgesList = availableUsers.filter(
    (u) => u.role === 'juri' || u.role === 'panitia' || u.role === 'super_admin'
  );

  const filteredSubmissions = submissions.filter((s) => {
    if (compFilter !== 'all' && s.registration?.competition_id !== compFilter) return false;
    const assignments = judgeAssignments.filter((a) => a.submission_id === s.id);
    const isLocked = assignments.some((a) => a.scores?.some((sc) => sc.is_locked));

    if (statusFilter === 'unassigned') return assignments.length === 0;
    if (statusFilter === 'in_progress') return assignments.length > 0 && !isLocked;
    if (statusFilter === 'locked') return isLocked;

    return true;
  });

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDrawerSub || !selectedJudgeId) return;

    setAssigning(true);
    setDrawerError(null);
    try {
      await assignJudge(assignDrawerSub.id, selectedJudgeId);
      setAssignDrawerSub(null);
      setSelectedJudgeId('');
      setAlertSuccess('Karya peserta berhasil ditugaskan ke dewan juri!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menugaskan juri';
      setDrawerError(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleOpenDirectScoring = (sub: Submission) => {
    setScoringDrawerSub(sub);
    const compCriteria = rubricCriteria.filter(
      (c) => c.competition_id === sub.registration?.competition_id
    );

    // Inisialisasi score inputs
    const initial: Record<string, number> = {};
    compCriteria.forEach((crit) => {
      initial[crit.id] = 80; // default 80
    });
    setScoreInputs(initial);
    setScoringNotes(sub.notes || '');
  };

  const handleDirectScoringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringDrawerSub) return;

    setIsSubmittingScore(true);
    try {
      const formattedScores = Object.entries(scoreInputs).map(([criteriaId, score]) => ({
        criteriaId,
        score: Number(score),
        comment: scoringNotes,
      }));

      const existingAssignment = judgeAssignments.find((a) => a.submission_id === scoringDrawerSub.id);
      if (existingAssignment) {
        await submitJudgeScore(existingAssignment.id, formattedScores);
      } else {
        await overrideScore(
          scoringDrawerSub.id,
          currentCalculatedScore,
          scoringNotes.length >= 20
            ? scoringNotes
            : 'Penilaian langsung panitia berdasarkan evaluasi matriks rubrik perlombaan resmi'
        );
      }
      setAlertSuccess(`Nilai karya "${scoringDrawerSub.file_name || 'karya'}" (${currentCalculatedScore}) berhasil disimpan!`);

      setScoringDrawerSub(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan nilai';
      setDrawerError(msg);
    } finally {
      setIsSubmittingScore(false);
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

  // Live calculation of weighted score in direct scoring drawer
  const targetCompCriteria = scoringDrawerSub
    ? rubricCriteria.filter((c) => c.competition_id === scoringDrawerSub.registration?.competition_id)
    : [];

  const currentCalculatedScore = Math.round(
    targetCompCriteria.reduce((acc, crit) => {
      const score = scoreInputs[crit.id] || 0;
      const weight = crit.weight || 0.25;
      return acc + score * weight;
    }, 0) * 10
  ) / 10;

  return (
    <DashboardLayout
      title="Penilaian Karya, Penugasan Juri &amp; Kunci Nilai"
      subtitle="Distribusikan karya ke dewan juri, fleksibel input nilai, pantau matriks penilaian rubrik, dan sahkan skor akhir perlombaan."
      actions={
        <Link href="/dashboard/admin/koreksi-darurat">
          <Button size="sm" variant="outline" leftIcon={<ShieldWarning className="w-4 h-4 text-[var(--warning)]" />}>
            Koreksi Darurat Nilai
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Operasi Berhasil</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Tab & Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          {/* Tab Filter Status */}
          <div className="flex items-center gap-1 bg-[var(--accent)]/50 p-1 rounded-lg border border-[var(--border)] overflow-x-auto">
            {[
              { id: 'all', label: `Semua (${submissions.length})` },
              { id: 'unassigned', label: 'Belum Ditugaskan' },
              { id: 'in_progress', label: 'Sedang Dinilai' },
              { id: 'locked', label: 'Terkunci' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap min-h-[32px] ${
                  statusFilter === tab.id
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--muted-foreground)] font-semibold shrink-0">Lomba:</span>
            <select
              value={compFilter}
              onChange={(e) => setCompFilter(e.target.value)}
              aria-label="Filter cabang lomba"
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 h-9 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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
        </div>

        {filteredSubmissions.length === 0 ? (
          <EmptyState
            icon={<ClipboardText className="w-7 h-7 text-[var(--primary)]" weight="duotone" />}
            title="Belum Ada Karya yang Dinilai"
            description="Belum ada karya yang sesuai dengan filter cabang lomba atau status penilaian saat ini."
          />
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => {
              const comp = sub.registration?.competition;
              const assignments = judgeAssignments.filter((a) => a.submission_id === sub.id);
              const isLocked = assignments.some((a) => a.scores?.some((s) => s.is_locked));

              return (
                <Card key={sub.id} className="overflow-hidden border-[var(--border)] bg-[var(--card)] shadow-2xs">
                  <div className="p-4 sm:p-5">
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
                        <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5 flex-wrap">
                          <span>Peserta:</span>
                          <strong className="text-[var(--foreground)]">{sub.registration?.user?.full_name}</strong>
                          <span>({sub.registration?.user?.institution || '-'})</span>
                          <span>•</span>
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
                            leftIcon={<Sliders className="w-4 h-4" />}
                            onClick={() => handleOpenDirectScoring(sub)}
                            disabled={isLocked}
                            title="Input / Koreksi Nilai Rubrik Langsung"
                          >
                            Input Nilai
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<UserPlus className="w-4 h-4" weight="bold" />}
                            onClick={() => setAssignDrawerSub(sub)}
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
                          Belum ada juri yang ditugaskan. Anda dapat menugaskan juri atau langsung menginput nilai lewat tombol &quot;Input Nilai&quot; di atas.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {assignments.map((assign) => (
                            <div
                              key={assign.id}
                              className="p-3 rounded-xl bg-[var(--accent)]/30 border border-[var(--border)] text-xs flex items-center justify-between"
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
                                    className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition-colors"
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

      {/* DRAWER PENUGASAN JURI */}
      <Drawer
        isOpen={Boolean(assignDrawerSub)}
        onClose={() => setAssignDrawerSub(null)}
        size="md"
      >
        <DrawerHeader>
          <DrawerTitle>Tugaskan Dewan Juri</DrawerTitle>
          <DrawerDescription>
            Pilih akun juri yang akan bertanggung jawab memberikan penilaian berbasis rubrik untuk karya &quot;{assignDrawerSub?.file_name || 'karya'}&quot;.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerContent className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {drawerError && (
            <Alert variant="destructive" onClose={() => setDrawerError(null)}>
              <AlertTitle>Gagal Menugaskan Juri</AlertTitle>
              <AlertDescription>{drawerError}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Pilih Dewan Juri <span className="text-[var(--destructive)]">*</span>
            </label>
            <select
              required
              value={selectedJudgeId}
              onChange={(e) => setSelectedJudgeId(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 h-10 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="">Pilih Juri...</option>
              {judgesList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.full_name} ({j.email}) - Peran: {j.role}
                </option>
              ))}
            </select>
          </div>
        </DrawerContent>

        <DrawerFooter className="flex items-center justify-end gap-2 border-t border-[var(--border)] p-4 bg-[var(--card)]">
          <Button type="button" variant="ghost" size="sm" onClick={() => setAssignDrawerSub(null)}>
            Batal
          </Button>
          <Button type="button" variant="primary" size="sm" isLoading={assigning} onClick={handleAssignSubmit}>
            Tugaskan Sekarang
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* DRAWER INPUT / KOREKSI NILAI RUBRIK FLEKSIBEL */}
      <Drawer
        isOpen={Boolean(scoringDrawerSub)}
        onClose={() => setScoringDrawerSub(null)}
        size="lg"
      >
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[var(--primary)]" />
            <DrawerTitle>
              Matriks Penilaian Rubrik: {scoringDrawerSub?.file_name || 'Karya Peserta'}
            </DrawerTitle>
          </div>
          <DrawerDescription>
            Input nilai langsung berdasarkan kriteria bobot rubrik tanpa birokrasi berbelit.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerContent className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Box Total Nilai Terhitung */}
          <div className="p-4 rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-[var(--foreground)] font-semibold block">Total Skor Terhitung (Bobot)</span>
              <span className="text-[11px] text-[var(--muted-foreground)]">Kalkulasi otomatis: Σ (Skor * Bobot)</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-2xl font-bold text-[var(--primary)]">{currentCalculatedScore}</span>
              <span className="text-xs text-[var(--muted-foreground)] block">/ 100</span>
            </div>
          </div>

          {/* Form Kriteria Rubrik */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Kriteria Bobot Penilaian
            </h4>

            {targetCompCriteria.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)] italic p-4 border border-dashed border-[var(--border)] rounded-xl text-center">
                Belum ada rubrik terdaftar untuk cabang lomba ini.
              </p>
            ) : (
              <div className="space-y-3">
                {targetCompCriteria.map((crit) => {
                  const currentScore = scoreInputs[crit.id] || 0;
                  const weight = Math.round((crit.weight || 0.25) * 100);
                  return (
                    <div
                      key={crit.id}
                      className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-[var(--foreground)]">{crit.name}</strong>
                        <div className="flex items-center gap-2">
                          <Badge variant="primary" size="sm" className="font-mono">
                            Bobot: {weight}%
                          </Badge>
                          <span className="font-mono font-bold text-sm text-[var(--foreground)]">
                            {currentScore} / {crit.max_score}
                          </span>
                        </div>
                      </div>

                      {crit.description && (
                        <p className="text-[11px] text-[var(--muted-foreground)]">{crit.description}</p>
                      )}

                      <div className="pt-1">
                        <input
                          type="range"
                          min="0"
                          max={crit.max_score}
                          value={currentScore}
                          onChange={(e) =>
                            setScoreInputs((prev) => ({
                              ...prev,
                              [crit.id]: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-[var(--primary)] cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                Catatan / Feedback Kualitatif
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan evaluasi atau alasan penetapan skor..."
                value={scoringNotes}
                onChange={(e) => setScoringNotes(e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              />
            </div>
          </div>
        </DrawerContent>

        <DrawerFooter className="flex items-center justify-between border-t border-[var(--border)] p-4 bg-[var(--card)]">
          <Button type="button" variant="outline" size="sm" onClick={() => setScoringDrawerSub(null)}>
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            isLoading={isSubmittingScore}
            onClick={handleDirectScoringSubmit}
          >
            Simpan Nilai Karya
          </Button>
        </DrawerFooter>
      </Drawer>

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

export default function AdminPenilaianPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Memuat data penilaian juri...</div>}>
      <AdminPenilaianContent />
    </Suspense>
  );
}
