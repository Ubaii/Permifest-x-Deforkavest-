'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { GameController, Plus, Trophy, Medal } from '@phosphor-icons/react';

export default function AdminHasilPage() {
  const { matchResults, competitions, addMatchResult } = useAppStore();

  const esportComps = competitions.filter((c) => c.type === 'non_academic');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompId, setSelectedCompId] = useState(esportComps[0]?.id || '');
  const [participantName, setParticipantName] = useState('');
  const [position, setPosition] = useState(1);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addMatchResult({
        competition_id: selectedCompId,
        participant_name: participantName,
        position: Number(position),
        notes: notes,
      });

      setModalOpen(false);
      setParticipantName('');
      setNotes('');
      alert('Hasil turnamen e-sport berhasil diinput dan dipublikasikan!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan hasil';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Input Hasil Pertandingan E-Sport (PES & ML)" 
      subtitle="Pencatatan hasil turnamen e-sport non-akademik ke sistem klasemen dan pengumuman juara resmi."
      actions={
        <Button size="sm" variant="primary" leftIcon={<Plus size={16} weight="bold" />} onClick={() => setModalOpen(true)}>
          + Input Juara / Skor Baru
        </Button>
      }
    >
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Hasil Pertandingan yang Telah Divalidasi</CardTitle>
            <p className="text-xs text-muted-foreground">Data peringkat juara e-sport yang tampil di leaderboard publik</p>
          </CardHeader>
          <CardContent>
            {matchResults.length === 0 ? (
              <EmptyState
                icon={<GameController size={28} weight="duotone" className="text-primary" />}
                title="Belum Ada Hasil Pertandingan"
                description="Turnamen e-sport PES atau Mobile Legends belum memiliki input rekapitulasi juara. Klik tombol di atas untuk menambah entri."
              />
            ) : (
              <div className="divide-y divide-border">
                {matchResults.map((m) => {
                  const comp = competitions.find((c) => c.id === m.competition_id);

                  return (
                    <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--brand-gold)]/15 border border-[var(--brand-gold)]/30 text-[var(--brand-gold-soft)] flex items-center justify-center font-bold font-mono text-sm shrink-0">
                          #{m.position}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground font-[family-name:var(--font-bricolage)]">
                              {m.participant_name}
                            </h4>
                            <Badge variant="primary">{comp?.name || 'Turnamen E-Sport'}</Badge>
                          </div>
                          {m.notes && <p className="text-xs text-muted-foreground">{m.notes}</p>}
                        </div>
                      </div>

                      <div className="text-left sm:text-right text-xs text-muted-foreground font-mono shrink-0">
                        Dicatat: {formatDateShort(m.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Modal Input Hasil Turnamen E-Sport */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Input Juara / Hasil Turnamen E-Sport"
        description="Hasil pertandingan yang dimasukkan akan langsung disahkan dan muncul di Leaderboard publik."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Cabang Turnamen E-Sport <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            >
              {esportComps.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.participation_type})</option>
              ))}
            </select>
          </div>

          <Input
            label="Nama Pemain / Tim (Squad)"
            placeholder="Contoh: Mystic Slayers / Ahmad Fauzi"
            required
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Posisi Peringkat / Gelar <span className="text-destructive">*</span>
            </label>
            <select
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            >
              <option value={1}>Peringkat #1 (Juara 1)</option>
              <option value={2}>Peringkat #2 (Juara 2)</option>
              <option value={3}>Peringkat #3 (Juara 3)</option>
              <option value={4}>Peringkat #4</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Catatan Skor / Informasi Babak (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Menang Final Score 3 - 1"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary min-h-[44px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Simpan &amp; Rilis Hasil
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
