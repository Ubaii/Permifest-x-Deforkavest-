'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { Registration, RegistrationStatus } from '@/lib/types';
import {
  Users,
  UserPlus,
  PencilSimple,
  Trash,
  IdentificationCard,
  Envelope,
  Buildings,
  Phone,
  ShieldCheck,
  Trophy,
  CalendarBlank,
} from '@phosphor-icons/react';

export default function AdminPesertaPage() {
  const {
    registrations,
    competitions,
    availableUsers,
    addRegistrationManual,
    updateRegistrationStatus,
    deleteRegistration,
  } = useAppStore();

  const [compFilter, setCompFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editStatusReg, setEditStatusReg] = useState<Registration | null>(null);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [deleteConfirmReg, setDeleteConfirmReg] = useState<Registration | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form manual pendaftaran baru
  const [manualUserId, setManualUserId] = useState('');
  const [manualCompId, setManualCompId] = useState(competitions[0]?.id || '');
  const [manualTeamName, setManualTeamName] = useState('');
  const [manualStatus, setManualStatus] = useState<RegistrationStatus>('verified');

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesComp = compFilter === 'all' || reg.competition_id === compFilter;
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    return matchesComp && matchesStatus;
  });

  // Metrik Pendaftaran
  const totalPendaftar = registrations.length;
  const verifiedPendaftar = registrations.filter((r) => r.status === 'verified').length;
  const pendingPayment = registrations.filter((r) => r.status === 'payment_pending').length;
  const totalTeams = registrations.filter((r) => r.team_id || r.team).length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserId || !manualCompId) return;

    setIsSubmitting(true);
    try {
      await addRegistrationManual({
        userId: manualUserId,
        competitionId: manualCompId,
        status: manualStatus,
        teamName: manualTeamName || undefined,
      });
      setAlertSuccess('Pendaftaran peserta baru berhasil ditambahkan secara manual!');
      setModalOpen(false);
      setManualUserId('');
      setManualTeamName('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambahkan pendaftaran';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStatusReg) return;
    await updateRegistrationStatus(editStatusReg.id, editStatusReg.status);
    setAlertSuccess(`Status pendaftaran untuk ${editStatusReg.user?.full_name} berhasil diperbarui.`);
    setEditStatusReg(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmReg) return;
    await deleteRegistration(deleteConfirmReg.id);
    if (selectedReg?.id === deleteConfirmReg.id) {
      setSelectedReg(null);
    }
    setAlertSuccess(`Pendaftaran peserta ${deleteConfirmReg.user?.full_name} telah dihapus.`);
    setDeleteConfirmReg(null);
  };

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
          <div className="text-[10px] text-[var(--muted-foreground)]">{r.user?.institution || '-'}</div>
        </div>
      ),
    },
    {
      key: 'competition',
      header: 'Kompetisi & Kategori',
      sortable: true,
      accessor: (r) => r.competition?.name || '',
      cell: (r) => (
        <div className="space-y-1">
          <Badge variant="primary">{r.competition?.name}</Badge>
          {r.team && (
            <div className="text-[11px] font-semibold text-[var(--foreground)] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Tim: {r.team.name}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status Pendaftaran',
      sortable: true,
      accessor: (r) => r.status,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={r.status} domain="registration" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditStatusReg(r);
            }}
            className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--accent)] transition-colors"
            title="Ubah Status Registrasi"
          >
            <PencilSimple className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
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
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedReg(r)}
            className="text-xs"
          >
            Detail
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirmReg(r)}
            className="text-xs text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)] p-2 min-h-0 min-w-0"
            title="Hapus Pendaftaran"
          >
            <Trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Pendaftaran Peserta & Anggota Tim"
      subtitle="Basis data pendaftar kompetisi, komposisi tim perlombaan, status kelengkapan administrasi, dan ekspor data."
      actions={
        <Button
          size="sm"
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" weight="bold" />}
          onClick={() => setModalOpen(true)}
        >
          + Pendaftaran Manual
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

        {/* Ringkasan Metrik Pendaftaran */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Pendaftar"
            value={totalPendaftar}
            icon={<IdentificationCard className="w-5 h-5 text-[var(--primary)]" weight="bold" />}
            description="Semua registrasi masuk"
          />
          <StatCard
            title="Terverifikasi"
            value={verifiedPendaftar}
            icon={<ShieldCheck className="w-5 h-5 text-[var(--success-text)]" weight="bold" />}
            description="Siap mengikuti lomba"
          />
          <StatCard
            title="Menunggu Bayar"
            value={pendingPayment}
            icon={<CalendarBlank className="w-5 h-5 text-[var(--warning-text)]" weight="bold" />}
            description="Belum melunasi biaya"
          />
          <StatCard
            title="Partisipasi Tim"
            value={totalTeams}
            icon={<Users className="w-5 h-5 text-[var(--primary)]" weight="bold" />}
            description="Regu terdaftar"
          />
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)] font-semibold">Cabang Lomba:</span>
              <select
                value={compFilter}
                onChange={(e) => setCompFilter(e.target.value)}
                aria-label="Filter cabang lomba"
                className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[36px]"
              >
                <option value="all">Semua Cabang Lomba</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)] font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter status pendaftaran"
                className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[36px]"
              >
                <option value="all">Semua Status</option>
                <option value="verified">Terverifikasi</option>
                <option value="payment_pending">Menunggu Pembayaran</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-[var(--muted-foreground)] font-mono">
            Tampil: <strong className="text-[var(--foreground)]">{filteredRegistrations.length}</strong> pendaftaran
          </div>
        </div>

        {/* Tabel Data Registrasi */}
        <DataTable
          data={filteredRegistrations as (Registration & Record<string, unknown>)[]}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Cari nama, email, kampus, tim..."
          searchableKeys={['id', 'status', 'registered_at']}
          exportFilename="data_pendaftaran_permifest"
          onRowClick={(item) => setSelectedReg(item as Registration)}
          emptyTitle="Tidak Ada Pendaftaran"
          emptyDescription="Tidak ditemukan pendaftar dengan kriteria filter tersebut."
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
                    <IdentificationCard className="w-4 h-4 text-[var(--primary)]" />
                    Profil Pendaftar
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
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Buildings className="w-3.5 h-3.5" /> Institusi
                      </span>
                      <span className="font-medium text-[var(--foreground)]">{selectedReg.user?.institution || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> No. WhatsApp
                      </span>
                      <span className="font-mono text-[var(--foreground)]">{selectedReg.user?.phone || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Cabang Lomba */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[var(--primary)]" />
                    Detail Cabang Kompetisi
                  </h4>
                  <div className="bg-[var(--accent)]/30 border border-[var(--border)] rounded-[var(--radius-md)] p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)]">Nama Lomba</span>
                      <span className="font-bold text-[var(--foreground)]">{selectedReg.competition?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)]">Kategori Lomba</span>
                      <span className="uppercase text-[11px] font-semibold text-[var(--primary)]">
                        {selectedReg.competition?.category} ({selectedReg.competition?.type})
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
                      Detail Anggota Tim
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

        {/* Modal Tambah Pendaftaran Manual */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Tambah Pendaftaran Peserta Manual"
          description="Daftarkan akun peserta yang ada ke cabang lomba tertentu tanpa melalui alur pembayaran publik."
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Pilih Akun Pengguna / Peserta *
              </label>
              <select
                required
                value={manualUserId}
                onChange={(e) => setManualUserId(e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
              >
                <option value="">Pilih Peserta...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email}) - {u.institution || 'Tanpa Kampus'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Pilih Cabang Kompetisi *
              </label>
              <select
                required
                value={manualCompId}
                onChange={(e) => setManualCompId(e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
              >
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.participation_type})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Nama Tim (Opsional, untuk lomba beregu)"
              placeholder="Contoh: Garuda Cyber Team"
              value={manualTeamName}
              onChange={(e) => setManualTeamName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Status Registrasi Awal *
              </label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value as RegistrationStatus)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
              >
                <option value="verified">Terverifikasi (Langsung Lunas &amp; Sah)</option>
                <option value="payment_pending">Menunggu Pembayaran</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                Daftarkan Sekarang
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal Ubah Status Registrasi */}
        <Modal
          isOpen={Boolean(editStatusReg)}
          onClose={() => setEditStatusReg(null)}
          title="Ubah Status Registrasi Peserta"
          description={`Ubah status kelengkapan administrasi untuk ${editStatusReg?.user?.full_name}.`}
        >
          {editStatusReg && (
            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                  Status Baru
                </label>
                <select
                  value={editStatusReg.status}
                  onChange={(e) =>
                    setEditStatusReg({
                      ...editStatusReg,
                      status: e.target.value as RegistrationStatus,
                    })
                  }
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
                >
                  <option value="verified">Terverifikasi (Lolos Berkas &amp; Bayar)</option>
                  <option value="payment_pending">Menunggu Pembayaran</option>
                  <option value="rejected">Ditolak / Diskualifikasi</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditStatusReg(null)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Simpan Status
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Dialog Konfirmasi Hapus Pendaftaran */}
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmReg)}
          onClose={() => setDeleteConfirmReg(null)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Data Pendaftaran Ini?"
          description={`Anda akan menghapus pendaftaran peserta "${deleteConfirmReg?.user?.full_name}" pada kompetisi "${deleteConfirmReg?.competition?.name}". Berkas submission terkait juga akan dibatalkan.`}
          confirmText="Hapus Pendaftaran"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
}
