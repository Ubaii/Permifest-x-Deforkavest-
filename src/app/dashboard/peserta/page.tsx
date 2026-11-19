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
  Trophy, 
  CreditCard, 
  CloudArrowUp as UploadCloud, 
  Medal as Award, 
  ArrowRight, 
  WarningCircle as AlertCircle, 
  CheckCircle as CheckCircle2, 
  Clock 
} from '@phosphor-icons/react';

export default function PesertaOverviewPage() {
  const { currentUser, registrations, submissions, announcements } = useAppStore();

  const myRegistrations = registrations.filter(r => r.user_id === currentUser.id);
  const mySubmissions = submissions.filter(s => s.registration?.user_id === currentUser.id);
  const pendingPayments = myRegistrations.filter(r => r.payment && r.payment.status !== 'verified');

  return (
    <DashboardLayout 
      title={`Selamat Datang, ${currentUser.full_name}`}
      subtitle="Pantau status pendaftaran, pembayaran, dan progres submission Anda di sini."
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Kompetisi Diikuti</p>
              <h3 className="text-2xl font-bold font-mono text-cyan-400 mt-1">{myRegistrations.length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <Trophy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Pembayaran Menunggu</p>
              <h3 className="text-2xl font-bold font-mono text-amber-400 mt-1">{pendingPayments.length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Karya Terkirim</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">{mySubmissions.length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Status Akun</p>
              <h3 className="text-sm font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Terverifikasi
              </h3>
            </div>
            <div className="p-3 rounded-lg bg-slate-800 text-slate-300">
              <Award className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action alerts if payment pending */}
      {pendingPayments.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-amber-300">
                Ada {pendingPayments.length} pembayaran yang belum terkonfirmasi!
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Selesaikan pembayaran dan unggah bukti transfer agar pendaftaran Anda diverifikasi panitia.
              </p>
            </div>
          </div>
          <Link href="/dashboard/peserta/pembayaran">
            <Button size="sm" variant="primary" className="shrink-0">
              Unggah Bukti Bayar Sekarang
            </Button>
          </Link>
        </div>
      )}

      {/* Registered Competitions Table / Cards */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kompetisi Yang Sedang Anda Ikuti</CardTitle>
          <Link href="/kompetisi">
            <Button size="sm" variant="secondary">
              + Ikut Lomba Lain
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {myRegistrations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Anda belum mendaftar di kompetisi manapun.{' '}
              <Link href="/kompetisi" className="text-cyan-400 hover:underline">
                Pilih lomba sekarang.
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {myRegistrations.map((reg) => (
                <div key={reg.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{reg.competition?.name}</h4>
                      <Badge variant={getStatusBadgeVariant(reg.status)} size="sm">
                        {getStatusLabel(reg.status)}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                      <span>Kategori: {reg.competition?.type === 'academic' ? 'Akademik' : 'E-Sport'}</span>
                      <span>•</span>
                      <span>Didaftar: {formatDateShort(reg.registered_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/dashboard/peserta/pembayaran">
                      <Button size="sm" variant="secondary">
                        Status Bayar
                      </Button>
                    </Link>
                    {reg.competition?.submission_config.allowedTypes.length ? (
                      <Link href="/dashboard/peserta/submission">
                        <Button size="sm" variant="primary">
                          Kumpul Karya
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest Announcements */}
      <Card>
        <CardHeader>
          <CardTitle>Pengumuman Terkini</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcements.slice(0, 2).map((ann) => (
            <div key={ann.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-200">{ann.title}</span>
                <span className="text-slate-500 font-mono text-[10px]">{formatDateShort(ann.published_at)}</span>
              </div>
              <p className="text-slate-400 line-clamp-2">{ann.excerpt}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
