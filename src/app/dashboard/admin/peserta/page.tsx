'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { Registration } from '@/lib/types';
import { User, Users, Envelope, Buildings, CalendarBlank, IdentificationCard, ShieldCheck } from '@phosphor-icons/react';

export default function AdminPesertaPage() {
  const { registrations, competitions } = useAppStore();
  const [compFilter, setCompFilter] = useState('all');
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

  const filteredRegistrations = registrations.filter((reg) => {
    return compFilter === 'all' || reg.competition_id === compFilter;
  });

  const columns: Column<Registration & Record<string, unknown>>[] = [
    {
      key: 'user',
      header: 'Peserta & Kontak',
      sortable: true,
      accessor: (r) => r.user?.full_name || '',
      cell: (r) => (
        <div>
          <div className="font-bold text-[var(--foreground)]">{r.user?.full_name}</div>
          <div className="text-[11px] text-[var(--muted-foreground)] font-mono">{r.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'institution',
      header: 'Instansi / Kampus',
      sortable: true,
      accessor: (r) => r.user?.institution || '',
      cell: (r) => (
        <span className="text-[var(--muted-foreground)] font-medium">
          {r.user?.institution || '-'}
        </span>
      ),
    },
    {
      key: 'competition',
      header: 'Kompetisi',
      sortable: true,
      accessor: (r) => r.competition?.name || '',
      cell: (r) => (
        <Badge variant="primary">{r.competition?.name}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      cell: (r) => <StatusBadge status={r.status} domain="registration" />,
    },
    {
      key: 'registered_at',
      header: 'Tanggal Daftar',
      sortable: true,
      cell: (r) => (
        <span className="text-[var(--muted-foreground)] font-mono text-[11px]">
          {formatDateShort(r.registered_at)}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      className: 'text-right',
      cell: (r) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReg(r);
            }}
          >
            Detail
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Manajemen Peserta & Pendaftaran"
      subtitle="Basis data seluruh pendaftar, instansi asal, dan status kelengkapan administrasi."
    >
      <div className="space-y-6">
        <DataTable
          data={filteredRegistrations as (Registration & Record<string, unknown>)[]}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Cari nama, email, kampus..."
          searchableKeys={['id', 'status', 'registered_at']}
          exportFilename="peserta_permifest_deforkafest"
          onRowClick={(item) => setSelectedReg(item as Registration)}
          actionSlot={
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)] shrink-0 font-medium">Filter Lomba:</span>
              <select
                value={compFilter}
                onChange={(e) => setCompFilter(e.target.value)}
                aria-label="Filter cabang lomba"
                className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
              >
                <option value="all">Semua Cabang Lomba</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        {/* Slide-over Detail Drawer */}
        <Drawer
          isOpen={!!selectedReg}
          onClose={() => setSelectedReg(null)}
          size="lg"
        >
          {selectedReg && (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-2">
                  <DrawerTitle>{selectedReg.user?.full_name}</DrawerTitle>
                  <StatusBadge status={selectedReg.status} domain="registration" />
                </div>
                <DrawerDescription>ID Pendaftaran: {selectedReg.id}</DrawerDescription>
              </DrawerHeader>

              <DrawerContent className="space-y-6">
                {/* Informasi Peserta */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[var(--primary)]" />
                    Profil Peserta
                  </h4>
                  <div className="bg-[var(--accent)]/30 border border-[var(--border)] rounded-[var(--radius-md)] p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <IdentificationCard className="w-3.5 h-3.5" /> Nama Lengkap
                      </span>
                      <span className="font-semibold text-[var(--foreground)]">{selectedReg.user?.full_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Envelope className="w-3.5 h-3.5" /> Email
                      </span>
                      <span className="font-mono text-[var(--foreground)]">{selectedReg.user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Buildings className="w-3.5 h-3.5" /> Institusi
                      </span>
                      <span className="font-medium text-[var(--foreground)]">{selectedReg.user?.institution || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Cabang Lomba */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                    Cabang Kompetisi
                  </h4>
                  <div className="bg-[var(--accent)]/30 border border-[var(--border)] rounded-[var(--radius-md)] p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)]">Nama Lomba</span>
                      <span className="font-bold text-[var(--foreground)]">{selectedReg.competition?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)]">Kategori</span>
                      <span className="uppercase text-[11px] font-semibold text-[var(--primary)]">
                        {selectedReg.competition?.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <CalendarBlank className="w-3.5 h-3.5" /> Waktu Mendaftar
                      </span>
                      <span className="font-mono text-[var(--muted-foreground)]">
                        {formatDateShort(selectedReg.registered_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Tim */}
                {selectedReg.team && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-[var(--primary)]" />
                      Detail Tim
                    </h4>
                    <div className="bg-[var(--accent)]/30 border border-[var(--border)] rounded-[var(--radius-md)] p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--muted-foreground)]">Nama Tim</span>
                        <span className="font-bold text-[var(--foreground)]">{selectedReg.team.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--muted-foreground)]">Kode Undangan</span>
                        <span className="font-mono font-bold bg-[var(--card)] px-2 py-0.5 rounded border border-[var(--border)]">
                          {selectedReg.team.invite_code}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </DrawerContent>

              <DrawerFooter>
                <Button variant="outline" size="sm" onClick={() => setSelectedReg(null)}>
                  Tutup
                </Button>
              </DrawerFooter>
            </>
          )}
        </Drawer>
      </div>
    </DashboardLayout>
  );
}
