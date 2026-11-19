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
  UploadCloud, 
  Layers, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  History,
  ShieldAlert
} from 'lucide-react';

export default function AdminOverviewPage() {
  const { currentUser, registrations, competitions, submissions, auditLogs } = useAppStore();

  const pendingPayments = registrations.filter(r => r.payment?.status === 'uploaded');
  const verifiedPayments = registrations.filter(r => r.payment?.status === 'verified');
  const totalIncome = verifiedPayments.reduce((acc, r) => acc + (r.payment?.amount || 0), 0);

  return (
    <DashboardLayout 
      title="Dashboard Panitia & Administrasi" 
      subtitle="Pusat kendali operasional kompetisi, verifikasi transaksi, dan pengawasan penjurian."
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Pendaftar</p>
              <h3 className="text-2xl font-bold font-mono text-cyan-400 mt-1">{registrations.length}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Dari 5 cabang lomba</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Perlu Verifikasi Bayar</p>
              <h3 className="text-2xl font-bold font-mono text-amber-400 mt-1">{pendingPayments.length}</h3>
              <p className="text-[10px] text-amber-400/80 mt-0.5">SLA maks 24 jam</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-950 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Karya Masuk</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">{submissions.length}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Akademik & UI/UX</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Kas Terverifikasi</p>
              <h3 className="text-lg font-bold font-mono text-emerald-400 mt-1">{formatCurrency(totalIncome)}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{verifiedPayments.length} transaksi lunas</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800 text-slate-300">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Immediate action alert if pending payments */}
      {pendingPayments.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">
                Ada {pendingPayments.length} bukti pembayaran menunggu verifikasi!
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Segera periksa nomor rekening dan foto resi untuk menyetujui atau menolak dengan alasan.
              </p>
            </div>
          </div>
          <Link href="/dashboard/admin/pembayaran">
            <Button size="sm" variant="primary" className="shrink-0">
              Buka Halaman Verifikasi
            </Button>
          </Link>
        </div>
      )}

      {/* Quick shortcuts grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/admin/pembayaran" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-colors">
          <CreditCard className="w-5 h-5 text-cyan-400 mb-2" />
          <h4 className="text-xs font-bold text-slate-200">Verifikasi Bayar</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Approve/reject bukti transfer.</p>
        </Link>
        <Link href="/dashboard/admin/submission" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-colors">
          <UploadCloud className="w-5 h-5 text-emerald-400 mb-2" />
          <h4 className="text-xs font-bold text-slate-200">Tugaskan Juri</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Distribusi karya ke dewan juri.</p>
        </Link>
        <Link href="/dashboard/admin/hasil" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-colors">
          <Layers className="w-5 h-5 text-purple-400 mb-2" />
          <h4 className="text-xs font-bold text-slate-200">Hasil PES & ML</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Input skor e-sport & klasemen.</p>
        </Link>
        <Link href="/dashboard/admin/audit-log" className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition-colors">
          <History className="w-5 h-5 text-amber-400 mb-2" />
          <h4 className="text-xs font-bold text-slate-200">Audit Trail</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">Jejak aksi sensitif platform.</p>
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
          <div className="divide-y divide-slate-800">
            {registrations.slice(0, 5).map((reg) => (
              <div key={reg.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-100">{reg.user?.full_name}</strong>
                    <span className="text-slate-500">({reg.user?.institution || 'Pelajar/Mahasiswa'})</span>
                    <Badge variant={getStatusBadgeVariant(reg.status)} size="sm">
                      {getStatusLabel(reg.status)}
                    </Badge>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Lomba: <span className="text-cyan-400">{reg.competition?.name}</span>
                  </div>
                </div>

                <div className="text-slate-400 font-mono text-[11px]">
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
