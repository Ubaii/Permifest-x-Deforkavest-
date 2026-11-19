'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { ClipboardText, CheckCircle, Clock, ArrowRight, Scales, Lock } from '@phosphor-icons/react';

export default function JuriOverviewPage() {
  const { currentUser, judgeAssignments } = useAppStore();

  const myAssignments = judgeAssignments.filter((a) => a.judge_id === currentUser.id || currentUser.role === 'juri');
  const completed = myAssignments.filter((a) => a.status === 'completed');
  const pending = myAssignments.filter((a) => a.status !== 'completed');

  return (
    <DashboardLayout 
      title={`Dashboard Dewan Juri: ${currentUser.full_name}`}
      subtitle="Pusat penugasan penilaian karya peserta berbasis rubrik terstruktur dan terbobot otomatis."
    >
      {/* Kartu Metrik Dewan Juri */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Tugas Penilaian</p>
              <h3 className="text-2xl font-bold font-mono text-primary mt-1 tabular-nums">
                {myAssignments.length}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Karya akademik yang diplot</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ClipboardText size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Belum Dinilai</p>
              <h3 className="text-2xl font-bold font-mono text-amber-500 mt-1 tabular-nums">
                {pending.length}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Menunggu input rubrik</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Selesai Dinilai</p>
              <h3 className="text-2xl font-bold font-mono text-support-lime mt-1 tabular-nums">
                {completed.length}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Skor terbobot tersimpan</p>
            </div>
            <div className="p-3 rounded-xl bg-support-lime/10 text-support-lime border border-support-lime/20">
              <CheckCircle size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banner Panduan Penjurian */}
      <div className="p-6 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-foreground font-[family-name:var(--font-bricolage)]">
            Panduan Integritas Rubrik &amp; Penilaian
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
            Setiap kriteria memiliki pembobotan (0.0 - 1.0). Masukkan skor 0-100 dan catatan konstruktif. Nilai dapat diperbarui sebelum dikunci oleh panitia.
          </p>
        </div>
        <Link href="/dashboard/juri/penugasan" className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" size="sm" rightIcon={<ArrowRight size={14} weight="bold" />} className="w-full sm:w-auto">
            Buka Lembar Penilaian
          </Button>
        </Link>
      </div>

      {/* Daftar Tugas Terkini */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Daftar Tugas Penilaian Terkini</CardTitle>
            <p className="text-xs text-muted-foreground">Karya peserta yang perlu dinilai atau ditinjau ulang</p>
          </div>
          <Link href="/dashboard/juri/penugasan">
            <Button size="sm" variant="ghost">Lihat Semua</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {myAssignments.length === 0 ? (
            <EmptyState
              icon={<ClipboardText size={28} weight="duotone" className="text-primary" />}
              title="Tidak Ada Tugas Penilaian"
              description="Belum ada karya peserta yang ditugaskan kepada Anda saat ini."
            />
          ) : (
            <div className="divide-y divide-border">
              {myAssignments.slice(0, 5).map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">
                        {item.submission?.file_name || (item.submission?.link_url ? 'Figma Design Submission' : 'Karya Peserta')}
                      </h4>
                      <StatusBadge
                        status={item.status === 'completed' ? 'completed' : 'assigned'}
                        customLabel={item.status === 'completed' ? 'Selesai' : 'Perlu Dinilai'}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Peserta: <strong className="text-foreground">{item.submission?.registration?.user?.full_name || 'Peserta Terdaftar'}</strong>
                      {' '}({item.submission?.registration?.user?.institution || '-'})
                    </div>
                  </div>

                  <Link href="/dashboard/juri/penugasan">
                    <Button size="sm" variant={item.status === 'completed' ? 'secondary' : 'primary'} leftIcon={<Scales size={15} />}>
                      {item.status === 'completed' ? 'Periksa Skor' : 'Beri Nilai'}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
