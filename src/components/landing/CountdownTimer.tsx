'use client';

import React, { useEffect, useState, memo } from 'react';
import { Clock } from '@phosphor-icons/react';

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
  deadlineDate: string;
  registrationDateLabel: string;
}

export const CountdownTimer = memo(function CountdownTimer({
  deadlineDate,
  registrationDateLabel,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    // Jalankan kalkulasi pertama secara instan
    setTimeLeft(computeTimeLeft(deadlineDate));

    // Perbarui hanya state lokal komponen ini setiap detik (tidak memicu re-render HeroSection)
    const interval = setInterval(() => {
      setTimeLeft(computeTimeLeft(deadlineDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadlineDate]);

  if (!timeLeft) return null;

  return (
    <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-[#140D33] border border-[#2E2266] shadow-[0_12px_36px_rgba(11,7,32,0.7)] inline-block max-w-full">
      <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-[#2E2266]/70">
        <span className="text-[11px] font-bold text-[#E6C978] uppercase tracking-wider">
          Hitung Mundur Deadline Pendaftaran
        </span>
        <span className="text-[10px] font-mono text-[#A99FD1] bg-[#0B0720] px-2 py-0.5 rounded border border-[#2E2266]">
          WIB (UTC+7)
        </span>
      </div>

      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
        {[
          { label: 'Hari', val: timeLeft.hari },
          { label: 'Jam', val: timeLeft.jam },
          { label: 'Menit', val: timeLeft.menit },
          { label: 'Detik', val: timeLeft.detik },
        ].map(({ label, val }, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className="w-13 sm:w-16 h-14 sm:h-16 rounded-xl bg-[#0B0720] border border-[#2E2266] flex items-center justify-center shadow-inner group-hover:border-[#9B6BF2] transition-colors">
                <span className="tabular-nums text-xl sm:text-2xl font-black font-[family-name:var(--font-jetbrains)] text-[#F5F2FF] tracking-tight">
                  {pad(val)}
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#A99FD1] font-bold uppercase tracking-wider mt-1.5">
                {label}
              </span>
            </div>

            {/* Pemisah titik dua digital */}
            {i < 3 && (
              <div className="flex flex-col justify-center items-center pb-5 select-none" aria-hidden="true">
                <span className="text-sm sm:text-base font-bold text-[#9B6BF2]">
                  :
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#2E2266]/70 flex items-center justify-between text-[11px] text-[#A99FD1]">
        <span className="flex items-center gap-1.5">
          <Clock size={12} className="text-[#6CC4FF]" />
          Batas akhir: {registrationDateLabel}, 23:59 WIB
        </span>
      </div>
    </div>
  );
});
