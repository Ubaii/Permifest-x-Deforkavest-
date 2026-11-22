'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Competition, CompetitionCategory, CompetitionType, ParticipationType, RubricCriteria } from '@/lib/types';
import {
  Plus,
  PencilSimple,
  Trash,
  Eye,
  EyeSlash,
  ListNumbers,
  QrCode,
  Users,
  CaretLeft,
  CaretRight,
  CheckCircle,
  WarningCircle,
  Sliders,
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
  const {
    competitions,
    addCompetition,
    updateCompetition,
    deleteCompetition,
    rubricCriteria,
    addRubricCriteria,
    updateRubricCriteria,
    deleteRubricCriteria,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'non_academic'>('all');
  
  // Competition Drawer CRUD state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompetitionFormData>(defaultFormData);
  const [drawerTab, setDrawerTab] = useState<'info' | 'biaya' | 'berkas'>('info');
  const [deleteConfirmComp, setDeleteConfirmComp] = useState<Competition | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rubrik Drawer state
  const [rubricDrawerComp, setRubricDrawerComp] = useState<Competition | null>(null);
  const [newCritName, setNewCritName] = useState('');
  const [newCritDesc, setNewCritDesc] = useState('');
  const [newCritMaxScore, setNewCritMaxScore] = useState(100);
  const [newCritWeight, setNewCritWeight] = useState(25);
  const [editingCritId, setEditingCritId] = useState<string | null>(null);
  const [rubricError, setRubricError] = useState<string | null>(null);

  const filteredCompetitions = competitions.filter((c) => {
    if (activeTab === 'all') return true;
    return c.type === activeTab;
  });

  const openCreateDrawer = () => {
    setEditingCompId(null);
    setFormData(defaultFormData);
    setDrawerTab('info');
    setFormError(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (comp: Competition) => {
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
    setDrawerTab('info');
    setFormError(null);
    setDrawerOpen(true);
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
      setFormError('File QRIS harus berformat gambar (.png, .jpg, .jpeg, .webp)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        payment_qr_url: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!formData.name.trim()) throw new Error('Nama lomba wajib diisi');
      if (!formData.slug.trim()) throw new Error('Slug URL wajib diisi');
      if (formData.min_team_size > formData.max_team_size) {
        throw new Error('Jumlah minimal anggota tidak boleh melebihi maksimal');
      }

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
        setAlertSuccess(`Cabang lomba "${formData.name}" berhasil diperbarui!`);
      } else {
        await addCompetition({
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

      setDrawerOpen(false);
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
      `Status publikasi "${comp.name}" diubah menjadi ${
        !comp.is_published ? 'Aktif (Published)' : 'Draft (Unpublished)'
      }.`
    );
  };

  // Rubrik Drawer Helpers
  const activeRubricCriteria = rubricDrawerComp
    ? rubricCriteria.filter((c) => c.competition_id === rubricDrawerComp.id)
    : [];
  
  const totalWeightPercent = Math.round(
    activeRubricCriteria.reduce((sum, c) => sum + (c.weight || 0) * 100, 0)
  );

  const handleSaveRubricCriterion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rubricDrawerComp) return;
    setRubricError(null);

    if (!newCritName.trim()) {
      setRubricError('Nama kriteria wajib diisi');
      return;
    }

    try {
      if (editingCritId) {
        await updateRubricCriteria(editingCritId, {
          name: newCritName,
          description: newCritDesc,
          max_score: Number(newCritMaxScore),
          weight: Number(newCritWeight) / 100,
        });
        setAlertSuccess(`Kriteria "${newCritName}" berhasil diperbarui.`);
        setEditingCritId(null);
      } else {
        await addRubricCriteria({
          competition_id: rubricDrawerComp.id,
          name: newCritName,
          description: newCritDesc,
          max_score: Number(newCritMaxScore),
          weight: Number(newCritWeight) / 100,
          sort_order: activeRubricCriteria.length + 1,
        });
        setAlertSuccess(`Kriteria baru "${newCritName}" berhasil ditambahkan ke rubrik.`);
      }

      setNewCritName('');
      setNewCritDesc('');
      setNewCritMaxScore(100);
      setNewCritWeight(25);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan rubrik kriteria';
      setRubricError(msg);
    }
  };

  const handleEditCriterionClick = (crit: RubricCriteria) => {
    setEditingCritId(crit.id);
    setNewCritName(crit.name);
    setNewCritDesc(crit.description || '');
    setNewCritMaxScore(crit.max_score);
    setNewCritWeight(Math.round((crit.weight || 0) * 100));
  };

  const handleDeleteCriterionClick = async (id: string, name: string) => {
    await deleteRubricCriteria(id);
    setAlertSuccess(`Kriteria "${name}" telah dihapus.`);
    if (editingCritId === id) {
      setEditingCritId(null);
      setNewCritName('');
      setNewCritDesc('');
    }
  };

  const columns: Column<Competition & Record<string, unknown>>[] = [
    {
      key: 'name',
      header: 'Cabang Lomba & Tema',
      sortable: true,
      cell: (comp) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[var(--foreground)] flex items-center gap-2">
              <span>{comp.name}</span>
              <Badge variant={comp.type === 'academic' ? 'primary' : 'neutral'} size="sm">
                {comp.type === 'academic' ? 'Akademik' : 'Non-Akademik'}
              </Badge>
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)] line-clamp-1">
              Tema: <span className="italic">{comp.theme || 'Belum ditentukan'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'participation',
      header: 'Partisipasi & Kuota',
      sortable: true,
      accessor: (comp) => comp.participation_type,
      cell: (comp) => (
        <div className="text-xs">
          <div className="flex items-center gap-1 font-semibold text-[var(--foreground)]">
            <Users className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span>
              {comp.participation_type === 'team'
                ? `Tim (${comp.min_team_size}-${comp.max_team_size} org)`
                : 'Individu (Solo)'}
            </span>
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)]">
            Kuota: {comp.quota ? `${comp.quota} slot` : 'Tanpa batas'}
          </div>
        </div>
      ),
    },
    {
      key: 'fee',
      header: 'Biaya Tiket',
      sortable: true,
      accessor: (comp) => comp.registration_fee,
      cell: (comp) => (
        <span className="font-mono text-xs font-bold text-[var(--foreground)]">
          {comp.registration_fee === 0 ? 'Gratis' : formatCurrency(comp.registration_fee)}
        </span>
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
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {comp.type === 'academic' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRubricDrawerComp(comp)}
              className="h-8 w-8 p-0 text-[var(--primary)] hover:bg-[var(--primary)]/10"
              title="Kelola Rubrik Penilaian (Buka Drawer)"
              aria-label="Kelola Rubrik Penilaian"
            >
              <ListNumbers className="w-4 h-4" />
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditDrawer(comp)}
            className="h-8 w-8 p-0 text-[var(--foreground)] hover:bg-[var(--accent)]"
            title="Edit Cabang Lomba (Buka Drawer)"
            aria-label="Edit Cabang Lomba"
          >
            <PencilSimple className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirmComp(comp)}
            className="h-8 w-8 p-0 text-[var(--destructive-text)] hover:bg-[var(--destructive)]/10"
            title="Hapus Cabang Lomba"
            aria-label="Hapus Cabang Lomba"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Manajemen Cabang Kompetisi"
      subtitle="Kelola parameter lomba, biaya registrasi, pembagian kuota, ketentuan berkas, dan rubrik penilaian melalui panel drawer."
      actions={
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" weight="bold" />}
          onClick={openCreateDrawer}
        >
          Tambah Lomba Baru
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
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center gap-1 bg-[var(--accent)]/50 p-1 rounded-lg border border-[var(--border)]">
            {[
              { id: 'all', label: `Semua Cabang (${competitions.length})` },
              {
                id: 'academic',
                label: `Akademik (${competitions.filter((c) => c.type === 'academic').length})`,
              },
              {
                id: 'non_academic',
                label: `Non-Akademik (${competitions.filter((c) => c.type === 'non_academic').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors min-h-[32px] ${
                  activeTab === tab.id
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
          onRowClick={(item) => openEditDrawer(item as Competition)}
          emptyTitle="Belum Ada Cabang Lomba"
          emptyDescription="Belum ada kompetisi pada kategori ini. Silakan buat kompetisi baru dengan tombol di atas."
        />

        {/* DRAWER CRUD KOMPETISI */}
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          size="lg"
        >
          <DrawerHeader>
            <DrawerTitle>
              {editingCompId ? `Edit Lomba: ${formData.name || 'Kompetisi'}` : 'Tambah Cabang Kompetisi Baru'}
            </DrawerTitle>
            <DrawerDescription>
              Atur parameter lomba, biaya tiket, kuota slot peserta, dan format berkas yang diterima.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerContent className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {formError && (
              <Alert variant="destructive" onClose={() => setFormError(null)}>
                <AlertTitle>Validasi Gagal</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {/* Sub-navigasi Tab Drawer */}
            <div className="flex items-center gap-1 border-b border-[var(--border)] pb-2">
              <button
                type="button"
                onClick={() => setDrawerTab('info')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  drawerTab === 'info'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                1. Informasi Dasar
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('biaya')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  drawerTab === 'biaya'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                2. Biaya &amp; Kuota
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('berkas')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  drawerTab === 'berkas'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                3. Berkas &amp; QRIS
              </button>
            </div>

            {/* Tab 1: Informasi Dasar */}
            {drawerTab === 'info' && (
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
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 h-9 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 h-9 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                    placeholder="Tuliskan latar belakang singkat dan sasaran kompetisi..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Biaya & Kuota */}
            {drawerTab === 'biaya' && (
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
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 h-9 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    >
                      <option value="individual">Individu (Solo)</option>
                      <option value="team">Kelompok (Tim)</option>
                    </select>
                  </div>

                  <Input
                    label="Min Anggota *"
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.min_team_size}
                    onChange={(e) => setFormData((prev) => ({ ...prev, min_team_size: Number(e.target.value) }))}
                  />

                  <Input
                    label="Maks Anggota *"
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
                    placeholder="Kosongkan jika tak terbatas"
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
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl bg-[var(--accent)]/30 border border-[var(--border)]">
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

            {/* Tab 3: Berkas & QRIS */}
            {drawerTab === 'berkas' && (
              <div className="space-y-3.5 pt-1">
                <Input
                  label="Format Berkas yang Diizinkan"
                  placeholder=".pdf, .docx, figma_url"
                  value={formData.allowed_types}
                  onChange={(e) => setFormData((prev) => ({ ...prev, allowed_types: e.target.value }))}
                  helperText="Pisahkan dengan koma. Contoh: .pdf, figma_url"
                />

                <div className="space-y-2">
                  <label className="block text-xs font-medium text-[var(--foreground)]">
                    Unggah QRIS Khusus Cabang Ini (Opsional)
                  </label>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Kosongkan jika ingin menggunakan barcode QRIS default event dari Pengaturan Sistem.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-xl border border-dashed border-[var(--border)] bg-[var(--accent)]/20">
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
                          className="text-[11px] text-[var(--destructive)] hover:underline block"
                        >
                          Hapus QRIS khusus (gunakan global)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DrawerContent>

          <DrawerFooter className="flex items-center justify-between border-t border-[var(--border)] p-4 bg-[var(--card)]">
            <div className="flex items-center gap-1.5">
              {drawerTab !== 'info' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<CaretLeft className="w-3.5 h-3.5" />}
                  onClick={() => {
                    if (drawerTab === 'berkas') setDrawerTab('biaya');
                    else if (drawerTab === 'biaya') setDrawerTab('info');
                  }}
                >
                  Kembali
                </Button>
              )}
              {drawerTab !== 'berkas' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  rightIcon={<CaretRight className="w-3.5 h-3.5" />}
                  onClick={() => {
                    if (drawerTab === 'info') setDrawerTab('biaya');
                    else if (drawerTab === 'biaya') setDrawerTab('berkas');
                  }}
                >
                  Selanjutnya
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
                Batal
              </Button>
              <Button type="button" variant="primary" size="sm" isLoading={isSubmitting} onClick={handleSubmit}>
                {editingCompId ? 'Simpan Perubahan' : 'Buat Kompetisi'}
              </Button>
            </div>
          </DrawerFooter>
        </Drawer>

        {/* DRAWER MANAJEMEN RUBRIK PENILAIAN */}
        <Drawer
          isOpen={Boolean(rubricDrawerComp)}
          onClose={() => setRubricDrawerComp(null)}
          size="xl"
        >
          <DrawerHeader>
            <div className="flex items-center gap-2">
              <ListNumbers className="w-5 h-5 text-[var(--primary)]" />
              <DrawerTitle>
                Rubrik Penilaian: {rubricDrawerComp?.name}
              </DrawerTitle>
            </div>
            <DrawerDescription>
              Kelola indikator, skala skor, dan persentase bobot penilaian dewan juri untuk cabang akademik ini.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerContent className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Bobot Meter Status */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--accent)]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--foreground)]">Total Bobot Kriteria</span>
                <span className="font-mono text-sm font-bold text-[var(--primary)]">{totalWeightPercent}% / 100%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--accent)] overflow-hidden">
                <div
                  style={{ width: `${Math.min(totalWeightPercent, 100)}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    totalWeightPercent === 100
                      ? 'bg-[var(--success)]'
                      : totalWeightPercent > 100
                      ? 'bg-[var(--destructive)]'
                      : 'bg-[var(--warning)]'
                  }`}
                />
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                {totalWeightPercent === 100 ? (
                  <span className="text-[var(--success)] flex items-center gap-1 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" weight="bold" />
                    Bobot valid dan seimbang (Pas 100%)
                  </span>
                ) : (
                  <span className="text-[var(--warning)] flex items-center gap-1 font-semibold">
                    <WarningCircle className="w-3.5 h-3.5" weight="bold" />
                    Total bobot belum 100% (Selisih {100 - totalWeightPercent}%)
                  </span>
                )}
              </div>
            </div>

            {/* List Kriteria yang Sudah Ada */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Daftar Kriteria Penilaian ({activeRubricCriteria.length})
              </h4>

              {activeRubricCriteria.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xl text-xs text-[var(--muted-foreground)]">
                  Belum ada kriteria penilaian untuk lomba ini. Silakan tambahkan kriteria melalui formulir di bawah.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeRubricCriteria.map((crit) => (
                    <div
                      key={crit.id}
                      className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 transition-colors flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs text-[var(--foreground)]">{crit.name}</strong>
                          <Badge variant="primary" size="sm" className="font-mono">
                            Bobot: {Math.round((crit.weight || 0) * 100)}%
                          </Badge>
                          <Badge variant="neutral" size="sm" className="font-mono">
                            Maks: {crit.max_score} poin
                          </Badge>
                        </div>
                        {crit.description && (
                          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                            {crit.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditCriterionClick(crit)}
                          className="h-7 w-7 p-0 text-[var(--foreground)] hover:bg-[var(--accent)]"
                          title="Edit Kriteria"
                        >
                          <PencilSimple className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCriterionClick(crit.id, crit.name)}
                          className="h-7 w-7 p-0 text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                          title="Hapus Kriteria"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Tambah/Edit Kriteria */}
            <form onSubmit={handleSaveRubricCriterion} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--accent)]/10 space-y-3.5">
              <h4 className="text-xs font-bold text-[var(--foreground)] flex items-center justify-between">
                <span>{editingCritId ? 'Edit Kriteria Terpilih' : 'Tambah Kriteria Baru'}</span>
                {editingCritId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCritId(null);
                      setNewCritName('');
                      setNewCritDesc('');
                    }}
                    className="text-[10px] text-[var(--muted-foreground)] hover:underline"
                  >
                    Batal Edit
                  </button>
                )}
              </h4>

              {rubricError && (
                <Alert variant="destructive" onClose={() => setRubricError(null)}>
                  <AlertTitle>Gagal Menyimpan</AlertTitle>
                  <AlertDescription>{rubricError}</AlertDescription>
                </Alert>
              )}

              <Input
                label="Nama Kriteria *"
                placeholder="Contoh: Orisinalitas & Inovasi Ide"
                required
                value={newCritName}
                onChange={(e) => setNewCritName(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Persentase Bobot (%) *"
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={newCritWeight}
                  onChange={(e) => setNewCritWeight(Number(e.target.value))}
                  helperText="Contoh: 25 untuk bobot 25%"
                />

                <Input
                  label="Skor Maksimal *"
                  type="number"
                  min="10"
                  max="100"
                  required
                  value={newCritMaxScore}
                  onChange={(e) => setNewCritMaxScore(Number(e.target.value))}
                  helperText="Skala penilaian juri (default 100)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1">
                  Deskripsi &amp; Panduan Juri
                </label>
                <textarea
                  rows={2}
                  placeholder="Panduan bagi dewan juri dalam memberikan rentang nilai..."
                  value={newCritDesc}
                  onChange={(e) => setNewCritDesc(e.target.value)}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="primary" size="sm">
                  {editingCritId ? 'Simpan Perubahan Kriteria' : 'Tambah Kriteria ke Rubrik'}
                </Button>
              </div>
            </form>
          </DrawerContent>

          <DrawerFooter className="flex items-center justify-end border-t border-[var(--border)] p-4 bg-[var(--card)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRubricDrawerComp(null)}
            >
              Tutup Rubrik
            </Button>
          </DrawerFooter>
        </Drawer>

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
