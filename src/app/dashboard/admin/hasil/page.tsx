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
import { formatDateShort } from '@/lib/utils';
import { MatchResult } from '@/lib/types';
import { GameController, Plus, PencilSimple, Trash } from '@phosphor-icons/react';

export default function AdminHasilPage() {
  const { matchResults, competitions, addMatchResult, updateMatchResult, deleteMatchResult } = useAppStore();

  const esportComps = competitions.filter((c) => c.type === 'non_academic');

  const [filterGame, setFilterGame] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filteredMatches = matchResults.filter((m) => {
    if (filterGame === 'all') return true;
    return m.competition_id === filterGame;
  });
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [selectedCompId, setSelectedCompId] = useState(esportComps[0]?.id || '');
  const [participantName, setParticipantName] = useState('');
  const [position, setPosition] = useState(1);
  const [notes, setNotes] = useState('');
  const [deleteConfirmMatch, setDeleteConfirmMatch] = useState<MatchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingMatchId(null);
    setSelectedCompId(esportComps[0]?.id || '');
    setParticipantName('');
    setPosition(1);
    setNotes('');
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (m: MatchResult) => {
    setEditingMatchId(m.id);
    setSelectedCompId(m.competition_id);
    setParticipantName(m.participant_name);
    setPosition(m.position);
    setNotes(m.notes || '');
    setModalError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    try {
      if (editingMatchId) {
        await updateMatchResult(editingMatchId, {
          competition_id: selectedCompId,
          participant_name: participantName,
          position: Number(position),
          notes: notes,
        });
        setAlertSuccess(`Hasil pertandingan untuk "${participantName}" berhasil diperbarui!`);
      } else {
        await addMatchResult({
          competition_id: selectedCompId,
          participant_name: participantName,
          position: Number(position),
          notes: notes,
        });
        setAlertSuccess(`Hasil turnamen "${participantName}" (Juara ${position}) berhasil dirilis!`);
      }

      setModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan hasil';
      setModalError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmMatch) return;
    await deleteMatchResult(deleteConfirmMatch.id);
    setAlertSuccess(`Catatan juara untuk "${deleteConfirmMatch.participant_name}" telah dihapus.`);
    setDeleteConfirmMatch(null);
  };

  return (
    <DashboardLayout
      title="Input Hasil Pertandingan E-Sport (PES & ML)"
      subtitle="Pencatatan dan pengelolaan hasil turnamen e-sport non-akademik ke sistem klasemen juara resmi."
      actions={
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" weight="bold" />} onClick={openCreateModal}>
          Input Juara / Skor Baru
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

        {/* Filter Tab Game */}
        <div className="flex items-center gap-2 p-1 bg-[var(--muted)] rounded-lg w-fit border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setFilterGame('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filterGame === 'all'
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            Semua Game
          </button>
          {esportComps.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setFilterGame(c.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterGame === c.id
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <Card className="border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle>Hasil Pertandingan yang Telah Divalidasi</CardTitle>
            <p className="text-xs text-[var(--muted-foreground)]">Data peringkat juara e-sport yang tampil di leaderboard publik</p>
          </CardHeader>
          <CardContent>
            {filteredMatches.length === 0 ? (
              <EmptyState
                icon={<GameController className="w-7 h-7 text-[var(--primary)]" weight="duotone" />}
                title="Belum Ada Hasil Pertandingan"
                description="Turnamen e-sport belum memiliki input rekapitulasi juara untuk kategori ini. Klik tombol di atas untuk menambah entri."
                action={
                  <Button size="sm" variant="primary" onClick={openCreateModal}>
                    Input Juara
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {filteredMatches.map((m) => {
                  const comp = competitions.find((c) => c.id === m.competition_id);

                  return (
                    <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--brand-gold)]/15 border border-[var(--brand-gold)]/30 text-[var(--brand-gold-soft)] flex items-center justify-center font-bold font-mono text-sm shrink-0">
                          #{m.position}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-[var(--foreground)] font-[family-name:var(--font-bricolage)]">
                              {m.participant_name}
                            </h4>
                            <Badge variant="primary">{comp?.name || 'Turnamen E-Sport'}</Badge>
                          </div>
                          {m.notes && <p className="text-xs text-[var(--muted-foreground)]">{m.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-left sm:text-right text-xs text-[var(--muted-foreground)] font-mono shrink-0">
                          {formatDateShort(m.created_at)}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(m)}
                            className="h-8 w-8 p-0 text-[var(--foreground)] hover:bg-[var(--accent)]"
                            title="Edit Hasil Pertandingan"
                            aria-label="Edit Hasil Pertandingan"
                          >
                            <PencilSimple className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteConfirmMatch(m)}
                            className="h-8 w-8 p-0 text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)]"
                            title="Hapus Hasil Pertandingan"
                            aria-label="Hapus Hasil Pertandingan"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Input & Edit Hasil Turnamen E-Sport */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMatchId ? 'Ubah Hasil / Juara Turnamen' : 'Input Juara / Hasil Turnamen E-Sport'}
        description="Hasil pertandingan yang dimasukkan akan langsung disahkan dan muncul di Leaderboard publik."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {modalError && (
            <Alert variant="destructive" onClose={() => setModalError(null)}>
              <AlertTitle>Gagal Menyimpan</AlertTitle>
              <AlertDescription>{modalError}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Cabang Turnamen E-Sport <span className="text-[var(--destructive-text)]">*</span>
            </label>
            <select
              required
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[44px]"
            >
              {esportComps.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.participation_type})</option>
              ))}
            </select>
          </div>

          <Input
            label="Nama Pemain / Tim (Squad) *"
            placeholder="Contoh: Mystic Slayers / Ahmad Fauzi"
            required
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Posisi Peringkat / Gelar <span className="text-[var(--destructive-text)]">*</span>
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[44px]"
            >
              <option value={1}>Peringkat #1 (Juara 1)</option>
              <option value={2}>Peringkat #2 (Juara 2)</option>
              <option value={3}>Peringkat #3 (Juara 3)</option>
              <option value={4}>Peringkat #4</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
              Catatan Skor / Informasi Babak (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Menang Final Score 3 - 1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3.5 py-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[44px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              {editingMatchId ? 'Simpan Perubahan' : 'Simpan & Rilis Hasil'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dialog Konfirmasi Hapus Hasil Turnamen */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmMatch)}
        onClose={() => setDeleteConfirmMatch(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Rekapitulasi Juara Ini?"
        description={`Anda akan menghapus catatan juara untuk "${deleteConfirmMatch?.participant_name}" (Posisi #${deleteConfirmMatch?.position}). Peringkat leaderboard akan disesuaikan.`}
        confirmText="Hapus Catatan"
        variant="destructive"
      />
    </DashboardLayout>
  );
}
