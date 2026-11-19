'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { 
  ClipboardText as ClipboardCheck, 
  FileText, 
  ArrowSquareOut as ExternalLink, 
  DownloadSimple as Download, 
  CheckCircle as CheckCircle2, 
  Lock, 
  Scales as Scale, 
  ChatCenteredText as MessageSquare,
  Sparkle as Sparkles
} from '@phosphor-icons/react';

export default function JuriPenugasanPage() {
  const { judgeAssignments, rubricCriteria, submitJudgeScore } = useAppStore();

  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [scoresInput, setScoresInput] = useState<Record<string, { score: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  const activeAssignment = judgeAssignments.find(a => a.id === activeAssignmentId);
  const activeCompId = activeAssignment?.submission?.registration?.competition_id;
  const activeRubrics = rubricCriteria.filter(r => r.competition_id === activeCompId);

  const openScoringModal = (assignmentId: string) => {
    setActiveAssignmentId(assignmentId);
    const assign = judgeAssignments.find(a => a.id === assignmentId);
    
    // Pre-populate if already scored
    const initial: Record<string, { score: number; comment: string }> = {};
    if (assign?.scores) {
      assign.scores.forEach(s => {
        initial[s.rubric_criteria_id] = { score: s.score, comment: s.comment || '' };
      });
    }
    setScoresInput(initial);
  };

  const handleScoreChange = (critId: string, val: number) => {
    const clamped = Math.min(100, Math.max(0, isNaN(val) ? 0 : val));
    setScoresInput(prev => ({
      ...prev,
      [critId]: { ...prev[critId], score: clamped }
    }));
  };

  const handleCommentChange = (critId: string, text: string) => {
    setScoresInput(prev => ({
      ...prev,
      [critId]: { ...prev[critId], comment: text }
    }));
  };

  // Calculate live weighted score
  const totalWeighted = activeRubrics.reduce((acc, crit) => {
    const s = scoresInput[crit.id]?.score || 0;
    return acc + (s * crit.weight);
  }, 0);

  const handleSaveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignmentId) return;

    setSubmitting(true);
    try {
      const payload = activeRubrics.map(crit => ({
        criteriaId: crit.id,
        score: scoresInput[crit.id]?.score || 0,
        comment: scoresInput[crit.id]?.comment || '',
      }));

      await submitJudgeScore(activeAssignmentId, payload);
      setActiveAssignmentId(null);
      alert('Penilaian berhasil disimpan dan dihitung otomatis!');
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan nilai');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Lembar Penugasan Karya Dewan Juri" 
      subtitle="Evaluasi karya peserta sesuai rubrik kriteria dan bobot yang ditetapkan panitia."
    >
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 gap-4">
          {judgeAssignments.map((assignment) => {
            const sub = assignment.submission;
            const reg = sub?.registration;
            const comp = reg?.competition;
            const isCompleted = assignment.status === 'completed';

            return (
              <Card key={assignment.id} className="overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant={isCompleted ? 'success' : 'warning'}>
                          {isCompleted ? 'Selesai Dinilai' : 'Menunggu Penilaian'}
                        </Badge>
                        <Badge variant="cyber">{comp?.name}</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100">
                        {sub?.file_name || (sub?.link_url ? 'Figma Design Submission' : 'Karya Peserta')}
                      </h3>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span>Peserta: <strong className="text-slate-300">{reg?.user?.full_name}</strong> ({reg?.user?.institution})</span>
                        <span>•</span>
                        <span>Versi: <strong className="text-cyan-400">v{sub?.version}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* View submission file or link */}
                      {sub?.link_url ? (
                        <a href={sub.link_url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                            Buka Figma
                          </Button>
                        </a>
                      ) : sub?.file_url ? (
                        <a href={sub.file_url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                            Unduh Dokumen
                          </Button>
                        </a>
                      ) : null}

                      <Button
                        size="sm"
                        variant={isCompleted ? 'secondary' : 'primary'}
                        leftIcon={<Scale className="w-3.5 h-3.5" />}
                        onClick={() => openScoringModal(assignment.id)}
                      >
                        {isCompleted ? 'Edit / Periksa Nilai' : 'Beri Nilai Rubrik'}
                      </Button>
                    </div>
                  </div>

                  {sub?.notes && (
                    <div className="mt-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <span className="text-[10px] uppercase font-mono text-cyan-400 block mb-0.5">Catatan Peserta:</span>
                      &quot;{sub.notes}&quot;
                    </div>
                  )}

                  {/* Summary of score if completed */}
                  {isCompleted && assignment.scores && (
                    <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Nilai Akhir Terhitung (Terbobot):</span>
                      <span className="text-base font-bold font-mono text-cyan-400">
                        {sub?.final_score || 0} / 100
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

      </div>

      {/* Scoring Modal with Rubric */}
      <Modal
        isOpen={!!activeAssignmentId}
        onClose={() => setActiveAssignmentId(null)}
        title="Formulir Penilaian Rubrik Juri"
        description="Masukkan skor angka (0-100) dan catatan masukan untuk setiap kriteria."
        maxWidth="xl"
      >
        <form onSubmit={handleSaveScore} className="space-y-5">
          
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-500 block text-[10px]">Karya Peserta:</span>
              <strong className="text-slate-200">
                {activeAssignment?.submission?.file_name || activeAssignment?.submission?.link_url}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">Nilai Berbobot Sementara:</span>
              <span className="text-lg font-bold font-mono text-cyan-400">
                {Math.round(totalWeighted * 10) / 10} / 100
              </span>
            </div>
          </div>

          {/* Rubric Criteria List */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {activeRubrics.map((crit) => {
              const currentScore = scoresInput[crit.id]?.score ?? 0;
              const currentComment = scoresInput[crit.id]?.comment ?? '';

              return (
                <div key={crit.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-100">{crit.name}</h4>
                        <Badge variant="info" size="sm">Bobot: {crit.weight * 100}%</Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{crit.description}</p>
                    </div>

                    <div className="w-24 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        required
                        className="text-right font-mono font-bold text-cyan-400"
                        placeholder="0-100"
                        value={currentScore}
                        onChange={(e) => handleScoreChange(crit.id, parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                      placeholder="Komentar kriteria ini (opsional)..."
                      value={currentComment}
                      onChange={(e) => handleCommentChange(crit.id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">Total Nilai Akhir (Weighted):</span>
            <span className="text-xl font-bold font-mono text-cyan-300">
              {Math.round(totalWeighted * 10) / 10}
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setActiveAssignmentId(null)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Kirim & Simpan Nilai
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
