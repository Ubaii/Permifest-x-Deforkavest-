'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Competition, CompetitionCategory, CompetitionType, ParticipationType } from '@/lib/types';
import {
  Stack,
  Plus,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  ListNumbers,
  QrCode,
  Users,
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
  payment_qr_url?: string;
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
  payment_qr_url: '',
  registration_open_at: '2026-04-01T00:00:00.000Z',
  registration_close_at: '2026-05-15T23:59:59.000Z',
  is_published: true,
};

export default function AdminKompetisiPage() {
  const { competitions, addCompetition, updateCompetition, deleteCompetition } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'non_academic'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompetitionFormData>(defaultFormData);
  const [modalTab, setModalTab] = useState<'info' | 'biaya' | 'berkas'>('info');
  const [deleteConfirmComp, setDeleteConfirmComp] = useState<Competition | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCompetitions = competitions.filter((c) => {
    if (activeTab === 'all') return true;
    return c.type === activeTab;
  });

  const openCreateModal = () => {
    setEditingCompId(null);
    setFormData(defaultFormData);
    setModalTab('info');
    setFormError(null);
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
      payment_qr_url: comp.payment_qr_url || '',
      registration_open_at: comp.registration_open_at,
      registration_close_at: comp.registration_close_at,
      is_published: comp.is_published,
    });
    setModalTab('info');
    setFormError(null);
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

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('File QRIS harus berupa gambar (.png, .jpg, .jpeg, .webp)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        payment_qr_url: reader.result as string,
      }));
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Nama cabang lomba wajib diisi.');
      setModalTab('info');
      return;
    }

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
          payment_qr_url: formData.payment_qr_url || undefined,
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
          payment_qr_url: formData.payment_qr_url || undefined,
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
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data';
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmComp) return;
    await deleteCompetition(deleteConfirmComp.id);
    setAlertSuccess(`Kompetisi "${deleteConfirmComp.name}" telah berhasil dihapus.`);
    setDeleteConfirmComp(null);
  };

  const handleTogglePublish = async (comp: Competition) => {
    await updateCompetition(comp.id, { is_published: !comp.is_published });
    setAlertSuccess(
      `Status publikasi "${comp.name}" diubah menjadi ${!comp.is_published ? 'Aktif (Published)' : 'Draft (Unpublished)'
      }.`
    );
  };

  const columns: Column<Competition & Record<string, unknown>>[] = [
    {
      key: 'name',
      header: 'Cabang Lomba & Tema',
      sortable: true,
      cell: (comp) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[var(--radius-md)] bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
            <Stack className="w-5 h-5" weight="bold" />
          </div>
          <div>
            <div className="font-bold text-[var(--foreground)] text-sm">{comp.name}</div>
            <div className="text-[11px] text-[var(--muted-foreground)] truncate max-w-xs" title={comp.theme}>
              Tema: <strong className="text-[var(--foreground)]">{comp.theme || '-'}</strong>
            </div>
            <span className="font-mono text-[10px] text-[var(--muted-foreground)]">/{comp.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Kategori & Bentuk',
      sortable: true,
      accessor: (comp) => comp.category,
      cell: (comp) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Badge variant={comp.type === 'academic' ? 'primary' : 'neutral'} size="sm">
              {comp.type === 'academic' ? 'Akademik' : 'E-Sport'}
            </Badge>
            <Badge variant="info" size="sm">
              {comp.category.toUpperCase()}
            </Badge>
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span className="capitalize">
              {comp.participation_type} ({comp.min_team_size}-{comp.max_team_size} org)
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'fee',
      header: 'Biaya & Kuota',
      sortable: true,
      accessor: (comp) => comp.registration_fee,
      cell: (comp) => (
        <div className="space-y-0.5">
          <div className="font-mono font-bold text-sm text-[var(--primary)] tabular-nums">
            {formatCurrency(comp.registration_fee)}
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)] font-mono">
            {comp.registered_count} / {comp.quota ? `${comp.quota} slot` : '∞'}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Publikasi',
      sortable: true,
      accessor: (comp) => comp.is_published,
      cell: (comp) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleTogglePublish(comp);
          }}
          className="inline-flex items-center gap-1.5 p-1 rounded-md hover:bg-[var(--accent)] transition-colors"
          title={comp.is_published ? 'Klik untuk jadikan Draf' : 'Klik untuk Publikasikan'}
        >
          {comp.is_published ? (
            <Badge variant="success" size="sm" className="gap-1 cursor-pointer">
              <Eye className="w-3 h-3" /> Live
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm" className="gap-1 cursor-pointer">
              <EyeSlash className="w-3 h-3" /> Draf
            </Badge>
          )}
        </button>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      className: 'text-right',
      cell: (comp) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          {comp.type === 'academic' && (
            <Link href={`/dashboard/admin/rubrik?competition_id=${comp.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 h-8"
                title="Kelola Rubrik"
              >
                <ListNumbers className="w-3.5 h-3.5 text-[var(--primary)]" />
                {/* <span className="hidden sm:inline">Rubrik</span> */}
              </Button>
            </Link>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEditModal(comp)}
            className="text-xs h-8"
          >
            <PencilSimple className="w-3.5 h-3.5 sm:mr-1" />
            {/* <span className="hidden sm:inline">Edit</span> */}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirmComp(comp)}
            className="text-xs text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)] h-8 w-8 p-0"
            title="Hapus Kompetisi"
          >
            <Trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Manajemen Cabang Kompetisi"
      subtitle="Kelola parameter lomba, biaya registrasi, pembagian kuota, ketentuan berkas, dan rubrik penilaian."
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

        {/* Tab Filter Kategori Bersih */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center gap-1 bg-[var(--accent)]/50 p-1 rounded-[var(--radius-md)] border border-[var(--border)]">
            {[
              { id: 'all', label: `Semua Cabang (${competitions.length})` },
              {
                id: 'academic',
                label: `Akademik (${competitions.filter((c) => c.type === 'academic').length})`,
              },
              {
                id: 'non_academic',
                label: `E-Sport (${competitions.filter((c) => c.type === 'non_academic').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors min-h-[32px] ${activeTab === tab.id
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-[var(--muted-foreground)] font-mono">
            Tampil: <strong className="text-[var(--foreground)]">{filteredCompetitions.length}</strong> cabang
          </div>
        </div>

        {/* Tabel Data Kompetisi Bersih */}
        <DataTable
          data={filteredCompetitions as (Competition & Record<string, unknown>)[]}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Cari nama lomba, tema, slug..."
          searchableKeys={['name', 'slug', 'theme', 'category']}
          exportFilename="cabang_kompetisi_permifest"
          onRowClick={(item) => openEditModal(item as Competition)}
          emptyTitle="Belum Ada Cabang Lomba"
          emptyDescription="Belum ada kompetisi pada kategori ini. Silakan buat kompetisi baru dengan tombol di atas."
        />

        {/* Modal CRUD Terstruktur Rapi */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCompId ? `Edit Lomba: ${formData.name || 'Kompetisi'}` : 'Tambah Cabang Kompetisi Baru'}
          description="Atur informasi parameter, biaya pendaftaran, kuota peserta, dan ketentuan berkas pengumpulan."
          maxWidth="2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="destructive" onClose={() => setFormError(null)}>
                <AlertTitle>Validasi Gagal</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Sub-navigasi Tab Modal */}
            <div className="flex items-center gap-1 border-b border-[var(--border)] pb-2">
              <button
                type="button"
                onClick={() => setModalTab('info')}
                className={`px-3 py-1.5 text-xs font-bold rounded-[var(--radius-sm)] transition-colors ${modalTab === 'info'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                  }`}
              >
                1. Informasi Dasar
              </button>
              <button
                type="button"
                onClick={() => setModalTab('biaya')}
                className={`px-3 py-1.5 text-xs font-bold rounded-[var(--radius-sm)] transition-colors ${modalTab === 'biaya'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                  }`}
              >
                2. Biaya &amp; Kuota
              </button>
              <button
                type="button"
                onClick={() => setModalTab('berkas')}
                className={`px-3 py-1.5 text-xs font-bold rounded-[var(--radius-sm)] transition-colors ${modalTab === 'berkas'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                  }`}
              >
                3. Berkas &amp; QRIS
              </button>
            </div>

            {/* Tab 1: Informasi Dasar */}
            {modalTab === 'info' && (
              <div className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    helperText="Identifier unik URL web publik"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                      Tipe Lomba *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, type: e.target.value as CompetitionType }))
                      }
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
                    >
                      <option value="academic">Akademik (Karya &amp; Dinilai Juri)</option>
                      <option value="non_academic">Non-Akademik (E-Sport / Pertandingan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                      Kategori Spesifik *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value as CompetitionCategory }))
                      }
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
                    >
                      <option value="esai">Esai Ilmiah</option>
                      <option value="uiux">UI/UX Design</option>
                      <option value="it_system_arch">IT Architecture</option>
                      <option value="pes">eFootball PES</option>
                      <option value="ml">Mobile Legends</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Tema Perlombaan *"
                  placeholder="Contoh: Empowering Smart Nation with AI Security"
                  required
                  value={formData.theme}
                  onChange={(e) => setFormData((prev) => ({ ...prev, theme: e.target.value }))}
                />

                <div>
                  <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                    Deskripsi &amp; Gambaran Lomba
                  </label>
                  <textarea
                    rows={3}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                    placeholder="Tuliskan latar belakang singkat dan sasaran kompetisi..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Partisipasi, Biaya & Kuota */}
            {modalTab === 'biaya' && (
              <div className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                      Bentuk Partisipasi *
                    </label>
                    <select
                      value={formData.participation_type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          participation_type: e.target.value as ParticipationType,
                        }))
                      }
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
                    >
                      <option value="individual">Individu (Solo)</option>
                      <option value="team">Kelompok (Tim)</option>
                    </select>
                  </div>

                  <Input
                    label="Min Anggota Tim *"
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.min_team_size}
                    onChange={(e) => setFormData((prev) => ({ ...prev, min_team_size: Number(e.target.value) }))}
                  />

                  <Input
                    label="Maks Anggota Tim *"
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.max_team_size}
                    onChange={(e) => setFormData((prev) => ({ ...prev, max_team_size: Number(e.target.value) }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Biaya Pendaftaran (IDR) *"
                    type="number"
                    min="0"
                    step="5000"
                    required
                    value={formData.registration_fee}
                    onChange={(e) => setFormData((prev) => ({ ...prev, registration_fee: Number(e.target.value) }))}
                    helperText="0 = Gratis tanpa biaya"
                  />

                  <Input
                    label="Kuota Slot Peserta"
                    type="number"
                    min="1"
                    placeholder="Kosongkan jika tidak terbatas"
                    value={formData.quota || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        quota: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    helperText="Batas maksimal pendaftar diterima"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-[var(--radius-md)] bg-[var(--accent)]/30 border border-[var(--border)]">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                      className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-[var(--foreground)] block">
                        Publikasikan Lomba Sekarang
                      </span>
                      <span className="text-[var(--muted-foreground)]">
                        Lomba akan langsung tampil di landing page dan portal pendaftaran
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Tab 3: Berkas & QRIS Khusus */}
            {modalTab === 'berkas' && (
              <div className="space-y-3.5 pt-1">
                <Input
                  label="Format Berkas yang Diizinkan"
                  placeholder=".pdf, .docx, figma_url"
                  value={formData.allowed_types}
                  onChange={(e) => setFormData((prev) => ({ ...prev, allowed_types: e.target.value }))}
                  helperText="Pisahkan dengan koma. Contoh: .pdf, figma_url"
                />

                {/* Zona QRIS Khusus Cabang Lomba */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[var(--foreground)]">
                    Unggah QRIS Khusus Cabang Ini (Opsional)
                  </label>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Kosongkan jika ingin menggunakan barcode QRIS default event dari Pengaturan Sistem.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--accent)]/20">
                    {formData.payment_qr_url ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-[var(--border)] bg-white p-1 shrink-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.payment_qr_url}
                          alt="QRIS Khusus"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] flex flex-col items-center justify-center text-[var(--muted-foreground)] shrink-0">
                        <QrCode className="w-8 h-8 opacity-40 mb-1" />
                        <span className="text-[9px]">Belum ada</span>
                      </div>
                    )}

                    <div className="space-y-2 flex-1 text-xs">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="text-xs text-[var(--foreground)] file:mr-2.5 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary)] file:text-white hover:file:opacity-90 cursor-pointer"
                      />
                      {formData.payment_qr_url && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, payment_qr_url: '' }))}
                          className="text-[11px] text-[var(--destructive-text)] hover:underline block"
                        >
                          Hapus QRIS khusus (gunakan global)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-1.5">
                {modalTab !== 'info' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (modalTab === 'berkas') setModalTab('biaya');
                      else if (modalTab === 'biaya') setModalTab('info');
                    }}
                  >
                    &larr; Kembali
                  </Button>
                )}
                {modalTab !== 'berkas' && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (modalTab === 'info') setModalTab('biaya');
                      else if (modalTab === 'biaya') setModalTab('berkas');
                    }}
                  >
                    Selanjutnya &rarr;
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  {editingCompId ? 'Simpan Perubahan' : 'Buat Kompetisi'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>

        {/* Dialog Konfirmasi Hapus Kompetisi */}
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmComp)}
          onClose={() => setDeleteConfirmComp(null)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Cabang Kompetisi Ini?"
          description={`Anda akan menghapus cabang lomba "${deleteConfirmComp?.name}". Pendaftaran peserta dan berkas karya terkait cabang ini akan terpengaruh.`}
          confirmText="Hapus Permanen"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
}
