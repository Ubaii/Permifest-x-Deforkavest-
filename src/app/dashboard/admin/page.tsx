'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort, getStatusBadgeVariant, getStatusLabel } from '@/lib/utils';
import {
  Users,
  CreditCard,
  UploadSimple,
  SquaresFour,
  Warning,
  TrendUp,
  ClockCounterClockwise,
} from '@phosphor-icons/react';

export default function AdminOverviewPage() {
  const { registrations, submissions } = useAppStore();

  const pendingPayments = registrations.filter((r) => r.payment?.status === 'uploaded');
  const verifiedPayments = registrations.filter((r) => r.payment?.status === 'verified');
  const totalIncome = verifiedPayments.reduce((acc, r) => acc + (r.payment?.amount || 0), 0);

  return (
    <DashboardLayout
      title="Dashboard Panitia & Administrasi"
      subtitle="Pusat kendali operasional kompetisi, verifikasi transaksi, dan pengawasan penjurian."
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Pendaftar</p>
              <h3 className="text-2xl font-bold font-mono text-primary mt-1">
                {registrations.length}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Dari 5 cabang lomba</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Perlu Verifikasi Bayar</p>
              <h3 className="text-2xl font-bold font-mono text-amber-500 mt-1">
                {pendingPayments.length}
              </h3>
              <p className="text-[10px] text-amber-500 font-medium mt-0.5">SLA maksimal 24 jam</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <CreditCard size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Karya Masuk</p>
              <h3 className="text-2xl font-bold font-mono text-support-lime mt-1">
                {submissions.length}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Akademik &amp; UI/UX</p>
            </div>
            <div className="p-3 rounded-xl bg-support-lime/10 text-support-lime border border-support-lime/20">
              <UploadSimple size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kas Terverifikasi</p>
              <h3 className="text-lg font-bold font-mono text-foreground mt-1 tabular-nums">
                {formatCurrency(totalIncome)}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {verifiedPayments.length} transaksi lunas
              </p>
            </div>
            <div className="p-3 rounded-xl bg-muted text-muted-foreground border border-border">
              <TrendUp size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Immediate action alert if pending payments */}
      {pendingPayments.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Warning size={24} weight="fill" className="text-amber-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-foreground">
                Ada {pendingPayments.length} bukti pembayaran menunggu verifikasi!
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Segera periksa nomor rekening dan foto resi untuk menyetujui atau menolak dengan alasan.
              </p>
            </div>
          </div>
          <Link href="/dashboard/admin/pembayaran">
            <Button size="sm" variant="primary" className="shrink-0 min-h-[36px]">
              Buka Halaman Verifikasi
            </Button>
          </Link>
        </div>
      )}

      {/* Quick shortcuts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/admin/pembayaran"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary transition-colors block"
        >
          <CreditCard size={22} weight="duotone" className="text-primary mb-2" />
          <h4 className="text-xs font-bold text-foreground">Verifikasi Bayar</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Konfirmasi bukti transfer.</p>
        </Link>
        <Link
          href="/dashboard/admin/submission"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary transition-colors block"
        >
          <UploadSimple size={22} weight="duotone" className="text-support-lime mb-2" />
          <h4 className="text-xs font-bold text-foreground">Tugaskan Juri</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Distribusi karya ke dewan juri.</p>
        </Link>
        <Link
          href="/dashboard/admin/hasil"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary transition-colors block"
        >
          <SquaresFour size={22} weight="duotone" className="text-brand-pink mb-2" />
          <h4 className="text-xs font-bold text-foreground">Hasil PES &amp; ML</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Input skor e-sport &amp; klasemen.</p>
        </Link>
        <Link
          href="/dashboard/admin/audit-log"
          className="p-4 rounded-2xl bg-card border border-border hover:border-primary transition-colors block"
        >
          <ClockCounterClockwise size={22} weight="duotone" className="text-brand-gold mb-2" />
          <h4 className="text-xs font-bold text-foreground">Audit Trail</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">Jejak aksi sensitif platform.</p>
        </Link>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pendaftaran Peserta Terkini</CardTitle>
          <Link href="/dashboard/admin/peserta">
            <Button size="sm" variant="ghost">Lihat Semua</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {registrations.slice(0, 5).map((reg) => (
              <div
                key={reg.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground">{reg.user?.full_name}</strong>
                    <span className="text-muted-foreground">
                      ({reg.user?.institution || 'Pelajar/Mahasiswa'})
                    </span>
                    <Badge variant={getStatusBadgeVariant(reg.status)} size="sm">
                      {getStatusLabel(reg.status)}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    Lomba: <span className="text-primary font-medium">{reg.competition?.name}</span>
                  </div>
                </div>

                <div className="text-muted-foreground font-mono text-[11px]">
                  {formatDateShort(reg.registered_at)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
