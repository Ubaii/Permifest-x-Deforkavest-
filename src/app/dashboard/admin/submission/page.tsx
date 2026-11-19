'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { 
  FileCheck2, 
  UserPlus, 
  Download, 
  ExternalLink, 
  Scale, 
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function AdminSubmissionPage() {
  const { submissions, availableUsers, judgeAssignments, assignJudge } = useAppStore();

  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  const judgesList = availableUsers.filter(u => u.role === 'juri' || u.role === 'panitia' || u.role === 'super_admin');

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubId || !selectedJudgeId) return;

    setAssigning(true);
    try {
      await assignJudge(activeSubId, selectedJudgeId);
      setActiveSubId(null);
      setSelectedJudgeId('');
      alert('Karya berhasil ditugaskan ke dewan juri!');
    } catch (err: any) {
      alert(err.message || 'Gagal menugaskan juri');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <DashboardLayout 
      title="Manajemen Submission & Penugasan Juri" 
      subtitle="Distribusikan karya peserta akademik kepada dewan juri dan pantau progres evaluasi."
    >
      <div className="space-y-6">
        
        <div className="space-y-4">
          {submissions.map((sub) => {
            const comp = sub.registration?.competition;
            const assignments = judgeAssignments.filter(a => a.submission_id === sub.id);

            return (
              <Card key={sub.id} className="overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="cyber">{comp?.name}</Badge>
                        <Badge variant="info">Versi v{sub.version}</Badge>
                      </div>
                      <h4 className="text-base font-bold text-slate-100">
                        {sub.file_name || (sub.link_url ? 'Link Desain Figma' : 'Dokumen Peserta')}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Peserta: <strong className="text-slate-200">{sub.registration?.user?.full_name}</strong>
                        {' '}({sub.registration?.user?.institution}) • Diunggah: {formatDateShort(sub.submitted_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {sub.link_url ? (
                        <a href={sub.link_url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                            Buka Figma
                          </Button>
                        </a>
                      ) : sub.file_url ? (
                        <a href={sub.file_url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                            Unduh File
                          </Button>
                        </a>
                      ) : null}

                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<UserPlus className="w-4 h-4" />}
                        onClick={() => setActiveSubId(sub.id)}
                      >
                        Tugaskan Juri
                      </Button>
                    </div>
                  </div>

                  {/* List of assigned judges for this work */}
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Juri Yang Ditugaskan ({assignments.length}):
                    </span>

                    {assignments.length === 0 ? (
                      <span className="text-xs text-amber-400/90 italic">
                        Belum ada juri yang ditugaskan untuk karya ini.
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {assignments.map((assign) => (
                          <div 
                            key={assign.id}
                            className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-xs"
                          >
                            <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                              {assign.judge?.full_name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-200 block">{assign.judge?.full_name}</span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                {assign.status === 'completed' ? (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Nilai Selesai ({sub.final_score})
                                  </span>
                                ) : (
                                  <span className="text-amber-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Sedang Menilai
                                  </span>
                                )}
                              </span>
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

      </div>

      {/* Assign Judge Modal */}
      <Modal
        isOpen={!!activeSubId}
        onClose={() => setActiveSubId(null)}
        title="Tugaskan Dewan Juri"
        description="Pilih penilai berkualifikasi untuk mengevaluasi karya ini."
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Pilih Juri Penilai <span className="text-cyan-400">*</span>
            </label>
            <select
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              value={selectedJudgeId}
              onChange={(e) => setSelectedJudgeId(e.target.value)}
            >
              <option value="">Pilih salah satu juri...</option>
              {judgesList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.full_name} ({j.institution || 'Juri Spesialis'})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300">
            Setelah ditugaskan, karya akan otomatis muncul di lembar penugasan dashboard juri yang bersangkutan.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setActiveSubId(null)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={assigning}>
              Konfirmasi Penugasan
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
