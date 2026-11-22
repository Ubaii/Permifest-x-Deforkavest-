'use client';

import React, { useEffect, useState, memo } from 'react';
import Link from 'next/link';

interface TimeLeft {
  hari: number;
  jam: number;
  menit: number;
  detik: number;
}

function computeTimeLeft(targetIso: string): TimeLeft {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const totalSec = Math.floor(diff / 1000);
  return {
    hari: Math.floor(totalSec / 86400),
    jam: Math.floor((totalSec % 86400) / 3600),
    menit: Math.floor((totalSec % 3600) / 60),
    detik: totalSec % 60,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

interface CountdownTimerProps {
  deadlineDate?: string;
  registrationDateLabel?: string;
}

export const CountdownTimer = memo(function CountdownTimer({
  deadlineDate = '2026-12-11T23:59:59+07:00',
  registrationDateLabel = '11 Desember 2026',
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(computeTimeLeft(deadlineDate));
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(deadlineDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadlineDate]);

  if (!timeLeft) return null;

  return (
    <section
      aria-label="Countdown Deadline Pendaftaran"
      className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"
    >
      <div className="rounded-3xl bg-[#140D33] border-2 border-[#2E2266] p-5 sm:p-7 shadow-[0_12px_36px_rgba(11,7,32,0.8)] flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Kolom Kiri: Label & Info Batas Waktu */}
        <div className="text-center lg:text-left">
          <div className="inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#2a2108] text-[#FFE359] border border-[#524112] mb-2 select-none -rotate-1">
            Deadline Pendaftaran Gelombang 1
          </div>
          <h3 className="text-xl sm:text-2xl font-black font-[family-name:var(--font-bricolage)] text-[#F5F2FF] tracking-tight">
            Segera Daftarkan Tim &amp; Karyamu!
          </h3>
          <p className="text-xs sm:text-sm text-[#A99FD1] mt-1">
            Batas pengumpulan formulir: <strong className="text-[#6CC4FF]">{registrationDateLabel}</strong>, pukul 23:59 WIB.
          </p>
        </div>

        {/* Kolom Tengah: 4 Kotak Digit Hitung Mundur */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 select-none">
          {[
            { label: 'Hari', val: timeLeft.hari },
            { label: 'Jam', val: timeLeft.jam },
            { label: 'Menit', val: timeLeft.menit },
            { label: 'Detik', val: timeLeft.detik },
          ].map(({ label, val }, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className="w-14 sm:w-16 h-15 sm:h-17 rounded-2xl bg-[#0B0720] border-2 border-[#2E2266] flex items-center justify-center shadow-[3px_3px_0px_#0B0720] group-hover:border-[#9B6BF2] transition-colors">
                  <span className="tabular-nums text-2xl sm:text-3xl font-black font-[family-name:var(--font-jetbrains)] text-[#F5F2FF] tracking-tight">
                    {pad(val)}
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] text-[#A99FD1] font-bold uppercase tracking-wider mt-1.5">
                  {label}
                </span>
              </div>

              {i < 3 && (
                <div className="flex flex-col justify-center items-center pb-5 select-none" aria-hidden="true">
                  <span className="text-lg sm:text-xl font-black text-[#9B6BF2]">
                    :
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Kolom Kanan: Tombol Aksi Cepat */}
        <div className="shrink-0 w-full sm:w-auto text-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-black text-[#0B0720] bg-gradient-to-r from-[#9B6BF2] via-[#D56BD9] to-[#FFE359] border-2 border-[#0B0720] shadow-[4px_4px_0px_#0B0720] hover:shadow-[6px_6px_0px_#0B0720] hover:-translate-y-0.5 active:translate-y-0.5 transition-all select-none"
          >
            Amankan Slot Pendaftaran
          </Link>
        </div>
      </div>
    </section>
  );
});
