'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ListBullets,
  Clock,
  MapPin,
  Alarm,
} from '@phosphor-icons/react';

interface AgendaItem {
  id: string;
  day: number;
  title: string;
  stickerBg: string;
  badgeType: string;
  desc: string;
  dateStr: string;
  timeStr: string;
  locationStr: string;
  isDeadline?: boolean;
}

const AGENDAS: AgendaItem[] = [
  {
    id: 'ag-1',
    day: 3,
    title: 'Buka daftar',
    stickerBg: '#F0A6F2',
    badgeType: 'Pendaftaran',
    desc: 'Pembukaan pendaftaran online untuk seluruh 5 cabang lomba di platform resmi.',
    dateStr: '3 Desember 2026',
    timeStr: 'Pukul 00:00 WIB',
    locationStr: 'Online Platform',
  },
  {
    id: 'ag-2',
    day: 10,
    title: 'Tutup',
    stickerBg: '#E6C978',
    badgeType: 'Batas Akhir',
    desc: 'Penutupan pendaftaran peserta dan batas verifikasi bukti pembayaran QRIS.',
    dateStr: '10 Desember 2026',
    timeStr: 'Pukul 23:59 WIB',
    locationStr: 'Online Platform',
    isDeadline: true,
  },
  {
    id: 'ag-3',
    day: 12,
    title: 'Tech meeting',
    stickerBg: '#6CC4FF',
    badgeType: 'Pengarahan',
    desc: 'Technical meeting virtual membahas aturan pertandingan e-sport dan pengumpulan karya.',
    dateStr: '12 Desember 2026',
    timeStr: 'Pukul 19:30 WIB',
    locationStr: 'Platform Meeting Room',
  },
  {
    id: 'ag-4',
    day: 18,
    title: 'Penyisihan',
    stickerBg: '#9B6BF2',
    badgeType: 'Babak Lomba',
    desc: 'Babak penyisihan e-sport (PES & Machine Learning) dan kurasi awal karya esai & UI/UX.',
    dateStr: '18 Desember 2026',
    timeStr: 'Pukul 10:00 WIB',
    locationStr: 'Online Arena',
  },
  {
    id: 'ag-5',
    day: 25,
    title: 'Final',
    stickerBg: '#C4F15A',
    badgeType: 'Puncak Acara',
    desc: 'Presentasi 5 besar finalis karya akademik dan babak penentuan juara e-sport.',
    dateStr: '25 Desember 2026',
    timeStr: 'Pukul 09:00 WIB',
    locationStr: 'Kampus UST Yogyakarta',
  },
  {
    id: 'ag-6',
    day: 27,
    title: 'Juara',
    stickerBg: '#E6C978',
    badgeType: 'Awarding',
    desc: 'Penyerahan piala penghargaan, sertifikat juara, dan penutupan resmi event.',
    dateStr: '27 Desember 2026',
    timeStr: 'Pukul 13:00 WIB',
    locationStr: 'Auditorium UST Yogyakarta',
  },
];

interface TimelineSectionProps {
  id?: string;
}

export function TimelineSection({ id = 'jadwal' }: TimelineSectionProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaItem | null>(null);

  const agendaMap: Record<number, AgendaItem> = {};
  for (const a of AGENDAS) {
    agendaMap[a.day] = a;
  }

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
            Tanggal di bawah hanya contoh. Jadwal sebenarnya diisi panitia.
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
            <span>Daftar</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="rounded-2xl border border-[#2E2266] bg-[#140D33] p-5 sm:p-7">
          <p className="font-[family-name:var(--font-bricolage)] font-extrabold text-xl sm:text-2xl text-[#F5F2FF] mb-5">
            Desember 2026
          </p>

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

          {/* 28-day grid from docs HTML */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: 28 }).map((_, idx) => {
              const day = idx + 1;
              const agenda = agendaMap[day];

              return (
                <div
                  key={day}
                  onClick={() => agenda && setSelectedAgenda(agenda)}
                  className={`min-h-[64px] sm:min-h-[82px] rounded-xl border p-1.5 sm:p-2 transition-all flex flex-col justify-between ${
                    agenda
                      ? 'bg-[#140D33] border-[#2E2266] hover:border-[#7c4ddb] cursor-pointer'
                      : 'bg-[#140D33]/60 border-[#2E2266]/40'
                  }`}
                >
                  <span className="font-[family-name:var(--font-jetbrains)] font-bold text-xs sm:text-sm text-[#A99FD1] tabular-nums">
                    {day}
                  </span>

                  {agenda && (
                    <span
                      className="block mt-1 px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold text-[#0B0720] truncate text-center leading-tight shadow-sm"
                      style={{
                        backgroundColor: agenda.stickerBg,
                        transform: 'rotate(-3deg)',
                      }}
                      title={agenda.title}
                    >
                      {agenda.title}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Agenda Popover / Detail Bar */}
          {selectedAgenda && (
            <div className="mt-6 p-4 rounded-xl border border-[#7c4ddb] bg-[#1d1347] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A99FD1] block mb-1">
                  Detail Agenda: {selectedAgenda.dateStr}
                </span>
                <h4 className="text-base font-bold text-[#F5F2FF] mb-1">
                  {selectedAgenda.title}: {selectedAgenda.badgeType}
                </h4>
                <p className="text-xs text-[#A99FD1]">{selectedAgenda.desc}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-[#E6C978]">
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
          {AGENDAS.map((ag) => (
            <div
              key={ag.id}
              className="p-5 rounded-2xl border border-[#2E2266] bg-[#140D33] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="px-2.5 py-0.5 rounded-md text-xs font-bold text-[#0B0720]"
                    style={{ backgroundColor: ag.stickerBg }}
                  >
                    {ag.title}
                  </span>
                  {ag.isDeadline && (
                    <span className="text-xs font-bold text-[#D56BD9] flex items-center gap-1">
                      <Alarm size={14} weight="fill" />
                      Deadline
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#F5F2FF]">{ag.badgeType}</h3>
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
