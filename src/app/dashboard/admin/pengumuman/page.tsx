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
import { Bell, Plus, Megaphone, Trash as Trash2 } from '@phosphor-icons/react';

export default function AdminPengumumanPage() {
  const { announcements, competitions, createAnnouncement, currentUser } = useAppStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const comp = competitions.find(c => c.id === selectedCompId);
      await createAnnouncement({
        title,
        excerpt,
        content,
        competition_id: selectedCompId ? selectedCompId : null,
        competition_name: comp?.name,
        is_published: true,
        author_name: currentUser.full_name,
      });

      setModalOpen(false);
      setTitle('');
      setExcerpt('');
      setContent('');
      setSelectedCompId('');
      alert('Pengumuman berhasil diterbitkan!');
    } catch (err: any) {
      alert(err.message || 'Gagal menerbitkan pengumuman');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Manajemen Pengumuman Resmi" 
      subtitle="Publikasikan informasi umum atau spesifik per cabang lomba ke peserta."
      actions={
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          + Buat Pengumuman Baru
        </Button>
      }
    >
      <div className="space-y-6">
        
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Card key={ann.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant={ann.competition_name ? 'info' : 'cyber'}>
                      {ann.competition_name || 'Pengumuman Umum'}
                    </Badge>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatDateShort(ann.published_at)}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{ann.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{ann.excerpt}</p>
                </div>

                <div className="text-right text-xs text-slate-500 shrink-0">
                  Oleh: <strong className="text-slate-300">{ann.author_name}</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Buat Pengumuman Baru"
        description="Pengumuman ini akan langsung terlihat di website publik dan dashboard peserta."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Kompetisi
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
            >
              <option value="">Pengumuman Umum (Semua Peserta & Publik)</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Judul Pengumuman"
            placeholder="Contoh: Perpanjangan Deadline Pengumpulan Esai"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Ringkasan Pendek (Excerpt)"
            placeholder="Ringkasan 1-2 kalimat untuk pratinjau kartu..."
            required
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Isi Konten Lengkap <span className="text-cyan-400">*</span>
            </label>
            <textarea
              required
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              placeholder="Tuliskan detail pengumuman resmi..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              Terbitkan Sekarang
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
