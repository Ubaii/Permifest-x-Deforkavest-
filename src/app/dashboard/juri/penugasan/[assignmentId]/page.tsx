'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { getFileDownloadUrl } from '@/lib/supabase/storage-client';
import {
  ArrowLeft,
  FileText,
  ArrowSquareOut,
  DownloadSimple,
  CheckCircle,
  Scales,
  Lock,
  ChatCenteredText,
  Clock,
  Buildings,
} from '@phosphor-icons/react';

export default function JuriAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params?.assignmentId as string;

  const { judgeAssignments, rubricCriteria, submitJudgeScore } = useAppStore();

  const assignment = judgeAssignments.find((a) => a.id === assignmentId);
  const sub = assignment?.submission;
  const reg = sub?.registration;
  const comp = reg?.competition;

  const activeRubrics = rubricCriteria.filter((r) => r.competition_id === comp?.id);
  const isLocked = assignment?.scores?.some((s) => s.is_locked);

  const [scoresInput, setScoresInput] = useState<Record<string, { score: number; comment: string }>>(() => {
    const initial: Record<string, { score: number; comment: string }> = {};
    if (assignment?.scores) {
      assignment.scores.forEach((s) => {
        initial[s.rubric_criteria_id] = { score: s.score, comment: s.comment || '' };
      });
    }
    return initial;
  });

  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (!assignment) {
    return (
      <DashboardLayout
        title="Lembar Penilaian Karya"
        subtitle="Evaluasi karya peserta sesuai rubrik kriteria dan persentase bobot."
      >
        <EmptyState
          icon={<Scales size={32} className="text-primary" weight="duotone" />}
          title="Penugasan Tidak Ditemukan"
          description="Data penugasan penilaian karya dengan ID tersebut tidak ditemukan dalam daftar tugas Anda."
          action={
            <Link href="/dashboard/juri/penugasan">
              <Button variant="primary" leftIcon={<ArrowLeft size={16} />}>
                Kembali ke Daftar Karya
              </Button>
            </Link>
          }
        />
      </DashboardLayout>
    );
  }

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

  // Kalkulasi nilai terbobot otomatis
  const totalWeighted = activeRubrics.reduce((acc, crit) => {
    const s = scoresInput[crit.id]?.score || 0;
    return acc + s * crit.weight;
  }, 0);

  const handleDownloadFile = async () => {
    if (!sub?.file_url) return;
    if (sub.file_url.startsWith('http://') || sub.file_url.startsWith('https://')) {
      window.open(sub.file_url, '_blank', 'noopener,noreferrer');
      return;
    }
    setDownloading(true);
    try {
      const res = await getFileDownloadUrl('submissions', sub.file_url, {
        expiresInSeconds: 1800,
        isDownload: true,
      });
      if (res.success && res.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      } else {
        alert(res.error || 'Gagal mengunduh berkas karya.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = activeRubrics.map((crit) => ({
        criteriaId: crit.id,
        score: scoresInput[crit.id]?.score || 0,
        comment: scoresInput[crit.id]?.comment || '',
      }));

      await submitJudgeScore(assignment.id, payload);
      setSuccessBanner('Penilaian dewan juri berhasil disimpan dan dihitung otomatis!');
      setTimeout(() => {
        router.push('/dashboard/juri/penugasan');
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan nilai';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title={`Penilaian: ${comp?.name || 'Karya Peserta'}`}
      subtitle="Evaluasi dokumen karya berdasarkan rubrik kriteria resmi dengan kalkulasi skor terbobot otomatis."
    >
      <div className="space-y-6">
        <Link
          href="/dashboard/juri/penugasan"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors font-medium"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Daftar Penugasan</span>
        </Link>

        {successBanner && (
          <Alert variant="success" onClose={() => setSuccessBanner(null)}>
            <AlertTitle>Nilai Berhasil Disimpan</AlertTitle>
            <AlertDescription>{successBanner}</AlertDescription>
          </Alert>
        )}

        {formError && (
          <Alert variant="destructive" onClose={() => setFormError(null)}>
            <AlertTitle>Gagal Menyimpan</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {isLocked && (
          <Alert variant="info" icon={<Lock className="w-5 h-5 text-[var(--primary)]" weight="bold" />}>
            <AlertTitle>Penilaian Telah Dikunci oleh Panitia</AlertTitle>
            <AlertDescription>
              Tahapan penjurian untuk cabang lomba ini telah berakhir dan nilai telah dikunci (*freeze*). Form saat ini dalam mode baca saja (*read-only*).
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Informasi Karya Peserta & Dokumen Viewer (5 Kolom) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader className="pb-3 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <Badge variant="primary">{comp?.category?.toUpperCase() || 'LOMBA'}</Badge>
                  <span className="font-mono text-xs text-[var(--primary)] font-bold">
                    Versi v{sub?.version || 1}
                  </span>
                </div>
                <CardTitle className="text-base mt-2">
                  {sub?.file_name || (sub?.link_url ? 'Tautan Prototipe Figma' : 'Dokumen Karya')}
                </CardTitle>
                <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-2 mt-1">
                  <Buildings size={14} />
                  <span>{reg?.user?.institution || 'Instansi Peserta'}</span>
                  <span>•</span>
                  <span>{reg?.user?.full_name}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {sub?.notes && (
                  <div className="p-3.5 rounded-xl bg-[var(--accent)]/30 border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                    <span className="text-[10px] uppercase font-mono text-[var(--primary)] font-bold block mb-1">
                      Catatan Pengantar dari Peserta:
                    </span>
                    &quot;{sub.notes}&quot;
                  </div>
                )}

                {/* Akses Dokumen Fisik / Figma */}
                <div className="space-y-3 pt-2">
                  {sub?.link_url ? (
                    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--muted-foreground)] font-semibold">Tautan Proyek Figma</span>
                        <Badge variant="success">Figma Viewable</Badge>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[var(--accent)]/20 font-mono text-[11px] text-[var(--primary)] break-all select-all">
                        {sub.link_url}
                      </div>
                      <a href={sub.link_url} target="_blank" rel="noreferrer" className="block">
                        <Button size="sm" variant="primary" className="w-full gap-2">
                          <span>Buka Prototipe di Tab Baru</span>
                          <ArrowSquareOut size={16} />
                        </Button>
                      </a>
                    </div>
                  ) : sub?.file_url ? (
                    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                          <FileText size={24} />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-xs text-[var(--foreground)] truncate">
                            {sub.file_name || 'berkas_karya.pdf'}
                          </div>
                          <span className="text-[11px] text-[var(--muted-foreground)]">Format Dokumen Digital</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2 text-xs"
                        isLoading={downloading}
                        onClick={handleDownloadFile}
                      >
                        <DownloadSimple size={16} />
                        <span>Unduh / Buka Dokumen Karya (Secure URL)</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-[var(--border)] rounded-xl text-xs text-[var(--muted-foreground)]">
                      Tidak ada lampiran berkas fisik pada submission ini.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Lembar Input Rubrik Kriteria Penilaian (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-[var(--border)] bg-[var(--card)]">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Scales size={18} className="text-[var(--primary)]" />
                    <span>Lembar Rubrik Penilaian Dewan Juri</span>
                  </CardTitle>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Rentang skor 0 - 100 per kriteria. Nilai akhir dihitung terbobot otomatis.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[var(--muted-foreground)] block">Skor Terbobot:</span>
                  <div className="flex items-center gap-1 font-mono">
                    <span className="text-xl font-bold text-[var(--foreground)]">
                      {Math.round(totalWeighted * 10) / 10}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">/ 100</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleSubmitScore} className="space-y-5">
                  {activeRubrics.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-xl">
                      Panitia belum mengatur rubrik penilaian untuk cabang lomba ini.
                    </div>
                  ) : (
                    activeRubrics.map((crit, idx) => {
                      const currentScore = scoresInput[crit.id]?.score ?? 0;
                      const currentComment = scoresInput[crit.id]?.comment ?? '';

                      return (
                        <div
                          key={crit.id}
                          className="p-4 rounded-xl border border-[var(--border)] bg-[var(--accent)]/15 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-[10px] font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <h4 className="text-xs font-bold text-[var(--foreground)]">{crit.name}</h4>
                              </div>
                              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 ml-7">
                                {crit.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-7 sm:ml-0">
                              <Badge variant="primary" size="sm">
                                Bobot {Math.round(crit.weight * 100)}%
                              </Badge>
                              <div className="flex items-center gap-1 bg-[var(--card)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
                                <span className="text-[11px] text-[var(--muted-foreground)]">Skor:</span>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  disabled={isLocked || submitting}
                                  value={currentScore === 0 ? '' : currentScore}
                                  placeholder="0"
                                  onChange={(e) => handleScoreChange(crit.id, Number(e.target.value))}
                                  className="w-12 text-center font-mono font-bold text-xs text-[var(--foreground)] bg-transparent focus:outline-none"
                                />
                                <span className="text-[10px] text-[var(--muted-foreground)] font-mono">/ 100</span>
                              </div>
                            </div>
                          </div>

                          {/* Kolom Catatan / Feedback Juri */}
                          <div className="pt-2 border-t border-[var(--border)]/50">
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)] mb-1">
                              <ChatCenteredText size={14} />
                              <span>Catatan / Masukan Konstruktif (Opsional):</span>
                            </div>
                            <textarea
                              rows={2}
                              disabled={isLocked || submitting}
                              value={currentComment}
                              onChange={(e) => handleCommentChange(crit.id, e.target.value)}
                              placeholder="Komentar terkait ketajaman analisis, arsitektur, atau orisinalitas..."
                              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg p-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none disabled:opacity-60"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}

                  {!isLocked && (
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border)]">
                      <Link href="/dashboard/juri/penugasan">
                        <Button type="button" variant="ghost" size="sm">
                          Batal
                        </Button>
                      </Link>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={submitting}
                        leftIcon={<CheckCircle size={16} weight="bold" />}
                      >
                        Simpan Penilaian
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
