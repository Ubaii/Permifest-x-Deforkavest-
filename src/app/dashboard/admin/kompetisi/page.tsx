'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { 
  Stack, 
  Plus, 
  PencilSimple, 
  Sliders,
  Calendar,
  Users,
  FileText
} from '@phosphor-icons/react';

export default function AdminKompetisiPage() {
  const { competitions } = useAppStore();

  return (
    <DashboardLayout 
      title="Manajemen Kompetisi & Tahapan" 
      subtitle="Konfigurasi data dinamis cabang perlombaan, field formulir, timeline babak, kuota, dan aturan berkas."
      actions={
        <Button 
          size="sm" 
          variant="primary" 
          leftIcon={<Plus size={16} weight="bold" />} 
          onClick={() => alert('Fitur tambah cabang lomba baru tersimpan sebagai entri dinamis di database PostgreSQL.')}
        >
          + Tambah Lomba Baru
        </Button>
      }
    >
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 gap-6">
          {competitions.map((comp) => {
            return (
              <Card key={comp.id} className="overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                      <Stack size={22} weight="bold" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base">{comp.name}</CardTitle>
                        <Badge variant={comp.type === 'academic' ? 'primary' : 'neutral'} size="sm">
                          {comp.type === 'academic' ? 'Akademik' : 'E-Sport'}
                        </Badge>
                        <Badge variant="primary" size="sm">{comp.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Tema: <strong className="text-foreground">{comp.theme}</strong></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      leftIcon={<PencilSimple size={15} weight="bold" />} 
                      onClick={() => alert(`Edit konfigurasi lomba: ${comp.name}`)}
                    >
                      Ubah Parameter
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Parameter Kunci */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Biaya Pendaftaran:</span>
                      <span className="text-primary font-bold font-mono text-sm tabular-nums">{formatCurrency(comp.registration_fee)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Kuota Pendaftar:</span>
                      <span className="text-foreground font-mono font-medium">{comp.quota ? `${comp.quota} Slot` : 'Tak Terbatas'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Bentuk Partisipasi:</span>
                      <span className="text-foreground font-medium capitalize">{comp.participation_type} ({comp.min_team_size}-{comp.max_team_size} org)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Format Unggahan:</span>
                      <span className="text-foreground font-mono text-[11px]">
                        {comp.submission_config.allowedTypes.length ? comp.submission_config.allowedTypes.join(', ') : 'Pertandingan Langsung'}
                      </span>
                    </div>
                  </div>

                  {/* Tahapan Babak (Penyisihan / Final) */}
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2 font-mono">
                      Jadwal Tahapan Kompetisi:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {comp.stages.map((st) => (
                        <div key={st.id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block">{st.name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">
                              Deadline: {formatDateShort(st.submission_close_at)}
                            </span>
                          </div>
                          <Badge variant={st.is_active ? 'success' : 'neutral'} size="sm">
                            {st.is_active ? 'Tahap Berjalan' : 'Belum Dibuka'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formulir Dinamis Lomba */}
                  {comp.form_fields.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2 font-mono">
                        Field Formulir Pendaftaran Dinamis:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {comp.form_fields.map((f) => (
                          <div key={f.id} className="px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border text-[11px] flex items-center gap-1.5 font-mono">
                            <span>{f.label}</span>
                            <span className="text-muted-foreground">({f.type})</span>
                            {f.required && <span className="text-destructive font-bold">*</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
}
