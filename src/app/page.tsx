'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { 
  Shield, 
  Terminal, 
  FileText, 
  Palette, 
  Server, 
  Gamepad2, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const { competitions } = useAppStore();

  const getCompIcon = (category: string) => {
    switch (category) {
      case 'esai': return <FileText className="w-6 h-6 text-cyan-400" />;
      case 'uiux': return <Palette className="w-6 h-6 text-emerald-400" />;
      case 'it_system_arch': return <Server className="w-6 h-6 text-purple-400" />;
      case 'pes': return <Gamepad2 className="w-6 h-6 text-blue-400" />;
      case 'ml': return <Trophy className="w-6 h-6 text-amber-400" />;
      default: return <Shield className="w-6 h-6 text-cyan-400" />;
    }
  };

  const timelineSteps = [
    { title: 'Pendaftaran & Pembayaran', date: '1 Nov - 10 Des 2026', desc: 'Isi formulir, unggah bukti transfer/QRIS, dan tunggu verifikasi panitia.' },
    { title: 'Babak Penyisihan', date: '15 Des 2026', desc: 'Pengumpulan karya (Esai, UI/UX, IT Arch) atau jadwal tanding PES & ML.' },
    { title: 'Penilaian Juri', date: '16 - 20 Des 2026', desc: 'Penilaian terstruktur berbasis rubrik terstandarisasi.' },
    { title: 'Babak Final & Pengumuman', date: '28 Des 2026', desc: 'Presentasi finalis & rilis leaderboard pemenang resmi.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 cyber-grid border-b border-slate-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/10 to-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Theme Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 text-xs font-mono mb-6 glow-cyan">
            <Terminal className="w-3.5 h-3.5" />
            <span>ANNUAL CYBERSECURITY FESTIVAL 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            PERMIFEST <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">×</span> DEVORKAFEST
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Platform kompetisi satu pintu: pendaftaran mandiri, verifikasi pembayaran kilat, penilaian juri terstruktur, dan turnamen e-sport.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/kompetisi">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Jelajahi 5 Cabang Lomba
              </Button>
            </Link>
            <Link href="/informasi">
              <Button size="lg" variant="secondary">
                Pelajari Guidebook
              </Button>
            </Link>
          </div>

          {/* Quick Highlights */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-cyan-400 font-mono">5</div>
              <div className="text-xs text-slate-400 mt-1">Cabang Perlombaan</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-400 font-mono">3</div>
              <div className="text-xs text-slate-400 mt-1">Kategori Akademik</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-400 font-mono">2</div>
              <div className="text-xs text-slate-400 mt-1">Kategori E-Sport</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1">Sistem Terintegrasi</div>
            </div>
          </div>

        </div>
      </section>

      {/* Competitions Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="text-xs font-mono text-cyan-400 tracking-wider uppercase mb-1">Pilihan Kompetisi</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">5 Cabang Lomba Resmi</h2>
            <p className="text-sm text-slate-400 mt-1">Tiga bidang akademik berbasis karya dan dua turnamen e-sport kompetitif.</p>
          </div>
          <Link href="/kompetisi" className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
            <span>Lihat Persyaratan Lengkap</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((comp) => {
            const isAcademic = comp.type === 'academic';
            return (
              <Card key={comp.id} glow className="flex flex-col justify-between group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 group-hover:scale-105 transition-transform">
                      {getCompIcon(comp.category)}
                    </div>
                    <Badge variant={isAcademic ? 'info' : 'warning'}>
                      {isAcademic ? 'Akademik' : 'E-Sport'}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {comp.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tipe Peserta:</span>
                      <span className="text-slate-300 capitalize">{comp.participation_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Biaya Pendaftaran:</span>
                      <span className="text-cyan-400 font-mono font-medium">{formatCurrency(comp.registration_fee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Format Karya:</span>
                      <span className="text-slate-300 font-mono">
                        {comp.submission_config.allowedTypes.length > 0 
                          ? comp.submission_config.allowedTypes.join(' / ') 
                          : 'Pertandingan'}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <div className="p-6 pt-0">
                  <Link href={`/kompetisi/${comp.slug}`}>
                    <Button variant="secondary" size="sm" className="w-full justify-between">
                      <span>Detail & Daftar</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs font-mono text-cyan-400 tracking-wider uppercase mb-1">Alur Kompetisi</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Timeline Pelaksanaan</h2>
            <p className="text-xs text-slate-400 mt-1">Ikuti setiap tahapan agar tidak melewatkan deadline.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="relative p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm mb-3">
                    0{idx + 1}
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">{step.title}</h4>
                  <div className="text-[11px] font-mono text-cyan-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{step.date}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-950 border border-cyan-500/30 glow-cyan">
          <Shield className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-4xl font-bold text-white">Siap Menguji Ketangkasan Anda?</h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mt-3">
            Daftarkan diri Anda atau tim Anda sekarang juga. Raih pengalaman kompetisi berstandar tinggi dan hadiah bergengsi.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/kompetisi">
              <Button size="lg" variant="primary">
                Daftar Kompetisi Sekarang
              </Button>
            </Link>
            <Link href="/informasi">
              <Button size="lg" variant="outline">
                Pelajari FAQ & Syarat
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
