'use client';

import React from 'react';
import Link from 'next/link';
import { getLandingCompetitions } from '@/lib/landing-data';
import { formatCurrency } from '@/lib/utils';
import { QrCode, ShieldCheck, Check, ArrowRight } from '@phosphor-icons/react';

export function PricingSection() {
  const competitions = getLandingCompetitions();

  return (
    <section
      aria-labelledby="pricing-heading"
      className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/50"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Kolom Kiri: Tabel Biaya Cabang Lomba */}
        <div className="lg:col-span-7">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-violet-400">
            Transparansi Biaya
          </span>
          <h2
            id="pricing-heading"
            className="text-2xl sm:text-4xl font-extrabold font-[family-name:var(--font-bricolage)] text-foreground tracking-tight mt-2 mb-4"
          >
            Investasi Pendaftaran Kompetisi
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
            Biaya pendaftaran sudah termasuk hak penilaian rubrik juri terstandarisasi, akses
            room technical meeting, dan e-sertifikat nasional.
          </p>

          <div className="space-y-3">
            {competitions.map((comp) => (
              <div
                key={comp.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/70 hover:border-brand-violet-600 transition-colors"
              >
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    {comp.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {comp.participation_type === 'team'
                      ? `Kategori Tim (${comp.min_team_size}–${comp.max_team_size} orang)`
                      : 'Kategori Individu'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm sm:text-base font-bold text-foreground font-[family-name:var(--font-jetbrains)] tabular-nums">
                    {formatCurrency(comp.registration_fee)}
                  </span>
                  <span className="block text-[10px] text-muted-foreground">per pendaftaran</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Panduan QRIS Placeholder */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 text-center relative overflow-hidden">
            {/* [PLACEHOLDER] QRIS Ilustrasi */}
            <div className="mx-auto w-36 h-36 rounded-2xl bg-muted/80 border border-border/80 flex flex-col items-center justify-center text-muted-foreground mb-6">
              <QrCode size={64} weight="duotone" className="text-brand-violet-400" />
              <span className="text-[10px] uppercase font-bold tracking-wider mt-1 text-muted-foreground">
                QRIS Nasional
              </span>
            </div>

            <h3 className="text-lg font-bold font-[family-name:var(--font-bricolage)] text-foreground mb-2">
              Pembayaran Cepat via QRIS
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
              Mendukung semua aplikasi perbankan digital dan e-wallet (BCA, Mandiri, GoPay, OVO,
              ShopeePay, Dana, dll). Kode QRIS asli akan digenerate otomatis di dashboard setelah kamu
              memilih cabang lomba.
            </p>

            <ul className="text-left text-xs text-muted-foreground space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-support-lime shrink-0" weight="bold" />
                <span>Tanpa biaya transfer antar bank</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-support-lime shrink-0" weight="bold" />
                <span>Unggah bukti pembayaran langsung dari HP</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-brand-gold shrink-0" weight="bold" />
                <span>Verifikasi panitia maksimal 1x24 jam kerja</span>
              </li>
            </ul>

            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-xs sm:text-sm text-primary-foreground bg-primary hover:opacity-90 transition-opacity min-h-[44px]"
            >
              <span>Daftar &amp; Dapatkan QRIS</span>
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
