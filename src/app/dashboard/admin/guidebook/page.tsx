'use client';

import React, { useState, useMemo, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { PdfViewerModal } from '@/components/guidebook/PdfViewerModal';
import { useAppStore } from '@/lib/store';
import { Guidebook, GuidebookCategory } from '@/lib/types';
import { MOCK_GUIDEBOOKS } from '@/lib/mock-data';
import {
  BookOpen,
  Plus,
  PencilSimple,
  Trash,
  DownloadSimple,
  UploadSimple,
  LinkSimple,
  FilePdf,
  Eye,
  CheckCircle,
  WarningCircle,
  MagnifyingGlass,
  Check,
} from '@phosphor-icons/react';

interface GuidebookFormData {
  title: string;
  category: GuidebookCategory;
  file_url: string;
  file_name: string;
  file_size_bytes: number;
  version: string;
  description: string;
  release_notes: string;
  is_published: boolean;
}

const defaultFormData: GuidebookFormData = {
  title: '',
  category: 'general',
  file_url: '/docs/guidebook-permifest-2026.pdf',
  file_name: 'Guidebook_Permifest_Deforkafest_2026.pdf',
  file_size_bytes: 3500000,
  version: 'v1.0',
  description: '',
  release_notes: '',
  is_published: true,
};

const CATEGORY_MAP: Record<GuidebookCategory, { label: string; badgeBg: string; textColor: string }> = {
  general: { label: 'Panduan Umum', badgeBg: 'bg-[#9B6BF2]/20 border-[#9B6BF2]/40', textColor: 'text-[#9B6BF2]' },
  esai: { label: 'Esai Cyber Security', badgeBg: 'bg-[#FFE359]/20 border-[#FFE359]/40', textColor: 'text-[#FFE359]' },
  uiux: { label: 'UI/UX Design', badgeBg: 'bg-[#F0A6F2]/20 border-[#F0A6F2]/40', textColor: 'text-[#F0A6F2]' },
  it_system_arch: { label: 'IT System Architecture', badgeBg: 'bg-[#6CC4FF]/20 border-[#6CC4FF]/40', textColor: 'text-[#6CC4FF]' },
  pes: { label: 'PES 2026 e-Football', badgeBg: 'bg-[#C4F15A]/20 border-[#C4F15A]/40', textColor: 'text-[#C4F15A]' },
  ml: { label: 'Mobile Legends: Bang Bang', badgeBg: 'bg-[#FF9B70]/20 border-[#FF9B70]/40', textColor: 'text-[#FF9B70]' },
};

export default function AdminGuidebookPage() {
  const store = useAppStore();
  const rawGuidebooks = store?.guidebooks;
  const guidebooks = Array.isArray(rawGuidebooks) ? rawGuidebooks : MOCK_GUIDEBOOKS;
  const { addGuidebook, updateGuidebook, deleteGuidebook, toggleGuidebookPublished } = store;

  const [categoryFilter, setCategoryFilter] = useState<'all' | GuidebookCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<GuidebookFormData>(defaultFormData);
  const [fileInputMode, setFileInputMode] = useState<'upload' | 'link'>('upload');
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<Guidebook | null>(null);
  const [previewGuidebook, setPreviewGuidebook] = useState<Guidebook | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter daftar guidebook
  const filteredGuidebooks = useMemo(() => {
    return guidebooks.filter((g) => {
      const matchCategory = categoryFilter === 'all' || g.category === categoryFilter;
      const matchSearch =
        searchQuery === '' ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [guidebooks, categoryFilter, searchQuery]);

  // Statistik ringkas
  const stats = useMemo(() => {
    return {
      total: guidebooks.length,
      published: guidebooks.filter((g) => g.is_published).length,
      draft: guidebooks.filter((g) => !g.is_published).length,
      categoriesCount: new Set(guidebooks.map((g) => g.category)).size,
    };
  }, [guidebooks]);

  const openCreateDrawer = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setFileInputMode('upload');
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (guidebook: Guidebook) => {
    setEditingId(guidebook.id);
    setFormData({
      title: guidebook.title,
      category: guidebook.category,
      file_url: guidebook.file_url,
      file_name: guidebook.file_name,
      file_size_bytes: guidebook.file_size_bytes || 3000000,
      version: guidebook.version,
      description: guidebook.description,
      release_notes: guidebook.release_notes || '',
      is_published: guidebook.is_published,
    });
    setFileInputMode(guidebook.file_url.startsWith('data:') || guidebook.file_url.startsWith('/') ? 'upload' : 'link');
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setDrawerError('Berkas harus berformat PDF (.pdf)');
      return;
    }

    const maxSizeBytes = 15 * 1024 * 1024; // 15 MB
    if (file.size > maxSizeBytes) {
      setDrawerError('Ukuran berkas melebihi batas maksimal 15 MB');
      return;
    }

    setDrawerError(null);

    // Baca berkas sebagai data URL lokal untuk pratinjau instan
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        file_url: dataUrl,
        file_name: file.name,
        file_size_bytes: file.size,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDrawerError(null);

    if (!formData.title.trim()) {
      setDrawerError('Judul buku panduan wajib diisi');
      return;
    }
    if (!formData.version.trim()) {
      setDrawerError('Nomor versi (misal: v1.0, v2.1) wajib diisi');
      return;
    }
    if (!formData.file_url.trim()) {
      setDrawerError('Berkas PDF atau tautan dokumen wajib disediakan');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateGuidebook(editingId, {
          title: formData.title.trim(),
          category: formData.category,
          file_url: formData.file_url.trim(),
          file_name: formData.file_name.trim() || `${formData.title.replace(/\s+/g, '_')}.pdf`,
          file_size_bytes: formData.file_size_bytes,
          version: formData.version.trim(),
          description: formData.description.trim(),
          release_notes: formData.release_notes.trim(),
          is_published: formData.is_published,
        });
        setAlertSuccess(`Buku panduan "${formData.title}" berhasil diperbarui!`);
      } else {
        await addGuidebook({
          title: formData.title.trim(),
          category: formData.category,
          file_url: formData.file_url.trim(),
          file_name: formData.file_name.trim() || `${formData.title.replace(/\s+/g, '_')}.pdf`,
          file_size_bytes: formData.file_size_bytes,
          version: formData.version.trim(),
          description: formData.description.trim(),
          release_notes: formData.release_notes.trim(),
          is_published: formData.is_published,
        });
        setAlertSuccess(`Buku panduan baru "${formData.title}" berhasil ditambahkan!`);
      }

      setDrawerOpen(false);
      setTimeout(() => setAlertSuccess(null), 4000);
    } catch (err) {
      setDrawerError(err instanceof Error ? err.message : 'Terjadi kegagalan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmTarget) return;
    try {
      await deleteGuidebook(deleteConfirmTarget.id);
      setAlertSuccess(`Guidebook "${deleteConfirmTarget.title}" berhasil dihapus.`);
      setDeleteConfirmTarget(null);
      setTimeout(() => setAlertSuccess(null), 4000);
    } catch {
      setDrawerError('Gagal menghapus buku panduan.');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'PDF';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#9B6BF2]/20 border border-[#9B6BF2]/40 text-[#9B6BF2]">
                <BookOpen size={22} weight="duotone" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-[family-name:var(--font-bricolage)] text-[var(--foreground)] tracking-tight">
                Manajemen Buku Panduan (Guidebook)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-1">
              Kelola dokumen PDF panduan teknis umum dan rulebook per cabang lomba untuk dibaca online atau diunduh peserta.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={openCreateDrawer}
            leftIcon={<Plus size={18} weight="bold" />}
            className="shadow-[3px_3px_0px_#0B0720]"
          >
            Unggah / Tambah Guidebook
          </Button>
        </div>

        {/* ── Feedback Alert ── */}
        {alertSuccess && (
          <Alert variant="default" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300">
            <CheckCircle size={18} className="text-emerald-400" />
            <AlertTitle>Operasi Berhasil</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {/* ── Statistik Ringkas ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Total Guidebook
                </p>
                <p className="text-2xl font-black font-[family-name:var(--font-jetbrains)] text-[var(--foreground)] mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#9B6BF2]/10 border border-[#9B6BF2]/30 flex items-center justify-center text-[#9B6BF2]">
                <FilePdf size={22} weight="duotone" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Diterbitkan (Aktif)
                </p>
                <p className="text-2xl font-black font-[family-name:var(--font-jetbrains)] text-[#C4F15A] mt-1">
                  {stats.published}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#C4F15A]/10 border border-[#C4F15A]/30 flex items-center justify-center text-[#C4F15A]">
                <Check size={22} weight="bold" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Draft / Diarsipkan
                </p>
                <p className="text-2xl font-black font-[family-name:var(--font-jetbrains)] text-[#FFE359] mt-1">
                  {stats.draft}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#FFE359]/10 border border-[#FFE359]/30 flex items-center justify-center text-[#FFE359]">
                <WarningCircle size={22} weight="duotone" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--border)] bg-[var(--card)]">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Cakupan Kategori
                </p>
                <p className="text-2xl font-black font-[family-name:var(--font-jetbrains)] text-[#6CC4FF] mt-1">
                  {stats.categoriesCount} / 6
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#6CC4FF]/10 border border-[#6CC4FF]/30 flex items-center justify-center text-[#6CC4FF]">
                <BookOpen size={22} weight="duotone" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Search & Filter Tabs ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)]">
          {/* Tab Filter Kategori */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] ${
                categoryFilter === 'all'
                  ? 'bg-[#9B6BF2] text-[#0B0720] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              Semua ({guidebooks.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('general')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] ${
                categoryFilter === 'general'
                  ? 'bg-[#9B6BF2] text-[#0B0720] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              Panduan Umum
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('esai')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] ${
                categoryFilter === 'esai'
                  ? 'bg-[#FFE359] text-[#0B0720] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              Esai Cyber Security
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('uiux')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] ${
                categoryFilter === 'uiux'
                  ? 'bg-[#F0A6F2] text-[#0B0720] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              UI/UX
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('it_system_arch')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] ${
                categoryFilter === 'it_system_arch'
                  ? 'bg-[#6CC4FF] text-[#0B0720] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              ITSA
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('pes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] ${
                categoryFilter === 'pes'
                  ? 'bg-[#C4F15A] text-[#0B0720] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              PES 2026
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('ml')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] ${
                categoryFilter === 'ml'
                  ? 'bg-[#FF9B70] text-[#0B0720] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              MLBB
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Cari judul atau versi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:border-[#9B6BF2]"
            />
          </div>
        </div>

        {/* ── Daftar Kartu Guidebook ── */}
        {filteredGuidebooks.length === 0 ? (
          <EmptyState
            title="Tidak ada buku panduan yang cocok"
            description="Coba ubah kata kunci pencarian atau pilih tab kategori lain."
            action={
              <Button variant="primary" size="sm" onClick={openCreateDrawer}>
                Tambah Guidebook Baru
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGuidebooks.map((item) => {
              const meta = CATEGORY_MAP[item.category] || CATEGORY_MAP.general;
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border-2 p-5 bg-[var(--card)] transition-all flex flex-col justify-between ${
                    item.is_published
                      ? 'border-[var(--border)] hover:border-[#9B6BF2]/60 hover:shadow-[4px_4px_0px_#0B0720]'
                      : 'border-[var(--border)]/50 opacity-75 bg-[var(--card)]/60'
                  }`}
                >
                  <div>
                    {/* Header baris atas */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${meta.badgeBg} ${meta.textColor}`}
                        >
                          {meta.label}
                        </span>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#FFE359] text-[#0B0720] shadow-sm -rotate-1 select-none">
                          {item.version}
                        </span>
                      </div>

                      {/* Status Aktif Switcher */}
                      <button
                        type="button"
                        onClick={() => toggleGuidebookPublished(item.id, !item.is_published)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          item.is_published
                            ? 'bg-[#C4F15A]/15 text-[#C4F15A] border-[#C4F15A]/30 hover:bg-[#C4F15A]/25'
                            : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30 hover:bg-zinc-500/25'
                        }`}
                        title="Klik untuk mengubah status publikasi"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_published ? 'bg-[#C4F15A]' : 'bg-zinc-400'}`} />
                        <span>{item.is_published ? 'Diterbitkan' : 'Draft / Arsip'}</span>
                      </button>
                    </div>

                    <h3 className="font-[family-name:var(--font-bricolage)] font-extrabold text-base sm:text-lg text-[var(--foreground)] leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mt-2 line-clamp-2">
                      {item.description}
                    </p>

                    {item.release_notes && (
                      <div className="mt-3 p-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                        <span className="font-bold text-[#FFE359]">Catatan Rilis:</span> {item.release_notes}
                      </div>
                    )}
                  </div>

                  {/* Footer Baris Bawah: Metadata & Actions */}
                  <div className="mt-5 pt-3.5 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--muted-foreground)]">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span>{formatFileSize(item.file_size_bytes)}</span>
                      <span>·</span>
                      <span className="truncate max-w-[150px]" title={item.file_name}>
                        {item.file_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Baca Online (In-Browser Viewer) */}
                      <button
                        type="button"
                        onClick={() => setPreviewGuidebook(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#6CC4FF] bg-[#082436] border border-[#144766] hover:border-[#6CC4FF] transition-all flex items-center gap-1.5 min-h-[36px] cursor-pointer"
                        title="Baca Online di Viewer"
                      >
                        <Eye size={15} weight="bold" />
                        <span>Pratinjau</span>
                      </button>

                      {/* Unduh */}
                      <a
                        href={item.file_url}
                        download={item.file_name}
                        className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] border border-[var(--border)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                        title="Unduh Berkas PDF"
                      >
                        <DownloadSimple size={16} weight="bold" />
                      </a>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditDrawer(item)}
                        className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[#FFE359] hover:bg-[#2a2108] border border-[var(--border)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                        title="Edit Metadata & File"
                      >
                        <PencilSimple size={16} weight="bold" />
                      </button>

                      {/* Hapus */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmTarget(item)}
                        className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[#ff6b76] hover:bg-[#ff6b76]/10 border border-[var(--border)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                        title="Hapus Guidebook"
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Drawer Form Tambah / Edit ── */}
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={editingId ? 'Edit Buku Panduan' : 'Unggah / Tambah Buku Panduan'}
          description="Pastikan berkas PDF memiliki teks yang jelas dan rubrik penilaian mutakhir."
          size="lg"
        >
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
            <DrawerContent className="space-y-4">
              {drawerError && (
                <Alert variant="destructive">
                  <AlertTitle>Kesalahan Formulir</AlertTitle>
                  <AlertDescription>{drawerError}</AlertDescription>
                </Alert>
              )}

                {/* Judul Guidebook */}
                <Input
                  label="Judul Dokumen Guidebook *"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="misal: Buku Panduan Teknis Umum Permifest x Deforkafest 2026"
                  className="bg-[#0B0720] border-[#2E2266]"
                />

                {/* Baris 2: Kategori & Versi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#A99FD1] uppercase tracking-wider mb-1.5">
                      Kategori / Cabang Lomba *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as GuidebookCategory })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-[#0B0720] border border-[#2E2266] text-[#F5F2FF] focus:outline-none focus:border-[#9B6BF2]"
                    >
                      <option value="general">Panduan Umum Perlombaan</option>
                      <option value="esai">Esai Ilmiah: Cyber Security</option>
                      <option value="uiux">UI/UX Design Competition</option>
                      <option value="it_system_arch">IT System Architecture</option>
                      <option value="pes">PES 2026 e-Football</option>
                      <option value="ml">Mobile Legends: Bang Bang</option>
                    </select>
                  </div>

                  <Input
                    label="Nomor Versi Dokumen *"
                    required
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="misal: v2.1"
                    className="bg-[#0B0720] border-[#2E2266]"
                  />
                </div>

                {/* Mode Input File: Upload vs URL */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#A99FD1] uppercase tracking-wider">
                      Sumber Berkas PDF *
                    </label>
                    <div className="flex items-center gap-1 bg-[#0B0720] p-0.5 rounded-lg border border-[#2E2266]">
                      <button
                        type="button"
                        onClick={() => setFileInputMode('upload')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          fileInputMode === 'upload'
                            ? 'bg-[#9B6BF2] text-[#0B0720]'
                            : 'text-[#A99FD1] hover:text-white'
                        }`}
                      >
                        Unggah Berkas PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => setFileInputMode('link')}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          fileInputMode === 'link'
                            ? 'bg-[#9B6BF2] text-[#0B0720]'
                            : 'text-[#A99FD1] hover:text-white'
                        }`}
                      >
                        Tautan URL Dokumen
                      </button>
                    </div>
                  </div>

                  {fileInputMode === 'upload' ? (
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="p-5 border-2 border-dashed border-[#2E2266] hover:border-[#9B6BF2] rounded-2xl bg-[#0B0720] flex flex-col items-center justify-center text-center cursor-pointer transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#9B6BF2]/10 border border-[#9B6BF2]/30 flex items-center justify-center text-[#9B6BF2] mb-2 group-hover:scale-105 transition-transform">
                          <UploadSimple size={24} weight="bold" />
                        </div>
                        <p className="text-xs font-bold text-[#F5F2FF]">
                          Pilih atau seret berkas PDF ke sini
                        </p>
                        <p className="text-[11px] text-[#A99FD1] mt-1">
                          Format: .pdf (Maksimal 15 MB)
                        </p>
                      </div>

                      {formData.file_name && (
                        <div className="p-3 rounded-xl bg-[#0B0720] border border-[#2E2266] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate">
                            <FilePdf size={18} className="text-[#FFE359] shrink-0" weight="fill" />
                            <span className="truncate text-[#F5F2FF] font-mono">{formData.file_name}</span>
                          </div>
                          <span className="text-[#A99FD1] shrink-0 font-mono text-[11px]">
                            {formatFileSize(formData.file_size_bytes)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Input
                        label="Tautan URL Berkas PDF"
                        type="url"
                        value={formData.file_url}
                        onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                        placeholder="https://example.com/guidebook.pdf atau /docs/guidebook.pdf"
                        className="bg-[#0B0720] border-[#2E2266]"
                      />
                      <Input
                        label="Nama File Saat Diunduh"
                        type="text"
                        value={formData.file_name}
                        onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                        placeholder="Guidebook_Permifest_2026.pdf"
                        className="bg-[#0B0720] border-[#2E2266]"
                      />
                    </div>
                  )}
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-xs font-bold text-[#A99FD1] uppercase tracking-wider mb-1.5">
                    Ringkasan Isi Panduan
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ringkasan poin penting mengenai buku panduan ini..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#0B0720] border border-[#2E2266] text-[#F5F2FF] focus:outline-none focus:border-[#9B6BF2]"
                  />
                </div>

                {/* Catatan Rilis */}
                <Input
                  label="Catatan Rilis / Perubahan (Opsional)"
                  value={formData.release_notes}
                  onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
                  placeholder="misal: Pembaruan rubrik penilaian babak final dan penegasan format sitasi"
                  className="bg-[#0B0720] border-[#2E2266]"
                />

                {/* Status Publikasi */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded text-[#9B6BF2] bg-[#0B0720] border-[#2E2266] focus:ring-[#9B6BF2]"
                  />
                  <label htmlFor="is_published" className="text-xs text-[#F5F2FF] select-none cursor-pointer">
                    <strong>Terbitkan langsung ke publik</strong> (dapat dibaca & diunduh oleh peserta)
                  </label>
                </div>
              </DrawerContent>

              {/* Footer Drawer */}
              <DrawerFooter className="p-6 border-t border-[#2E2266] flex flex-row items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDrawerOpen(false)}
                  disabled={submitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="shadow-[3px_3px_0px_#0B0720]"
                >
                  {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambahkan Guidebook'}
                </Button>
              </DrawerFooter>
            </form>
        </Drawer>

        {/* ── Modal Pratinjau PDF Online ── */}
        <PdfViewerModal
          guidebook={previewGuidebook}
          isOpen={Boolean(previewGuidebook)}
          onClose={() => setPreviewGuidebook(null)}
        />

        {/* ── Dialog Konfirmasi Hapus ── */}
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmTarget)}
          onClose={() => setDeleteConfirmTarget(null)}
          onConfirm={handleDelete}
          title="Hapus Buku Panduan?"
          description={`Apakah kamu yakin ingin menghapus "${deleteConfirmTarget?.title}" (${deleteConfirmTarget?.version})? Berkas ini tidak akan dapat diakses lagi oleh peserta.`}
          confirmText="Ya, Hapus Dokumen"
          cancelText="Batal"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
}
