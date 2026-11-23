'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ListBullets,
  Alarm,
  Trophy,
  X,
  ArrowSquareOut,
  GitFork,
  Check,
  Flag,
  UploadSimple,
  MapPin,
} from '@phosphor-icons/react';
import { useAppStore } from '@/lib/store';
import { TimelineEvent, TimelineEventType } from '@/lib/types';

interface AgendaItem {
  id: string;
  day: number;
  month: number; // 1-12
  year: number;
  isoDate: string;
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
  daftar: { stickerBg: '#F0A6F2', badgeType: 'Pendaftaran' },
  'technical-meeting': { stickerBg: '#6CC4FF', badgeType: 'Pengarahan TM' },
  penyisihan: { stickerBg: '#9B6BF2', badgeType: 'Babak Lomba' },
  final: { stickerBg: '#C4F15A', badgeType: 'Puncak Acara' },
  pengumuman: { stickerBg: '#E6C978', badgeType: 'Pengumuman' },
};

interface TimelineSectionProps {
  id?: string;
}

export function TimelineSection({ id = 'jadwal' }: TimelineSectionProps) {
  const { timelineEvents, workflowNodes, competitions } = useAppStore();
  const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'tree'>('calendar');
  const [selectedTreeComp, setSelectedTreeComp] = useState<string>('all');
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaItem | null>(null);

  // Ubah timelineEvents dari store ke AgendaItem
  const agendaList: AgendaItem[] = useMemo(() => {
    return timelineEvents.map((ev: TimelineEvent) => {
      const parts = ev.tanggal_mulai.split('-');
      const y = parseInt(parts[0], 10) || 2026;
      const m = parseInt(parts[1], 10) || 12;
      const d = parseInt(parts[2], 10) || 1;

      const meta = EVENT_TYPE_MAP[ev.jenis] || { stickerBg: '#E6C978', badgeType: 'Agenda Event' };

      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];
      const dateFormatted = `${d} ${monthNames[m - 1] || 'Desember'} ${y}`;

      return {
        id: ev.id,
        day: d,
        month: m,
        year: y,
        isoDate: ev.tanggal_mulai,
        title: ev.judul.replace(
          /^(Buka Pendaftaran: |Tutup Pendaftaran & Pembayaran: |Batas Pengumpulan Berkas: |Babak Final & Presentasi: )/,
          ''
        ),
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

  // Petakan event ke hari Desember 2026
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

  // Helper membuat Google Calendar URL
  const getGoogleCalendarUrl = (item: AgendaItem) => {
    const title = encodeURIComponent(`[Permifest x Deforkafest] ${item.title}`);
    const details = encodeURIComponent(`${item.desc}\n\nCabang: ${item.cabangNama || 'Umum'}\nLokasi: ${item.locationStr}`);
    const location = encodeURIComponent(item.locationStr);
    // YYYYMMDD format
    const ymd = `${item.year}${String(item.month).padStart(2, '0')}${String(item.day).padStart(2, '0')}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${ymd}/${ymd}`;
  };

  return (
    <section
      id={id}
      aria-labelledby="timeline-heading"
      className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="max-w-2xl text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#140D33] text-[#D56BD9] border border-[#2E2266] mb-3">
            Jadwal Rangkaian Acara 2026
          </span>
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
            Klik pada tanggal mana pun di kalender untuk membuka rincian agenda, countdown, dan reminder jadwal resmi.
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[#140D33] border border-[#2E2266] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px] cursor-pointer ${viewMode === 'calendar'
                ? 'bg-[#7c4ddb] text-[#F5F2FF] shadow-sm'
                : 'text-[#A99FD1] hover:text-[#F5F2FF]'
              }`}
          >
            <CalendarIcon size={16} weight="bold" />
            <span>Kalender</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px] cursor-pointer ${viewMode === 'list'
                ? 'bg-[#7c4ddb] text-[#F5F2FF] shadow-sm'
                : 'text-[#A99FD1] hover:text-[#F5F2FF]'
              }`}
          >
            <ListBullets size={16} weight="bold" />
            <span>Daftar ({agendaList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px] cursor-pointer ${viewMode === 'tree'
                ? 'bg-[#7c4ddb] text-[#F5F2FF] shadow-sm'
                : 'text-[#A99FD1] hover:text-[#F5F2FF]'
              }`}
          >
            <GitFork size={16} weight="bold" />
            <span>Pohon Alur (Tree)</span>
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="rounded-2xl border border-[#2E2266] bg-[#140D33] p-4 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#2E2266]/70">
            <div>
              <p className="font-[family-name:var(--font-bricolage)] font-extrabold text-xl sm:text-2xl text-[#F5F2FF]">
                Desember 2026
              </p>
              <p className="text-xs text-[#A99FD1]">Klik kotak tanggal untuk melihat pop-up rincian acara</p>
            </div>
            <span className="text-[11px] text-[#A99FD1] font-mono bg-[#0B0720] px-2.5 py-1 rounded-lg border border-[#2E2266]">
              WIB (UTC+7)
            </span>
          </div>

          {/* Day Headers (Sen - Min) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 text-center text-xs font-bold text-[#A99FD1] font-[family-name:var(--font-jetbrains)] mb-2.5 select-none">
            <span className="text-[#A99FD1]">Sen</span>
            <span className="text-[#A99FD1]">Sel</span>
            <span className="text-[#A99FD1]">Rab</span>
            <span className="text-[#A99FD1]">Kam</span>
            <span className="text-[#A99FD1]">Jum</span>
            <span className="text-[#6CC4FF]">Sab</span>
            <span className="text-[#D56BD9]">Min</span>
          </div>

          {/* Grid Hari Desember 2026 (1 Des 2026 adalah Selasa => offset 1 sel di hari Senin) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 select-none">
            {/* Offset hari pertama: 30 Nov */}
            <div className="min-h-[70px] sm:min-h-[96px] rounded-xl border border-transparent bg-[#140D33]/30 p-2 opacity-30 select-none">
              <span className="font-[family-name:var(--font-jetbrains)] text-xs text-[#A99FD1]/40">30</span>
            </div>

            {Array.from({ length: 31 }).map((_, idx) => {
              const day = idx + 1;
              const dayAgendas = agendaMap[day] || [];
              const primaryAgenda = dayAgendas[0];
              const hasEvents = dayAgendas.length > 0;

              return (
                <div
                  key={day}
                  onClick={() => {
                    if (primaryAgenda) setSelectedAgenda(primaryAgenda);
                  }}
                  className={`min-h-[70px] sm:min-h-[96px] rounded-xl border p-1.5 sm:p-2.5 transition-all duration-200 flex flex-col justify-between ${hasEvents
                      ? 'bg-[#18103c] border-[#7c4ddb]/70 hover:border-[#9B6BF2] hover:-translate-y-1 hover:rotate-[-0.8deg] hover:scale-[1.02] hover:shadow-[0_6px_20px_rgba(155,107,242,0.3)] cursor-pointer'
                      : 'bg-[#140D33]/60 border-[#2E2266]/40'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-[family-name:var(--font-jetbrains)] font-bold text-xs sm:text-sm tabular-nums ${hasEvents ? 'text-[#F5F2FF] font-black' : 'text-[#A99FD1]/80'
                        }`}
                    >
                      {day}
                    </span>
                    {dayAgendas.length > 1 && (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-[#9B6BF2] text-[#0B0720]">
                        +{dayAgendas.length}
                      </span>
                    )}
                  </div>

                  {primaryAgenda && (
                    <div className="mt-1">
                      <span
                        className="block px-1.5 py-1 rounded-lg text-[9px] sm:text-[11px] font-extrabold text-[#0B0720] truncate text-center leading-tight shadow-sm transition-transform hover:scale-105"
                        style={{
                          backgroundColor: primaryAgenda.stickerBg,
                          transform: 'rotate(-1.5deg)',
                        }}
                        title={`${primaryAgenda.title} (${primaryAgenda.badgeType})`}
                      >
                        {primaryAgenda.title}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* List Mode */
        <div className="space-y-3.5">
          {agendaList.map((ag) => (
            <div
              key={ag.id}
              onClick={() => setSelectedAgenda(ag)}
              className="p-5 rounded-2xl border border-[#2E2266] bg-[#140D33] hover:border-[#9B6BF2] hover:-translate-y-1 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
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
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <Alarm size={13} weight="fill" />
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
      ) : (
        /* ── Tree View: Pohon Alur Perlombaan Interaktif ── */
        <div className="space-y-6">
          {/* Filter Cabang Lomba untuk Tree */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedTreeComp('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] border cursor-pointer ${
                selectedTreeComp === 'all'
                  ? 'bg-[#9B6BF2] text-[#0B0720] border-[#9B6BF2] shadow-[2px_2px_0px_#0B0720]'
                  : 'bg-[#140D33] text-[#A99FD1] border-[#2E2266] hover:text-[#F5F2FF]'
              }`}
            >
              Semua Tahapan ({workflowNodes.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTreeComp('global')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] border cursor-pointer ${
                selectedTreeComp === 'global'
                  ? 'bg-[#9B6BF2] text-[#0B0720] border-[#9B6BF2] shadow-[2px_2px_0px_#0B0720]'
                  : 'bg-[#140D33] text-[#A99FD1] border-[#2E2266] hover:text-[#F5F2FF]'
              }`}
            >
              Alur Umum ({workflowNodes.filter((n) => !n.competition_id).length})
            </button>
            {competitions.map((c) => {
              const count = workflowNodes.filter((n) => n.competition_id === c.id).length;
              const isActive = selectedTreeComp === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedTreeComp(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] border cursor-pointer ${
                    isActive
                      ? 'bg-[#9B6BF2] text-[#0B0720] border-[#9B6BF2] shadow-[2px_2px_0px_#0B0720]'
                      : 'bg-[#140D33] text-[#A99FD1] border-[#2E2266] hover:text-[#F5F2FF]'
                  }`}
                >
                  {c.name} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          {/* Node Flowcards Container */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#2E2266]">
            {workflowNodes
              .filter((n) => {
                if (selectedTreeComp === 'all') return true;
                if (selectedTreeComp === 'global') return !n.competition_id;
                return n.competition_id === selectedTreeComp;
              })
              .sort((a, b) => a.order_index - b.order_index)
              .map((node) => {
                const isCompleted = node.status === 'completed';
                const isActive = node.status === 'active';

                return (
                  <div key={node.id} className="relative group">
                    {/* Node Bullet On Left Line */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full border-2 border-[#140D33] flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                        isCompleted
                          ? 'bg-[#C4F15A] text-[#0B0720]'
                          : isActive
                          ? 'bg-[#9B6BF2] text-[#0B0720] shadow-[0_0_12px_rgba(155,107,242,0.8)]'
                          : 'bg-[#0B0720] border-[#2E2266] text-[#A99FD1]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={12} weight="bold" />
                      ) : (
                        <span className="text-[10px] font-bold font-mono">{node.order_index}</span>
                      )}
                    </div>

                    {/* Node Card */}
                    <div
                      className={`rounded-2xl border-2 p-5 bg-[#140D33] transition-all ${
                        isActive
                          ? 'border-[#9B6BF2] shadow-[4px_4px_0px_#0B0720,0_0_20px_rgba(155,107,242,0.15)] ring-1 ring-[#9B6BF2]/40'
                          : isCompleted
                          ? 'border-[#C4F15A]/40 bg-[#140D33]'
                          : 'border-[#2E2266] bg-[#140D33]/70 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div>
                          {/* Badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isCompleted
                                  ? 'bg-[#C4F15A]/15 text-[#C4F15A] border-[#C4F15A]/30'
                                  : isActive
                                  ? 'bg-[#9B6BF2]/20 text-[#D56BD9] border-[#9B6BF2]/40'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isCompleted ? 'bg-[#C4F15A]' : isActive ? 'bg-[#D56BD9] animate-pulse' : 'bg-zinc-500'
                                }`}
                              />
                              <span>{isCompleted ? 'Selesai' : isActive ? 'Sedang Berjalan' : 'Mendatang'}</span>
                            </span>

                            {node.is_milestone && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFE359]/15 text-[#FFE359] border border-[#FFE359]/30">
                                <Flag size={11} weight="fill" />
                                <span>Milestone Kunci</span>
                              </span>
                            )}

                            {node.requires_action && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#6CC4FF]/15 text-[#6CC4FF] border border-[#6CC4FF]/30">
                                <UploadSimple size={11} weight="bold" />
                                <span>Aksi Peserta Diperlukan</span>
                              </span>
                            )}
                          </div>

                          <h3 className="font-[family-name:var(--font-bricolage)] font-bold text-base sm:text-lg text-[#F5F2FF] leading-snug">
                            {node.title}
                          </h3>

                          {node.instructions && (
                            <p className="text-xs text-[#A99FD1] leading-relaxed mt-2 max-w-2xl">
                              {node.instructions}
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-[#A99FD1]">
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon size={14} className="text-[#9B6BF2]" weight="bold" />
                              <span className="font-mono text-[11px] text-[#F5F2FF]">
                                {node.start_date} {node.end_date && node.end_date !== node.start_date ? `s/d ${node.end_date}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-[#C4F15A]" weight="bold" />
                              <span>{node.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Manga Event Interactive Modal Dialog ── */}
      {selectedAgenda && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-modal-title"
          onClick={() => setSelectedAgenda(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl bg-[#140D33] border-2 border-[#9B6BF2] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.85)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header dengan Badge Washi Tape & Tombol Tutup (Aman, Tidak Terpotong) */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div
                className="inline-block px-3.5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-[#0B0720] shadow-sm select-none border border-black/20"
                style={{
                  backgroundColor: selectedAgenda.stickerBg,
                  transform: 'rotate(-2deg)',
                }}
              >
                ★ {selectedAgenda.badgeType}
              </div>

              <button
                type="button"
                onClick={() => setSelectedAgenda(null)}
                className="p-2 rounded-xl text-[#A99FD1] hover:text-[#F5F2FF] hover:bg-[#1d1347] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Tutup Detail"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {selectedAgenda.cabangNama && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#2E2266] text-[#6CC4FF]">
                    {selectedAgenda.cabangNama}
                  </span>
                )}
                {selectedAgenda.isDeadline && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-500/25 text-rose-300 border border-rose-500/40">
                    Batas Akhir / Deadline
                  </span>
                )}
              </div>

              <h3
                id="calendar-modal-title"
                className="text-2xl font-extrabold font-[family-name:var(--font-bricolage)] text-[#F5F2FF] leading-snug"
              >
                {selectedAgenda.title}
              </h3>

              <p className="mt-3 text-sm text-[#A99FD1] leading-relaxed">
                {selectedAgenda.desc}
              </p>

              {/* Rincian Waktu & Tempat Box yang Bersih */}
              <div className="mt-5 p-4 rounded-xl bg-[#0B0720] border border-[#2E2266] space-y-2.5">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#A99FD1]">Tanggal</span>
                  <span className="font-bold text-[#F5F2FF]">{selectedAgenda.dateStr}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#A99FD1]">Waktu Pelaksanaan</span>
                  <span className="font-bold text-[#F5F2FF]">{selectedAgenda.timeStr}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-[#A99FD1]">Lokasi / Saluran</span>
                  <span className="font-bold text-[#6CC4FF]">{selectedAgenda.locationStr}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-[#2E2266] flex flex-wrap items-center justify-end gap-3">
                <a
                  href={getGoogleCalendarUrl(selectedAgenda)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#F5F2FF] bg-[#1d1347] border border-[#2E2266] hover:bg-[#25195c] hover:border-[#6CC4FF] transition-all min-h-[44px]"
                >
                  <ArrowSquareOut size={16} weight="bold" />
                  Simpan di Google Calendar
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedAgenda(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#F5F2FF] bg-[#2E2266] border border-[#6CC4FF]/40 hover:bg-[#3D2D85] hover:border-[#6CC4FF] transition-all min-h-[44px]"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
