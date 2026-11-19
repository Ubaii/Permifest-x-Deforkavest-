'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { Shield } from '@phosphor-icons/react';

export default function AdminAuditLogPage() {
  const { auditLogs } = useAppStore();

  const getActionBadge = (action: string) => {
    if (action.includes('VERIFY')) return <Badge variant="success">{action}</Badge>;
    if (action.includes('SCORE')) return <Badge variant="info">{action}</Badge>;
    if (action.includes('REGISTER')) return <Badge variant="cyber">{action}</Badge>;
    return <Badge variant="neutral">{action}</Badge>;
  };

  return (
    <DashboardLayout 
      title="Audit Trail & Rekam Jejak Sistem" 
      subtitle="Pencatatan kepatuhan keamanan dan audit log seluruh aksi sensitif platform secara real-time."
    >
      <div className="space-y-6">
        
        {/* Security Info Banner */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>
              Log audit bersifat <strong>append-only</strong> (tidak dapat dihapus atau dimanipulasi). Setiap perubahan nilai juri darurat atau verifikasi kas tersimpan permanen.
            </span>
          </div>
          <span className="font-mono text-cyan-400 text-[11px] shrink-0 hidden sm:inline">SHA-256 IMMUTABLE</span>
        </div>

        {/* Logs Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="p-4">Waktu</th>
                  <th className="p-4">Pelaku (Email)</th>
                  <th className="p-4">Aksi / Event</th>
                  <th className="p-4">Entitas</th>
                  <th className="p-4">Detail Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {formatDateShort(log.created_at)}
                    </td>
                    <td className="p-4 text-cyan-400 font-sans font-medium">
                      {log.user_email || 'system@permifest.id'}
                    </td>
                    <td className="p-4 font-sans">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="p-4 text-slate-300">
                      {log.entity_type} <span className="text-slate-500 text-[10px]">({log.entity_id?.slice(0, 8)})</span>
                    </td>
                    <td className="p-4 text-slate-400 font-sans max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </DashboardLayout>
  );
}
