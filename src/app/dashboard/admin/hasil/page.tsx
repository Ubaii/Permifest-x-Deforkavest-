'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { MatchResult } from '@/lib/types';
import {
  GameController,
  Plus,
  PencilSimple,
  Trash,
  Trophy,
  Medal,
  Crown,
  Calendar,
} from '@phosphor-icons/react';

export default function AdminHasilPage() {
  const { matchResults, competitions, addMatchResult, updateMatchResult, deleteMatchResult } = useAppStore();

  const esportComps = competitions.filter((c) => c.type === 'non_academic');

  const [filterGame, setFilterGame] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredMatches = matchResults.filter((m) => {
    if (filterGame === 'all') return true;
    return m.competition_id === filterGame;
  });

  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [selectedCompId, setSelectedCompId] = useState(esportComps[0]?.id || '');
  const [participantName, setParticipantName] = useState('');
  const [position, setPosition] = useState(1);
  const [stage, setStage] = useState('Grand Final');
  const [scoreDetail, setScoreDetail] = useState('');
  const [notes, setNotes] = useState('');
  const [deleteConfirmMatch, setDeleteConfirmMatch] = useState<MatchResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [drawerError, setDrawerError] = useState<string | null>(null);

  const openCreateDrawer = () => {
    setEditingMatchId(null);
    setSelectedCompId(esportComps[0]?.id || '');
    setParticipantName('');
    setPosition(1);
    setStage('Grand Final');
    setScoreDetail('');
    setNotes('');
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (m: MatchResult) => {
    setEditingMatchId(m.id);
    setSelectedCompId(m.competition_id);
    setParticipantName(m.participant_name);
    setPosition(m.position);
    setNotes(m.notes || '');
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setDrawerError(null);
    try {
      const compiledNotes = scoreDetail
        ? `${stage ? `[${stage}] ` : ''}Skor: ${scoreDetail}. ${notes}`.trim()
        : notes;

      if (editingMatchId) {
        await updateMatchResult(editingMatchId, {
          competition_id: selectedCompId,
          participant_name: participantName,
          position: Number(position),
          notes: compiledNotes,
        });
        setAlertSuccess(`Hasil pertandingan untuk "${participantName}" berhasil diperbarui!`);
      } else {
        await addMatchResult({
          competition_id: selectedCompId,
          participant_name: participantName,
          position: Number(position),
          notes: compiledNotes,
        });
        setAlertSuccess(`Hasil turnamen "${participantName}" (Juara ${position}) berhasil dirilis!`);
      }

      setDrawerOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan hasil';
      setDrawerError(message);
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

  // Top 3 Podium Sorting
  const sortedMatches = [...filteredMatches].sort((a, b) => a.position - b.position);
  const podiumTop3 = sortedMatches.filter((m) => m.position <= 3);

  const getPositionBadge = (pos: number) => {
    if (pos === 1) {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center font-bold font-mono text-sm shrink-0">
          <Crown className="w-5 h-5" weight="fill" />
        </div>
      );
    }
    if (pos === 2) {
      return (
        <div className="w-9 h-9 rounded-xl bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center font-bold font-mono text-sm shrink-0">
          <Medal className="w-5 h-5" weight="fill" />
        </div>
      );
    }
    if (pos === 3) {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center font-bold font-mono text-sm shrink-0">
          <Trophy className="w-5 h-5" weight="fill" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-xl bg-[var(--accent)] text-[var(--muted-foreground)] border border-[var(--border)] flex items-center justify-center font-bold font-mono text-xs shrink-0">
        #{pos}
      </div>
    );
  };

  return (
    <DashboardLayout
      title="Input Hasil Pertandingan E-Sport (PES &amp; ML)"
      subtitle="Pencatatan dan pengelolaan hasil turnamen e-sport non-akademik ke sistem klasemen juara resmi melalui drawer."
      actions={
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" weight="bold" />} onClick={openCreateDrawer}>
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
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center gap-1 bg-[var(--accent)]/50 p-1 rounded-lg border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setFilterGame('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterGame === 'all'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              Semua Game ({matchResults.length})
            </button>
            {esportComps.map((c) => {
              const count = matchResults.filter((m) => m.competition_id === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFilterGame(c.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    filterGame === c.id
                      ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs border border-[var(--border)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[var(--muted-foreground)] font-mono">
            Total Entri: <strong className="text-[var(--foreground)]">{filteredMatches.length}</strong> catatan
          </div>
        </div>

        {/* Podium Highlight Top 3 (Jika Ada) */}
        {podiumTop3.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {podiumTop3.map((m) => {
              const comp = competitions.find((c) => c.id === m.competition_id);
              const isChamp = m.position === 1;
              return (
                <Card
                  key={m.id}
                  className={`border-[var(--border)] bg-[var(--card)] shadow-2xs relative overflow-hidden ${
                    isChamp ? 'border-amber-500/40 ring-1 ring-amber-500/20' : ''
                  }`}
                >
                  {isChamp && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-bl-lg font-mono">
                      Champion
                    </div>
                  )}
                  <CardContent className="p-4 flex items-center gap-3.5">
                    {getPositionBadge(m.position)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                        <span>Juara {m.position}</span>
                        <span>•</span>
                        <span className="truncate">{comp?.name}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[var(--foreground)] truncate mt-0.5">
                        {m.participant_name}
                      </h4>
                      {m.notes && (
                        <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-1 italic mt-0.5">
                          {m.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Match Cards List */}
        <Card className="border-[var(--border)] bg-[var(--card)] shadow-2xs">
          <CardHeader className="pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <GameController className="w-5 h-5 text-[var(--primary)]" />
              <CardTitle className="text-base">Rekapitulasi Hasil Pertandingan &amp; Klasemen</CardTitle>
            </div>
            <CardDescription className="text-xs text-[var(--muted-foreground)]">
              Data skor pertandingan dan peringkat juara e-sport yang dirilis ke leaderboard publik
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {filteredMatches.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<GameController className="w-8 h-8 text-[var(--primary)]" weight="duotone" />}
                  title="Belum Ada Hasil Pertandingan"
                  description="Turnamen e-sport belum memiliki catatan hasil pertandingan untuk kategori ini. Tambahkan entri baru melalui tombol di atas."
                />
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {sortedMatches.map((m) => {
                  const comp = competitions.find((c) => c.id === m.competition_id);

                  return (
                    <div
                      key={m.id}
                      className="py-3 px-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--accent)]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        {getPositionBadge(m.position)}
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-[var(--foreground)]">
                              {m.participant_name}
                            </h4>
                            <Badge variant="primary" size="sm">{comp?.name || 'Turnamen E-Sport'}</Badge>
                            <span className="font-mono text-xs font-semibold text-[var(--primary)]">
                              Juara #{m.position}
                            </span>
                          </div>
                          {m.notes && <p className="text-xs text-[var(--muted-foreground)]">{m.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <div className="text-xs text-[var(--muted-foreground)] font-mono flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDateShort(m.created_at)}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDrawer(m)}
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
                            className="h-8 w-8 p-0 text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                            title="Hapus Catatan Juara"
                            aria-label="Hapus Catatan Juara"
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

      {/* DRAWER CRUD HASIL E-SPORT */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="md"
      >
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <GameController className="w-5 h-5 text-[var(--primary)]" />
            <DrawerTitle>
              {editingMatchId ? 'Edit Catatan Hasil E-Sport' : 'Input Hasil Pertandingan E-Sport'}
            </DrawerTitle>
          </div>
          <DrawerDescription>
            Masukkan peringkat juara, babak turnamen, dan skor akhir untuk dipublikasikan ke leaderboard.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerContent className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {drawerError && (
            <Alert variant="destructive" onClose={() => setDrawerError(null)}>
              <AlertTitle>Validasi Gagal</AlertTitle>
              <AlertDescription>{drawerError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} id="esport-match-form" className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Cabang Game E-Sport <span className="text-[var(--destructive)]">*</span>
              </label>
              <select
                required
                value={selectedCompId}
                onChange={(e) => setSelectedCompId(e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 h-10 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                {esportComps.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Nama Tim / Pemain Peserta *"
              placeholder="Contoh: EVOS Permikomnas / Yuum Gaming"
              required
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Peringkat Juara (1, 2, 3...) *"
                type="number"
                min="1"
                max="64"
                required
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
                helperText="1 = Juara 1, 2 = Runner-up"
              />

              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Babak Pertandingan
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 h-10 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="Grand Final">Grand Final</option>
                  <option value="Bronze Match">Bronze Match (Perebutan Juara 3)</option>
                  <option value="Semifinal">Semifinal</option>
                  <option value="Quarterfinal">Quarterfinal</option>
                  <option value="Babak Grup">Babak Klasemen Grup</option>
                </select>
              </div>
            </div>

            <Input
              label="Skor Pertandingan (Opsional)"
              placeholder="Contoh: 3 - 1 (Bo5) atau 2 - 0"
              value={scoreDetail}
              onChange={(e) => setScoreDetail(e.target.value)}
              helperText="Format skor seri atau agregat gol"
            />

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Catatan / Keterangan Tambahan
              </label>
              <textarea
                rows={3}
                placeholder="Contoh: Menang lewat babak adu penalti / MVP: Player1..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              />
            </div>
          </form>
        </DrawerContent>

        <DrawerFooter className="flex items-center justify-end gap-2 border-t border-[var(--border)] p-4 bg-[var(--card)]">
          <Button type="button" variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
            Batal
          </Button>
          <Button type="submit" form="esport-match-form" variant="primary" size="sm" isLoading={submitting}>
            {editingMatchId ? 'Simpan Perubahan' : 'Rilis Hasil Pertandingan'}
          </Button>
        </DrawerFooter>
      </Drawer>

      {/* Dialog Konfirmasi Hapus Hasil Pertandingan */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmMatch)}
        onClose={() => setDeleteConfirmMatch(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Catatan Juara E-Sport?"
        description={`Anda akan menghapus data peringkat untuk "${deleteConfirmMatch?.participant_name}". Peringkat pada leaderboard publik akan disesuaikan.`}
        confirmText="Hapus Hasil"
        variant="destructive"
      />
    </DashboardLayout>
  );
}
