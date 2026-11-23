'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { 
  FileText, 
  Palette, 
  HardDrives as Server, 
  GameController as Gamepad2, 
  Trophy, 
  ArrowRight, 
  CheckCircle, 
} from '@phosphor-icons/react';

export default function KompetisiPage() {
  const { competitions } = useAppStore();
  const [filterType, setFilterType] = useState<'all' | 'academic' | 'non_academic'>('all');

  const filtered = competitions.filter(comp => {
    if (filterType === 'all') return true;
    return comp.type === filterType;
  });

  const getCompIcon = (category: string) => {
    switch (category) {
      case 'esai': return <FileText className="w-5 h-5 text-cyan-400" />;
      case 'uiux': return <Palette className="w-5 h-5 text-emerald-400" />;
      case 'it_system_arch': return <Server className="w-5 h-5 text-purple-400" />;
      case 'pes': return <Gamepad2 className="w-5 h-5 text-blue-400" />;
      case 'ml': return <Trophy className="w-5 h-5 text-amber-400" />;
      default: return <FileText className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />

      {/* Header Banner */}
      <section className="py-12 bg-slate-950 border-b border-slate-900 cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="cyber" className="mb-3">CABANG PERLOMBAAN</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Daftar Kompetisi 2026</h1>
          <p className="text-sm text-slate-400 max-w-xl mx-auto mt-2">
            Pilih cabang kompetisi sesuai keahlianmu. Pendaftaran dibuka hingga 10 Desember 2026.
          </p>

          {/* Filter Tabs */}
          <div className="mt-8 inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Lomba ({competitions.length})
            </button>
            <button
              onClick={() => setFilterType('academic')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'academic'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Akademik (3)
            </button>
            <button
              onClick={() => setFilterType('non_academic')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'non_academic'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              E-Sport (2)
            </button>
          </div>
        </div>
      </section>

      {/* Competition Grid */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((comp) => {
            const isAcademic = comp.type === 'academic';
            return (
              <Card key={comp.id} glow className="flex flex-col justify-between">
                <CardContent className="p-6">
                  
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                        {getCompIcon(comp.category)}
                      </div>
                      <div>
                        <Badge variant={isAcademic ? 'info' : 'warning'} size="sm">
                          {isAcademic ? 'Akademik' : 'E-Sport'}
                        </Badge>
                        <h3 className="text-xl font-bold text-slate-100 mt-1">
                          {comp.name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Biaya</div>
                      <div className="text-sm font-bold font-mono text-cyan-400">{formatCurrency(comp.registration_fee)}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                    {comp.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Tema:</span>
                      <span className="text-slate-200 font-medium truncate block">{comp.theme}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Partisipasi:</span>
                      <span className="text-slate-200 font-medium capitalize">
                        {comp.participation_type === 'individual' ? 'Individu (1 Orang)' : `Tim (${comp.min_team_size}-${comp.max_team_size} Orang)`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Tahapan:</span>
                      <span className="text-slate-200 font-medium">{comp.stages.map(s => s.name).join(' → ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Terdaftar:</span>
                      <span className="text-cyan-400 font-mono font-medium">{comp.registered_count} Peserta {comp.quota ? `/ ${comp.quota}` : ''}</span>
                    </div>
                  </div>

                </CardContent>

                <div className="p-6 pt-0 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Pendaftaran Terbuka</span>
                  </div>
                  <Link href={`/kompetisi/${comp.slug}`}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Detail & Form Pendaftaran
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
