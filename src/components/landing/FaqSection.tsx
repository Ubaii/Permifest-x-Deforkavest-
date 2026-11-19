'use client';

import React, { useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Boleh daftar sendiri atau harus tim?',
    answer: 'Tergantung cabangnya. Format tiap lomba ada di halaman detail.',
  },
  {
    id: 'faq-2',
    question: 'Bayarnya gimana?',
    answer: 'Lewat QRIS. Setelah daftar, kamu unggah bukti bayar dan panitia memverifikasi.',
  },
  {
    id: 'faq-3',
    question: 'Berkas apa saja yang disiapkan?',
    answer: 'Beda-beda per cabang. Daftarnya muncul saat kamu memilih lomba.',
  },
  {
    id: 'faq-4',
    question: 'Apakah mahasiswa dari luar D.I. Yogyakarta boleh mendaftar?',
    answer: 'Boleh. Seluruh cabang kompetisi terbuka untuk mahasiswa aktif D3/D4/S1 dari seluruh perguruan tinggi di Indonesia.',
  },
  {
    id: 'faq-5',
    question: 'Di mana babak final diselenggarakan?',
    answer: 'Babak final diselenggarakan di kampus Universitas Sarjanawiyata Tamansiswa (UST) Yogyakarta.',
  },
  {
    id: 'faq-6',
    question: 'Bagaimana bila berkas karya saya salah unggah?',
    answer: 'Selama periode pengumpulan karya sebelum batas waktu berakhir, kamu masih bisa mengunggah ulang revisi langsung dari dashboard peserta.',
  },
  {
    id: 'faq-7',
    question: 'Apakah peserta akan mendapatkan sertifikat?',
    answer: 'Seluruh peserta yang mengumpulkan karya lengkap atau hadir bertanding akan mendapatkan e-sertifikat nasional resmi.',
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
      className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <h2
        id="faq-heading"
        className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-bricolage)] text-foreground tracking-tight mb-8 text-left"
      >
        Sering ditanya
      </h2>

      <div className="divide-y divide-[#2E2266] border-y border-[#2E2266]">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="py-4">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                className="w-full flex items-center justify-between text-left font-bold text-base sm:text-lg text-[#F5F2FF] hover:text-[#D56BD9] transition-colors py-2 min-h-[44px]"
              >
                <span className="pr-4">{item.question}</span>
                <span
                  className={`shrink-0 transition-transform duration-200 text-[#A99FD1] ${
                    isOpen ? 'rotate-180 text-[#D56BD9]' : ''
                  }`}
                  aria-hidden="true"
                >
                  <CaretDown size={20} weight="bold" />
                </span>
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${item.id}`}
                  className="pt-2 pb-3 text-sm sm:text-base text-[#A99FD1] leading-relaxed"
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
