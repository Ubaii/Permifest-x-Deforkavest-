'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { History, CheckCircle2, Lock, Scale } from 'lucide-react';

export default function JuriRiwayatPage() {
  const { judgeAssignments } = useAppStore();
  const completed = judgeAssignments.filter(a => a.status === 'completed');

  return (
    <DashboardLayout 
      title="Riwayat Penilaian Dewan Juri" 
      subtitle="Arsip nilai karya peserta yang telah selesai dihitung dan diserahkan ke panitia."
    >
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Penilaian Tersimpan</CardTitle>
          </CardHeader>
          <CardContent>
            {completed.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Belum ada penilaian yang diselesaikan.
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {completed.map((item) => {
                  const sub = item.submission;
                  const comp = sub?.registration?.competition;

                  return (
                    <div key={item.id} className="py-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-100">
                              {sub?.file_name || (sub?.link_url ? 'Figma Design' : 'Karya')}
                            </h4>
                            <Badge variant="success" size="sm">Terkunci</Badge>
                            <Badge variant="cyber" size="sm">{comp?.name}</Badge>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Peserta: <strong className="text-slate-300">{sub?.registration?.user?.full_name}</strong>
                            {' '}• Selesai: {formatDateShort(item.completed_at)}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">Nilai Terhitung:</span>
                          <span className="text-lg font-bold font-mono text-cyan-400">
                            {sub?.final_score} / 100
                          </span>
                        </div>
                      </div>

                      {/* Criteria breakdown */}
                      {item.scores && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                          {item.scores.map((sc) => (
                            <div key={sc.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]">
                              <div className="text-slate-400 truncate">{sc.rubric_criteria?.name || 'Kriteria'}</div>
                              <div className="font-bold font-mono text-cyan-400 text-xs mt-0.5">{sc.score} / 100</div>
                              {sc.comment && <div className="text-slate-500 text-[10px] mt-1 italic truncate">&quot;{sc.comment}&quot;</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
