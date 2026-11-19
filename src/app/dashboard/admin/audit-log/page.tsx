'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { ShieldCheck, ClockCounterClockwise } from '@phosphor-icons/react';

export default function AdminAuditLogPage() {
  const { auditLogs } = useAppStore();

  const getActionBadge = (action: string) => {
    if (action.includes('VERIFY')) return <Badge variant="success">{action}</Badge>;
    if (action.includes('SCORE') || action.includes('OVERRIDE')) return <Badge variant="destructive">{action}</Badge>;
    if (action.includes('REGISTER')) return <Badge variant="primary">{action}</Badge>;
    return <Badge variant="neutral">{action}</Badge>;
  };

  return (
    <DashboardLayout 
      title="Audit Trail & Rekam Jejak Sistem" 
      subtitle="Pencatatan kepatuhan keamanan dan audit forensik seluruh operasi sensitif platform secara real-time."
    >
      <div className="space-y-6">
        
        {/* Banner Integritas Keamanan */}
        <div className="p-4 rounded-xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <ShieldCheck size={20} weight="bold" />
            </div>
            <span>
              Log audit bersifat <strong>append-only</strong> (tidak dapat dimanipulasi atau dihapus). Seluruh tindakan verifikasi pembayaran, penugasan juri, dan override darurat tersimpan permanen.
            </span>
          </div>
          <span className="font-mono text-primary text-[11px] font-bold shrink-0">SHA-256 IMMUTABLE</span>
        </div>

        {/* Tabel Audit Log */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Stempel Waktu</th>
                  <th className="p-4">Eksekutor (Email)</th>
                  <th className="p-4">Aksi / Event</th>
                  <th className="p-4">Entitas Target</th>
                  <th className="p-4">Payload Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-sans">
                      Belum ada rekaman log audit yang dicatat.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-muted-foreground whitespace-nowrap">
                        {formatDateShort(log.created_at)}
                      </td>
                      <td className="p-4 text-primary font-sans font-medium">
                        {log.user_email || 'system@permifest.id'}
                      </td>
                      <td className="p-4 font-sans">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="p-4 text-foreground">
                        {log.entity_type} <span className="text-muted-foreground text-[10px]">({log.entity_id?.slice(0, 8)})</span>
                      </td>
                      <td className="p-4 text-muted-foreground font-sans max-w-xs truncate" title={JSON.stringify(log.details)}>
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
