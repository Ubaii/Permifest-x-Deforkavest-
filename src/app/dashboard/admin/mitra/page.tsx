'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/modal';
import {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
  DrawerFooter,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { Partner, PartnerCategory } from '@/lib/types';
import {
  Handshake,
  Plus,
  PencilSimple,
  Trash,
  CheckCircle,
  XCircle,
  ArrowSquareOut,
  Sparkle,
} from '@phosphor-icons/react';

interface PartnerFormData {
  name: string;
  category: PartnerCategory;
  logo_url: string;
  website_url: string;
  description: string;
  tier: 'utama' | 'platinum' | 'gold' | 'silver' | 'partner';
  order_index: number;
  is_active: boolean;
}

const defaultFormData: PartnerFormData = {
  name: '',
  category: 'organizer',
  logo_url: '/brand/permikomnas.svg',
  website_url: '',
  description: '',
  tier: 'utama',
  order_index: 1,
  is_active: true,
};

export default function AdminMitraPage() {
  const { partners, addPartner, updatePartner, deletePartner, togglePartnerActive } = useAppStore();

  const [categoryFilter, setCategoryFilter] = useState<'all' | PartnerCategory>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>(defaultFormData);
  const [deleteConfirmPartner, setDeleteConfirmPartner] = useState<Partner | null>(null);
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter daftar mitra
  const filteredPartners = useMemo(() => {
    return partners
      .filter((p) => {
        if (categoryFilter === 'all') return true;
        return p.category === categoryFilter;
      })
      .sort((a, b) => a.order_index - b.order_index);
  }, [partners, categoryFilter]);

  const stats = useMemo(() => {
    return {
      total: partners.length,
      active: partners.filter((p) => p.is_active).length,
      organizers: partners.filter(
        (p) => p.category === 'organizer' || p.category === 'kabinet' || p.category === 'co_host'
      ).length,
      sponsors: partners.filter((p) => p.category === 'sponsor').length,
    };
  }, [partners]);

  const openCreateDrawer = () => {
    setEditingPartnerId(null);
    setFormData({
      ...defaultFormData,
      order_index: partners.length + 1,
    });
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (partner: Partner) => {
    setEditingPartnerId(partner.id);
    setFormData({
      name: partner.name,
      category: partner.category,
      logo_url: partner.logo_url,
      website_url: partner.website_url || '',
      description: partner.description || '',
      tier: partner.tier || 'utama',
      order_index: partner.order_index,
      is_active: partner.is_active,
    });
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setDrawerError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error('Nama mitra / instansi wajib diisi.');
      }
      if (!formData.logo_url.trim()) {
        throw new Error('URL / Path logo mitra wajib diisi.');
      }

      if (editingPartnerId) {
        await updatePartner(editingPartnerId, {
          name: formData.name.trim(),
          category: formData.category,
          logo_url: formData.logo_url.trim(),
          website_url: formData.website_url.trim() || undefined,
          description: formData.description.trim() || undefined,
          tier: formData.tier,
          order_index: Number(formData.order_index) || 1,
          is_active: formData.is_active,
        });
        setAlertSuccess(`Data mitra "${formData.name}" berhasil diperbarui!`);
      } else {
        await addPartner({
          name: formData.name.trim(),
          category: formData.category,
          logo_url: formData.logo_url.trim(),
          website_url: formData.website_url.trim() || undefined,
          description: formData.description.trim() || undefined,
          tier: formData.tier,
          order_index: Number(formData.order_index) || 1,
          is_active: formData.is_active,
        });
        setAlertSuccess(`Mitra baru "${formData.name}" berhasil ditambahkan!`);
      }

      setDrawerOpen(false);
    } catch (err) {
      setDrawerError(err instanceof Error ? err.message : 'Gagal menyimpan data mitra.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmPartner) return;
    try {
      await deletePartner(deleteConfirmPartner.id);
      setAlertSuccess(`Mitra "${deleteConfirmPartner.name}" berhasil dihapus.`);
    } catch {
      // Ignored
    } finally {
      setDeleteConfirmPartner(null);
    }
  };

  return (
    <DashboardLayout
      title="Manajemen Mitra &amp; Sponsor"
      subtitle="Kelola logo Permikomnas DIY, Kabinet Nawasena, Deforkafest, IMPSI UST, serta sponsor resmi event."
    >
      <div className="space-y-6">
        {alertSuccess && (
          <Alert variant="success" onClose={() => setAlertSuccess(null)}>
            <AlertTitle>Operasi Berhasil</AlertTitle>
            <AlertDescription>{alertSuccess}</AlertDescription>
          </Alert>
        )}

        {/* ── KPI Ringkasan ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Total Mitra
              </span>
              <span className="text-2xl font-black text-foreground font-[family-name:var(--font-jetbrains)] mt-1 block">
                {stats.total}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Mitra Aktif
              </span>
              <span className="text-2xl font-black text-emerald-400 font-[family-name:var(--font-jetbrains)] mt-1 block">
                {stats.active}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Penyelenggara
              </span>
              <span className="text-2xl font-black text-sky-400 font-[family-name:var(--font-jetbrains)] mt-1 block">
                {stats.organizers}
              </span>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Sponsor Komersial
              </span>
              <span className="text-2xl font-black text-amber-400 font-[family-name:var(--font-jetbrains)] mt-1 block">
                {stats.sponsors}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* ── Action & Filter Bar ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Tab Filter */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-card border border-border text-xs">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'organizer', label: 'Penyelenggara' },
              { id: 'kabinet', label: 'Kabinet Permi' },
              { id: 'co_host', label: 'Co-Host / Deforka' },
              { id: 'sponsor', label: 'Sponsor' },
              { id: 'media_partner', label: 'Media Partner' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  categoryFilter === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={openCreateDrawer}
            className="flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} weight="bold" />
            Tambah Mitra Baru
          </Button>
        </div>

        {/* ── Tabel / Grid Mitra ── */}
        {filteredPartners.length === 0 ? (
          <EmptyState
            icon={<Handshake className="w-8 h-8 text-primary" weight="duotone" />}
            title="Belum Ada Data Mitra"
            description="Tidak ada entitas mitra atau sponsor pada filter kategori yang dipilih."
            action={
              <Button type="button" variant="primary" size="sm" onClick={openCreateDrawer}>
                Tambah Mitra Pertama
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPartners.map((item) => (
              <Card
                key={item.id}
                className={`border transition-all ${
                  item.is_active
                    ? 'border-border bg-card'
                    : 'border-border/50 bg-card/40 opacity-70'
                }`}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge
                        variant={
                          item.category === 'kabinet'
                            ? 'warning'
                            : item.category === 'sponsor'
                            ? 'success'
                            : 'info'
                        }
                      >
                        {item.category === 'kabinet'
                          ? 'Kabinet Nawasena'
                          : item.category === 'sponsor'
                          ? `Sponsor · ${item.tier || 'Partner'}`
                          : item.category === 'co_host'
                          ? 'Deforkafest Co-Host'
                          : 'Penyelenggara Utama'}
                      </Badge>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePartnerActive(item.id)}
                          title={item.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                          className={`text-xs px-2 py-0.5 rounded font-bold transition-colors ${
                            item.is_active
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/40'
                          }`}
                        >
                          {item.is_active ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </div>
                    </div>

                    {/* Logo & Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-background border border-border flex items-center justify-center p-2 shrink-0 overflow-hidden">
                        {item.logo_url.endsWith('.svg') || item.logo_url.startsWith('/') ? (
                          <Image
                            src={item.logo_url}
                            alt={item.name}
                            width={56}
                            height={56}
                            className="max-h-10 w-auto object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs font-black text-primary">
                            {item.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="overflow-hidden">
                        <h4 className="font-extrabold text-sm text-foreground truncate">
                          {item.name}
                        </h4>
                        <span className="text-xs text-muted-foreground block truncate">
                          Urutan Tampil: #{item.order_index}
                        </span>
                        {item.website_url && (
                          <a
                            href={item.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 mt-0.5 truncate"
                          >
                            Tautan web <ArrowSquareOut size={12} weight="bold" />
                          </a>
                        )}
                      </div>
                    </div>

                    {item.description && (
                      <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDrawer(item)}
                      className="text-xs h-8 px-2.5"
                    >
                      <PencilSimple size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmPartner(item)}
                      className="text-xs h-8 px-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                      <Trash size={14} className="mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── Form Drawer (Tambah & Edit) ── */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingPartnerId ? 'Ubah Informasi Mitra' : 'Tambah Mitra / Sponsor Baru'}
        description="Masukkan identitas instansi, kategori entitas (Penyelenggara, Kabinet Nawasena, Deforkafest, IMPSI, atau Sponsor), dan link logo."
      >
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
          <DrawerContent className="space-y-4">
            {drawerError && (
              <Alert variant="destructive">
                <AlertDescription>{drawerError}</AlertDescription>
              </Alert>
            )}

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Nama Mitra / Instansi <span className="text-rose-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Kabinet Nawasena / Permikomnas DIY"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Kategori Entitas <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as PartnerCategory })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="organizer">Penyelenggara Utama (Permikomnas/IMPSI)</option>
                  <option value="kabinet">Kabinet Nawasena</option>
                  <option value="co_host">Deforkafest (Co-Host)</option>
                  <option value="sponsor">Sponsor Komersial</option>
                  <option value="media_partner">Media Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Tier / Tingkatan Sponsor
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="utama">Utama / Penyelenggara</option>
                  <option value="platinum">Platinum Partner</option>
                  <option value="gold">Gold Partner</option>
                  <option value="silver">Silver Partner</option>
                  <option value="partner">Supporting Partner</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  URL / Path Logo <span className="text-rose-400">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="/brand/nawasena.svg atau URL gambar"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Urutan Tampil (Order Index)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value, 10) || 1 })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Tautan Website Resmi / Instagram
              </label>
              <Input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://instagram.com/permikomnas.diy"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Deskripsi Singkat Entitas
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan peran instansi atau bentuk dukungan kerjasama..."
                className="w-full bg-card border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_active_checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="is_active_checkbox" className="text-xs font-bold text-foreground cursor-pointer">
                Tampilkan di Halaman Utama (Status Aktif)
              </label>
            </div>
          </DrawerContent>

          <DrawerFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDrawerOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : editingPartnerId ? 'Simpan Perubahan' : 'Tambah Mitra'}
            </Button>
          </DrawerFooter>
        </form>
      </Drawer>

      {/* ── Confirm Delete Dialog ── */}
      <ConfirmDialog
        isOpen={!!deleteConfirmPartner}
        onClose={() => setDeleteConfirmPartner(null)}
        title="Hapus Data Mitra / Sponsor?"
        description={`Apakah Anda yakin ingin menghapus "${deleteConfirmPartner?.name}" dari daftar mitra resmi? Data yang dihapus tidak akan ditampilkan lagi di beranda.`}
        confirmText="Ya, Hapus Mitra"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
