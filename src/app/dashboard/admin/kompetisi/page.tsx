'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { 
  Stack as Layers, 
  Gear as Settings2, 
  Plus, 
  Clock, 
  Users, 
  CheckCircle as CheckCircle2, 
  PencilSimple as Edit3, 
  FileText,
  Sliders
} from '@phosphor-icons/react';

export default function AdminKompetisiPage() {
  const { competitions } = useAppStore();

  return (
    <DashboardLayout 
      title="Manajemen Kompetisi & Tahapan" 
      subtitle="Konfigurasi dinamis cabang perlombaan, field formulir, timeline, biaya, dan rubrik penilaian."
      actions={
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => alert('Fitur tambah cabang lomba baru (dinamis di database).')}>
          + Tambah Lomba Baru
        </Button>
      }
    >
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 gap-6">
          {competitions.map((comp) => {
            return (
              <Card key={comp.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{comp.name}</CardTitle>
                        <Badge variant={comp.type === 'academic' ? 'info' : 'warning'} size="sm">
                          {comp.type}
                        </Badge>
                        <Badge variant="cyber" size="sm">{comp.category}</Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Tema: {comp.theme}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" leftIcon={<Edit3 className="w-3.5 h-3.5" />} onClick={() => alert(`Edit konfigurasi lomba ${comp.name}`)}>
                      Edit Konfigurasi
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key settings grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Biaya Registrasi:</span>
                      <span className="text-cyan-400 font-bold font-mono">{formatCurrency(comp.registration_fee)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Kuota Peserta:</span>
                      <span className="text-slate-200">{comp.quota ? `${comp.quota} Slot` : 'Tak Terbatas'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Bentuk Peserta:</span>
                      <span className="text-slate-200 capitalize">{comp.participation_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Format Unggahan:</span>
                      <span className="text-slate-300 font-mono">
                        {comp.submission_config.allowedTypes.length ? comp.submission_config.allowedTypes.join(', ') : 'Pertandingan Langsung'}
                      </span>
                    </div>
                  </div>

                  {/* Stages */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Tahapan & Jadwal Pelaksanaan:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {comp.stages.map((st) => (
                        <div key={st.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-200 block">{st.name}</span>
                            <span className="text-[11px] text-slate-400">Deadline: {formatDateShort(st.submission_close_at)}</span>
                          </div>
                          <Badge variant={st.is_active ? 'success' : 'neutral'} size="sm">
                            {st.is_active ? 'Aktif' : 'Tutup'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Form Fields preview */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Field Formulir Dinamis ({comp.form_fields.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {comp.form_fields.map((f) => (
                        <span key={f.id} className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                          {f.label} ({f.type}) {f.required && <span className="text-cyan-400">*</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
