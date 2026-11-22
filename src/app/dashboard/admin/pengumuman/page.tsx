'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { Announcement } from '@/lib/types';
import { Megaphone, Plus, PencilSimple, Trash, Calendar, User } from '@phosphor-icons/react';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>(defaultFormData);
  const [deleteConfirmAnn, setDeleteConfirmAnn] = useState<Announcement | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openCreateDrawer = () => {
    setEditingAnnId(null);
    setFormData(defaultFormData);
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setFormData({
      title: ann.title,
      excerpt: ann.excerpt || '',
      content: ann.content,
      competition_id: ann.competition_id || '',
    });
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setDrawerError(null);
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

      setDrawerOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan pengumuman';
      setDrawerError(message);
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
      subtitle="Publikasikan dan kelola siaran informasi umum atau berita per cabang perlombaan melalui drawer editor."
      actions={
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" weight="bold" />} onClick={openCreateDrawer}>
          Buat Pengumuman Baru
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
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-semibold">Filter Pengumuman:</span>
            <select
              value={filterComp}
              onChange={(e) => setFilterComp(e.target.value)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 h-9 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="all">Semua Pengumuman ({announcements.length})</option>
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
            icon={<Megaphone className="w-8 h-8 text-[var(--primary)]" weight="duotone" />}
            title="Belum Ada Pengumuman"
            description="Tidak ada pengumuman yang sesuai dengan filter. Klik tombol di atas untuk membuat siaran baru."
            action={
              <Button size="sm" variant="primary" onClick={openCreateDrawer}>
                Buat Pengumuman
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((ann) => (
              <Card key={ann.id} className="p-4 sm:p-5 border-[var(--border)] bg-[var(--card)] shadow-2xs hover:border-[var(--primary)]/40 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={ann.competition_name ? 'primary' : 'neutral'} size="sm">
                        {ann.competition_name || 'Pengumuman Umum'}
                      </Badge>
                      <span className="text-[11px] text-[var(--muted-foreground)] font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateShort(ann.published_at)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--foreground)] font-[family-name:var(--font-bricolage)]">
                      {ann.title}
                    </h3>

                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                      {ann.excerpt || ann.content}
                    </p>

                    <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5 pt-1">
                      <User className="w-3.5 h-3.5" />
                      <span>Dipublikasikan oleh:</span>
                      <strong className="text-[var(--foreground)]">{ann.author_name}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDrawer(ann)}
                      className="h-8 w-8 p-0 text-[var(--foreground)] hover:bg-[var(--accent)]"
                      title="Edit Pengumuman"
                      aria-label="Edit Pengumuman"
                    >
                      <PencilSimple className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirmAnn(ann)}
                      className="h-8 w-8 p-0 text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                      title="Hapus Pengumuman"
                      aria-label="Hapus Pengumuman"
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

      {/* DRAWER CRUD PENGUMUMAN DENGAN LIVE PREVIEW */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="lg"
      >
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[var(--primary)]" />
            <DrawerTitle>
              {editingAnnId ? 'Edit Siaran Pengumuman' : 'Buat Pengumuman Baru'}
            </DrawerTitle>
          </div>
          <DrawerDescription>
            Publikasikan pengumuman penting, jadwal teknikal meeting, atau edaran resmi untuk peserta.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerContent className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {drawerError && (
            <Alert variant="destructive" onClose={() => setDrawerError(null)}>
              <AlertTitle>Validasi Gagal</AlertTitle>
              <AlertDescription>{drawerError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} id="announcement-form" className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Target Sasaran Pengumuman
              </label>
              <select
                value={formData.competition_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, competition_id: e.target.value }))}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 h-10 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Semua Cabang (Pengumuman Global)</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    Khusus Cabang: {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Judul Pengumuman *"
              placeholder="Contoh: Jadwal Technical Meeting & Pembagian Grup PES"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            />

            <Input
              label="Ringkasan / Excerpt Singkat"
              placeholder="Ringkasan 1-2 kalimat untuk preview di beranda..."
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
            />

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Isi Pengumuman Lengkap *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Tulis isi pengumuman secara detail (mendukung paragraf dan poin-poin)..."
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              />
            </div>

            {/* Live Preview Card */}
            {formData.title && (
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block mb-1.5">
                  Pratinjau Tampilan Pengumuman:
                </span>
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs space-y-2">
                  <Badge variant="primary" size="sm">
                    {formData.competition_id
                      ? competitions.find((c) => c.id === formData.competition_id)?.name
                      : 'Pengumuman Umum'}
                  </Badge>
                  <h4 className="font-bold text-sm text-[var(--foreground)]">{formData.title}</h4>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {formData.excerpt || formData.content || 'Isi pengumuman...'}
                  </p>
                </div>
              </div>
            )}
          </form>
        </DrawerContent>

        <DrawerFooter className="flex items-center justify-end gap-2 border-t border-[var(--border)] p-4 bg-[var(--card)]">
          <Button type="button" variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
            Batal
          </Button>
          <Button type="submit" form="announcement-form" variant="primary" size="sm" isLoading={submitting}>
            {editingAnnId ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
          </Button>
        </DrawerFooter>
      </Drawer>

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
