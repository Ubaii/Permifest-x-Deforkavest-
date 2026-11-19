'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { DownloadSimple, MagnifyingGlass, Users } from '@phosphor-icons/react';

export default function AdminPesertaPage() {
  const { registrations, competitions } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [compFilter, setCompFilter] = useState('all');

  const filtered = registrations.filter((reg) => {
    const matchesSearch = 
      reg.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.user?.institution?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesComp = compFilter === 'all' || reg.competition_id === compFilter;
    return matchesSearch && matchesComp;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Nama', 'Email', 'Institusi', 'Kompetisi', 'Status', 'Tgl Daftar'];
    const rows = filtered.map((r) => [
      r.id,
      `"${r.user?.full_name || ''}"`,
      `"${r.user?.email || ''}"`,
      `"${r.user?.institution || ''}"`,
      `"${r.competition?.name || ''}"`,
      r.status,
      r.registered_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peserta_permifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout 
      title="Manajemen Peserta & Pendaftaran" 
      subtitle="Basis data seluruh pendaftar, instansi asal, dan status kelengkapan administrasi."
      actions={
        <Button size="sm" variant="secondary" leftIcon={<DownloadSimple size={16} weight="bold" />} onClick={exportCSV}>
          Ekspor CSV
        </Button>
      }
    >
      <div className="space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
          <div className="relative w-full sm:w-80">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, email, kampus..."
              className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary min-h-[40px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground shrink-0 font-medium">Filter Lomba:</span>
            <select
              value={compFilter}
              onChange={(e) => setCompFilter(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary min-h-[40px]"
            >
              <option value="all">Semua Cabang Lomba</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel Data Peserta */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Peserta &amp; Kontak</th>
                  <th className="p-4">Instansi</th>
                  <th className="p-4">Kompetisi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Tidak ditemukan peserta dengan kata kunci atau filter tersebut.
                    </td>
                  </tr>
                ) : (
                  filtered.map((reg) => (
                    <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{reg.user?.full_name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{reg.user?.email}</div>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">
                        {reg.user?.institution || '-'}
                      </td>
                      <td className="p-4">
                        <Badge variant="primary">{reg.competition?.name}</Badge>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={reg.status} domain="registration" />
                      </td>
                      <td className="p-4 text-muted-foreground font-mono text-[11px]">
                        {formatDateShort(reg.registered_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
