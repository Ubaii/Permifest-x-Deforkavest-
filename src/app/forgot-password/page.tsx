'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 cyber-grid py-16">
        <Card className="w-full max-w-md border-cyan-500/30 glow-cyan">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <CardTitle className="justify-center text-xl">Lupa Kata Sandi?</CardTitle>
            <CardDescription>
              Masukkan alamat email terdaftar untuk menerima tautan pemulihan sandi.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {submitted ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Tautan Terkirim!</h4>
                <p className="text-xs text-slate-400">
                  Periksa kotak masuk (inbox) atau spam email <strong className="text-cyan-400">{email}</strong> untuk mengatur ulang kata sandi Anda.
                </p>
                <div className="pt-3">
                  <Link href="/login">
                    <Button variant="secondary" size="sm">Kembali ke Halaman Masuk</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Akun"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Button type="submit" variant="primary" className="w-full justify-center" isLoading={loading}>
                  Kirim Tautan Pemulihan
                </Button>

                <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <Link href="/login" className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Halaman Masuk</span>
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
