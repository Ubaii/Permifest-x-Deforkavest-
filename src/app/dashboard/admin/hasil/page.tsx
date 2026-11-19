'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { GameController as Gamepad2, Trophy, Plus, CheckCircle, Medal as Award } from '@phosphor-icons/react';

export default function AdminHasilPage() {
  const { matchResults, competitions, addMatchResult } = useAppStore();

  const esportComps = competitions.filter(c => c.type === 'non_academic');

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
      subtitle="Pencatatan hasil pertandingan turnamen e-sport non-akademik ke sistem klasemen resmi."
      actions={
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          + Input Juara / Skor Baru
        </Button>
      }
    >
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Hasil Pertandingan Tersimpan</CardTitle>
          </CardHeader>
          <CardContent>
            {matchResults.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada data hasil pertandingan yang diinput.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {matchResults.map((m) => {
                  const comp = competitions.find(c => c.id === m.competition_id);

                  return (
                    <div key={m.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold font-mono text-sm">
                          #{m.position}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-100">{m.participant_name}</h4>
                            <Badge variant="cyber">{comp?.name || 'Turnamen E-Sport'}</Badge>
                          </div>
                          {m.notes && <p className="text-xs text-slate-400 mt-0.5">{m.notes}</p>}
                        </div>
                      </div>

                      <div className="text-right text-xs text-slate-500 font-mono">
                        Diinput: {formatDateShort(m.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Input Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Input Hasil Pertandingan E-Sport"
        description="Masukkan nama pemain/tim juara dan catatan skor pertandingan."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Cabang E-Sport
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
            >
              {esportComps.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Nama Pemain / Tim"
            placeholder="Contoh: Rafi 'CyberStrike' Kurnia atau Tim Shadow Phoenix"
            required
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Peringkat / Posisi Juara
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
            >
              <option value={1}>Juara 1 (Champion)</option>
              <option value={2}>Juara 2 (Runner Up)</option>
              <option value={3}>Juara 3</option>
              <option value={4}>Semifinalis / Peringkat 4</option>
            </select>
          </div>

          <Input
            label="Catatan Skor / Agregat Pertandingan"
            placeholder="Contoh: Menang 3 - 1 di Grand Final"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Simpan Hasil Pertandingan
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
