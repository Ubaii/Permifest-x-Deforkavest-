'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateWIB } from '@/lib/utils';
import { getFileDownloadUrl } from '@/lib/supabase/storage-client';
import { 
  ClipboardText, 
  ArrowSquareOut, 
  DownloadSimple, 
  CheckCircle, 
  Lock, 
  Scales, 
  UserCircle,
  EyeSlash,
  ChatCenteredText
} from '@phosphor-icons/react';

export default function JuriPenugasanPage() {
  const { judgeAssignments, rubricCriteria, submitJudgeScore } = useAppStore();

  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [scoresInput, setScoresInput] = useState<Record<string, { score: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState(false);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const activeAssignment = judgeAssignments.find((a) => a.id === activeAssignmentId);
  const activeCompId = activeAssignment?.submission?.registration?.competition_id;
  const activeRubrics = rubricCriteria.filter((r) => r.competition_id === activeCompId);

  // Periksa apakah nilai sudah dikunci
  const isLocked = activeAssignment?.scores?.some((s) => s.is_locked);

  const openScoringModal = (assignmentId: string) => {
    setActiveAssignmentId(assignmentId);
    setModalError(null);
    const assign = judgeAssignments.find((a) => a.id === assignmentId);
    
    // Pre-populate nilai yang tersimpan sebelumnya
    const initial: Record<string, { score: number; comment: string }> = {};
    if (assign?.scores) {
      assign.scores.forEach((s) => {
        initial[s.rubric_criteria_id] = { score: s.score, comment: s.comment || '' };
      });
    }
    setScoresInput(initial);
  };

  const handleScoreChange = (critId: string, val: number) => {
    if (isLocked) return;
    const clamped = Math.min(100, Math.max(0, isNaN(val) ? 0 : val));
    setScoresInput((prev) => ({
      ...prev,
      [critId]: { ...prev[critId], score: clamped },
    }));
  };

  const handleCommentChange = (critId: string, text: string) => {
    if (isLocked) return;
    setScoresInput((prev) => ({
      ...prev,
      [critId]: { ...prev[critId], comment: text },
    }));
  };

  // Kalkulasi skor terbobot otomatis
  const totalWeighted = activeRubrics.reduce((acc, crit) => {
    const s = scoresInput[crit.id]?.score || 0;
    return acc + (s * crit.weight);
  }, 0);

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentId || isLocked) return;

    setSubmitting(true);
    setModalError(null);
    try {
      const payload = activeRubrics.map((crit) => ({
        criteriaId: crit.id,
        score: scoresInput[crit.id]?.score || 0,
        comment: scoresInput[crit.id]?.comment || '',
      }));

      await submitJudgeScore(activeAssignmentId, payload);
      setActiveAssignmentId(null);
      setSuccessBanner('Penilaian dewan juri berhasil disimpan dan dihitung otomatis!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan nilai';
      setModalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadSubmission = async (assignmentId: string, rawPath: string) => {
    if (!rawPath) return;
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      window.open(rawPath, '_blank', 'noopener,noreferrer');
      return;
    }
    setDownloadingFileId(assignmentId);
    try {
      const res = await getFileDownloadUrl('submissions', rawPath, { expiresInSeconds: 1800, isDownload: true });
      if (res.success && res.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      } else {
        alert(res.error || 'Gagal mengunduh berkas karya.');
      }
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <DashboardLayout 
      title="Lembar Penilaian Karya Dewan Juri" 
      subtitle="Evaluasi karya peserta sesuai rubrik kriteria dan persentase bobot yang ditentukan panitia."
    >
      <div className="space-y-6">
        
        {successBanner && (
          <Alert variant="success" onClose={() => setSuccessBanner(null)}>
            <AlertTitle>Penilaian Tersimpan</AlertTitle>
            <AlertDescription>{successBanner}</AlertDescription>
          </Alert>
        )}
        
        {judgeAssignments.length === 0 ? (
          <EmptyState
            icon={<ClipboardText size={28} weight="duotone" className="text-primary" />}
            title="Belum Ada Penugasan Karya"
            description="Panitia belum menugaskan berkas karya untuk Anda nilai. Penugasan akan muncul setelah tenggat pengumpulan peserta ditutup."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {judgeAssignments.map((assignment) => {
              const sub = assignment.submission;
              const reg = sub?.registration;
              const comp = reg?.competition;
              const isCompleted = assignment.status === 'completed';
              const locked = assignment.scores?.some((s) => s.is_locked);

              return (
                <Card key={assignment.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge 
                            status={isCompleted ? 'completed' : 'assigned'} 
                            customLabel={isCompleted ? 'Penilaian Selesai' : 'Perlu Dinilai'} 
                          />
                          <Badge variant="primary">{comp?.name}</Badge>
                          {locked && (
                            <Badge variant="neutral" className="gap-1">
                              <Lock size={12} weight="bold" />
                              Nilai Terkunci
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground font-[family-name:var(--font-bricolage)]">
                          {sub?.file_name || (sub?.link_url ? 'Tautan Desain Figma Peserta' : 'Karya Peserta')}
                        </h3>
                        
                        {/* Detail Pengirim (Mendukung Blind Review) */}
                        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                          <span className="flex items-center gap-1">
                            <UserCircle size={15} className="text-primary" />
                            Peserta: <strong className="text-foreground">{reg?.user?.full_name || 'Peserta Terdaftar'}</strong>
                          </span>
                          <span>•</span>
                          <span>Instansi: <strong className="text-foreground">{reg?.user?.institution || '-'}</strong></span>
                          <span>•</span>
                          <span>Versi: <strong className="text-primary font-mono">v{sub?.version}</strong></span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Tombol Akses Berkas / Figma */}
                        {sub?.link_url ? (
                          <a href={sub.link_url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" leftIcon={<ArrowSquareOut size={16} />}>
                              Buka Figma
                            </Button>
                          </a>
                        ) : sub?.file_url ? (
                          <Button
                            size="sm"
                            variant="outline"
                            leftIcon={<DownloadSimple size={16} />}
                            isLoading={downloadingFileId === assignment.id}
                            onClick={() => handleDownloadSubmission(assignment.id, sub.file_url || '')}
                          >
                            Unduh File
                          </Button>
                        ) : null}

                        <Button
                          size="sm"
                          variant={isCompleted ? 'secondary' : 'primary'}
                          leftIcon={<Scales size={16} weight="bold" />}
                          onClick={() => openScoringModal(assignment.id)}
                        >
                          {locked ? 'Lihat Lembar Nilai' : isCompleted ? 'Edit / Cek Nilai' : 'Mulai Menilai'}
                        </Button>
                      </div>
                    </div>

                    {/* Catatan Pengantar Peserta */}
                    {sub?.notes && (
                      <div className="mt-4 p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
                        <span className="text-[10px] uppercase font-mono text-primary font-bold block mb-1">
                          Catatan dari Peserta:
                        </span>
                        &quot;{sub.notes}&quot;
                      </div>
                    )}

                    {/* Ringkasan Skor Terhitung */}
                    {isCompleted && assignment.scores && (
                      <div className="mt-4 pt-3.5 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Skor Akhir Terbobot (Otomatis):</span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold font-mono text-foreground tabular-nums">
                            {sub?.final_score || Math.round(totalWeighted * 10) / 10}
                          </span>
                          <span className="text-muted-foreground font-mono">/ 100</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal Rubrik Penilaian Dewan Juri */}
      <Modal
        isOpen={Boolean(activeAssignmentId)}
        onClose={() => setActiveAssignmentId(null)}
        title="Formulir Penilaian Rubrik Juri"
        description="Masukkan skor angka (0-100) dan masukan kualitatif untuk setiap kriteria penilaian."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveScore} className="space-y-4">
          
          {modalError && (
            <Alert variant="destructive" onClose={() => setModalError(null)}>
              <AlertTitle>Gagal Menyimpan</AlertTitle>
              <AlertDescription>{modalError}</AlertDescription>
            </Alert>
          )}
          
          {/* Header Ringkasan Karya */}
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-mono">Karya Dinilai:</span>
              <strong className="text-foreground truncate block max-w-sm">
                {activeAssignment?.submission?.file_name || activeAssignment?.submission?.link_url}
              </strong>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-muted-foreground block text-[10px] uppercase font-mono">Total Terbobot:</span>
              <span className="text-xl font-bold font-mono text-primary tabular-nums">
                {Math.round(totalWeighted * 10) / 10} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
              </span>
            </div>
          </div>

          {/* Banner Peringatan Jika Nilai Dikunci Panitia */}
          {isLocked && (
            <div className="p-3 rounded-xl bg-muted border border-border text-xs text-muted-foreground flex items-center gap-2">
              <Lock size={16} className="text-primary shrink-0" />
              <span>Nilai untuk karya ini telah <strong>dikunci oleh panitia</strong>. Mode tampilan hanya-baca (*read-only*).</span>
            </div>
          )}

          {/* Daftar Kriteria Rubrik */}
          <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
            {activeRubrics.map((crit) => {
              const currentScore = scoresInput[crit.id]?.score ?? 0;
              const currentComment = scoresInput[crit.id]?.comment ?? '';

              return (
                <div key={crit.id} className="p-4 rounded-xl bg-card border border-border space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground">{crit.name}</h4>
                        <Badge variant="primary" size="sm">Bobot: {crit.weight * 100}%</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{crit.description}</p>
                    </div>

                    <div className="w-24 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        required
                        disabled={isLocked}
                        className="text-right font-mono font-bold text-foreground"
                        placeholder="0-100"
                        value={currentScore}
                        onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      disabled={isLocked}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary disabled:opacity-60"
                      placeholder="Catatan atau masukan untuk kriteria ini (opsional)..."
                      value={currentComment}
                      onChange={(e) => handleCommentChange(crit.id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs">
            <span className="text-foreground font-semibold">Total Nilai Akhir Terhitung:</span>
            <span className="text-xl font-bold font-mono text-primary tabular-nums">
              {Math.round(totalWeighted * 10) / 10}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setActiveAssignmentId(null)}>
              Tutup
            </Button>
            {!isLocked && (
              <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
                Simpan &amp; Kirim Penilaian
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
