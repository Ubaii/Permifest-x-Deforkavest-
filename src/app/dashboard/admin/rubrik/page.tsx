'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { RubricCriteria } from '@/lib/types';
import {
  ListNumbers,
  Plus,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';

interface RubricFormData {
  competition_id: string;
  name: string;
  description: string;
  max_score: number;
  weight_percent: number;
}

const defaultFormData: RubricFormData = {
  competition_id: '',
  name: '',
  description: '',
  max_score: 100,
  weight_percent: 25,
};

function RubricManagerContent() {
  const searchParams = useSearchParams();
  const compIdParam = searchParams.get('competition_id');

  const {
    rubricCriteria,
    competitions,
    addRubricCriteria,
    updateRubricCriteria,
    deleteRubricCriteria,
  } = useAppStore();

  const academicComps = competitions.filter((c) => c.type === 'academic');
  const [selectedCompId, setSelectedCompId] = useState<string>(
    compIdParam && academicComps.some((c) => c.id === compIdParam)
      ? compIdParam
      : academicComps[0]?.id || ''
  );

  const hasParamCompetition = Boolean(
    compIdParam && academicComps.some((c) => c.id === compIdParam)
  );

  useEffect(() => {
    if (compIdParam && hasParamCompetition) {
      const frameId = window.requestAnimationFrame(() => setSelectedCompId(compIdParam));
      return () => window.cancelAnimationFrame(frameId);
    }
  }, [compIdParam, hasParamCompetition]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCritId, setEditingCritId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RubricFormData>({
    ...defaultFormData,
    competition_id: selectedCompId,
  });
  const [deleteConfirmCrit, setDeleteConfirmCrit] = useState<RubricCriteria | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeComp = academicComps.find((c) => c.id === selectedCompId);
  const currentCriteria = rubricCriteria.filter((c) => c.competition_id === selectedCompId);
  const totalWeightPercent = Math.round(
    currentCriteria.reduce((sum, c) => sum + (c.weight || 0) * 100, 0)
  );

  const openCreateModal = () => {
    setEditingCritId(null);
    setFormData({
      ...defaultFormData,
      competition_id: selectedCompId,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (crit: RubricCriteria) => {
    setEditingCritId(crit.id);
    setFormData({
      competition_id: crit.competition_id,
      name: crit.name,
      description: crit.description || '',
      max_score: crit.max_score,
      weight_percent: Math.round(crit.weight * 100),
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Nama kriteria penilaian wajib diisi.');
      return;
    }

    if (formData.weight_percent <= 0 || formData.weight_percent > 100) {
      setFormError('Porsi bobot persen harus bernilai antara 1% sampai 100%.');
      return;
    }

    setIsSubmitting(true);
    try {
      const weightDecimal = Number(formData.weight_percent) / 100;

      if (editingCritId) {
        await updateRubricCriteria(editingCritId, {
          competition_id: formData.competition_id,
          name: formData.name,
          description: formData.description,
          max_score: Number(formData.max_score),
          weight: weightDecimal,
        });
        setAlertSuccess(`Kriteria rubrik "${formData.name}" berhasil diperbarui!`);
      } else {
        await addRubricCriteria({
          competition_id: formData.competition_id,
          name: formData.name,
          description: formData.description,
          max_score: Number(formData.max_score),
          weight: weightDecimal,
          sort_order: currentCriteria.length + 1,
        });
        setAlertSuccess(`Kriteria rubrik baru "${formData.name}" berhasil ditambahkan!`);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan kriteria rubrik';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmCrit) return;
    await deleteRubricCriteria(deleteConfirmCrit.id);
    setAlertSuccess(`Kriteria rubrik "${deleteConfirmCrit.name}" telah dihapus.`);
    setDeleteConfirmCrit(null);
  };

  return (
    <DashboardLayout
      title="Manajemen Rubrik Penilaian Dewan Juri"
      subtitle="Atur kriteria evaluasi karya akademik per-lomba dan pembobotan skor otomatis (total bobot wajib 100%)."
      actions={
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" weight="bold" />}
          onClick={openCreateModal}
        >
          Tambah Kriteria
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

        {/* Pemilih Cabang Lomba Akademik */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Pilih Cabang Lomba:</span>
            <div className="flex flex-wrap gap-1.5">
              {academicComps.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCompId(c.id)}
                  className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors min-h-[36px] ${
                    selectedCompId === c.id
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'bg-[var(--accent)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border border-[var(--border)]'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Indikator Akumulasi Bobot */}
          <div className="flex items-center gap-3">
            <div className="text-xs text-right">
              <span className="text-[10px] text-[var(--muted-foreground)] block font-mono">Total Akumulasi</span>
              <span
                className={`font-mono font-bold text-sm ${
                  totalWeightPercent === 100 ? 'text-[var(--success-text)]' : 'text-amber-500'
                }`}
              >
                {totalWeightPercent}% / 100%
              </span>
            </div>
            <div className="w-24 bg-[var(--accent)] h-2.5 rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className={`h-full transition-all duration-300 ${
                  totalWeightPercent === 100
                    ? 'bg-emerald-500'
                    : totalWeightPercent > 100
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(totalWeightPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {totalWeightPercent !== 100 && (
          <Alert variant="warning">
            <AlertTitle>Perhatian Pembobotan Rubrik: {activeComp?.name}</AlertTitle>
            <AlertDescription>
              Total bobot saat ini adalah <strong>{totalWeightPercent}%</strong>. Sistem penilaian dewan juri mensyaratkan total bobot akumulasi bernilai <strong>100%</strong> tepat.
            </AlertDescription>
          </Alert>
        )}

        {/* Daftar Kriteria Rubrik */}
        {currentCriteria.length === 0 ? (
          <EmptyState
            icon={<ListNumbers className="w-7 h-7 text-[var(--primary)]" weight="duotone" />}
            title="Belum Ada Kriteria Rubrik"
            description={`Cabang lomba "${activeComp?.name || 'ini'}" belum memiliki rubrik penilaian. Silakan buat kriteria baru.`}
            action={
              <Button size="sm" variant="primary" onClick={openCreateModal}>
                Tambah Kriteria
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {currentCriteria.map((crit, idx) => (
              <Card key={crit.id} className="p-4 border-[var(--border)] bg-[var(--card)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--primary)] bg-[var(--accent)] px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--foreground)]">{crit.name}</h4>
                      <Badge variant="primary" size="sm">
                        Bobot {Math.round(crit.weight * 100)}%
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        Maks Skor: {crit.max_score}
                      </Badge>
                    </div>
                    {crit.description && (
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {crit.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(crit)}
                      className="h-8 w-8 p-0 text-[var(--foreground)] hover:bg-[var(--accent)]"
                      title="Edit Kriteria Rubrik"
                      aria-label="Edit Kriteria Rubrik"
                    >
                      <PencilSimple className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirmCrit(crit)}
                      className="h-8 w-8 p-0 text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)]"
                      title="Hapus Kriteria Rubrik"
                      aria-label="Hapus Kriteria Rubrik"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal CRUD Rubrik Criteria */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCritId ? 'Ubah Kriteria Rubrik' : `Tambah Kriteria: ${activeComp?.name || 'Kompetisi'}`}
          description="Tentukan nama kriteria, panduan penilaian untuk juri, skor maksimal, dan porsi bobot."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <Alert variant="destructive" onClose={() => setFormError(null)}>
                <AlertTitle>Validasi Gagal</AlertTitle>
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Input
              label="Nama Kriteria Evaluasi *"
              placeholder="Contoh: Metodologi Penelitian &amp; Orisinalitas"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Panduan Deskripsi Penilaian untuk Dewan Juri
              </label>
              <textarea
                rows={3}
                placeholder="Indikator apa saja yang harus diperiksa dan dinilai oleh juri..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Skor Maksimal *"
                type="number"
                min="10"
                max="100"
                required
                value={formData.max_score}
                onChange={(e) => setFormData((prev) => ({ ...prev, max_score: Number(e.target.value) }))}
              />

              <Input
                label="Porsi Bobot Persen (%) *"
                type="number"
                min="1"
                max="100"
                required
                value={formData.weight_percent}
                onChange={(e) => setFormData((prev) => ({ ...prev, weight_percent: Number(e.target.value) }))}
                helperText="Misal: 25 untuk 25%"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                {editingCritId ? 'Simpan Perubahan' : 'Buat Kriteria'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Dialog Konfirmasi Hapus Kriteria Rubrik */}
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmCrit)}
          onClose={() => setDeleteConfirmCrit(null)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Kriteria Rubrik Ini?"
          description={`Anda akan menghapus kriteria "${deleteConfirmCrit?.name}". Penilaian yang telah menggunakan kriteria ini akan dihitung ulang.`}
          confirmText="Hapus Kriteria"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
}

export default function AdminRubrikPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[var(--muted-foreground)]">Memuat data rubrik...</div>}>
      <RubricManagerContent />
    </Suspense>
  );
}
