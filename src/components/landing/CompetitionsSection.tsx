'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import {
  X,
  ArrowRight,
  CheckCircle,
} from '@phosphor-icons/react';

interface CompetitionItem {
  id: string;
  name: string;
  type: 'academic' | 'non_academic';
  categoryType: 'gold' | 'sky';
  categoryLabel: 'Akademik' | 'Non-akademik';
  iconBg: string;
  iconPath: React.ReactNode;
  desc: string;
  formatText: string;
  feeText: string;
  registrationFee: number;
  participationType: string;
  allowedFormat: string;
}

const COMPETITIONS_DATA: CompetitionItem[] = [
  {
    id: 'comp-uiux',
    name: 'UI/UX',
    type: 'academic',
    categoryType: 'gold',
    categoryLabel: 'Akademik',
    iconBg: '#6CC4FF',
    iconPath: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#0B0720" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 5v19l5-5 4 8 3-1.5-4-8h7z" />
      </svg>
    ),
    desc: 'Rancang pengalaman yang enak dipakai, dari riset sampai prototipe.',
    formatText: 'Individu · Desain Figma',
    feeText: 'Rp 75.000',
    registrationFee: 75000,
    participationType: 'Individu (1 orang)',
    allowedFormat: 'Figma Prototype URL & Case Study PDF',
  },
  {
    id: 'comp-arch',
    name: 'IT System Architecture',
    type: 'academic',
    categoryType: 'gold',
    categoryLabel: 'Akademik',
    iconBg: '#E6C978',
    iconPath: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#0B0720" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="5" width="22" height="7" rx="2" />
        <rect x="5" y="20" width="10" height="7" rx="2" />
        <rect x="17" y="20" width="10" height="7" rx="2" />
        <path d="M16 12v4M10 20v-4h12v4" />
      </svg>
    ),
    desc: 'Susun arsitektur sistem yang kuat, rapi, dan siap tumbuh.',
    formatText: 'Tim (1–3 orang) · Proposal PDF',
    feeText: 'Rp 100.000',
    registrationFee: 100000,
    participationType: 'Tim (1–3 orang)',
    allowedFormat: 'Blueprint Dokumen & Diagram Arsitektur (.pdf)',
  },
  {
    id: 'comp-esai',
    name: 'Esai Cyber Security',
    type: 'academic',
    categoryType: 'gold',
    categoryLabel: 'Akademik',
    iconBg: '#C4F15A',
    iconPath: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#0B0720" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4l10 4v8c0 6-4 10-10 12C10 26 6 22 6 16V8z" />
        <path d="M11 16l4 4 6-8" />
      </svg>
    ),
    desc: 'Tulis gagasanmu soal keamanan siber, tajam dan enak dibaca.',
    formatText: 'Individu · Naskah PDF',
    feeText: 'Rp 50.000',
    registrationFee: 50000,
    participationType: 'Individu (1 orang)',
    allowedFormat: 'Naskah Esai Ilmiah (.pdf, maks 15MB)',
  },
  {
    id: 'comp-ml',
    name: 'Machine Learning',
    type: 'non_academic',
    categoryType: 'sky',
    categoryLabel: 'Non-akademik',
    iconBg: '#F0A6F2',
    iconPath: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#0B0720" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="9" r="3" />
        <circle cx="7" cy="23" r="3" />
        <circle cx="16" cy="16" r="3" />
        <circle cx="25" cy="16" r="3" />
        <path d="M10 9l3.5 5M10 23l3.5-5M19 16h3" />
      </svg>
    ),
    desc: 'Latih modelmu, kejar akurasi, dan buktikan di papan skor.',
    formatText: 'Tim / Individu · Notebook / Code',
    feeText: 'Rp 75.000',
    registrationFee: 75000,
    participationType: 'Individu atau Tim (1–2 orang)',
    allowedFormat: 'Model Weights & Notebook (.ipynb / GitHub repo)',
  },
  {
    id: 'comp-pes',
    name: 'PES',
    type: 'non_academic',
    categoryType: 'sky',
    categoryLabel: 'Non-akademik',
    iconBg: '#9B6BF2',
    iconPath: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#0B0720" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="9" width="26" height="15" rx="7" />
        <path d="M10 13v7M6.5 16.5h7" />
        <circle cx="21" cy="14.5" r="1" />
        <circle cx="24" cy="18.5" r="1" />
      </svg>
    ),
    desc: 'Adu strategi di lapangan hijau. Jempol boleh pegal, hati jangan.',
    formatText: 'Individu · Bracket Tanding',
    feeText: 'Rp 35.000',
    registrationFee: 35000,
    participationType: 'Individu (1v1)',
    allowedFormat: 'Turnamen e-sport offline/online bracket',
  },
];

interface CompetitionsSectionProps {
  id?: string;
}

export function CompetitionsSection({ id = 'lomba' }: CompetitionsSectionProps) {
  const [selectedComp, setSelectedComp] = useState<CompetitionItem | null>(null);

  return (
    <section
      id={id}
      aria-labelledby="competitions-heading"
      className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mb-10 text-left">
        <h2
          id="competitions-heading"
          className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-bricolage)] text-foreground tracking-tight"
        >
          Pilih arena{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            kamu
          </span>
        </h2>
        <p className="mt-3 text-[#A99FD1] text-base leading-relaxed">
          Lima cabang contoh. Daftar aslinya diatur panitia dan bisa bertambah kapan saja.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {COMPETITIONS_DATA.map((comp) => (
          <article
            key={comp.id}
            className="flex flex-col justify-between rounded-2xl border border-[#2E2266] bg-[#140D33] p-5 sm:p-6 transition-all hover:border-[#7c4ddb]"
          >
            <div>
              {/* Icon Box */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-[#F5F2FF] shadow-sm mb-4"
                style={{ backgroundColor: comp.iconBg }}
              >
                {comp.iconPath}
              </div>

              <h3 className="text-xl font-bold font-[family-name:var(--font-bricolage)] text-[#F5F2FF] mb-2">
                {comp.name}
              </h3>

              {/* Badge */}
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                  comp.categoryType === 'gold'
                    ? 'bg-[#2a2108] text-[#E6C978] border border-[#524112]/40'
                    : 'bg-[#082436] text-[#6CC4FF] border border-[#144766]/40'
                }`}
              >
                {comp.categoryLabel}
              </span>

              {/* Description */}
              <p className="text-sm text-[#A99FD1] leading-relaxed mb-4">
                {comp.desc}
              </p>

              <p className="text-xs text-[#A99FD1]/90 font-medium">
                Format: {comp.formatText} · Biaya: {comp.feeText}
              </p>
            </div>

            {/* CTA Button */}
            <div className="mt-6 pt-4 border-t border-[#2E2266]/60">
              <button
                type="button"
                onClick={() => setSelectedComp(comp)}
                className="w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 font-bold text-xs sm:text-sm text-[#F5F2FF] bg-[#1d1347] border border-[#2E2266] hover:bg-[#25195c] hover:border-[#7c4ddb] transition-all min-h-[44px]"
              >
                Lihat detail
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* ── Dialog Detail Lomba Modal ── */}
      {selectedComp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setSelectedComp(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-[#140D33] border border-[#2E2266] p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedComp(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#A99FD1] hover:text-[#F5F2FF] hover:bg-[#1d1347] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Tutup"
            >
              <X size={20} weight="bold" />
            </button>

            <span
              className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold mb-2 ${
                selectedComp.categoryType === 'gold'
                  ? 'bg-[#2a2108] text-[#E6C978]'
                  : 'bg-[#082436] text-[#6CC4FF]'
              }`}
            >
              {selectedComp.categoryLabel}
            </span>

            <h3
              id="modal-title"
              className="text-2xl font-bold font-[family-name:var(--font-bricolage)] text-[#F5F2FF] pr-8"
            >
              {selectedComp.name}
            </h3>

            <p className="mt-3 text-sm text-[#A99FD1] leading-relaxed">
              {selectedComp.desc}
            </p>

            <div className="mt-5 space-y-3 pt-4 border-t border-[#2E2266] text-xs sm:text-sm text-[#A99FD1]">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#C4F15A] shrink-0" weight="fill" />
                <span>
                  Format Peserta: <strong className="text-[#F5F2FF]">{selectedComp.participationType}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#C4F15A] shrink-0" weight="fill" />
                <span>
                  Biaya Pendaftaran:{' '}
                  <strong className="text-[#F5F2FF] tabular-nums">
                    {formatCurrency(selectedComp.registrationFee)}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[#C4F15A] shrink-0" weight="fill" />
                <span>
                  Pengumpulan Karya: <strong className="text-[#F5F2FF]">{selectedComp.allowedFormat}</strong>
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#2E2266] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedComp(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#A99FD1] hover:text-[#F5F2FF] hover:bg-[#1d1347] min-h-[44px]"
              >
                Tutup
              </button>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#0B0720] hover:opacity-90 min-h-[44px]"
                style={{
                  background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
                }}
              >
                Daftar Sekarang
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
