'use client';

import React, { useState } from 'react';
import { CaretDown, Question } from '@phosphor-icons/react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Boleh daftar sendiri atau harus tim?',
    answer: 'Tergantung cabangnya. Cabang Esai Ilmiah dapat diikuti individu atau tim (maksimal 3 orang), UI/UX & IT Architecture tim 2-3 orang, sedangkan PES bertanding individu (1 vs 1) dan Mobile Legends bertim 5 pemain inti + 1 cadangan.',
  },
  {
    id: 'faq-2',
    question: 'Bayarnya gimana?',
    answer: 'Pembayaran dilakukan praktis menggunakan QRIS Nasional resmi panitia. Setelah mendaftarkan tim, kamu cukup mengunggah bukti transfer digital di dashboard, dan tim verifikasi panitia akan mengonfirmasi status pembayaranmu.',
  },
  {
    id: 'faq-3',
    question: 'Berkas apa saja yang disiapkan?',
    answer: 'Secara umum: Kartu Tanda Mahasiswa (KTM) aktif atau surat keterangan aktif kuliah, pas foto formal, dan bukti pembayaran pendaftaran. Rincian berkas proposal/karya muncul saat kamu memilih cabang lomba di dashboard.',
  },
  {
    id: 'faq-4',
    question: 'Apakah mahasiswa dari luar D.I. Yogyakarta boleh mendaftar?',
    answer: 'Sangat boleh! Seluruh cabang kompetisi terbuka untuk seluruh mahasiswa aktif jenjang D3/D4/S1 dari perguruan tinggi negeri maupun swasta di seluruh wilayah Indonesia.',
  },
  {
    id: 'faq-5',
    question: 'Di mana babak final diselenggarakan?',
    answer: 'Babak final dan penganugerahan juara akan diselenggarakan secara luring (offline) di kampus Universitas Sarjanawiyata Tamansiswa (UST) Yogyakarta, lengkap dengan sesi exhibition dan awarding ceremony.',
  },
  {
    id: 'faq-6',
    question: 'Bagaimana bila berkas karya saya salah unggah?',
    answer: 'Selama periode pengumpulan karya sebelum batas waktu penutupan berakhir, kamu bebas memperbarui atau mengunggah ulang berkas revisi karya langsung dari menu Pengumpulan Karya di dashboard peserta.',
  },
  {
    id: 'faq-7',
    question: 'Apakah semua peserta akan mendapatkan sertifikat?',
    answer: 'Ya! Seluruh peserta yang menyelesaikan berkas karya atau hadir bertanding pada turnamen akan mendapatkan e-sertifikat nasional berpredikat resmi dari Permikomnas dan UST Yogyakarta.',
  },
];

interface FaqSectionProps {
  id?: string;
}

export function FaqSection({ id = 'faq' }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggle = (itemId: string) => {
    setOpenId((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <section
      id={id}
      aria-labelledby="faq-heading"
      className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#2E2266]/70 border border-[#9B6BF2]/40 text-[#6CC4FF] mb-3">
          <Question size={16} weight="bold" />
          Pertanyaan Umum
        </div>
        <h2
          id="faq-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-bricolage)] text-[#F5F2FF] tracking-tight"
        >
          Frequently Asked <span className="text-[#D56BD9]">Questions</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#A99FD1] max-w-xl mx-auto">
          Punya pertanyaan seputar teknis lomba, pendaftaran, atau pembayaran? Simak jawaban singkat di bawah ini.
        </p>
      </div>

      <div className="space-y-3.5">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-[#18113B] border-[#9B6BF2]/60 shadow-[0_8px_24px_rgba(155,107,242,0.15)] ring-1 ring-[#9B6BF2]/30'
                  : 'bg-[#120B2E]/60 border-[#2E2266] hover:border-[#6CC4FF]/40 hover:bg-[#160E38]/80'
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                className="w-full flex items-center justify-between text-left p-4 sm:p-5 gap-4 min-h-[56px] cursor-pointer select-none group"
              >
                <div className="flex items-center gap-3.5 sm:gap-4">
                  <span
                    className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all duration-200 ${
                      isOpen
                        ? 'bg-[#9B6BF2] text-[#0B0720] shadow-[2px_2px_0px_#FFE359]'
                        : 'bg-[#2E2266] text-[#A99FD1] group-hover:text-[#F5F2FF]'
                    }`}
                  >
                    0{idx + 1}
                  </span>
                  <span className={`text-base sm:text-lg font-bold transition-colors ${
                    isOpen ? 'text-[#F5F2FF]' : 'text-[#DDD6FE] group-hover:text-white'
                  }`}>
                    {item.question}
                  </span>
                </div>

                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    isOpen
                      ? 'rotate-180 bg-[#D56BD9] text-[#0B0720] border-[#FFE359]'
                      : 'bg-[#2E2266]/60 text-[#A99FD1] border-[#2E2266] group-hover:border-[#6CC4FF] group-hover:text-[#6CC4FF]'
                  }`}
                  aria-hidden="true"
                >
                  <CaretDown size={18} weight="bold" />
                </div>
              </button>

              <div
                id={`faq-answer-${item.id}`}
                className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pt-1 sm:pl-[68px] sm:pr-6 text-sm sm:text-base text-[#A99FD1] leading-relaxed border-t border-[#2E2266]/40">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
