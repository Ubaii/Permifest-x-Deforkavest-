'use client';

import React from 'react';
import { SakugaButton } from '@/components/ui/sakuga-button';
import { ArrowRight } from '@phosphor-icons/react';

interface StepItem {
  num: number;
  title: string;
  desc: string;
}

const STEPS: StepItem[] = [
  {
    num: 1,
    title: 'Buat akun',
    desc: 'Cukup data dasar, nggak sampai semenit.',
  },
  {
    num: 2,
    title: 'Pilih lomba',
    desc: 'Cabangnya ada di atas, tinggal tunjuk yang paling kamu banget.',
  },
  {
    num: 3,
    title: 'Isi tim dan berkas',
    desc: 'Syarat berkas muncul sesuai cabang yang kamu pilih.',
  },
  {
    num: 4,
    title: 'Bayar lewat QRIS',
    desc: 'Unggah bukti bayar, lalu panitia yang memverifikasi.',
  },
];

interface HowToRegisterSectionProps {
  id?: string;
}

export function HowToRegisterSection({ id = 'daftar' }: HowToRegisterSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby="how-to-register-heading"
      className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mb-10 text-left">
        <h2
          id="how-to-register-heading"
          className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-bricolage)] text-foreground tracking-tight"
        >
          Daftar itu gampang,{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            empat langkah
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {STEPS.map((st) => (
          <div
            key={st.num}
            className="group relative flex flex-col justify-between rounded-2xl border border-[#2E2266] bg-[#140D33]/90 p-6 transition-all duration-200 hover:border-[#9B6BF2] hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(155,107,242,0.15)] backdrop-blur-sm"
          >
            <div>
              <p
                className="font-[family-name:var(--font-jetbrains)] font-extrabold text-4xl leading-none mb-4 group-hover:scale-105 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                0{st.num}
              </p>

              <h3 className="text-xl font-bold font-[family-name:var(--font-bricolage)] text-[#F5F2FF] mb-2 group-hover:text-[#F0A6F2] transition-colors">
                {st.title}
              </h3>

              <p className="text-sm text-[#A99FD1] leading-relaxed">
                {st.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <SakugaButton
          href="/register"
          variant="brand"
          size="lg"
          sfxText="GASSS!!"
          className="px-8 py-3.5"
          rightIcon={<ArrowRight size={18} weight="bold" />}
        >
          Mulai Pendaftaran Sekarang
        </SakugaButton>
      </div>
    </section>
  );
}
