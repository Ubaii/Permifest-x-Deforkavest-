'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort, getStatusBadgeVariant, getStatusLabel } from '@/lib/utils';
import { Trophy, ArrowRight, CloudArrowUp as UploadCloud, CreditCard, ArrowSquareOut as ExternalLink } from '@phosphor-icons/react';

export default function PesertaKompetisiPage() {
  const { currentUser, registrations } = useAppStore();
  const myRegistrations = registrations.filter(r => r.user_id === currentUser.id);

  return (
    <DashboardLayout 
      title="Kompetisi Saya" 
      subtitle="Daftar kompetisi yang telah Anda ikuti beserta status administrasi dan teknisnya."
    >
      <div className="space-y-6">
        {myRegistrations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">Belum Ada Kompetisi</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
                Anda belum terdaftar di cabang lomba manapun. Jelajahi kompetisi dan mulai daftarkan diri Anda sekarang.
              </p>
              <Link href="/kompetisi">
                <Button variant="primary">Lihat Daftar Lomba</Button>
              </Link>
            </CardContent>
          </Card>
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
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant={getStatusBadgeVariant(reg.status)}>
                            {getStatusLabel(reg.status)}
                          </Badge>
                          <Badge variant="cyber">{comp?.type.toUpperCase()}</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-slate-100">{comp?.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">Tema: {comp?.theme}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Biaya Registrasi</span>
                        <span className="text-base font-bold font-mono text-cyan-400">
                          {formatCurrency(comp?.registration_fee || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Registration info details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Tanggal Daftar:</span>
                        <span className="text-slate-300 font-medium">{formatDateShort(reg.registered_at)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Status Pembayaran:</span>
                        <span className="text-cyan-400 font-semibold">{reg.payment?.status ? getStatusLabel(reg.payment.status) : 'Gratis'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Bentuk Partisipasi:</span>
                        <span className="text-slate-300 capitalize">{comp?.participation_type}</span>
                      </div>
                    </div>

                    {/* Data submitted in form */}
                    {reg.form_data && Object.keys(reg.form_data).length > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Data Formulir Yang Terkirim:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {Object.entries(reg.form_data).map(([key, val]) => (
                            <div key={key}>
                              <span className="text-slate-500 capitalize">{key.replace('_', ' ')}:</span>{' '}
                              <span className="text-slate-200 font-mono">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/kompetisi/${comp?.slug}`}>
                      <Button variant="ghost" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        Buka Detail Lomba
                      </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link href="/dashboard/peserta/pembayaran">
                        <Button variant="secondary" size="sm" leftIcon={<CreditCard className="w-4 h-4" />}>
                          Konfirmasi Pembayaran
                        </Button>
                      </Link>

                      {hasSubmission ? (
                        <Link href="/dashboard/peserta/submission">
                          <Button variant="primary" size="sm" leftIcon={<UploadCloud className="w-4 h-4" />}>
                            Unggah Karya
                          </Button>
                        </Link>
                      ) : null}
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
