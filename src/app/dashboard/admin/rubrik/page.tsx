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
import { RubricCriteria } from '@/lib/types';
import {
  ListNumbers,
  Plus,
  PencilSimple,
  Trash,
  CheckCircle,
  WarningCircle,
  Percent,
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

export default function AdminRubrikPage() {
  const { rubricCriteria, competitions, addRubricCriteria, updateRubricCriteria, deleteRubricCriteria } = useAppStore();

  const academicComps = competitions.filter((c) => c.type === 'academic');
  const [selectedCompId, setSelectedCompId] = useState<string>(academicComps[0]?.id || '');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCritId, setEditingCritId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RubricFormData>({
    ...defaultFormData,
    competition_id: academicComps[0]?.id || '',
  });
  const [deleteConfirmCrit, setDeleteConfirmCrit] = useState<RubricCriteria | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kriteria untuk kompetisi terpilih
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
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert(msg);
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
      subtitle="Konfigurasi kriteria evaluasi karya akademik dan pembobotan skor terbobot otomatis (total bobot wajib 100%)."
      actions={
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" weight="bold" />}
          onClick={openCreateModal}
        >
          + Tambah Kriteria Rubrik
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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Pilih Cabang Lomba:</span>
            <select
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              aria-label="Pilih cabang lomba akademik"
              className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[36px]"
            >
              {academicComps.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Indikator Total Bobot */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span>Total Akumulasi Bobot:</span>
            <span
              className={`px-2.5 py-1 rounded-md font-bold ${
                totalWeightPercent === 100
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
              }`}
            >
              {totalWeightPercent}% / 100%
            </span>
          </div>
        </div>

        {totalWeightPercent !== 100 && (
          <Alert variant="warning">
            <AlertTitle>Peringatan Pembobotan Rubrik</AlertTitle>
            <AlertDescription>
              Total bobot seluruh kriteria saat ini adalah <strong>{totalWeightPercent}%</strong>. Mohon sesuaikan kriteria agar total akumulasi mencapai <strong>100%</strong> tepat.
            </AlertDescription>
          </Alert>
        )}

        {/* Daftar Kriteria Rubrik */}
        {currentCriteria.length === 0 ? (
          <EmptyState
            icon={<ListNumbers className="w-7 h-7 text-[var(--primary)]" weight="duotone" />}
            title="Belum Ada Rubrik Penilaian"
            description="Cabang lomba ini belum memiliki kriteria penilaian rubrik. Silakan tambahkan kriteria baru menggunakan tombol di atas."
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

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<PencilSimple className="w-3.5 h-3.5" />}
                      onClick={() => openEditModal(crit)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirmCrit(crit)}
                      className="text-xs text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)] p-2 min-h-0 min-w-0"
                      title="Hapus Kriteria"
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
          title={editingCritId ? 'Ubah Kriteria Rubrik' : 'Tambah Kriteria Rubrik Baru'}
          description="Tentukan nama kriteria, panduan penilaian untuk juri, skor maksimal, dan porsi bobot."
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Kriteria Evaluasi *"
              placeholder="Contoh: Metodologi Penelitian & Orisinalitas"
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
