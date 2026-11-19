'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Competition, CompetitionCategory, CompetitionType, ParticipationType } from '@/lib/types';
import {
  Stack,
  Plus,
  PencilSimple,
  Trash,
  Check,
  Eye,
  EyeSlash,
  Users,
  CalendarBlank,
} from '@phosphor-icons/react';

interface CompetitionFormData {
  name: string;
  slug: string;
  type: CompetitionType;
  category: CompetitionCategory;
  participation_type: ParticipationType;
  min_team_size: number;
  max_team_size: number;
  description: string;
  theme: string;
  registration_fee: number;
  quota?: number;
  allowed_types: string;
  registration_open_at: string;
  registration_close_at: string;
  is_published: boolean;
}

const defaultFormData: CompetitionFormData = {
  name: '',
  slug: '',
  type: 'academic',
  category: 'esai',
  participation_type: 'individual',
  min_team_size: 1,
  max_team_size: 1,
  description: '',
  theme: '',
  registration_fee: 50000,
  quota: 50,
  allowed_types: '.pdf',
  registration_open_at: '2026-04-01T00:00:00.000Z',
  registration_close_at: '2026-05-15T23:59:59.000Z',
  is_published: true,
};

export default function AdminKompetisiPage() {
  const { competitions, addCompetition, updateCompetition, deleteCompetition } = useAppStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompetitionFormData>(defaultFormData);
  const [deleteConfirmComp, setDeleteConfirmComp] = useState<Competition | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingCompId(null);
    setFormData(defaultFormData);
    setModalOpen(true);
  };

  const openEditModal = (comp: Competition) => {
    setEditingCompId(comp.id);
    setFormData({
      name: comp.name,
      slug: comp.slug,
      type: comp.type,
      category: comp.category,
      participation_type: comp.participation_type,
      min_team_size: comp.min_team_size,
      max_team_size: comp.max_team_size,
      description: comp.description,
      theme: comp.theme,
      registration_fee: comp.registration_fee,
      quota: comp.quota,
      allowed_types: comp.submission_config?.allowedTypes?.join(', ') || '',
      registration_open_at: comp.registration_open_at,
      registration_close_at: comp.registration_close_at,
      is_published: comp.is_published,
    });
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCompId ? prev.slug : slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const allowedTypesArray = formData.allowed_types
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      if (editingCompId) {
        await updateCompetition(editingCompId, {
          name: formData.name,
          slug: formData.slug,
          type: formData.type,
          category: formData.category,
          participation_type: formData.participation_type,
          min_team_size: Number(formData.min_team_size),
          max_team_size: Number(formData.max_team_size),
          description: formData.description,
          theme: formData.theme,
          registration_fee: Number(formData.registration_fee),
          quota: formData.quota ? Number(formData.quota) : undefined,
          is_published: formData.is_published,
          registration_open_at: formData.registration_open_at,
          registration_close_at: formData.registration_close_at,
          submission_config: {
            allowedTypes: allowedTypesArray,
          },
        });
        setAlertSuccess(`Kompetisi "${formData.name}" berhasil diperbarui!`);
      } else {
        await addCompetition({
          name: formData.name,
          slug: formData.slug || `comp-${Date.now()}`,
          type: formData.type,
          category: formData.category,
          participation_type: formData.participation_type,
          min_team_size: Number(formData.min_team_size),
          max_team_size: Number(formData.max_team_size),
          description: formData.description,
          theme: formData.theme,
          registration_fee: Number(formData.registration_fee),
          quota: formData.quota ? Number(formData.quota) : undefined,
          requires_identity_verification: true,
          is_published: formData.is_published,
          registration_open_at: formData.registration_open_at,
          registration_close_at: formData.registration_close_at,
          form_fields: [
            { id: 'full_name', label: 'Nama Lengkap', type: 'text', required: true },
            { id: 'institution', label: 'Asal Instansi / Kampus', type: 'text', required: true },
          ],
          submission_config: {
            allowedTypes: allowedTypesArray,
          },
          stages: [
            {
              id: `stage-${Date.now()}-1`,
              competition_id: `comp-${Date.now()}`,
              name: 'Penyisihan',
              slug: 'penyisihan',
              stage_order: 1,
              submission_open_at: formData.registration_open_at,
              submission_close_at: formData.registration_close_at,
              is_active: true,
            },
          ],
        });
        setAlertSuccess(`Kompetisi baru "${formData.name}" berhasil ditambahkan!`);
      }

      setModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmComp) return;
    await deleteCompetition(deleteConfirmComp.id);
    setAlertSuccess(`Kompetisi "${deleteConfirmComp.name}" telah dihapus.`);
    setDeleteConfirmComp(null);
  };

  const handleTogglePublish = async (comp: Competition) => {
    await updateCompetition(comp.id, { is_published: !comp.is_published });
    setAlertSuccess(`Status publikasi "${comp.name}" diubah menjadi ${!comp.is_published ? 'Aktif (Published)' : 'Draft (Unpublished)'}.`);
  };

  return (
    <DashboardLayout
      title="Manajemen Kompetisi & Cabang Lomba"
      subtitle="Kelola parameter lomba, biaya pendaftaran, kuota peserta, dan ketentuan berkas secara dinamis."
      actions={
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" weight="bold" />}
          onClick={openCreateModal}
        >
          + Tambah Lomba Baru
        </Button>
      }
    >
      <div className="space-y-6">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Operasi Berhasil</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {competitions.length === 0 ? (
          <EmptyState
            icon={<Stack className="w-8 h-8 text-[var(--primary)]" weight="duotone" />}
            title="Belum Ada Cabang Lomba"
            description="Belum ada kompetisi yang dibuat. Silakan tambahkan kompetisi baru menggunakan tombol di atas."
            action={
              <Button size="sm" variant="primary" onClick={openCreateModal}>
                Tambah Kompetisi
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {competitions.map((comp) => {
              return (
                <Card key={comp.id} className="overflow-hidden border-[var(--border)] bg-[var(--card)] transition-colors">
                  <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] shrink-0">
                        <Stack className="w-5 h-5" weight="bold" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base font-bold text-[var(--foreground)]">{comp.name}</CardTitle>
                          <Badge variant={comp.type === 'academic' ? 'primary' : 'neutral'} size="sm">
                            {comp.type === 'academic' ? 'Akademik' : 'E-Sport'}
                          </Badge>
                          <Badge variant="primary" size="sm">
                            {comp.category.toUpperCase()}
                          </Badge>
                          {comp.is_published ? (
                            <Badge variant="success" size="sm">
                              Aktif Publik
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              Draft
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          Tema: <strong className="text-[var(--foreground)]">{comp.theme || '-'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePublish(comp)}
                        className="text-xs gap-1"
                        title={comp.is_published ? 'Jadikan Draft' : 'Publikasikan'}
                      >
                        {comp.is_published ? (
                          <>
                            <EyeSlash className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                            <span className="hidden sm:inline">Unpublish</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-[var(--primary)]" />
                            <span className="hidden sm:inline">Publish</span>
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<PencilSimple className="w-3.5 h-3.5" weight="bold" />}
                        onClick={() => openEditModal(comp)}
                        className="text-xs"
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteConfirmComp(comp)}
                        className="text-xs text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)] p-2 min-h-0 min-w-0"
                        title="Hapus Kompetisi"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-4">
                    {/* Parameter Kunci */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-[var(--radius-md)] bg-[var(--accent)]/30 border border-[var(--border)] text-xs">
                      <div>
                        <span className="text-[var(--muted-foreground)] block text-[11px]">Biaya Pendaftaran:</span>
                        <span className="text-[var(--primary)] font-bold font-mono text-sm tabular-nums">
                          {formatCurrency(comp.registration_fee)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--muted-foreground)] block text-[11px]">Kuota / Terdaftar:</span>
                        <span className="text-[var(--foreground)] font-mono font-medium">
                          {comp.registered_count} / {comp.quota ? `${comp.quota} Slot` : '∞'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--muted-foreground)] block text-[11px]">Bentuk Partisipasi:</span>
                        <span className="text-[var(--foreground)] font-medium capitalize">
                          {comp.participation_type} ({comp.min_team_size}-{comp.max_team_size} org)
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--muted-foreground)] block text-[11px]">Format Unggahan:</span>
                        <span className="text-[var(--foreground)] font-mono text-[11px] truncate block" title={comp.submission_config?.allowedTypes?.join(', ')}>
                          {comp.submission_config?.allowedTypes?.length
                            ? comp.submission_config.allowedTypes.join(', ')
                            : 'Pertandingan Langsung'}
                        </span>
                      </div>
                    </div>

                    {/* Tahapan Babak */}
                    {comp.stages && comp.stages.length > 0 && (
                      <div>
                        <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-2 font-mono">
                          Jadwal Tahapan Kompetisi:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {comp.stages.map((st) => (
                            <div
                              key={st.id}
                              className="p-3 rounded-[var(--radius-md)] bg-[var(--card)] border border-[var(--border)] flex items-center justify-between text-xs"
                            >
                              <div className="space-y-0.5">
                                <span className="font-bold text-[var(--foreground)] block">{st.name}</span>
                                <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                                  Deadline: {formatDateShort(st.submission_close_at)}
                                </span>
                              </div>
                              <Badge variant={st.is_active ? 'success' : 'neutral'} size="sm">
                                {st.is_active ? 'Tahap Berjalan' : 'Belum Dibuka'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal CRUD Kompetisi (Create & Edit) */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCompId ? 'Ubah Konfigurasi Kompetisi' : 'Tambah Cabang Kompetisi Baru'}
          description="Sesuaikan parameter pendaftaran, kategori lomba, biaya, dan ketentuan file."
          maxWidth="2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Cabang Lomba *"
                placeholder="Contoh: UI/UX Design Competition"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />

              <Input
                label="Slug URL *"
                placeholder="ui-ux-design"
                required
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                helperText="Identifier unik URL rute publik"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Tipe Lomba *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as CompetitionType }))}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
                >
                  <option value="academic">Akademik (Karya & Juri)</option>
                  <option value="non_academic">Non-Akademik (E-Sport)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Kategori *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as CompetitionCategory }))}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
                >
                  <option value="esai">Esai Ilmiah</option>
                  <option value="uiux">UI/UX Design</option>
                  <option value="architecture">IT Architecture</option>
                  <option value="pes">eFootball PES</option>
                  <option value="ml">Mobile Legends</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Partisipasi *
                </label>
                <select
                  value={formData.participation_type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, participation_type: e.target.value as ParticipationType }))}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
                >
                  <option value="individual">Individu (Solo)</option>
                  <option value="team">Kelompok (Tim)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Biaya Pendaftaran (IDR) *"
                type="number"
                min="0"
                step="5000"
                required
                value={formData.registration_fee}
                onChange={(e) => setFormData((prev) => ({ ...prev, registration_fee: Number(e.target.value) }))}
              />

              <Input
                label="Kuota Slot Maksimal"
                type="number"
                min="1"
                placeholder="Kosongkan jika unlimited"
                value={formData.quota || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, quota: e.target.value ? Number(e.target.value) : undefined }))}
              />

              <Input
                label="Format Berkas (pisahkan koma)"
                placeholder=".pdf, .docx, figma_url"
                value={formData.allowed_types}
                onChange={(e) => setFormData((prev) => ({ ...prev, allowed_types: e.target.value }))}
                helperText="Contoh: .pdf, figma_url"
              />
            </div>

            <Input
              label="Tema Kompetisi *"
              placeholder="Contoh: Empowering Smart Nation with AI Security"
              required
              value={formData.theme}
              onChange={(e) => setFormData((prev) => ({ ...prev, theme: e.target.value }))}
            />

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Deskripsi Singkat Lomba
              </label>
              <textarea
                rows={3}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                placeholder="Penjelasan latar belakang dan tujuan cabang perlombaan..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_published_chk"
                checked={formData.is_published}
                onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              <label htmlFor="is_published_chk" className="text-xs text-[var(--foreground)] font-medium cursor-pointer">
                Publikasikan ke halaman web peserta (Live &amp; Open)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                {editingCompId ? 'Simpan Perubahan' : 'Buat Kompetisi'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Dialog Konfirmasi Hapus Kompetisi */}
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmComp)}
          onClose={() => setDeleteConfirmComp(null)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Kompetisi Ini?"
          description={`Anda akan menghapus cabang lomba "${deleteConfirmComp?.name}". Data pendaftaran dan submission terkait pada cabang ini akan terpengaruh.`}
          confirmText="Hapus Permanen"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
}
