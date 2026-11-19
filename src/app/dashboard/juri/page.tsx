'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { ClipboardText as ClipboardCheck, ClockCounterClockwise as History, CheckCircle as CheckCircle2, Clock, ArrowRight, Shield } from '@phosphor-icons/react';

export default function JuriOverviewPage() {
  const { currentUser, judgeAssignments } = useAppStore();

  const myAssignments = judgeAssignments.filter(a => a.judge_id === currentUser.id || currentUser.role === 'juri');
  const completed = myAssignments.filter(a => a.status === 'completed');
  const pending = myAssignments.filter(a => a.status !== 'completed');

  return (
    <DashboardLayout 
      title={`Dashboard Dewan Juri: ${currentUser.full_name}`}
      subtitle="Penilaian karya peserta berbasis rubrik terstruktur dan terenkripsi."
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Penugasan Karya</p>
              <h3 className="text-2xl font-bold font-mono text-cyan-400 mt-1">{myAssignments.length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Belum Dinilai</p>
              <h3 className="text-2xl font-bold font-mono text-amber-400 mt-1">{pending.length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-amber-950 text-amber-400 border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Selesai Dinilai</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">{completed.length}</h3>
            </div>
            <div className="p-3 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Panduan Penjurian & Integritas Rubrik</h3>
          <p className="text-xs text-slate-400 mt-1">
            Penilaian menggunakan sistem rubrik berbobot otomatis. Nilai dapat diubah sebelum status dikunci oleh panitia.
          </p>
        </div>
        <Link href="/dashboard/juri/penugasan">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Buka Lembar Penilaian
          </Button>
        </Link>
      </div>

      {/* Assigned Submissions List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Tugas Penilaian Terkini</CardTitle>
          <Link href="/dashboard/juri/penugasan">
            <Button size="sm" variant="ghost">Lihat Semua</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-800">
            {myAssignments.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-200">
                      {item.submission?.file_name || (item.submission?.link_url ? 'Figma Design Submission' : 'Karya Peserta')}
                    </h4>
                    <Badge variant={item.status === 'completed' ? 'success' : 'warning'} size="sm">
                      {item.status === 'completed' ? 'Selesai' : 'Perlu Dinilai'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Peserta: <strong className="text-slate-300">{item.submission?.registration?.user?.full_name || 'Peserta Terdaftar'}</strong>
                    {' '}• Cabang: <span className="text-cyan-400">{item.submission?.registration?.competition?.name}</span>
                  </div>
                </div>

                <div>
                  <Link href="/dashboard/juri/penugasan">
                    <Button size="sm" variant={item.status === 'completed' ? 'secondary' : 'primary'}>
                      {item.status === 'completed' ? 'Lihat Nilai' : 'Beri Nilai Sekarang'}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
