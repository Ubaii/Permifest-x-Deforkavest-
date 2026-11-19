'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { Megaphone, Plus, Bell } from '@phosphor-icons/react';

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
      const comp = competitions.find((c) => c.id === selectedCompId);
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
      alert('Pengumuman resmi panitia berhasil diterbitkan!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menerbitkan pengumuman';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      title="Manajemen Pengumuman Resmi" 
      subtitle="Publikasikan siaran informasi umum atau berita spesifik per cabang perlombaan."
      actions={
        <Button size="sm" variant="primary" leftIcon={<Plus size={16} weight="bold" />} onClick={() => setModalOpen(true)}>
          + Buat Pengumuman Baru
        </Button>
      }
    >
      <div className="space-y-6">
        
        {announcements.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={28} weight="duotone" className="text-primary" />}
            title="Belum Ada Pengumuman"
            description="Panitia belum menerbitkan siaran pengumuman. Klik tombol di atas untuk membuat siaran baru."
          />
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <Card key={ann.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={ann.competition_name ? 'primary' : 'neutral'}>
                        {ann.competition_name || 'Pengumuman Umum'}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {formatDateShort(ann.published_at)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground font-[family-name:var(--font-bricolage)]">{ann.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ann.excerpt || ann.content}</p>
                  </div>

                  <div className="text-left sm:text-right text-xs text-muted-foreground shrink-0 font-mono">
                    Oleh: <strong className="text-foreground">{ann.author_name}</strong>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>

      {/* Modal Buat Pengumuman Baru */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Buat Pengumuman Resmi Baru"
        description="Pengumuman ini akan langsung tampil di portal publik dan dashboard peserta terkait."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Target Cabang Lomba
            </label>
            <select
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary min-h-[44px]"
            >
              <option value="">Pengumuman Global (Seluruh Cabang &amp; Publik)</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Judul Pengumuman"
            placeholder="Contoh: Perpanjangan Batas Waktu Pengumpulan Karya Babak Penyisihan"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Ringkasan Singkat (Excerpt)"
            placeholder="Ringkasan 1-2 kalimat yang tampil di kartu pengumuman..."
            required
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Isi Konten Lengkap <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              rows={5}
              placeholder="Tuliskan isi pengumuman, ketentuan teknis, atau jadwal yang diperbarui secara lengkap..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Publikasikan Sekarang
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
