'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { WorkflowNode, WorkflowNodeType, WorkflowNodeStatus } from '@/lib/types';
import {
  GitFork,
  Plus,
  PencilSimple,
  Trash,
  CheckCircle,
  ArrowDown,
  ArrowUp,
  MapPin,
  Flag,
  UploadSimple,
  Calendar,
  Check,
  PlayCircle,
} from '@phosphor-icons/react';

interface WorkflowNodeFormData {
  title: string;
  competition_id: string;
  type: WorkflowNodeType;
  order_index: number;
  parent_id: string;
  start_date: string;
  end_date: string;
  status: WorkflowNodeStatus;
  location: string;
  instructions: string;
  is_milestone: boolean;
  requires_action: boolean;
}

const defaultFormData: WorkflowNodeFormData = {
  title: '',
  competition_id: '',
  type: 'registration',
  order_index: 1,
  parent_id: '',
  start_date: '2026-11-01',
  end_date: '2026-12-11',
  status: 'upcoming',
  location: 'Portal Online Permifest',
  instructions: '',
  is_milestone: false,
  requires_action: false,
};

const NODE_TYPE_MAP: Record<WorkflowNodeType, { label: string; badgeClass: string }> = {
  registration: { label: 'Pendaftaran & Bayar', badgeClass: 'bg-primary/10 border-primary/25 text-primary' },
  screening: { label: 'Kurasi / Administrasi', badgeClass: 'bg-zinc-500/10 border-zinc-500/25 text-zinc-700 dark:text-zinc-300' },
  submission: { label: 'Unggah Berkas Karya', badgeClass: 'bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400' },
  judging: { label: 'Penjurian (Review)', badgeClass: 'bg-purple-500/10 border-purple-500/25 text-purple-700 dark:text-purple-400' },
  announcement: { label: 'Pengumuman Lolos', badgeClass: 'bg-sky-500/10 border-sky-500/25 text-sky-700 dark:text-sky-400' },
  tm: { label: 'Technical Meeting', badgeClass: 'bg-teal-500/10 border-teal-500/25 text-teal-700 dark:text-teal-400' },
  final: { label: 'Babak Final & Match', badgeClass: 'bg-rose-500/10 border-rose-500/25 text-rose-700 dark:text-rose-400' },
  ceremony: { label: 'Awarding Night', badgeClass: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400' },
};

const STATUS_MAP: Record<WorkflowNodeStatus, { label: string; dotClass: string; badgeClass: string }> = {
  completed: { label: 'Selesai', dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-400' },
  active: { label: 'Sedang Berlangsung', dotClass: 'bg-primary animate-pulse', badgeClass: 'bg-primary/10 border-primary/25 text-primary' },
  upcoming: { label: 'Mendatang', dotClass: 'bg-muted-foreground', badgeClass: 'bg-muted border-border text-muted-foreground' },
  blocked: { label: 'Ditunda / Terkunci', dotClass: 'bg-destructive', badgeClass: 'bg-destructive/10 border-destructive/25 text-destructive' },
};

export default function AdminWorkflowPage() {
  const store = useAppStore();
  const rawNodes = store?.workflowNodes;
  const nodes = useMemo(() => (Array.isArray(rawNodes) ? rawNodes : []), [rawNodes]);
  const rawComps = store?.competitions;
  const competitions = useMemo(() => (Array.isArray(rawComps) ? rawComps : []), [rawComps]);
  const { addWorkflowNode, updateWorkflowNode, deleteWorkflowNode, updateWorkflowNodeStatus, reorderWorkflowNodes } = store;

  const [selectedCompFilter, setSelectedCompFilter] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<WorkflowNodeFormData>(defaultFormData);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<WorkflowNode | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filtered & Sorted Nodes
  const filteredNodes = useMemo(() => {
    return nodes
      .filter((n) => {
        if (selectedCompFilter === 'all') return true;
        if (selectedCompFilter === 'global') return !n.competition_id;
        return n.competition_id === selectedCompFilter;
      })
      .sort((a, b) => a.order_index - b.order_index);
  }, [nodes, selectedCompFilter]);

  // Statistik ringkas
  const stats = useMemo(() => {
    return {
      total: filteredNodes.length,
      completed: filteredNodes.filter((n) => n.status === 'completed').length,
      active: filteredNodes.filter((n) => n.status === 'active').length,
      milestones: filteredNodes.filter((n) => n.is_milestone).length,
    };
  }, [filteredNodes]);

  const openCreateDrawer = () => {
    setEditingId(null);
    setFormData({
      ...defaultFormData,
      competition_id: selectedCompFilter === 'all' || selectedCompFilter === 'global' ? '' : selectedCompFilter,
      order_index: filteredNodes.length + 1,
      parent_id: filteredNodes.length > 0 ? filteredNodes[filteredNodes.length - 1].id : '',
    });
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (node: WorkflowNode) => {
    setEditingId(node.id);
    setFormData({
      title: node.title,
      competition_id: node.competition_id || '',
      type: node.type,
      order_index: node.order_index,
      parent_id: node.parent_id || '',
      start_date: node.start_date,
      end_date: node.end_date || '',
      status: node.status,
      location: node.location,
      instructions: node.instructions,
      is_milestone: node.is_milestone,
      requires_action: node.requires_action,
    });
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDrawerError(null);

    if (!formData.title.trim()) {
      setDrawerError('Judul tahapan alur wajib diisi');
      return;
    }

    const matchedComp = competitions.find((c) => c.id === formData.competition_id);

    setSubmitting(true);
    try {
      if (editingId) {
        await updateWorkflowNode(editingId, {
          title: formData.title.trim(),
          competition_id: formData.competition_id || undefined,
          competition_name: matchedComp?.name || undefined,
          type: formData.type,
          order_index: Number(formData.order_index) || 1,
          parent_id: formData.parent_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          status: formData.status,
          location: formData.location.trim(),
          instructions: formData.instructions.trim(),
          is_milestone: formData.is_milestone,
          requires_action: formData.requires_action,
        });
        setAlertSuccess(`Tahapan "${formData.title}" berhasil diperbarui.`);
      } else {
        await addWorkflowNode({
          title: formData.title.trim(),
          competition_id: formData.competition_id || undefined,
          competition_name: matchedComp?.name || undefined,
          type: formData.type,
          order_index: Number(formData.order_index) || filteredNodes.length + 1,
          parent_id: formData.parent_id || null,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          status: formData.status,
          location: formData.location.trim(),
          instructions: formData.instructions.trim(),
          is_milestone: formData.is_milestone,
          requires_action: formData.requires_action,
        });
        setAlertSuccess(`Tahapan baru "${formData.title}" berhasil ditambahkan.`);
      }

      setDrawerOpen(false);
      setTimeout(() => setAlertSuccess(null), 4000);
    } catch (err) {
      setDrawerError(err instanceof Error ? err.message : 'Gagal menyimpan tahapan alur');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === filteredNodes.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...filteredNodes];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Normalisasikan nomor urut
    const updated = reordered.map((item, idx) => ({
      ...item,
      order_index: idx + 1,
    }));

    await reorderWorkflowNodes(updated);
    setAlertSuccess('Urutan tahapan berhasil diperbarui.');
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  const handleQuickStatus = async (node: WorkflowNode, nextStatus: WorkflowNodeStatus) => {
    await updateWorkflowNodeStatus(node.id, nextStatus);
    setAlertSuccess(`Status tahapan "${node.title}" diubah menjadi "${STATUS_MAP[nextStatus].label}".`);
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  const handleDelete = async () => {
    if (!deleteConfirmTarget) return;
    try {
      await deleteWorkflowNode(deleteConfirmTarget.id);
      setAlertSuccess(`Tahapan "${deleteConfirmTarget.title}" berhasil dihapus.`);
      setDeleteConfirmTarget(null);
      setTimeout(() => setAlertSuccess(null), 4000);
    } catch {
      setDrawerError('Gagal menghapus tahapan alur.');
    }
  };

  const formatDateRange = (start: string, end?: string) => {
    try {
      const d1 = new Date(start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      if (!end || end === start) return d1;
      const d2 = new Date(end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${d1} - ${d2}`;
    } catch {
      return start;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <GitFork size={22} weight="duotone" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-[family-name:var(--font-bricolage)] text-foreground tracking-tight">
                Pohon Alur Perlombaan (Workflow Tree)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Atur diagram alur tahapan perlombaan (registrasi, kurasi, penyisihan, TM, hingga awarding) secara dinamis per cabang lomba.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={openCreateDrawer}
            leftIcon={<Plus size={18} weight="bold" />}
          >
            Tambah Tahapan (Node)
          </Button>
        </div>

        {/* ── Feedback Alert ── */}
        {alertSuccess && (
          <Alert variant="default" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
            <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400" />
            <AlertTitle>Operasi Berhasil</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {/* ── Statistik Ringkas ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Total Tahapan
                </p>
                <p className="text-2xl font-black font-[family-name:var(--font-jetbrains)] text-foreground mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <GitFork size={22} weight="duotone" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sedang Aktif (Live)
                </p>
                <p className="text-2xl font-black font-[family-name:var(--font-jetbrains)] text-primary mt-1">
                  {stats.active}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <PlayCircle size={22} weight="duotone" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tahapan Selesai
                </p>
                <p className="text-2xl font-black font-[family-name:var(--font-jetbrains)] text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.completed}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Check size={22} weight="bold" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Milestone Kunci
                </p>
                <p className="text-2xl font-black font-[family-name:var(--font-jetbrains)] text-amber-600 dark:text-amber-400 mt-1">
                  {stats.milestones}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Flag size={22} weight="duotone" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Filter Cabang Lomba ── */}
        <div className="bg-card p-3 rounded-2xl border border-border flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-3 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCompFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] cursor-pointer ${
              selectedCompFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Semua Alur ({nodes.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCompFilter('global')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] cursor-pointer ${
              selectedCompFilter === 'global'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Alur Umum / Publik ({nodes.filter((n) => !n.competition_id).length})
          </button>
          {competitions.map((comp) => {
            const count = nodes.filter((n) => n.competition_id === comp.id).length;
            const isActive = selectedCompFilter === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedCompFilter(comp.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {comp.name} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>

        {/* ── Interactive Workflow Tree Visualization ── */}
        {filteredNodes.length === 0 ? (
          <EmptyState
            title="Belum ada tahapan alur untuk filter ini"
            description="Tambahkan tahapan alur lomba baru untuk memulai susunan workflow."
            action={
              <Button variant="primary" size="sm" onClick={openCreateDrawer}>
                Tambah Tahapan Baru
              </Button>
            }
          />
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-border">
            {filteredNodes.map((node, index) => {
              const typeMeta = NODE_TYPE_MAP[node.type] || NODE_TYPE_MAP.registration;
              const statusMeta = STATUS_MAP[node.status] || STATUS_MAP.upcoming;

              return (
                <div key={node.id} className="relative group">
                  {/* Timeline Node Bullet on the Left Line */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full border-2 border-card flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                      node.status === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : node.status === 'active'
                        ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(155,107,242,0.8)]'
                        : 'bg-muted border-border text-muted-foreground'
                    }`}
                  >
                    {node.status === 'completed' ? (
                      <Check size={12} weight="bold" />
                    ) : (
                      <span className="text-[10px] font-bold">{node.order_index}</span>
                    )}
                  </div>

                  {/* Node Card */}
                  <div
                    className={`rounded-2xl border p-5 bg-card transition-all ${
                      node.status === 'active'
                        ? 'border-primary shadow-sm ring-1 ring-primary/30'
                        : node.status === 'completed'
                        ? 'border-emerald-500/40 bg-card'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${typeMeta.badgeClass}`}>
                            {typeMeta.label}
                          </span>

                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                            <span>{statusMeta.label}</span>
                          </span>

                          {node.is_milestone && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                              <Flag size={11} weight="fill" />
                              <span>Milestone Kunci</span>
                            </span>
                          )}

                          {node.requires_action && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/25">
                              <UploadSimple size={11} weight="bold" />
                              <span>Perlu Aksi Peserta</span>
                            </span>
                          )}
                        </div>

                        <h3 className="font-[family-name:var(--font-bricolage)] font-bold text-base sm:text-lg text-foreground leading-snug">
                          {node.title}
                        </h3>

                        {node.instructions && (
                          <p className="text-xs text-muted-foreground leading-relaxed mt-2 max-w-2xl">
                            {node.instructions}
                          </p>
                        )}

                        {/* Metadata Tanggal & Tempat */}
                        <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-primary" weight="bold" />
                            <span>{formatDateRange(node.start_date, node.end_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-primary" weight="bold" />
                            <span>{node.location}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Tools: Quick Status, Reorder, Edit, Delete */}
                      <div className="flex items-center gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        {/* Status switcher quick actions */}
                        {node.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(node, 'completed')}
                            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer"
                            title="Tandai Selesai"
                          >
                            <Check size={14} weight="bold" />
                            <span className="hidden md:inline">Selesai</span>
                          </button>
                        )}

                        {node.status !== 'active' && (
                          <button
                            type="button"
                            onClick={() => handleQuickStatus(node, 'active')}
                            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-primary bg-primary/10 border border-primary/25 hover:bg-primary/20 transition-all flex items-center gap-1 cursor-pointer"
                            title="Aktifkan Tahapan"
                          >
                            <PlayCircle size={14} weight="bold" />
                            <span className="hidden md:inline">Aktifkan</span>
                          </button>
                        )}

                        {/* Geser Urutan */}
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 border border-border transition-colors cursor-pointer"
                          title="Geser Naik"
                        >
                          <ArrowUp size={15} weight="bold" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === filteredNodes.length - 1}
                          className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 border border-border transition-colors cursor-pointer"
                          title="Geser Turun"
                        >
                          <ArrowDown size={15} weight="bold" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditDrawer(node)}
                          className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors cursor-pointer"
                          title="Edit Tahapan"
                        >
                          <PencilSimple size={15} weight="bold" />
                        </button>

                        {/* Hapus */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmTarget(node)}
                          className="p-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border transition-colors cursor-pointer"
                          title="Hapus Tahapan"
                        >
                          <Trash size={15} weight="bold" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Drawer Form Tambah / Edit Node ── */}
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={editingId ? 'Edit Tahapan Alur' : 'Tambah Tahapan Alur Baru'}
          description="Sesuaikan jadwal, instruksi peserta, dan status alur lomba."
          size="lg"
        >
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
            <DrawerContent className="space-y-4">
              {drawerError && (
                <Alert variant="destructive">
                  <AlertTitle>Kesalahan Formulir</AlertTitle>
                  <AlertDescription>{drawerError}</AlertDescription>
                </Alert>
              )}

              {/* Judul Tahapan */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Nama Tahapan Alur <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="misal: Batas Pengumpulan Berkas Karya & Link Figma"
                />
              </div>

              {/* Cabang Lomba & Tipe */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Cabang Lomba Terkait
                  </label>
                  <select
                    value={formData.competition_id}
                    onChange={(e) => setFormData({ ...formData, competition_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Alur Umum (Berlaku untuk Semua)</option>
                    {competitions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Kategori / Jenis Tahapan <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkflowNodeType })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="registration">Pendaftaran & Pembayaran</option>
                    <option value="screening">Kurasi / Seleksi Berkas</option>
                    <option value="submission">Pengumpulan Berkas Karya</option>
                    <option value="judging">Penjurian & Evaluasi Skor</option>
                    <option value="announcement">Pengumuman Lolos Final</option>
                    <option value="tm">Technical Meeting (TM)</option>
                    <option value="final">Babak Final & Matchday</option>
                    <option value="ceremony">Awarding Night & Penganugerahan</option>
                  </select>
                </div>
              </div>

              {/* Tanggal & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Tanggal Mulai <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Tanggal Selesai
                  </label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Status Tahapan <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkflowNodeStatus })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="upcoming">Mendatang (Upcoming)</option>
                    <option value="active">Sedang Berlangsung (Active)</option>
                    <option value="completed">Selesai (Completed)</option>
                    <option value="blocked">Terkunci / Ditunda</option>
                  </select>
                </div>
              </div>

              {/* Lokasi & Nomor Urut */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Lokasi / Platform Pelaksanaan <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="misal: Kampus 1 UST Yogyakarta / Portal Online"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Nomor Urutan
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Instruksi untuk Peserta */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Instruksi / Penjelasan untuk Peserta
                </label>
                <textarea
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Jelaskan apa yang harus dilakukan peserta pada tahapan ini..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Checkboxes: Milestone & Aksi */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_milestone"
                    checked={formData.is_milestone}
                    onChange={(e) => setFormData({ ...formData, is_milestone: e.target.checked })}
                    className="w-4 h-4 rounded text-primary bg-background border-border focus:ring-primary"
                  />
                  <label htmlFor="is_milestone" className="text-xs text-foreground cursor-pointer select-none">
                    <strong>Milestone Kunci</strong> (penanda babak penting seperti Pengumuman atau Final)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requires_action"
                    checked={formData.requires_action}
                    onChange={(e) => setFormData({ ...formData, requires_action: e.target.checked })}
                    className="w-4 h-4 rounded text-primary bg-background border-border focus:ring-primary"
                  />
                  <label htmlFor="requires_action" className="text-xs text-foreground cursor-pointer select-none">
                    <strong>Membutuhkan Aksi Peserta</strong> (misal unggah berkas karya atau hadir di ruang Zoom/UST)
                  </label>
                </div>
              </div>
            </DrawerContent>

            <DrawerFooter className="p-6 border-t border-border flex flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDrawerOpen(false)}
                disabled={submitting}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={submitting}
              >
                {submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambahkan Tahapan'}
              </Button>
            </DrawerFooter>
          </form>
        </Drawer>

        {/* ── Dialog Konfirmasi Hapus ── */}
        <ConfirmDialog
          isOpen={Boolean(deleteConfirmTarget)}
          onClose={() => setDeleteConfirmTarget(null)}
          onConfirm={handleDelete}
          title="Hapus Tahapan Alur?"
          description={`Apakah kamu yakin ingin menghapus tahapan "${deleteConfirmTarget?.title}"?`}
          confirmText="Ya, Hapus Tahapan"
          cancelText="Batal"
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  );
}
