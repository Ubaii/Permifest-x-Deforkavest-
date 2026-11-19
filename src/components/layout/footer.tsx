import React from 'react';
import Link from 'next/link';

const LOMBA_LINKS = [
  { href: '/#lomba', label: 'UI/UX' },
  { href: '/#lomba', label: 'IT System Architecture' },
  { href: '/#lomba', label: 'Esai Cyber Security' },
  { href: '/#lomba', label: 'Machine Learning' },
  { href: '/#lomba', label: 'PES' },
];

const NAV_LINKS = [
  { href: '/#lomba', label: 'Lomba' },
  { href: '/#jadwal', label: 'Jadwal' },
  { href: '/#peringkat', label: 'Peringkat' },
  { href: '/#daftar', label: 'Cara Daftar' },
  { href: '/#faq', label: 'FAQ' },
];

export function Footer() {
  return (
    <footer className="border-t border-[#2E2266] bg-[#0B0720] text-[#A99FD1] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + Penyelenggara */}
          <div className="space-y-3 md:col-span-1">
            <p className="font-[family-name:var(--font-bricolage)] font-extrabold text-base text-[#F5F2FF]">
              Permifest x Deforkafest
            </p>
            <p className="text-xs text-[#A99FD1] leading-relaxed">
              Permikomnas Yogyakarta x IMPSI UST Yogyakarta. Platform terpadu pendaftaran, jadwal,
              dan papan peringkat kompetisi.
            </p>

            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-[#F5F2FF] uppercase tracking-wider">
                Kanal Resmi
              </p>
              <div className="flex flex-col gap-1 text-xs text-[#A99FD1]">
                <a
                  href="https://instagram.com/permikomnas.diy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F5F2FF] transition-colors"
                >
                  Instagram: @permikomnas.diy
                </a>
                <a
                  href="https://instagram.com/impsi_ust"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F5F2FF] transition-colors"
                >
                  Instagram: @impsi_ust
                </a>
              </div>
            </div>
          </div>

          {/* Lomba */}
          <div>
            <h4 className="font-bold text-[#F5F2FF] mb-3 uppercase tracking-wider text-[11px]">
              Cabang Lomba
            </h4>
            <ul className="space-y-2">
              {LOMBA_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#A99FD1] hover:text-[#F5F2FF] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-bold text-[#F5F2FF] mb-3 uppercase tracking-wider text-[11px]">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-[#A99FD1] hover:text-[#F5F2FF] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pelaksanaan */}
          <div>
            <h4 className="font-bold text-[#F5F2FF] mb-3 uppercase tracking-wider text-[11px]">
              Pelaksanaan
            </h4>
            <div className="space-y-1.5 text-xs text-[#A99FD1]">
              <p>Pendaftaran: 1 Nov - 10 Des 2026</p>
              <p>Technical Meeting: 12 Des 2026</p>
              <p>Penyisihan: 18 Des 2026</p>
              <p>Grand Final: 25 - 27 Des 2026</p>
              <p>Lokasi: Kampus UST Yogyakarta &amp; Online</p>
            </div>
            <div className="mt-4">
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-[#0B0720] transition-opacity hover:opacity-90 min-h-[44px]"
                style={{
                  background: 'linear-gradient(135deg, #9B6BF2, #D56BD9)',
                }}
              >
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#2E2266] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A99FD1]">
          <span>Copyright 2026 Permifest x Deforkafest. Seluruh hak cipta dilindungi.</span>
          <span>Permikomnas Yogyakarta x IMPSI UST Yogyakarta</span>
        </div>
      </div>
    </footer>
  );
}
