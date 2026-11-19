'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatusStepper, StepItem } from '@/components/dashboard/StatusStepper';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { 
  Trophy, 
  CreditCard, 
  UploadSimple, 
  CheckCircle, 
  ArrowRight, 
  WarningCircle, 
  Sparkle,
  FileText
} from '@phosphor-icons/react';

export default function PesertaOverviewPage() {
  const { currentUser, registrations, submissions, announcements } = useAppStore();

  const myRegistrations = registrations.filter((r) => r.user_id === currentUser.id);
  const mySubmissions = submissions.filter((s) => s.registration?.user_id === currentUser.id);
  const pendingPayments = myRegistrations.filter((r) => r.payment && r.payment.status !== 'verified');
  const verifiedRegistrations = myRegistrations.filter((r) => r.status === 'verified' || r.payment?.status === 'verified');

  // Menghitung status alur peserta untuk Stepper
  const hasRegistered = myRegistrations.length > 0;
  const hasPaid = myRegistrations.some((r) => r.payment?.status === 'uploaded' || r.payment?.status === 'verified');
  const isVerified = myRegistrations.some((r) => r.payment?.status === 'verified');
  const hasSubmitted = mySubmissions.length > 0;

  const journeySteps: StepItem[] = [
    {
      id: 'step-1',
      label: 'Daftar Lomba',
      description: hasRegistered ? `${myRegistrations.length} Lomba` : 'Pilih Cabang',
      state: hasRegistered ? 'completed' : 'current',
    },
    {
      id: 'step-2',
      label: 'Bayar QRIS',
      description: hasPaid ? 'Bukti Terunggah' : 'Unggah Bukti',
      state: isVerified ? 'completed' : hasPaid ? 'current' : hasRegistered ? 'current' : 'pending',
    },
    {
      id: 'step-3',
      label: 'Verifikasi',
      description: isVerified ? 'Disetujui' : 'Menunggu Panitia',
      state: isVerified ? 'completed' : hasPaid ? 'current' : 'pending',
    },
    {
      id: 'step-4',
      label: 'Karya / Match',
      description: hasSubmitted ? 'Karya Terkirim' : 'Sebelum Deadline',
      state: hasSubmitted ? 'completed' : isVerified ? 'current' : 'pending',
    },
    {
      id: 'step-5',
      label: 'Pengumuman',
      description: 'Leaderboard',
      state: 'pending',
    },
  ];

  return (
    <DashboardLayout 
      title={`Selamat Datang, ${currentUser.full_name}`}
      subtitle="Pantau alur kompetisi, pembayaran, verifikasi, dan unggah karya Anda dalam satu tempat."
    >
      {/* Alur Kompetisi Peserta (Status Stepper) */}
      <Card className="border-border bg-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-1.5">
              <Sparkle size={14} className="text-primary" weight="fill" />
              Progres Perjalanan Kompetisi Kamu
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">Status Terkini</span>
          </div>
          <StatusStepper steps={journeySteps} />
        </CardContent>
      </Card>

      {/* Action Card: Langkah Berikutnya (Dominan sesuai UI Kit) */}
      {pendingPayments.length > 0 ? (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0 mt-0.5 sm:mt-0">
              <WarningCircle size={24} weight="fill" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Langkah Berikutnya: Konfirmasi Pembayaran ({pendingPayments.length} Menunggu)
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                Segera selesaikan transfer QRIS dan unggah foto/screenshot bukti transaksi agar panitia dapat memverifikasi berkas pendaftaran Anda.
              </p>
            </div>
          </div>
          <Link href="/dashboard/peserta/pembayaran" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" variant="primary" className="w-full sm:w-auto">
              Unggah Bukti Transfer
            </Button>
          </Link>
        </div>
      ) : verifiedRegistrations.length > 0 && mySubmissions.length === 0 ? (
        <div className="p-5 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-primary/20 text-primary shrink-0 mt-0.5 sm:mt-0">
              <UploadSimple size={24} weight="bold" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Langkah Berikutnya: Kumpulkan Karya Anda
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                Pembayaran Anda telah diverifikasi! Anda kini dapat mengumpulkan dokumen karya (.pdf/.docx) atau tautan Figma sebelum deadline tahap penyisihan.
              </p>
            </div>
          </div>
          <Link href="/dashboard/peserta/submission" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" variant="primary" className="w-full sm:w-auto">
              Buka Form Submission
            </Button>
          </Link>
        </div>
      ) : null}

      {/* Metrik Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kompetisi Diikuti</p>
              <h3 className="text-2xl font-bold font-mono text-primary mt-1 tabular-nums">
                {myRegistrations.length}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Cabang lomba aktif</p>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Trophy size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Menunggu Verifikasi</p>
              <h3 className="text-2xl font-bold font-mono text-amber-500 mt-1 tabular-nums">
                {pendingPayments.length}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Transaksi pembayaran</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <CreditCard size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Karya Terkumpul</p>
              <h3 className="text-2xl font-bold font-mono text-support-lime mt-1 tabular-nums">
                {mySubmissions.length}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Tahap penyisihan/final</p>
            </div>
            <div className="p-3 rounded-xl bg-support-lime/10 text-support-lime border border-support-lime/20">
              <UploadSimple size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Status Akun</p>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-foreground">
                <CheckCircle size={16} weight="fill" className="text-support-lime" />
                <span>Email Terverifikasi</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{currentUser.email}</p>
            </div>
            <div className="p-3 rounded-xl bg-muted text-muted-foreground border border-border">
              <FileText size={22} weight="bold" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Kompetisi yang Diikuti */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Kompetisi yang Sedang Anda Ikuti</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftar perlombaan dan status verifikasi administrasi Anda
            </p>
          </div>
          <Link href="/kompetisi">
            <Button size="sm" variant="secondary">
              + Ikut Lomba Lain
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {myRegistrations.length === 0 ? (
            <EmptyState
              icon={<Trophy size={28} weight="duotone" className="text-primary" />}
              title="Belum Ada Kompetisi Terdaftar"
              description="Anda belum mendaftar di salah satu cabang kompetisi Permifest x Deforkafest. Pilih lomba dan daftarkan karya terbaik Anda!"
              action={
                <Link href="/kompetisi">
                  <Button size="sm" variant="primary">
                    Eksplorasi Cabang Lomba
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-border">
              {myRegistrations.map((reg) => (
                <div key={reg.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{reg.competition?.name}</h4>
                      <StatusBadge status={reg.status} domain="registration" />
                      {reg.payment && (
                        <StatusBadge 
                          status={reg.payment.status} 
                          domain="payment" 
                          customLabel={`Bayar: ${reg.payment.status === 'verified' ? 'Lunas' : reg.payment.status === 'uploaded' ? 'Menunggu Review' : 'Perlu Bukti'}`} 
                        />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                      <span>Kategori: <strong className="text-foreground">{reg.competition?.type === 'academic' ? 'Akademik' : 'E-Sport'}</strong></span>
                      <span>•</span>
                      <span>Biaya: <strong className="font-mono text-foreground">{formatCurrency(reg.competition?.registration_fee || 0)}</strong></span>
                      <span>•</span>
                      <span>Didaftar: {formatDateShort(reg.registered_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/dashboard/peserta/pembayaran">
                      <Button size="sm" variant="secondary">
                        Detail Bayar
                      </Button>
                    </Link>
                    {reg.competition?.submission_config.allowedTypes.length ? (
                      <Link href="/dashboard/peserta/submission">
                        <Button size="sm" variant="primary" rightIcon={<ArrowRight size={14} weight="bold" />}>
                          Kumpul Karya
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pengumuman Terbaru */}
      <Card>
        <CardHeader>
          <CardTitle>Warta &amp; Pengumuman Resmi</CardTitle>
          <p className="text-xs text-muted-foreground">Siaran penting dari panitia pelaksana kompetisi</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {announcements.slice(0, 3).map((ann) => (
            <div key={ann.id} className="p-4 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-sm">{ann.title}</span>
                <span className="text-muted-foreground font-mono text-[10px]">{formatDateShort(ann.published_at)}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed line-clamp-2">{ann.excerpt || ann.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
