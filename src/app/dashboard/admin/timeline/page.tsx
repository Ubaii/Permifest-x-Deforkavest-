'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal, ConfirmDialog } from '@/components/ui/modal';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { useAppStore } from '@/lib/store';
import { TimelineEvent, TimelineEventType } from '@/lib/types';
import { 
  Calendar as CalendarIcon, 
  ListBullets, 
  Plus, 
  ArrowsClockwise, 
  Trash, 
  PencilSimple, 
  Clock, 
  MapPin, 
  CaretLeft, 
  CaretRight, 
  Alarm, 
  Trophy, 
  Info,
  CheckCircle,
  Funnel
} from '@phosphor-icons/react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const EVENT_TYPE_LABELS: Record<TimelineEventType, { label: string; badgeVariant: 'warning' | 'info' | 'primary' | 'success' | 'destructive' | 'neutral'; color: string; bg: string }> = {
  'daftar': { label: 'Pendaftaran', badgeVariant: 'warning', color: '#B45309', bg: '#FEF3C7' },
  'technical-meeting': { label: 'Tech Meeting', badgeVariant: 'info', color: '#0369A1', bg: '#E0F2FE' },
  'penyisihan': { label: 'Babak Penyisihan', badgeVariant: 'primary', color: '#6D28D9', bg: '#EDE9FE' },
  'final': { label: 'Babak Final', badgeVariant: 'success', color: '#047857', bg: '#D1FAE5' },
  'pengumuman': { label: 'Pengumuman', badgeVariant: 'destructive', color: '#BE123C', bg: '#FFE4E6' },
};

export default function AdminTimelinePage() {
  const { 
    timelineEvents, 
    competitions, 
    addTimelineEvent, 
    updateTimelineEvent, 
    deleteTimelineEvent, 
    syncTimelineFromCompetitions 
  } = useAppStore();

  // Mode View: Kalender Grid atau List
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Kalender Navigation State (default Desember 2026 sesuai tanggal event resmi)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(11); // 11 = Desember (0-indexed)

  // Filter
  const [selectedCompFilter, setSelectedCompFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [detailEvent, setDetailEvent] = useState<TimelineEvent | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formJudul, setFormJudul] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formTanggalMulai, setFormTanggalMulai] = useState('');
  const [formJam, setFormJam] = useState('');
  const [formJenis, setFormJenis] = useState<TimelineEventType>('daftar');
  const [formCabangId, setFormCabangId] = useState<string>('');
  const [formLokasi, setFormLokasi] = useState('');
  const [formIsDeadline, setFormIsDeadline] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Alert State
  const [syncAlert, setSyncAlert] = useState<{ count: number; message: string } | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return timelineEvents.filter((ev) => {
      const matchComp = selectedCompFilter === 'all' || (selectedCompFilter === 'global' ? !ev.cabang_id : ev.cabang_id === selectedCompFilter);
      const matchType = selectedTypeFilter === 'all' || ev.jenis === selectedTypeFilter;
      return matchComp && matchType;
    });
  }, [timelineEvents, selectedCompFilter, selectedTypeFilter]);

  // Perhitungan Kalender Grid (Senin - Minggu)
  const calendarGrid = useMemo(() => {
    // Hari pertama dalam bulan: getDay() 0 = Minggu, 1 = Senin, dst.
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    // Konversi ke Senin = 0, Minggu = 6
    const firstDayIndex = (firstDay + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      events: TimelineEvent[];
    }[] = [];

    // Hari dari bulan sebelumnya
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const mStr = String(m).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${y}-${mStr}-${dStr}`;
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        events: filteredEvents.filter((e) => e.tanggal_mulai === dateStr),
      });
    }

    // Hari dalam bulan ini
    for (let day = 1; day <= daysInMonth; day++) {
      const mStr = String(currentMonth + 1).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${mStr}-${dStr}`;
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: true,
        events: filteredEvents.filter((e) => e.tanggal_mulai === dateStr),
      });
    }

    // Hari dari bulan berikutnya untuk melengkapi baris (kelipatan 7)
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const mStr = String(m).padStart(2, '0');
      const dStr = String(day).padStart(2, '0');
      const dateStr = `${y}-${mStr}-${dStr}`;
      cells.push({
        dateStr,
        dayNumber: day,
        isCurrentMonth: false,
        events: filteredEvents.filter((e) => e.tanggal_mulai === dateStr),
      });
    }

    return cells;
  }, [currentYear, currentMonth, filteredEvents]);

  // Navigasi Bulan
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToEventMonth = () => {
    setCurrentYear(2026);
    setCurrentMonth(11); // Desember 2026
  };

  // Sync Otomatis dari Lomba
  const handleSyncFromCompetitions = async () => {
    try {
      const res = await syncTimelineFromCompetitions();
      if (res.addedCount > 0) {
        setSyncAlert({
          count: res.addedCount,
          message: `Berhasil mendeteksi & menyinkronkan ${res.addedCount} jadwal otomatis dari cabang lomba dan tahapan babak!`,
        });
      } else {
        setSyncAlert({
          count: 0,
          message: 'Seluruh jadwal pendaftaran dan tahapan lomba sudah tersinkronisasi di kalender.',
        });
      }
    } catch {
      setSyncAlert({ count: 0, message: 'Gagal melakukan sinkronisasi jadwal lomba.' });
    }
  };

  // Buka Modal Tambah Event
  const openCreateModal = (defaultDate?: string) => {
    setEditingEventId(null);
    setFormJudul('');
    setFormDeskripsi('');
    setFormTanggalMulai(defaultDate || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`);
    setFormJam('09:00 WIB');
    setFormJenis('daftar');
    setFormCabangId('');
    setFormLokasi('Online Platform');
    setFormIsDeadline(false);
    setFormError(null);
    setModalOpen(true);
  };

  // Buka Modal Edit Event
  const openEditModal = (ev: TimelineEvent) => {
    setEditingEventId(ev.id);
    setFormJudul(ev.judul);
    setFormDeskripsi(ev.deskripsi || '');
    setFormTanggalMulai(ev.tanggal_mulai);
    setFormJam(ev.jam || '09:00 WIB');
    setFormJenis(ev.jenis);
    setFormCabangId(ev.cabang_id || '');
    setFormLokasi(ev.lokasi || 'Online Platform');
    setFormIsDeadline(Boolean(ev.is_deadline));
    setFormError(null);
    setDetailEvent(null);
    setModalOpen(true);
  };

  // Simpan Form Event
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim()) {
      setFormError('Judul agenda wajib diisi.');
      return;
    }
    if (!formTanggalMulai) {
      setFormError('Tanggal agenda wajib diisi.');
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    const comp = competitions.find((c) => c.id === formCabangId);

    try {
      if (editingEventId) {
        await updateTimelineEvent(editingEventId, {
          judul: formJudul.trim(),
          deskripsi: formDeskripsi.trim(),
          tanggal_mulai: formTanggalMulai,
          jam: formJam.trim(),
          jenis: formJenis,
          cabang_id: formCabangId || undefined,
          cabang_nama: comp ? comp.name : undefined,
          lokasi: formLokasi.trim(),
          is_deadline: formIsDeadline,
        });
        setSuccessBanner('Agenda timeline berhasil diperbarui.');
      } else {
        await addTimelineEvent({
          judul: formJudul.trim(),
          deskripsi: formDeskripsi.trim(),
          tanggal_mulai: formTanggalMulai,
          jam: formJam.trim(),
          jenis: formJenis,
          cabang_id: formCabangId || undefined,
          cabang_nama: comp ? comp.name : undefined,
          lokasi: formLokasi.trim(),
          is_deadline: formIsDeadline,
        });
        setSuccessBanner('Agenda timeline baru berhasil ditambahkan dan langsung aktif di landing page.');
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyimpan agenda timeline.';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Hapus Event
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await deleteTimelineEvent(deleteConfirmId);
      setSuccessBanner('Agenda timeline berhasil dihapus.');
      setDeleteConfirmId(null);
      setDetailEvent(null);
    } catch {
      // noop
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout
      title="Timeline & Kalender Event"
      subtitle="Kelola agenda penting, tanggal pendaftaran, jadwal pertandingan e-sport, dan babak final untuk kalender landing page."
    >
      <div className="space-y-6">
        
        {/* Success Banner */}
        {successBanner && (
          <Alert variant="success" onClose={() => setSuccessBanner(null)}>
            <AlertTitle>Berhasil</AlertTitle>
            <AlertDescription>{successBanner}</AlertDescription>
          </Alert>
        )}

        {/* Sync Result Alert */}
        {syncAlert && (
          <Alert variant={syncAlert.count > 0 ? 'success' : 'info'} onClose={() => setSyncAlert(null)}>
            <AlertTitle>{syncAlert.count > 0 ? 'Sinkronisasi Sukses' : 'Pemberitahuan'}</AlertTitle>
            <AlertDescription>{syncAlert.message}</AlertDescription>
          </Alert>
        )}

        {/* Action Header & View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex items-center p-1 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <CalendarIcon size={14} weight="bold" />
                <span>Grid Kalender</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--card)] text-[var(--foreground)] shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <ListBullets size={14} weight="bold" />
                <span>Daftar / Tabel</span>
              </button>
            </div>

            {/* Filter Cabang Lomba */}
            <div className="flex items-center gap-1.5">
              <Funnel size={14} className="text-[var(--muted-foreground)]" />
              <select
                value={selectedCompFilter}
                onChange={(e) => setSelectedCompFilter(e.target.value)}
                className="bg-[var(--card)] border border-[var(--border)] text-xs rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="all">Semua Cabang & Global</option>
                <option value="global">Khusus Global Event</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Jenis Agenda */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-[var(--card)] border border-[var(--border)] text-xs rounded-lg px-2.5 py-1.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="all">Semua Jenis Agenda</option>
              <option value="daftar">Pendaftaran & Bayar</option>
              <option value="technical-meeting">Technical Meeting</option>
              <option value="penyisihan">Babak Penyisihan / Tanding</option>
              <option value="final">Babak Final / Presentasi</option>
              <option value="pengumuman">Pengumuman & Awarding</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncFromCompetitions}
              leftIcon={<ArrowsClockwise size={14} />}
              title="Deteksi otomatis tanggal buka/tutup dan tahapan lomba untuk dimasukkan ke kalender"
            >
              Sync dari Lomba (Auto-detect)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => openCreateModal()}
              leftIcon={<Plus size={14} />}
            >
              Tambah Agenda Manual
            </Button>
          </div>
        </div>

        {/* View Mode: KALENDER GRID */}
        {viewMode === 'calendar' && (
          <Card className="border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xs">
            {/* Header Kalender Navigation */}
            <div className="p-4 sm:p-5 border-b border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-bricolage)] text-[var(--foreground)]">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-mono font-semibold">
                  {filteredEvents.length} Agenda Aktif
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleJumpToEventMonth}
                  className="text-xs"
                >
                  Bulan Event (Des 2026)
                </Button>
                <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--card)]">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-r border-[var(--border)] transition-colors"
                    title="Bulan Sebelumnya"
                  >
                    <CaretLeft size={16} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    title="Bulan Berikutnya"
                  >
                    <CaretRight size={16} weight="bold" />
                  </button>
                </div>
              </div>
            </div>

            {/* Nama Hari (Sen - Min) */}
            <div className="grid grid-cols-7 border-b border-[var(--border)] bg-[var(--muted)]/50 text-center text-xs font-bold text-[var(--muted-foreground)] font-mono">
              <div className="py-2.5 border-r border-[var(--border)]">Sen</div>
              <div className="py-2.5 border-r border-[var(--border)]">Sel</div>
              <div className="py-2.5 border-r border-[var(--border)]">Rab</div>
              <div className="py-2.5 border-r border-[var(--border)]">Kam</div>
              <div className="py-2.5 border-r border-[var(--border)]">Jum</div>
              <div className="py-2.5 border-r border-[var(--border)]">Sab</div>
              <div className="py-2.5">Min</div>
            </div>

            {/* Grid Sel Kalender */}
            <div className="grid grid-cols-7 auto-rows-fr bg-[var(--border)] gap-px">
              {calendarGrid.map((cell, idx) => {
                const isSelectedMonth = cell.isCurrentMonth;
                const hasEvents = cell.events.length > 0;

                return (
                  <div
                    key={`${cell.dateStr}-${idx}`}
                    className={`min-h-[110px] sm:min-h-[130px] p-2 flex flex-col justify-between transition-colors group relative ${
                      isSelectedMonth
                        ? 'bg-[var(--card)] hover:bg-[var(--muted)]/30'
                        : 'bg-[var(--muted)]/20 text-[var(--muted-foreground)]/50'
                    }`}
                  >
                    {/* Header Sel: Tanggal & Tombol Tambah */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-xs font-mono font-bold rounded-md px-1.5 py-0.5 ${
                          isSelectedMonth
                            ? hasEvents
                              ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                              : 'text-[var(--foreground)]'
                            : 'text-[var(--muted-foreground)]/40'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>

                      {/* Tombol Add On Hover */}
                      <button
                        type="button"
                        onClick={() => openCreateModal(cell.dateStr)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-[var(--muted)] hover:bg-[var(--primary)] hover:text-white text-[var(--muted-foreground)]"
                        title={`Tambah agenda pada ${cell.dateStr}`}
                      >
                        <Plus size={12} weight="bold" />
                      </button>
                    </div>

                    {/* Event Badges List */}
                    <div className="space-y-1 overflow-y-auto max-h-[85px] scrollbar-none flex-1">
                      {cell.events.map((ev) => {
                        const styleInfo = EVENT_TYPE_LABELS[ev.jenis] || EVENT_TYPE_LABELS['daftar'];
                        return (
                          <div
                            key={ev.id}
                            onClick={() => setDetailEvent(ev)}
                            className="px-1.5 py-1 rounded-md text-[10px] font-medium leading-tight truncate cursor-pointer transition-transform hover:scale-[1.02] flex items-center gap-1 shadow-2xs border border-transparent hover:border-[var(--primary)]"
                            style={{
                              backgroundColor: styleInfo.bg,
                              color: styleInfo.color,
                            }}
                            title={`${ev.judul} (${ev.jam || 'Jadwal'})`}
                          >
                            {ev.is_deadline && <Alarm size={11} weight="fill" className="shrink-0 text-red-600" />}
                            <span className="truncate">{ev.judul}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* View Mode: DAFTAR / TABEL */}
        {viewMode === 'list' && (
          <Card className="border-[var(--border)] bg-[var(--card)] shadow-xs">
            <CardContent className="p-0">
              {filteredEvents.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={<CalendarIcon size={28} weight="duotone" className="text-primary" />}
                    title="Tidak Ada Agenda Timeline"
                    description="Belum ada agenda yang sesuai dengan kriteria filter. Tambahkan agenda manual atau sinkronkan otomatis dari cabang lomba."
                  />
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {filteredEvents.map((ev) => {
                    const styleInfo = EVENT_TYPE_LABELS[ev.jenis] || EVENT_TYPE_LABELS['daftar'];
                    return (
                      <div
                        key={ev.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--muted)]/20 transition-colors"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded-md text-[11px] font-bold"
                              style={{ backgroundColor: styleInfo.bg, color: styleInfo.color }}
                            >
                              {styleInfo.label}
                            </span>

                            {ev.cabang_nama && (
                              <Badge variant="neutral" className="text-[10px]">
                                <Trophy size={11} className="mr-1 inline text-primary" />
                                {ev.cabang_nama}
                              </Badge>
                            )}

                            {ev.is_deadline && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                <Alarm size={12} weight="fill" />
                                Deadline
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                            {ev.judul}
                          </h4>
                          {ev.deskripsi && (
                            <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 max-w-2xl">
                              {ev.deskripsi}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted-foreground)] pt-1">
                            <span className="font-mono font-semibold text-[var(--foreground)]">
                              📅 {ev.tanggal_mulai}
                            </span>
                            {ev.jam && (
                              <span className="flex items-center gap-1">
                                <Clock size={13} /> {ev.jam}
                              </span>
                            )}
                            {ev.lokasi && (
                              <span className="flex items-center gap-1">
                                <MapPin size={13} /> {ev.lokasi}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border)]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(ev)}
                            leftIcon={<PencilSimple size={14} />}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteConfirmId(ev.id)}
                            leftIcon={<Trash size={14} />}
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

      </div>

      {/* Modal Tambah / Edit Event */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEventId ? 'Edit Agenda Timeline' : 'Tambah Agenda Timeline Baru'}
        description="Agenda ini akan otomatis ditampilkan pada kalender landing page publik Permifest x Deforkafest."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <Alert variant="destructive" onClose={() => setFormError(null)}>
              <AlertTitle>Gagal Menyimpan</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Input
            label="Judul Agenda *"
            placeholder="Contoh: Technical Meeting Babak Penyisihan MLBB"
            required
            value={formJudul}
            onChange={(e) => setFormJudul(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                Kategori Agenda *
              </label>
              <select
                value={formJenis}
                onChange={(e) => setFormJenis(e.target.value as TimelineEventType)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-md px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="daftar">Pendaftaran & Pembayaran</option>
                <option value="technical-meeting">Technical Meeting (Pengarahan)</option>
                <option value="penyisihan">Babak Penyisihan / Tanding</option>
                <option value="final">Babak Final / Presentasi</option>
                <option value="pengumuman">Pengumuman & Awarding</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                Terkait Cabang Lomba
              </label>
              <select
                value={formCabangId}
                onChange={(e) => setFormCabangId(e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-md px-3 py-2 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
              >
                <option value="">Agenda Umum / Seluruh Cabang</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'academic' ? 'Akademik' : 'E-Sport'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal Agenda (YYYY-MM-DD) *"
              type="date"
              required
              value={formTanggalMulai}
              onChange={(e) => setFormTanggalMulai(e.target.value)}
            />

            <Input
              label="Jam Pelaksanaan"
              placeholder="Contoh: 09:00 WIB atau 23:59 WIB"
              value={formJam}
              onChange={(e) => setFormJam(e.target.value)}
            />
          </div>

          <Input
            label="Lokasi / Platform Pelaksanaan"
            placeholder="Contoh: Online Arena, Kampus UST Yogyakarta, Zoom / Discord"
            value={formLokasi}
            onChange={(e) => setFormLokasi(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
              Deskripsi Singkat / Catatan Peserta
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan detail agenda, apa yang perlu disiapkan peserta, atau link teknis jika ada..."
              value={formDeskripsi}
              onChange={(e) => setFormDeskripsi(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-md p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_deadline"
              checked={formIsDeadline}
              onChange={(e) => setFormIsDeadline(e.target.checked)}
              className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <label htmlFor="is_deadline" className="text-xs text-[var(--foreground)] cursor-pointer select-none">
              Tandai sebagai <strong>Batas Akhir / Deadline Ketat</strong> (muncul ikon alarm merah)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formSubmitting}
            >
              {editingEventId ? 'Simpan Perubahan' : 'Terbitkan Agenda'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Agenda dari Klik Kalender Grid */}
      {detailEvent && (
        <Modal
          isOpen={Boolean(detailEvent)}
          onClose={() => setDetailEvent(null)}
          title={detailEvent.judul}
          description={`Agenda ${EVENT_TYPE_LABELS[detailEvent.jenis]?.label || 'Event'} pada ${detailEvent.tanggal_mulai}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={EVENT_TYPE_LABELS[detailEvent.jenis]?.badgeVariant || 'neutral'}>
                {EVENT_TYPE_LABELS[detailEvent.jenis]?.label || detailEvent.jenis}
              </Badge>
              {detailEvent.cabang_nama && (
                <Badge variant="neutral">
                  <Trophy size={12} className="mr-1 inline text-primary" />
                  {detailEvent.cabang_nama}
                </Badge>
              )}
              {detailEvent.is_deadline && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  <Alarm size={12} weight="fill" />
                  Batas Waktu (Deadline)
                </span>
              )}
            </div>

            {detailEvent.deskripsi && (
              <p className="text-xs text-[var(--foreground)] leading-relaxed bg-[var(--muted)]/40 p-3 rounded-lg border border-[var(--border)]">
                {detailEvent.deskripsi}
              </p>
            )}

            <div className="space-y-2 text-xs text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <span className="w-20 font-semibold text-[var(--foreground)]">Tanggal:</span>
                <span className="font-mono text-[var(--foreground)] font-bold">{detailEvent.tanggal_mulai}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 font-semibold text-[var(--foreground)]">Waktu:</span>
                <span>{detailEvent.jam || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-20 font-semibold text-[var(--foreground)]">Lokasi:</span>
                <span>{detailEvent.lokasi || 'Online Platform'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setDeleteConfirmId(detailEvent.id);
                  setDetailEvent(null);
                }}
                leftIcon={<Trash size={14} />}
              >
                Hapus Agenda
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDetailEvent(null)}
                >
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openEditModal(detailEvent)}
                  leftIcon={<PencilSimple size={14} />}
                >
                  Edit Agenda
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Konfirmasi Hapus Agenda */}
      <ConfirmDialog
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Agenda Timeline"
        description="Apakah Anda yakin ingin menghapus agenda ini? Agenda yang dihapus tidak akan lagi muncul di kalender landing page."
        confirmText="Ya, Hapus"
        variant="destructive"
        isLoading={isDeleting}
      />

    </DashboardLayout>
  );
}
