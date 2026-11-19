'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateWIB } from '@/lib/utils';
import { 
  UploadSimple, 
  FileText, 
  Link as LinkIcon, 
  Clock, 
  ArrowSquareOut,
  Sparkle,
  Info
} from '@phosphor-icons/react';

export default function PesertaSubmissionPage() {
  const { currentUser, registrations, submissions, submitWork } = useAppStore();

  // Hanya kompetisi akademik yang memerlukan pengumpulan berkas/karya
  const myAcademicRegistrations = registrations.filter(
    (r) => r.user_id === currentUser.id && r.competition?.submission_config.allowedTypes.length
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [figmaLink, setFigmaLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedReg = registrations.find((r) => r.id === activeRegId);
  const isFigmaRequired = selectedReg?.competition?.submission_config.allowedTypes.includes('figma_url');

  const openSubmitModal = (regId: string, stageId: string) => {
    setActiveRegId(regId);
    setActiveStageId(stageId);
    setFileName('');
    setFileUrl('');
    setFigmaLink('');
    setNotes('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRegId || !activeStageId) return;

    setSubmitting(true);
    try {
      await submitWork(activeRegId, activeStageId, {
        fileName: isFigmaRequired ? undefined : (fileName || 'karya_permifest.pdf'),
        fileUrl: isFigmaRequired ? undefined : (fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
        linkUrl: isFigmaRequired ? figmaLink : undefined,
        notes: notes,
      });

      setModalOpen(false);
      alert('Karya Anda berhasil dikumpulkan! Anda dapat memperbarui berkas sebelum deadline berakhir.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirimkan karya';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Pengumpulan Karya (Submission)" 
      subtitle="Kumpulkan dokumen proposal, berkas karya, atau tautan Figma sesuai ketentuan cabang lomba."
    >
      <div className="space-y-6">
        
        {myAcademicRegistrations.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} weight="duotone" className="text-primary" />}
            title="Tidak Ada Kompetisi Berbasis Karya"
            description="Anda belum mendaftar di cabang lomba akademik (Esai, UI/UX, IT Architecture). Lomba e-sport (PES & Mobile Legends) tidak memerlukan pengumpulan berkas."
          />
        ) : (
          myAcademicRegistrations.map((reg) => {
            const comp = reg.competition;
            const currentSubmissions = submissions.filter((s) => s.registration_id === reg.id);

            return (
              <Card key={reg.id} className="overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{comp?.name}</CardTitle>
                      <Badge variant="primary">{comp?.category.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Tema: <strong className="text-foreground">{comp?.theme}</strong></p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">Status Bayar:</span>
                    <StatusBadge status={reg.payment?.status || reg.status} domain="payment" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-2">
                  {/* Tahapan Lomba (Penyisihan / Final) */}
                  <div className="space-y-3">
                    {comp?.stages.map((stage) => {
                      const stageSub = currentSubmissions.find((s) => s.stage_id === stage.id && s.is_latest);

                      return (
                        <div key={stage.id} className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-foreground">Tahap: {stage.name}</h4>
                                {stage.is_active ? (
                                  <Badge variant="success" size="sm">Tahap Berjalan</Badge>
                                ) : (
                                  <Badge variant="neutral" size="sm">Belum Dibuka</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-mono">
                                <Clock size={14} className="text-primary" />
                                <span>Batas Pengumpulan: {formatDateWIB(stage.submission_close_at)}</span>
                              </div>
                            </div>

                            <div>
                              <Button
                                size="sm"
                                variant="primary"
                                leftIcon={<UploadSimple size={16} weight="bold" />}
                                onClick={() => openSubmitModal(reg.id, stage.id)}
                              >
                                {stageSub ? `Unggah Versi Baru (v${stageSub.version + 1})` : 'Kumpul Karya'}
                              </Button>
                            </div>
                          </div>

                          {/* Detail Berkas Terakhir yang Diserahkan */}
                          {stageSub ? (
                            <div className="p-3.5 rounded-xl bg-card border border-primary/30 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                  {stageSub.link_url ? <LinkIcon size={16} className="text-primary" /> : <FileText size={16} className="text-primary" />}
                                  <span>
                                    {stageSub.link_url ? 'Tautan Desain Figma' : stageSub.file_name}
                                  </span>
                                  <Badge variant="primary" size="sm">v{stageSub.version}</Badge>
                                </div>
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  Diunggah: {formatDateWIB(stageSub.submitted_at)}
                                </span>
                              </div>

                              {stageSub.link_url && (
                                <a
                                  href={stageSub.link_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1 break-all font-mono"
                                >
                                  <span>{stageSub.link_url}</span>
                                  <ArrowSquareOut size={14} className="shrink-0" />
                                </a>
                              )}

                              {stageSub.notes && (
                                <p className="text-xs text-muted-foreground italic">
                                  Catatan pengantar: &quot;{stageSub.notes}&quot;
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-muted-foreground italic p-3 rounded-lg bg-card/60 border border-border">
                              Belum ada berkas karya yang dikumpulkan untuk tahap ini.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

      </div>

      {/* Modal Form Submission */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Formulir Penyerahan Karya"
        description="Pastikan karya mematuhi batasan format, ukuran berkas, dan kaidah orisinalitas."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isFigmaRequired ? (
            <Input
              label="Tautan Berkas Figma (Public Viewable)"
              type="url"
              required
              placeholder="https://www.figma.com/design/..."
              value={figmaLink}
              onChange={(e) => setFigmaLink(e.target.value)}
              helperText="Pastikan akses proyek Figma disetel ke 'Anyone with the link can view'."
            />
          ) : (
            <>
              <Input
                label="Nama Berkas Dokumen (DOCX / PDF)"
                placeholder="Contoh: Esai_CyberSecurity_NamaPeserta.pdf"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
              <Input
                label="URL Penyimpanan Berkas (Cloud Storage / Drive)"
                placeholder="https://... (atau biarkan default untuk demo)"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                helperText="Ukuran maksimal 15-25 MB. Server memvalidasi tanda tangan berkas secara otomatis."
              />
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Catatan Pengantar untuk Dewan Juri (Opsional)
            </label>
            <textarea
              rows={3}
              className="w-full bg-card border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              placeholder="Jelaskan ringkasan pendekatan metodologi atau lampiran diagram sistem..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-muted-foreground flex items-start gap-2">
            <Info size={16} className="text-primary shrink-0 mt-0.5" />
            <p>
              Peserta dapat mengunggah ulang versi terbaru kapan saja sebelum batas waktu penutupan. Versi terakhir yang akan dinilai juri.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Kirim Karya
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
