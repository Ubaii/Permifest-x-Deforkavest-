'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { Submission } from '@/lib/types';
import {
  FileText,
  DownloadSimple,
  ArrowSquareOut,
  Trash,
  CheckCircle,
  Eye,
  Link as LinkIcon,
  Buildings,
} from '@phosphor-icons/react';

export default function AdminSubmissionPage() {
  const { submissions, deleteSubmission, competitions } = useAppStore();

  const [compFilter, setCompFilter] = useState('all');
  const [deleteConfirmSub, setDeleteConfirmSub] = useState<Submission | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const filteredSubmissions = submissions.filter((s) => {
    if (compFilter === 'all') return true;
    return s.registration?.competition_id === compFilter;
  });

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmSub) return;
    await deleteSubmission(deleteConfirmSub.id);
    setAlertSuccess(`Berkas submission "${deleteConfirmSub.file_name || 'karya'}" telah dihapus.`);
    setDeleteConfirmSub(null);
  };

  const columns: Column<Submission & Record<string, unknown>>[] = [
    {
      key: 'file',
      header: 'Karya & Format',
      sortable: true,
      accessor: (s) => s.file_name || s.link_url || '',
      cell: (s) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[var(--accent)] text-[var(--primary)] shrink-0">
            {s.link_url ? <LinkIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          </div>
          <div>
            <div className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <span>{s.file_name || (s.link_url ? 'Tautan Desain Figma' : 'Dokumen Karya')}</span>
              <Badge variant="primary" size="sm">v{s.version}</Badge>
            </div>
            {s.notes && (
              <p className="text-[11px] text-[var(--muted-foreground)] italic truncate max-w-xs" title={s.notes}>
                &quot;{s.notes}&quot;
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'peserta',
      header: 'Peserta & Instansi',
      sortable: true,
      accessor: (s) => s.registration?.user?.full_name || '',
      cell: (s) => (
        <div>
          <div className="font-semibold text-[var(--foreground)]">{s.registration?.user?.full_name}</div>
          <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
            <Buildings className="w-3 h-3" />
            <span>{s.registration?.user?.institution || '-'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'competition',
      header: 'Kompetisi',
      sortable: true,
      accessor: (s) => s.registration?.competition?.name || '',
      cell: (s) => <Badge variant="primary">{s.registration?.competition?.name}</Badge>,
    },
    {
      key: 'submitted_at',
      header: 'Waktu Pengumpulan',
      sortable: true,
      cell: (s) => (
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {formatDateShort(s.submitted_at)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi Berkas',
      className: 'text-right',
      cell: (s) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          {s.link_url ? (
            <a href={s.link_url} target="_blank" rel="noreferrer" title="Buka Tautan Desain Figma">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[var(--foreground)] hover:bg-[var(--accent)]" aria-label="Buka Tautan Figma">
                <ArrowSquareOut className="w-4 h-4" />
              </Button>
            </a>
          ) : s.file_url ? (
            <a href={s.file_url} target="_blank" rel="noreferrer" title="Unduh Berkas Dokumen">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[var(--foreground)] hover:bg-[var(--accent)]" aria-label="Unduh Berkas">
                <DownloadSimple className="w-4 h-4" />
              </Button>
            </a>
          ) : null}

          <Link href={`/dashboard/admin/penilaian?sub_id=${s.id}`} title="Penugasan & Penilaian Dewan Juri">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[var(--primary)] hover:bg-[var(--primary)]/10" aria-label="Penilaian Juri">
              <CheckCircle className="w-4 h-4" weight="bold" />
            </Button>
          </Link>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirmSub(s)}
            className="h-8 w-8 p-0 text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)]"
            title="Hapus Berkas Karya"
            aria-label="Hapus Berkas Karya"
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Gudang Pengumpulan Karya (Submission Archive)"
      subtitle="Periksa keabsahan dokumen proposal, berkas desain, tautan Figma, dan riwayat revisi karya peserta."
      actions={
        <Link href="/dashboard/admin/penilaian">
          <Button size="sm" variant="primary" leftIcon={<CheckCircle className="w-4 h-4" weight="bold" />}>
            Matriks Penilaian Juri &rarr;
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Operasi Berhasil</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-semibold">Filter Lomba:</span>
            <select
              value={compFilter}
              onChange={(e) => setCompFilter(e.target.value)}
              aria-label="Filter cabang lomba"
              className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[36px]"
            >
              <option value="all">Semua Cabang Akademik</option>
              {competitions
                .filter((c) => c.type === 'academic')
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="text-xs text-[var(--muted-foreground)] font-mono">
            Total Berkas Masuk: <strong className="text-[var(--foreground)]">{filteredSubmissions.length}</strong> karya
          </div>
        </div>

        {/* Tabel Data Submission */}
        <DataTable
          data={filteredSubmissions as (Submission & Record<string, unknown>)[]}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Cari karya, nama peserta, kampus..."
          searchableKeys={['file_name', 'link_url', 'notes', 'submitted_at']}
          exportFilename="submission_karya_permifest"
          emptyTitle="Belum Ada Karya Terkumpul"
          emptyDescription="Belum ada berkas karya atau tautan Figma yang dikumpulkan oleh peserta saat ini."
        />

        {/* Dialog Konfirmasi Hapus Berkas */}
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmSub)}
          onClose={() => setDeleteConfirmSub(null)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Berkas Karya Ini?"
          description={`Anda akan menghapus berkas submission "${deleteConfirmSub?.file_name || 'karya'}" milik ${deleteConfirmSub?.registration?.user?.full_name}. Data nilai juri terkait berkas ini akan dibatalkan.`}
          confirmText="Hapus Berkas"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
}
