'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { formatDateShort } from '@/lib/utils';
import { Calendar, User, CaretDown as ChevronDown, CaretUp as ChevronUp, Megaphone } from '@phosphor-icons/react';

export default function PengumumanPage() {
  const { announcements } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>('ann-1');

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />

      <section className="py-12 bg-slate-950 border-b border-slate-900 cyber-grid">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="cyber" className="mb-3">UPDATE RESMI</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Papan Pengumuman</h1>
          <p className="text-sm text-slate-400 mt-2">
            Informasi terkini mengenai jadwal, perubahan teknis, dan surat keputusan panitia.
          </p>
        </div>
      </section>

      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full space-y-4">
        {announcements.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <Card key={item.id} className="transition-all duration-200">
              <div 
                className="p-5 flex items-start justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400 shrink-0 mt-0.5">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge variant={item.competition_name ? 'info' : 'cyber'} size="sm">
                        {item.competition_name || 'Umum'}
                      </Badge>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateShort(item.published_at)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{item.excerpt}</p>
                  </div>
                </div>

                <button className="text-slate-400 hover:text-white p-1">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-3 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40">
                  {item.content}
                  <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-cyan-400" />
                      Diterbitkan oleh: <strong className="text-slate-400">{item.author_name}</strong>
                    </span>
                    <span className="font-mono text-cyan-500">RESMI</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </section>

      <Footer />
    </div>
  );
}
