'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { ClockCounterClockwise, Lock } from '@phosphor-icons/react';

export default function JuriRiwayatPage() {
  const { judgeAssignments } = useAppStore();
  const completed = judgeAssignments.filter((a) => a.status === 'completed');

  return (
    <DashboardLayout 
      title="Riwayat Penilaian Dewan Juri" 
      subtitle="Arsip nilai dan catatan evaluasi karya yang telah selesai dihitung dan diserahkan ke panitia."
    >
      <div className="space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Daftar Penilaian yang Telah Dikirim</CardTitle>
            <p className="text-xs text-muted-foreground">Nilai terhitung otomatis berdasarkan bobot rubrik</p>
          </CardHeader>
          <CardContent>
            {completed.length === 0 ? (
              <EmptyState
                icon={<ClockCounterClockwise size={28} weight="duotone" className="text-primary" />}
                title="Belum Ada Riwayat Penilaian"
                description="Anda belum menyelesaikan penilaian untuk karya yang ditugaskan. Buka menu 'Karya Ditugaskan' untuk mulai mengisi skor rubrik."
              />
            ) : (
              <div className="divide-y divide-border">
                {completed.map((item) => {
                  const sub = item.submission;
                  const comp = sub?.registration?.competition;
                  const isLocked = item.scores?.some((s) => s.is_locked);

                  return (
                    <div key={item.id} className="py-5 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground">
                              {sub?.file_name || (sub?.link_url ? 'Figma Design' : 'Karya Peserta')}
                            </h4>
                            <Badge variant="success" size="sm">Selesai</Badge>
                            {isLocked && (
                              <Badge variant="neutral" size="sm" className="gap-1">
                                <Lock size={12} weight="bold" />
                                Nilai Terkunci
                              </Badge>
                            )}
                            <Badge variant="primary" size="sm">{comp?.name}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Peserta: <strong className="text-foreground">{sub?.registration?.user?.full_name}</strong>
                            {' '}• Diserahkan: {formatDateShort(item.completed_at)}
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-[10px] text-muted-foreground block uppercase font-mono">Nilai Akhir Terbobot:</span>
                          <span className="text-xl font-bold font-mono text-primary tabular-nums">
                            {sub?.final_score || 0} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                          </span>
                        </div>
                      </div>

                      {/* Rincian Skor per Kriteria */}
                      {item.scores && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                          {item.scores.map((sc) => (
                            <div key={sc.id} className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                              <div className="text-muted-foreground font-medium truncate">{sc.rubric_criteria?.name || 'Kriteria'}</div>
                              <div className="font-bold font-mono text-foreground text-sm tabular-nums">{sc.score} / 100</div>
                              {sc.comment && (
                                <div className="text-muted-foreground text-[11px] italic truncate">
                                  &quot;{sc.comment}&quot;
                                </div>
                              )}
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
