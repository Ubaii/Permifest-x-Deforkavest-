'use client';

import React, { useState, useMemo } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import { useAppStore } from '@/lib/store';
import { MOCK_FAQS } from '@/lib/mock-data';

interface FaqSectionProps {
  id?: string;
}

export function FaqSection({ id = 'faq' }: FaqSectionProps) {
  const store = useAppStore();
  const rawFaqs = store?.faqs;
  const faqs = Array.isArray(rawFaqs) && rawFaqs.length > 0 ? rawFaqs : MOCK_FAQS;

  const publishedFaqs = useMemo(() => {
    return faqs.filter((f) => f.is_published).sort((a, b) => a.order_index - b.order_index);
  }, [faqs]);

  const [openId, setOpenId] = useState<string | null>(publishedFaqs[0]?.id || 'faq-1');

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
        <div className="inline-block px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#140D33] border border-[#524112] text-[#FFE359] mb-3">
          Tanya Jawab &amp; Bantuan
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
        {publishedFaqs.map((item, idx) => {
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
