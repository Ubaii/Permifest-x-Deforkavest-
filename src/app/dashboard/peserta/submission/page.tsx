'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { formatDateShort, formatDateWIB } from '@/lib/utils';
import { 
  CloudArrowUp as UploadCloud, 
  FileText, 
  Link as LinkIcon, 
  CheckCircle as CheckCircle2, 
  Clock, 
  ArrowSquareOut as ExternalLink,
  ClockCounterClockwise as History,
  WarningCircle as AlertCircle
} from '@phosphor-icons/react';

export default function PesertaSubmissionPage() {
  const { currentUser, registrations, submissions, submitWork } = useAppStore();

  // Academic competitions only require submissions
  const myAcademicRegistrations = registrations.filter(
    r => r.user_id === currentUser.id && r.competition?.submission_config.allowedTypes.length
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [activeRegId, setActiveRegId] = useState<string | null>(null);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [figmaLink, setFigmaLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedReg = registrations.find(r => r.id === activeRegId);
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
      subtitle="Kumpulkan dokumen karya atau tautan Figma sesuai ketentuan cabang lomba."
    >
      <div className="space-y-6">
        
        {myAcademicRegistrations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-slate-400 text-xs">
              Tidak ada kompetisi akademik aktif yang memerlukan pengumpulan karya pada akun Anda.
            </CardContent>
          </Card>
        ) : (
          myAcademicRegistrations.map((reg) => {
            const comp = reg.competition;
            const currentSubmissions = submissions.filter(s => s.registration_id === reg.id);
            const latestSub = currentSubmissions.find(s => s.is_latest);

            return (
              <Card key={reg.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{comp?.name}</CardTitle>
                      <Badge variant="cyber">{comp?.category.toUpperCase()}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Tema: {comp?.theme}</p>
                  </div>

                  <Badge variant={reg.status === 'verified' ? 'success' : 'warning'}>
                    Pembayaran: {reg.status}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Stages List */}
                  <div className="space-y-4">
                    {comp?.stages.map((stage) => {
                      const stageSub = currentSubmissions.find(s => s.stage_id === stage.id && s.is_latest);

                      return (
                        <div key={stage.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-100">Tahap: {stage.name}</h4>
                                {stage.is_active ? (
                                  <Badge variant="success" size="sm">Batas Aktif</Badge>
                                ) : (
                                  <Badge variant="neutral" size="sm">Belum Dibuka</Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Deadline: {formatDateWIB(stage.submission_close_at)}</span>
                              </div>
                            </div>

                            <div>
                              <Button
                                size="sm"
                                variant="primary"
                                leftIcon={<UploadCloud className="w-4 h-4" />}
                                onClick={() => openSubmitModal(reg.id, stage.id)}
                              >
                                {stageSub ? `Unggah Versi Baru (v${stageSub.version + 1})` : 'Kumpul Karya'}
                              </Button>
                            </div>
                          </div>

                          {/* Existing submission display */}
                          {stageSub ? (
                            <div className="p-3.5 rounded-lg bg-slate-900 border border-cyan-500/30 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                                  {stageSub.link_url ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                  <span>
                                    {stageSub.link_url ? 'Tautan Figma Diserahkan' : stageSub.file_name}
                                  </span>
                                  <Badge variant="info" size="sm">v{stageSub.version}</Badge>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {formatDateWIB(stageSub.submitted_at)}
                                </span>
                              </div>

                              {stageSub.link_url && (
                                <a
                                  href={stageSub.link_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-cyan-400 hover:underline flex items-center gap-1 break-all"
                                >
                                  <span>{stageSub.link_url}</span>
                                  <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                              )}

                              {stageSub.notes && (
                                <p className="text-xs text-slate-400 italic">
                                  Catatan peserta: &quot;{stageSub.notes}&quot;
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-900/40 border border-slate-800">
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

      {/* Submission Modal Form */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Formulir Penyerahan Karya"
        description="Pastikan karya mematuhi batasan format dan norma etika orisinalitas."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isFigmaRequired ? (
            <Input
              label="Tautan Berkas Figma (Public Can View)"
              type="url"
              required
              placeholder="https://www.figma.com/design/..."
              value={figmaLink}
              onChange={(e) => setFigmaLink(e.target.value)}
              helperText="Pastikan akses link telah disetel ke 'Anyone with the link can view'."
            />
          ) : (
            <>
              <Input
                label="Nama Berkas Karya (DOCX / PDF)"
                placeholder="Contoh: Esai_CyberDefense_AhmadFauzi.pdf"
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Catatan Pengantar untuk Dewan Juri (Opsional)
            </label>
            <textarea
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="Jelaskan ringkasan pendekatan inovatif atau diagram sistem yang dilampirkan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300">
            Karya Anda dapat diperbarui kembali kapan saja sebelum deadline tahap ditutup.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Kirim Karya
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
