'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useAppStore } from '@/lib/store';
import { User, UserRole } from '@/lib/types';
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
  ClipboardText,
  CheckCircle,
} from '@phosphor-icons/react';

interface UserFormData {
  full_name: string;
  email: string;
  role: UserRole;
  institution?: string;
  phone?: string;
}

const defaultUserFormData: UserFormData = {
  full_name: '',
  email: '',
  role: 'peserta',
  institution: '',
  phone: '',
};

export default function AdminPenggunaPage() {
  const { availableUsers, registrations, judgeAssignments, addUser, updateUser, deleteUser, currentUser } = useAppStore();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>(defaultUserFormData);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = availableUsers.filter((u) => {
    return roleFilter === 'all' || u.role === roleFilter;
  });

  // Statistik pengguna
  const pesertaCount = availableUsers.filter((u) => u.role === 'peserta').length;
  const juriCount = availableUsers.filter((u) => u.role === 'juri').length;
  const panitiaCount = availableUsers.filter((u) => u.role === 'panitia').length;
  const adminCount = availableUsers.filter((u) => u.role === 'super_admin').length;

  const openCreateModal = () => {
    setEditingUserId(null);
    setFormData(defaultUserFormData);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      institution: user.institution || '',
      phone: user.phone || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          institution: formData.institution,
          phone: formData.phone,
        });
        setAlertSuccess(`Data pengguna "${formData.full_name}" berhasil diperbarui!`);
      } else {
        await addUser({
          full_name: formData.full_name,
          email: formData.email,
          role: formData.role,
          institution: formData.institution,
          phone: formData.phone,
          email_verified: true,
        });
        setAlertSuccess(`Pengguna baru "${formData.full_name}" dengan peran ${formData.role.toUpperCase()} berhasil dibuat!`);
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmUser) return;
    if (deleteConfirmUser.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun yang sedang aktif digunakan.');
      setDeleteConfirmUser(null);
      return;
    }
    await deleteUser(deleteConfirmUser.id);
    if (selectedUser?.id === deleteConfirmUser.id) {
      setSelectedUser(null);
    }
    setAlertSuccess(`Akun pengguna "${deleteConfirmUser.full_name}" telah dihapus dari sistem.`);
    setDeleteConfirmUser(null);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="primary">Super Admin</Badge>;
      case 'panitia':
        return <Badge variant="info">Panitia</Badge>;
      case 'juri':
        return <Badge variant="cyber">Dewan Juri</Badge>;
      case 'peserta':
      default:
        return <Badge variant="neutral">Peserta</Badge>;
    }
  };

  const columns: Column<User & Record<string, unknown>>[] = [
    {
      key: 'full_name',
      header: 'Nama & Email Pengguna',
      sortable: true,
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] font-bold text-xs shrink-0">
            {u.full_name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-[var(--foreground)]">{u.full_name}</div>
            <div className="text-[11px] text-[var(--muted-foreground)] font-mono">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Peran (Role)',
      sortable: true,
      cell: (u) => getRoleBadge(u.role),
    },
    {
      key: 'institution',
      header: 'Instansi / Kampus',
      sortable: true,
      cell: (u) => (
        <span className="text-[var(--muted-foreground)] font-medium text-xs">
          {u.institution || '-'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Kontak WhatsApp',
      sortable: true,
      cell: (u) => (
        <span className="font-mono text-xs text-[var(--muted-foreground)]">
          {u.phone || '-'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Aksi',
      className: 'text-right',
      cell: (u) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedUser(u)}
            className="text-xs"
          >
            Detail
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditModal(u)}
            className="text-xs p-2 min-h-0 min-w-0"
            title="Edit Pengguna"
          >
            <PencilSimple className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteConfirmUser(u)}
            className="text-xs text-[var(--destructive-text)] hover:bg-[var(--destructive-bg)] p-2 min-h-0 min-w-0"
            title="Hapus Akun"
            disabled={u.id === currentUser.id}
          >
            <Trash className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  // Ambil riwayat pendaftaran atau penugasan user terpilih
  const userRegistrations = selectedUser ? registrations.filter((r) => r.user_id === selectedUser.id) : [];
  const userAssignments = selectedUser ? judgeAssignments.filter((a) => a.judge_id === selectedUser.id) : [];

  return (
    <DashboardLayout
      title="Manajemen Pengguna Sistem"
      subtitle="Kelola seluruh akun pengguna platform: peserta lomba, dewan juri penilai, panitia, dan super admin."
      actions={
        <Button
          size="sm"
          variant="primary"
          leftIcon={<UserPlus className="w-4 h-4" weight="bold" />}
          onClick={openCreateModal}
        >
          + Tambah Pengguna Baru
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

        {/* Ringkasan Jumlah Pengguna Berdasarkan Role */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Peserta"
            value={pesertaCount}
            icon={<Users className="w-5 h-5 text-[var(--primary)]" weight="bold" />}
            description="Pendaftar kompetisi"
          />
          <StatCard
            title="Dewan Juri"
            value={juriCount}
            icon={<ClipboardText className="w-5 h-5 text-[var(--primary)]" weight="bold" />}
            description="Penilai rubrik karya"
          />
          <StatCard
            title="Panitia Operasional"
            value={panitiaCount}
            icon={<ShieldCheck className="w-5 h-5 text-[var(--primary)]" weight="bold" />}
            description="Verifikator & pelaksana"
          />
          <StatCard
            title="Super Admin"
            value={adminCount}
            icon={<IdentificationCard className="w-5 h-5 text-[var(--primary)]" weight="bold" />}
            description="Akses konfigurasi penuh"
          />
        </div>

        {/* Filter Tab Role */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--card)] border border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--muted-foreground)] mr-1">Filter Peran:</span>
            {[
              { id: 'all', label: `Semua (${availableUsers.length})` },
              { id: 'peserta', label: `Peserta (${pesertaCount})` },
              { id: 'juri', label: `Juri (${juriCount})` },
              { id: 'panitia', label: `Panitia (${panitiaCount})` },
              { id: 'super_admin', label: `Admin (${adminCount})` },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setRoleFilter(st.id)}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold transition-colors min-h-[36px] ${
                  roleFilter === st.id
                    ? 'bg-[var(--primary)] text-white shadow-xs'
                    : 'bg-[var(--accent)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] border border-[var(--border)]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-[var(--muted-foreground)] font-mono">
            Tampil: <strong className="text-[var(--foreground)]">{filteredUsers.length}</strong> pengguna
          </div>
        </div>

        {/* Tabel Data Pengguna */}
        <DataTable
          data={filteredUsers as (User & Record<string, unknown>)[]}
          columns={columns}
          keyExtractor={(item) => item.id}
          searchPlaceholder="Cari nama, email, kampus, WhatsApp..."
          searchableKeys={['full_name', 'email', 'institution', 'phone', 'role']}
          exportFilename="data_pengguna_permifest"
          onRowClick={(item) => setSelectedUser(item as User)}
          emptyTitle="Tidak Ada Pengguna"
          emptyDescription="Tidak ditemukan pengguna dengan kriteria pencarian atau filter peran tersebut."
        />

        {/* Modal Tambah & Ubah Pengguna */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingUserId ? 'Ubah Profil & Hak Akses Pengguna' : 'Tambah Pengguna Baru'}
          description="Atur identitas, peran sistem (RBAC), dan informasi kontak."
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Lengkap *"
              placeholder="Contoh: Budi Pratama, S.Kom"
              required
              value={formData.full_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
            />

            <Input
              label="Alamat Email *"
              type="email"
              placeholder="user@permifest.id"
              required
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            />

            <div>
              <label className="block text-xs font-medium text-[var(--foreground)] mb-1.5">
                Peran Pengguna (Role) *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius-md)] px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] min-h-[40px]"
              >
                <option value="peserta">Peserta (Daftar & Kumpul Karya)</option>
                <option value="juri">Juri (Evaluasi Rubrik Penilaian)</option>
                <option value="panitia">Panitia (Verifikasi Pembayaran & Operasional)</option>
                <option value="super_admin">Super Admin (Akses Penuh Sistem)</option>
              </select>
            </div>

            <Input
              label="Instansi / Kampus / Asal Lembaga"
              placeholder="Contoh: Universitas Indonesia / Komunitas IT"
              value={formData.institution}
              onChange={(e) => setFormData((prev) => ({ ...prev, institution: e.target.value }))}
            />

            <Input
              label="Nomor WhatsApp"
              placeholder="Contoh: 081234567890"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                {editingUserId ? 'Simpan Perubahan' : 'Buat Pengguna'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Drawer Detail Pengguna */}
        <Drawer
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          size="lg"
        >
          {selectedUser && (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-2">
                  <DrawerTitle>{selectedUser.full_name}</DrawerTitle>
                  {getRoleBadge(selectedUser.role)}
                </div>
                <DrawerDescription>ID Pengguna: {selectedUser.id}</DrawerDescription>
              </DrawerHeader>

              <DrawerContent className="space-y-6">
                {/* Informasi Akun */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                    <IdentificationCard className="w-4 h-4 text-[var(--primary)]" />
                    Profil Akun
                  </h4>
                  <div className="bg-[var(--accent)]/30 border border-[var(--border)] rounded-[var(--radius-md)] p-4 space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Envelope className="w-3.5 h-3.5" /> Email
                      </span>
                      <span className="font-mono text-[var(--foreground)]">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Buildings className="w-3.5 h-3.5" /> Asal Instansi
                      </span>
                      <span className="font-medium text-[var(--foreground)]">{selectedUser.institution || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border)]/50">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> WhatsApp
                      </span>
                      <span className="font-mono text-[var(--foreground)]">{selectedUser.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Status Email
                      </span>
                      <span className="font-semibold text-[var(--success-text)]">Terverifikasi</span>
                    </div>
                  </div>
                </div>

                {/* Riwayat Pendaftaran (Jika Peserta) */}
                {selectedUser.role === 'peserta' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-[var(--primary)]" />
                      Kompetisi yang Diikuti ({userRegistrations.length})
                    </h4>
                    {userRegistrations.length === 0 ? (
                      <p className="text-xs text-[var(--muted-foreground)] italic">Peserta belum mendaftar di cabang lomba manapun.</p>
                    ) : (
                      <div className="space-y-2">
                        {userRegistrations.map((reg) => (
                          <div
                            key={reg.id}
                            className="p-3 rounded-[var(--radius-md)] bg-[var(--card)] border border-[var(--border)] text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-[var(--foreground)] block">{reg.competition?.name}</span>
                              <span className="text-[11px] text-[var(--muted-foreground)]">Status: {reg.status}</span>
                            </div>
                            <Badge variant="primary" size="sm">
                              {reg.payment?.status === 'verified' ? 'Lunas' : 'Belum Lunas'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Riwayat Penugasan (Jika Juri) */}
                {selectedUser.role === 'juri' && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] flex items-center gap-1.5">
                      <ClipboardText className="w-4 h-4 text-[var(--primary)]" />
                      Karya yang Ditugaskan ({userAssignments.length})
                    </h4>
                    {userAssignments.length === 0 ? (
                      <p className="text-xs text-[var(--muted-foreground)] italic">Belum ada karya yang ditugaskan ke juri ini.</p>
                    ) : (
                      <div className="space-y-2">
                        {userAssignments.map((assign) => (
                          <div
                            key={assign.id}
                            className="p-3 rounded-[var(--radius-md)] bg-[var(--card)] border border-[var(--border)] text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-[var(--foreground)] block">
                                {assign.submission?.file_name || 'Karya Peserta'}
                              </span>
                              <span className="text-[11px] text-[var(--muted-foreground)]">
                                Status: {assign.status === 'completed' ? 'Selesai Dinilai' : 'Sedang Menilai'}
                              </span>
                            </div>
                            <Badge variant={assign.status === 'completed' ? 'success' : 'neutral'} size="sm">
                              {assign.status === 'completed' ? 'Selesai' : 'Pending'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </DrawerContent>

              <DrawerFooter>
                <div className="flex items-center justify-between w-full">
                  <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                    Tutup
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<PencilSimple className="w-3.5 h-3.5" />}
                    onClick={() => {
                      const u = selectedUser;
                      setSelectedUser(null);
                      openEditModal(u);
                    }}
                  >
                    Edit Profil
                  </Button>
                </div>
              </DrawerFooter>
            </>
          )}
        </Drawer>

        {/* Dialog Konfirmasi Hapus Akun */}
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmUser)}
          onClose={() => setDeleteConfirmUser(null)}
          onConfirm={handleDeleteConfirm}
          title="Hapus Akun Pengguna Ini?"
          description={`Anda akan menghapus pengguna "${deleteConfirmUser?.full_name}" (${deleteConfirmUser?.email}). Tindakan ini akan mencabut akses login pengguna.`}
          confirmText="Hapus Akun"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
}
