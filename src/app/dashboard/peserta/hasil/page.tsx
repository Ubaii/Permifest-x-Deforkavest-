'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { Trophy, Medal as Award, CheckCircle as CheckCircle2, Megaphone, ArrowRight } from '@phosphor-icons/react';
import { MOCK_LEADERBOARDS } from '@/lib/mock-data';

export default function PesertaHasilPage() {
  const { currentUser, registrations, announcements } = useAppStore();
  const myRegistrations = registrations.filter(r => r.user_id === currentUser.id);

  // Match current user in leaderboards
  const myResults = MOCK_LEADERBOARDS.filter(l => 
    l.participant_name.toLowerCase().includes(currentUser.full_name.toLowerCase()) ||
    l.participant_name.toLowerCase().includes('ahmad') ||
    l.participant_name.toLowerCase().includes('fauzi')
  );

  return (
    <DashboardLayout 
      title="Hasil Akhir & Pengumuman" 
      subtitle="Pantau status kelulusan babak penyisihan dan klasemen akhir resmi perlombaan."
    >
      <div className="space-y-6">
        
        {/* Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Klasemen Resmi & Sertifikat Digital</h3>
              <p className="text-xs text-slate-400 mt-1">
                Hasil penilaian dewan juri telah dikunci oleh panitia dan disahkan secara sistem.
              </p>
            </div>
          </div>
          <Link href="/leaderboard">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Buka Papan Peringkat Publik
            </Button>
          </Link>
        </div>

        {/* My Competition Results */}
        <Card>
          <CardHeader>
            <CardTitle>Status Capaian Anda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRegistrations.map((reg) => {
              const matchedEntry = myResults.find(r => r.category === reg.competition?.category);

              return (
                <div key={reg.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{reg.competition?.name}</h4>
                      <Badge variant="cyber">{reg.competition?.type.toUpperCase()}</Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Status Partisipasi: <strong className="text-emerald-400">Terdaftar & Berkas Terkirim</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    {matchedEntry ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-xs">
                        <Award className="w-4 h-4" />
                        <span>Peringkat #{matchedEntry.rank}: {matchedEntry.notes || 'Juara'}</span>
                      </div>
                    ) : (
                      <Badge variant="info">Sedang Dalam Tahap Penjurian</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Latest Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-cyan-400" />
              <span>Surat Keputusan & Pengumuman Panitia</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200">{ann.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">{formatDateShort(ann.published_at)}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{ann.excerpt}</p>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
