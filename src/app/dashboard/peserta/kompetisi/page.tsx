'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { Trophy, ArrowRight, UploadSimple, CreditCard, ArrowSquareOut } from '@phosphor-icons/react';

export default function PesertaKompetisiPage() {
  const { currentUser, registrations } = useAppStore();
  const myRegistrations = registrations.filter((r) => r.user_id === currentUser.id);

  return (
    <DashboardLayout 
      title="Kompetisi Saya" 
      subtitle="Daftar kompetisi yang telah Anda ikuti beserta status administrasi, rincian tim, dan akses teknis."
    >
      <div className="space-y-6">
        {myRegistrations.length === 0 ? (
          <EmptyState
            icon={<Trophy size={28} weight="duotone" className="text-primary" />}
            title="Belum Ada Kompetisi Terdaftar"
            description="Anda belum terdaftar di cabang lomba manapun. Jelajahi kompetisi dan mulai daftarkan diri Anda sekarang!"
            action={
              <Link href="/kompetisi">
                <Button variant="primary">Lihat Daftar Lomba</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myRegistrations.map((reg) => {
              const comp = reg.competition;
              const hasSubmission = comp?.submission_config.allowedTypes.length;

              return (
                <Card key={reg.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <StatusBadge status={reg.status} domain="registration" />
                          <Badge variant="primary">{comp?.type === 'academic' ? 'Akademik' : 'E-Sport'}</Badge>
                          <Badge variant="neutral">{comp?.participation_type === 'team' ? 'Beregu / Tim' : 'Individu'}</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-foreground font-[family-name:var(--font-bricolage)]">
                          {comp?.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Tema: <strong className="text-foreground">{comp?.theme}</strong></p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-muted-foreground block">Biaya Registrasi</span>
                        <span className="text-lg font-bold font-mono text-primary tabular-nums">
                          {formatCurrency(comp?.registration_fee || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Informasi Rincian Pendaftaran */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 p-4 rounded-xl bg-muted/40 border border-border text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Tanggal Mendaftar:</span>
                        <span className="text-foreground font-medium font-mono">{formatDateShort(reg.registered_at)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Status Pembayaran:</span>
                        <div className="mt-0.5">
                          {reg.payment ? (
                            <StatusBadge status={reg.payment.status} domain="payment" />
                          ) : (
                            <span className="text-[var(--success)] font-medium">Bebas Biaya</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[11px]">Bentuk Partisipasi:</span>
                        <span className="text-foreground font-medium capitalize">{comp?.participation_type} ({comp?.min_team_size}-{comp?.max_team_size} org)</span>
                      </div>
                    </div>

                    {/* Jawaban Formulir Dinamis */}
                    {reg.form_data && Object.keys(reg.form_data).length > 0 && (
                      <div className="mt-4 p-4 rounded-xl bg-card border border-border text-xs space-y-2">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block font-mono">
                          Data Formulir Pendaftaran:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {Object.entries(reg.form_data).map(([key, val]) => (
                            <div key={key} className="flex items-baseline gap-1.5">
                              <span className="text-muted-foreground capitalize shrink-0">{key.replace('_', ' ')}:</span>
                              <span className="text-foreground font-mono truncate">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-muted/30 border-t border-border flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/kompetisi/${comp?.slug}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Buka Panduan &amp; Regulasi Lomba</span>
                      <ArrowSquareOut size={14} />
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link href="/dashboard/peserta/pembayaran">
                        <Button size="sm" variant="secondary" leftIcon={<CreditCard size={16} />}>
                          Rincian Bayar
                        </Button>
                      </Link>

                      {hasSubmission ? (
                        <Link href="/dashboard/peserta/submission">
                          <Button size="sm" variant="primary" leftIcon={<UploadSimple size={16} weight="bold" />}>
                            Kumpul Karya
                          </Button>
                        </Link>
                      ) : (
                        <Link href="/dashboard/peserta/hasil">
                          <Button size="sm" variant="outline" rightIcon={<ArrowRight size={14} weight="bold" />}>
                            Hasil Match
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
