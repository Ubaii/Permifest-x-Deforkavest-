'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Question as HelpCircle, 
  EnvelopeSimple as Mail, 
  Phone, 
  DownloadSimple as Download, 
  CaretDown as ChevronDown, 
  CaretUp as ChevronUp, 
  FileText,
  MapPin,
  ArrowSquareOut as ExternalLink
} from '@phosphor-icons/react';

export default function InformasiPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Apakah satu peserta boleh mendaftar lebih dari satu cabang lomba?',
      a: 'Berdasarkan PRD dan konfigurasi platform saat ini, satu akun diperbolehkan mendaftar lebih dari satu lomba selama jadwal tahapan pertandingan/deadline karya tidak bentrok.'
    },
    {
      q: 'Bagaimana metode pembayaran biaya pendaftaran?',
      a: 'Pembayaran dilakukan via scan QRIS atau transfer bank resmi panitia. Peserta wajib mengunggah foto/screenshot bukti transfer di dashboard pendaftaran untuk diverifikasi panitia dalam waktu maksimal 24 jam.'
    },
    {
      q: 'Apakah karya yang sudah diunggah bisa diperbaiki/diupload ulang?',
      a: 'Bisa! Peserta dapat memperbarui berkas unggahan karya (atau tautan Figma) kapan saja sebelum batas waktu deadline ditutup. Sistem secara otomatis mencatat riwayat versi dan hanya mengajukan versi terakhir ke dewan juri.'
    },
    {
      q: 'Bagaimana mekanisme pertandingan untuk PES dan Mobile Legends?',
      a: 'Untuk lomba non-akademik (e-sport), pertandingan dilaksanakan secara daring/luring sesuai panduan technical meeting. Platform ini digunakan untuk pendaftaran, konfirmasi peserta, serta pembaruan hasil akhir dan leaderboard.'
    },
    {
      q: 'Kapan pengumuman pemenang resmi dipublikasikan?',
      a: 'Pengumuman pemenang akan dirilis serentak di halaman Leaderboard dan Papan Pengumuman website setelah proses penguncian nilai oleh panitia selesai.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />

      <section className="py-12 bg-slate-950 border-b border-slate-900 cyber-grid">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="cyber" className="mb-3">PUSAT INFORMASI</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Panduan & Tanya Jawab</h1>
          <p className="text-sm text-slate-400 mt-2">
            Unduh guidebook teknis, pelajari regulasi perlombaan, dan hubungi kontak narahubung resmi.
          </p>
        </div>
      </section>

      <section className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 space-y-8">
        
        {/* Guidebook Download Card */}
        <Card className="border-cyan-500/30 glow-cyan">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Buku Panduan Teknis (Guidebook 2026)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mencakup rubrik penilaian, format sitasi, aturan plagiarisme, dan regulasi pertandingan e-sport.
                </p>
              </div>
            </div>
            <a href="/docs/guidebook-permifest-2026.pdf" download="Guidebook_Permifest_Deforkafest_2026.pdf">
              <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>
                Unduh PDF (v2.1)
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* FAQs */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Pertanyaan Umum (FAQ)</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <Card key={idx}>
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                  >
                    <span className="text-sm font-semibold text-slate-200">{faq.q}</span>
                    <button className="text-slate-400">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 mt-1">
                      {faq.a}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact info */}
        <div id="kontak">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Narahubung Panitia</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5 space-y-2">
                <div className="text-xs font-bold text-cyan-400 uppercase font-mono">Lomba Akademik (Esai, UI/UX, IT Arch)</div>
                <div className="text-sm font-semibold text-slate-200">Sekretariat Panitia Akademik</div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>WhatsApp: +62 812-3456-7890</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Email: akademik@permifest.id</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase font-mono">Turnamen E-Sport (PES & MLBB)</div>
                <div className="text-sm font-semibold text-slate-200">Divisi Kompetisi Digital Gaming</div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>WhatsApp: +62 877-8899-0011</span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email: esport@permifest.id</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </section>

      <Footer />
    </div>
  );
}
