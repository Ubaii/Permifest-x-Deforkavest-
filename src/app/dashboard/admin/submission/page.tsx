'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { 
  FileText, 
  UserPlus, 
  DownloadSimple, 
  ArrowSquareOut, 
  Lock, 
  Users,
  CheckCircle,
  Clock
} from '@phosphor-icons/react';

export default function AdminSubmissionPage() {
  const { submissions, availableUsers, judgeAssignments, assignJudge } = useAppStore();

  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [lockedSubmissions, setLockedSubmissions] = useState<Record<string, boolean>>({});

  const judgesList = availableUsers.filter((u) => u.role === 'juri' || u.role === 'panitia' || u.role === 'super_admin');

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubId || !selectedJudgeId) return;

    setAssigning(true);
    try {
      await assignJudge(activeSubId, selectedJudgeId);
      setActiveSubId(null);
      setSelectedJudgeId('');
      alert('Karya peserta berhasil ditugaskan ke dewan juri!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menugaskan juri';
      alert(message);
    } finally {
      setAssigning(false);
    }
  };

  const handleToggleLockScore = (subId: string) => {
    const isCurrentlyLocked = lockedSubmissions[subId];
    if (confirm(`Konfirmasi untuk ${isCurrentlyLocked ? 'MEMBUKA KUNCI' : 'MENGUNCI'} nilai karya ini? Setelah dikunci, dewan juri tidak dapat mengubah nilai lagi.`)) {
      setLockedSubmissions((prev) => ({
        ...prev,
        [subId]: !isCurrentlyLocked,
      }));
      alert(`Nilai karya berhasil ${isCurrentlyLocked ? 'dibuka kembali' : 'dikunci dan disahkan'}!`);
    }
  };

  return (
    <DashboardLayout 
      title="Manajemen Submission & Penugasan Juri" 
      subtitle="Distribusikan karya peserta akademik kepada dewan juri, pantau progres evaluasi, dan kunci nilai akhir."
    >
      <div className="space-y-6">
        
        {submissions.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} weight="duotone" className="text-primary" />}
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
                <Card key={sub.id} className="overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="primary">{comp?.name}</Badge>
                          <Badge variant="neutral" size="sm">Versi v{sub.version}</Badge>
                          {isLocked && (
                            <Badge variant="neutral" size="sm" className="gap-1">
                              <Lock size={12} weight="bold" />
                              Nilai Terkunci
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-foreground font-[family-name:var(--font-bricolage)]">
                          {sub.file_name || (sub.link_url ? 'Tautan Desain Figma Peserta' : 'Dokumen Peserta')}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Peserta: <strong className="text-foreground">{sub.registration?.user?.full_name}</strong>
                          {' '}({sub.registration?.user?.institution || '-'}) • Diunggah: <span className="font-mono">{formatDateShort(sub.submitted_at)}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {sub.link_url ? (
                          <a href={sub.link_url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" leftIcon={<ArrowSquareOut size={16} />}>
                              Buka Figma
                            </Button>
                          </a>
                        ) : sub.file_url ? (
                          <a href={sub.file_url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline" leftIcon={<DownloadSimple size={16} />}>
                              Unduh File
                            </Button>
                          </a>
                        ) : null}

                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<UserPlus size={16} weight="bold" />}
                          onClick={() => setActiveSubId(sub.id)}
                        >
                          Tugaskan Juri
                        </Button>

                        <Button
                          size="sm"
                          variant={isLocked ? 'outline' : 'primary'}
                          leftIcon={<Lock size={16} weight="bold" />}
                          onClick={() => handleToggleLockScore(sub.id)}
                        >
                          {isLocked ? 'Buka Kunci Nilai' : 'Kunci Nilai'}
                        </Button>
                      </div>
                    </div>

                    {/* Matriks Juri yang Ditugaskan */}
                    <div className="mt-4 pt-3.5 border-t border-border">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2 font-mono">
                        Dewan Juri yang Ditugaskan ({assignments.length}):
                      </span>

                      {assignments.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">
                          Belum ada juri yang ditugaskan untuk karya ini. Klik &quot;Tugaskan Juri&quot; di atas.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {assignments.map((assign) => (
                            <div key={assign.id} className="p-3 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
                              <div>
                                <span className="font-semibold text-foreground block">
                                  {assign.judge?.full_name || 'Dewan Juri'}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  Status: {assign.status === 'completed' ? 'Selesai Dinilai' : 'Sedang Menilai'}
                                </span>
                              </div>
                              <StatusBadge
                                status={assign.status === 'completed' ? 'completed' : 'assigned'}
                                customLabel={assign.status === 'completed' ? 'Selesai' : 'Ditugaskan'}
                              />
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
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Pilih Dewan Juri <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={selectedJudgeId}
              onChange={(e) => setSelectedJudgeId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            >
              <option value="">Pilih Juri...</option>
              {judgesList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.full_name} ({j.email}) - Peran: {j.role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setActiveSubId(null)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={assigning}>
              Tugaskan Sekarang
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
