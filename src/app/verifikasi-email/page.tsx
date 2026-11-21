'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnvelopeOpen, ArrowRight, ShieldCheck } from '@phosphor-icons/react';

export default function VerifikasiEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 cyber-grid py-16">
        <Card className="w-full max-w-md border-cyan-500/30 glow-cyan text-center">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
              <EnvelopeOpen className="w-7 h-7 text-slate-950 stroke-[2.5]" />
            </div>
            <CardTitle className="justify-center text-xl">Periksa Kotak Masuk Email Anda</CardTitle>
            <CardDescription>
              Tautan konfirmasi akun telah dikirimkan ke alamat email terdaftar
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2 text-left">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Langkah Verifikasi Akun:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Buka aplikasi email Anda (cek juga folder Spam atau Promosi).</li>
                <li>Klik tombol &quot;Konfirmasi Email Saya&quot; di pesan resmi Permifest.</li>
                <li>Setelah berhasil, Anda dapat langsung masuk dan memilih perlombaan.</li>
              </ol>
            </div>

            <div className="pt-2">
              <Link href="/login" className="block">
                <Button variant="primary" className="w-full justify-center gap-2">
                  <span>Menuju Halaman Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <p className="text-[11px] text-slate-500">
              Belum menerima email? Tunggu 1-2 menit atau coba lakukan pendaftaran ulang dengan alamat email yang benar.
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
