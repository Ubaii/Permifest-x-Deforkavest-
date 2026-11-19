'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ListBullets,
  Clock,
  MapPin,
  Alarm,
  Trophy,
} from '@phosphor-icons/react';
import { useAppStore } from '@/lib/store';
import { TimelineEvent, TimelineEventType } from '@/lib/types';

interface AgendaItem {
  id: string;
  day: number;
  month: number; // 1-12
  year: number;
  title: string;
  stickerBg: string;
  badgeType: string;
  desc: string;
  dateStr: string;
  timeStr: string;
  locationStr: string;
  isDeadline?: boolean;
  cabangNama?: string;
}

const EVENT_TYPE_MAP: Record<TimelineEventType, { stickerBg: string; badgeType: string }> = {
  'daftar': { stickerBg: '#F0A6F2', badgeType: 'Pendaftaran' },
  'technical-meeting': { stickerBg: '#6CC4FF', badgeType: 'Pengarahan TM' },
  'penyisihan': { stickerBg: '#9B6BF2', badgeType: 'Babak Lomba' },
  'final': { stickerBg: '#C4F15A', badgeType: 'Puncak Acara' },
  'pengumuman': { stickerBg: '#E6C978', badgeType: 'Pengumuman' },
};

interface TimelineSectionProps {
  id?: string;
}

export function TimelineSection({ id = 'jadwal' }: TimelineSectionProps) {
  const { timelineEvents } = useAppStore();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaItem | null>(null);

  // Ubah timelineEvents dari store ke AgendaItem
  const agendaList: AgendaItem[] = useMemo(() => {
    return timelineEvents.map((ev: TimelineEvent) => {
      const parts = ev.tanggal_mulai.split('-');
      const y = parseInt(parts[0], 10) || 2026;
      const m = parseInt(parts[1], 10) || 12;
      const d = parseInt(parts[2], 10) || 1;

      const meta = EVENT_TYPE_MAP[ev.jenis] || { stickerBg: '#E6C978', badgeType: 'Agenda Event' };

      // Format nama bulan
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const dateFormatted = `${d} ${monthNames[m - 1] || 'Desember'} ${y}`;

      return {
        id: ev.id,
        day: d,
        month: m,
        year: y,
        title: ev.judul.replace(/^(Buka Pendaftaran: |Tutup Pendaftaran & Pembayaran: |Batas Pengumpulan Berkas: |Babak Final & Presentasi: )/, ''),
        stickerBg: meta.stickerBg,
        badgeType: meta.badgeType,
        desc: ev.deskripsi || ev.judul,
        dateStr: dateFormatted,
        timeStr: ev.jam ? (ev.jam.startsWith('Pukul') ? ev.jam : `Pukul ${ev.jam}`) : 'Sepanjang Hari',
        locationStr: ev.lokasi || 'Online Platform',
        isDeadline: ev.is_deadline,
        cabangNama: ev.cabang_nama,
      };
    });
  }, [timelineEvents]);

  // Petakan event ke hari Desember 2026 untuk grid 28-31 hari
  const agendaMap = useMemo(() => {
    const map: Record<number, AgendaItem[]> = {};
    for (const a of agendaList) {
      if (a.month === 12 && a.year === 2026) {
        if (!map[a.day]) {
          map[a.day] = [];
        }
        map[a.day].push(a);
      }
    }
    return map;
  }, [agendaList]);

  return (
    <section
      id={id}
      aria-labelledby="timeline-heading"
      className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl text-left">
          <h2
            id="timeline-heading"
            className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-bricolage)] text-foreground tracking-tight"
          >
            Tanggal penting,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              jangan kelewat
            </span>
          </h2>
          <p className="mt-3 text-[#A99FD1] text-base leading-relaxed">
            Kalender terintegrasi yang diselaraskan langsung oleh panitia event. Klik tanggal atau item untuk melihat rincian agenda.
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#140D33] border border-[#2E2266] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px] ${
              viewMode === 'calendar'
                ? 'bg-[#7c4ddb] text-[#F5F2FF]'
                : 'text-[#A99FD1] hover:text-[#F5F2FF]'
            }`}
          >
            <CalendarIcon size={16} weight="bold" />
            <span>Kalender</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px] ${
              viewMode === 'list'
                ? 'bg-[#7c4ddb] text-[#F5F2FF]'
                : 'text-[#A99FD1] hover:text-[#F5F2FF]'
            }`}
          >
            <ListBullets size={16} weight="bold" />
            <span>Daftar ({agendaList.length})</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="rounded-2xl border border-[#2E2266] bg-[#140D33] p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <p className="font-[family-name:var(--font-bricolage)] font-extrabold text-xl sm:text-2xl text-[#F5F2FF]">
              Desember 2026
            </p>
            <span className="text-xs text-[#A99FD1] font-mono">
              Waktu Indonesia Barat (WIB)
            </span>
          </div>

          {/* Day Headers (Sen - Min) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-bold text-[#A99FD1] font-[family-name:var(--font-jetbrains)] mb-2">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
            <span>Min</span>
          </div>

          {/* Grid Hari Desember 2026 (1 Des 2026 adalah Selasa => ada 1 offset kosong di hari Senin) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Offset hari pertama: 1 Des 2026 = Selasa, offset 1 sel */}
            <div className="min-h-[64px] sm:min-h-[86px] rounded-xl border border-transparent bg-[#140D33]/30 p-1.5 opacity-30 select-none">
              <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[#A99FD1]/40">30</span>
            </div>

            {Array.from({ length: 31 }).map((_, idx) => {
              const day = idx + 1;
              const dayAgendas = agendaMap[day] || [];
              const primaryAgenda = dayAgendas[0];

              return (
                <div
                  key={day}
                  onClick={() => primaryAgenda && setSelectedAgenda(primaryAgenda)}
                  className={`min-h-[64px] sm:min-h-[86px] rounded-xl border p-1.5 sm:p-2 transition-all flex flex-col justify-between ${
                    dayAgendas.length > 0
                      ? 'bg-[#140D33] border-[#7c4ddb]/80 hover:border-[#7c4ddb] hover:shadow-lg hover:shadow-[#7c4ddb]/20 cursor-pointer'
                      : 'bg-[#140D33]/60 border-[#2E2266]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[family-name:var(--font-jetbrains)] font-bold text-xs sm:text-sm text-[#A99FD1] tabular-nums">
                      {day}
                    </span>
                    {dayAgendas.length > 1 && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#7c4ddb]/40 text-[#F5F2FF]">
                        +{dayAgendas.length}
                      </span>
                    )}
                  </div>

                  {primaryAgenda && (
                    <span
                      className="block mt-1 px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold text-[#0B0720] truncate text-center leading-tight shadow-xs"
                      style={{
                        backgroundColor: primaryAgenda.stickerBg,
                        transform: 'rotate(-2deg)',
                      }}
                      title={`${primaryAgenda.title} (${primaryAgenda.badgeType})`}
                    >
                      {primaryAgenda.title}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Agenda Popover / Detail Bar */}
          {selectedAgenda && (
            <div className="mt-6 p-4 rounded-xl border border-[#7c4ddb] bg-[#1d1347] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A99FD1]">
                    Detail Agenda: {selectedAgenda.dateStr}
                  </span>
                  {selectedAgenda.cabangNama && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#7c4ddb]/40 text-[#F5F2FF] flex items-center gap-1">
                      <Trophy size={11} /> {selectedAgenda.cabangNama}
                    </span>
                  )}
                  {selectedAgenda.isDeadline && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <Alarm size={11} weight="fill" /> Deadline
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-[#F5F2FF]">
                  {selectedAgenda.title}: {selectedAgenda.badgeType}
                </h4>
                <p className="text-xs text-[#A99FD1] max-w-2xl">{selectedAgenda.desc}</p>
                
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#E6C978]">
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {selectedAgenda.timeStr}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {selectedAgenda.locationStr}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAgenda(null)}
                className="px-3 py-1.5 rounded-lg bg-[#140D33] text-xs font-semibold text-[#A99FD1] hover:text-[#F5F2FF] self-start sm:self-auto min-h-[36px]"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      ) : (
        /* List Mode */
        <div className="space-y-3">
          {agendaList.map((ag) => (
            <div
              key={ag.id}
              className="p-5 rounded-2xl border border-[#2E2266] bg-[#140D33] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-xs font-bold text-[#0B0720]"
                    style={{ backgroundColor: ag.stickerBg }}
                  >
                    {ag.badgeType}
                  </span>
                  {ag.cabangNama && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#2E2266] text-[#A99FD1] flex items-center gap-1">
                      <Trophy size={12} className="text-[#E6C978]" />
                      {ag.cabangNama}
                    </span>
                  )}
                  {ag.isDeadline && (
                    <span className="text-xs font-bold text-[#D56BD9] flex items-center gap-1">
                      <Alarm size={14} weight="fill" />
                      Deadline
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#F5F2FF]">{ag.title}</h3>
                <p className="text-xs sm:text-sm text-[#A99FD1] mt-1">{ag.desc}</p>
              </div>
              <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#2E2266]">
                <span className="text-xs font-bold text-[#F5F2FF] block">{ag.dateStr}</span>
                <span className="text-xs text-[#A99FD1] block">{ag.timeStr}</span>
                <span className="text-xs text-[#A99FD1]/80 block">{ag.locationStr}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
