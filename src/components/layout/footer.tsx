'use client';

import React from 'react';
import Link from 'next/link';
import {
  InstagramLogo,
  WhatsappLogo,
  MapPin,
  EnvelopeSimple,
  ShieldCheck,
  FileText,
  Sparkle,
} from '@phosphor-icons/react';

const LOMBA_LINKS = [
  { href: '/#lomba', label: 'Esai Ilmiah & Cyber Security' },
  { href: '/#lomba', label: 'UI/UX Design Competition' },
  { href: '/#lomba', label: 'IT System Architecture' },
  { href: '/#lomba', label: 'PES 2026 e-Football' },
  { href: '/#lomba', label: 'Mobile Legends: Bang Bang' },
];

const FAST_LINKS = [
  { href: '/#jadwal', label: 'Kalender & Jadwal Lomba' },
  { href: '/#daftar', label: 'Alur & Panduan Pendaftaran' },
  { href: '/#faq', label: 'Pertanyaan Umum (FAQ)' },
  { href: '/login', label: 'Portal Masuk Peserta' },
  { href: '/register', label: 'Registrasi Akun Baru' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[#2E2266] bg-[#080517] text-[#A99FD1] text-sm overflow-hidden">
      {/* Subtle Glow Backdrop */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-[#9B6BF2]/5 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Kolom 1 & 2: Brand, Kolaborasi & Narasi */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9B6BF2] to-[#D56BD9] p-0.5 shadow-[2px_2px_0px_#FFE359]">
                <div className="w-full h-full bg-[#0B0720] rounded-[10px] flex items-center justify-center text-white font-black text-lg">
                  P
                </div>
              </div> */}
              <div>
                <span className="font-[family-name:var(--font-bricolage)] font-extrabold text-xl text-[#F5F2FF] tracking-tight block">
                  Permifest <span className="text-[#D56BD9]">x</span> Deforkafest
                </span>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#6CC4FF]">
                  National Tech &amp; E-Sport Arena 2026
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#A99FD1] leading-relaxed max-w-sm">
              Kolaborasi akbar tahunan antara <strong>Permikomnas Wilayah VII Yogyakarta</strong>{' '}
              dan <strong>Himpunan Mahasiswa Informatika (IMPSI) UST Yogyakarta</strong>.
              Wadah kompetisi teknologi dan e-sport terpadu bagi generasi muda berdaya saing.
            </p>

            {/* Social badges */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <a
                href="https://instagram.com/permikomnas.diy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-[#F5F2FF] bg-[#140D33] border border-[#2E2266] hover:border-[#D56BD9] hover:bg-[#1E134D] transition-all min-h-[36px]"
              >
                <InstagramLogo size={16} weight="bold" className="text-[#D56BD9]" />
                @permikomnas.diy
              </a>
              <a
                href="https://instagram.com/impsi_ust"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-[#F5F2FF] bg-[#140D33] border border-[#2E2266] hover:border-[#6CC4FF] hover:bg-[#1E134D] transition-all min-h-[36px]"
              >
                <InstagramLogo size={16} weight="bold" className="text-[#6CC4FF]" />
                @impsi_ust
              </a>
            </div>
          </div>

          {/* Kolom 3: Cabang Kompetisi */}
          <div>
            <h4 className="font-bold text-[#F5F2FF] mb-4 uppercase tracking-wider text-xs">
              Cabang Lomba
            </h4>
            <ul className="space-y-2.5">
              {LOMBA_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-[#A99FD1] hover:text-[#F5F2FF] hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: Navigasi Cepat & Dokumen */}
          <div>
            <h4 className="font-bold text-[#F5F2FF] mb-4 uppercase tracking-wider text-xs">
              Tautan &amp; Panduan
            </h4>
            <ul className="space-y-2.5">
              {FAST_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-[#A99FD1] hover:text-[#6CC4FF] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 5: Sekretariat & Helpdesk */}
          <div>
            <h4 className="font-bold text-[#F5F2FF] mb-4 uppercase tracking-wider text-xs">
              Narahubung &amp; Venue
            </h4>
            <div className="space-y-3 text-xs text-[#A99FD1] leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin size={16} weight="bold" className="text-[#D56BD9] shrink-0 mt-0.5" />
                <span>
                  Kampus Pusat UST Yogyakarta, Jl. Batikan, Tahunan, Umbulharjo, Kota Yogyakarta, D.I. Yogyakarta 55167
                </span>
              </div>
              <div className="flex items-center gap-2">
                <WhatsappLogo size={16} weight="bold" className="text-[#25D366] shrink-0" />
                <a
                  href="https://wa.me/6281234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Helpdesk WA: +62 812-3456-7890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeSimple size={16} weight="bold" className="text-[#6CC4FF] shrink-0" />
                <span>halo@permifest.id</span>
              </div>
            </div>

            {/* CTA Daftar di Footer */}
            <div className="mt-5">
              <Link
                href="/register"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl text-xs font-black text-[#0B0720] bg-gradient-to-r from-[#9B6BF2] via-[#D56BD9] to-[#FFE359] shadow-[3px_3px_0px_#0B0720] hover:brightness-110 active:translate-x-0.5 active:translate-y-0.5 transition-all min-h-[44px]"
              >
                Daftar Kompetisi Sekarang
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar / Copyright */}
        <div className="mt-12 pt-6 border-t border-[#2E2266] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A7FB8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Sistem Operasional &amp; Pendaftaran Terbuka</span>
          </div>

          <p className="text-center sm:text-right">
            &copy; 2026 <strong>Permifest x Deforkafest</strong>. Seluruh hak cipta dilindungi undang-undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
