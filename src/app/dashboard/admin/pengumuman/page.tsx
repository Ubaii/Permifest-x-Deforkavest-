'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { Announcement } from '@/lib/types';
import { Megaphone, Plus, PencilSimple, Trash } from '@phosphor-icons/react';

interface AnnouncementFormData {
  title: string;
  excerpt: string;
  content: string;
  competition_id: string;
}

const defaultFormData: AnnouncementFormData = {
  title: '',
  excerpt: '',
  content: '',
  competition_id: '',
};

export default function AdminPengumumanPage() {
  const { announcements, competitions, createAnnouncement, updateAnnouncement, deleteAnnouncement, currentUser } = useAppStore();

  const [filterComp, setFilterComp] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>(defaultFormData);
  const [deleteConfirmAnn, setDeleteConfirmAnn] = useState<Announcement | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingAnnId(null);
    setFormData(defaultFormData);
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setFormData({
      title: ann.title,
      excerpt: ann.excerpt || '',
      content: ann.content,
      competition_id: ann.competition_id || '',
    });
    setModalError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      const comp = competitions.find((c) => c.id === formData.competition_id);

      if (editingAnnId) {
        await updateAnnouncement(editingAnnId, {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          competition_id: formData.competition_id ? formData.competition_id : null,
          competition_name: comp?.name,
        });
        setAlertSuccess(`Pengumuman "${formData.title}" berhasil diperbarui!`);
      } else {
        await createAnnouncement({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          competition_id: formData.competition_id ? formData.competition_id : null,
          competition_name: comp?.name,
          is_published: true,
          author_name: currentUser.full_name,
        });
        setAlertSuccess(`Pengumuman "${formData.title}" berhasil diterbitkan!`);
      }

      setModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan pengumuman';
      setModalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmAnn) return;
    await deleteAnnouncement(deleteConfirmAnn.id);
    setAlertSuccess(`Pengumuman "${deleteConfirmAnn.title}" telah dihapus.`);
    setDeleteConfirmAnn(null);
  };

  const filteredAnnouncements = announcements.filter((ann) => {
    if (filterComp === 'all') return true;
    if (filterComp === 'global') return !ann.competition_id;
    return ann.competition_id === filterComp;
  });

  return (
    <DashboardLayout
      title="Manajemen Pengumuman Resmi"
      subtitle="Publikasikan dan kelola siaran informasi umum atau berita per cabang perlombaan."
      actions={
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" weight="bold" />} onClick={openCreateModal}>
          + Buat Pengumuman Baru
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

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-semibold">Filter Pengumuman:</span>
            <select
              value={filterComp}
              onChange={(e) => setFilterComp(e.target.value)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">Semua Pengumuman</option>
              <option value="global">Khusus Pengumuman Umum</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-[var(--muted-foreground)] font-mono">
            Total: <strong className="text-[var(--foreground)]">{filteredAnnouncements.length}</strong> rilis
          </span>
        </div>

        {filteredAnnouncements.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="w-7 h-7 text-[var(--primary)]" weight="duotone" />}
            title="Belum Ada Pengumuman"
            description="Tidak ada pengumuman yang sesuai dengan filter. Klik tombol di atas untuk membuat siaran baru."
            action={
              <Button size="sm" variant="primary" onClick={openCreateModal}>
                Buat Pengumuman
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((ann) => (
              <Card key={ann.id} className="p-5 border-[var(--border)] bg-[var(--card)]">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={ann.competition_name ? 'primary' : 'neutral'}>
                        {ann.competition_name || 'Pengumuman Umum'}
                      </Badge>
                      <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                        {formatDateShort(ann.published_at)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--foreground)] font-[family-name:var(--font-bricolage)]">
                      {ann.title}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {ann.excerpt || ann.content}
                    </p>
                    <div className="text-xs text-[var(--muted-foreground)] pt-1 font-mono">
                      Oleh: <strong className="text-[var(--foreground)]">{ann.author_name}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<PencilSimple className="w-3.5 h-3.5" />}
                      onClick={() => openEditModal(ann)}
                      className="text-xs"
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirmAnn(ann)}
                      className="text-xs text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)] p-2 min-h-0 min-w-0"
                      title="Hapus Pengumuman"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal CRUD Pengumuman (Create & Edit) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAnnId ? 'Ubah Pengumuman Resmi' : 'Buat Pengumuman Resmi Baru'}
        description="Pengumuman ini akan langsung tampil di portal publik dan dashboard peserta terkait."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <Alert variant="destructive" onClose={() => setModalError(null)}>
              <AlertTitle>Validasi Gagal</AlertTitle>
              <AlertDescription>{modalError}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Target Cabang Lomba
            </label>
            <select
              value={formData.competition_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, competition_id: e.target.value }))}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[44px]"
            >
              <option value="">Pengumuman Global (Seluruh Cabang &amp; Publik)</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Judul Pengumuman *"
            placeholder="Contoh: Perpanjangan Batas Waktu Pengumpulan Karya Babak Penyisihan"
            required
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          />

          <Input
            label="Ringkasan Singkat (Excerpt) *"
            placeholder="Ringkasan 1-2 kalimat yang tampil di kartu pengumuman..."
            required
            value={formData.excerpt}
            onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
          />

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Isi Konten Lengkap <span className="text-[var(--destructive-text)]">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Tuliskan isi pengumuman, ketentuan teknis, atau jadwal yang diperbarui secara lengkap..."
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              {editingAnnId ? 'Simpan Perubahan' : 'Publikasikan Sekarang'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Hapus Pengumuman */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmAnn)}
        onClose={() => setDeleteConfirmAnn(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Pengumuman Ini?"
        description={`Anda akan menghapus pengumuman "${deleteConfirmAnn?.title}". Siaran ini tidak akan lagi tampil di portal peserta.`}
        confirmText="Hapus Pengumuman"
        variant="destructive"
      />
    </DashboardLayout>
  );
}
