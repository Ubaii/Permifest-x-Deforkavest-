'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { formatDateShort, getStatusBadgeVariant, getStatusLabel } from '@/lib/utils';
import { Users, Download, Search, Filter, Mail, Phone } from 'lucide-react';

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
    const rows = filtered.map(r => [
      r.id,
      r.user?.full_name || '',
      r.user?.email || '',
      r.user?.institution || '',
      r.competition?.name || '',
      r.status,
      r.registered_at,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
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
      subtitle="Data seluruh peserta, instansi asal, dan status berkas kompetisi."
      actions={
        <Button size="sm" variant="secondary" leftIcon={<Download className="w-4 h-4" />} onClick={exportCSV}>
          Ekspor CSV
        </Button>
      }
    >
      <div className="space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, email, kampus..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 shrink-0">Lomba:</span>
            <select
              value={compFilter}
              onChange={(e) => setCompFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Semua Cabang Lomba</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="p-4">Peserta & Email</th>
                  <th className="p-4">Instansi</th>
                  <th className="p-4">Kompetisi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{reg.user?.full_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{reg.user?.email}</div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {reg.user?.institution || '-'}
                    </td>
                    <td className="p-4">
                      <span className="text-cyan-400 font-medium">{reg.competition?.name}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusBadgeVariant(reg.status)} size="sm">
                        {getStatusLabel(reg.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {formatDateShort(reg.registered_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
