'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/store';
import { Shield, ArrowRight, CheckCircle } from '@phosphor-icons/react';

export default function RegisterPage() {
  const router = useRouter();
  const { switchRole, setCurrentUser } = useAppStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Create new user & log in
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        institution,
        phone,
        role: 'peserta' as const,
        email_verified: true,
      };

      setCurrentUser(newUser);
      setIsSuccess(true);

      setTimeout(() => {
        router.push('/dashboard/peserta');
      }, 1500);
    }, 700);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 cyber-grid py-12">
        <Card className="w-full max-w-md border-cyan-500/30 glow-cyan">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <CardTitle className="justify-center text-xl">Registrasi Akun Peserta</CardTitle>
            <CardDescription>
              Daftarkan diri Anda untuk mengikuti seluruh cabang kompetisi
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {isSuccess ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle size={48} className="text-emerald-400 mx-auto" weight="fill" />
                <h4 className="text-base font-bold text-white">Akun Berhasil Didaftarkan!</h4>
                <p className="text-xs text-slate-400">
                  Mengalihkan Anda secara otomatis ke Dashboard Peserta...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nama Lengkap"
                  required
                  placeholder="Contoh: Budi Pratama"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <Input
                  label="Alamat Email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  label="Instansi / Sekolah / Universitas"
                  required
                  placeholder="Contoh: Universitas Indonesia"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                />

                <Input
                  label="Nomor WhatsApp"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Input
                  label="Kata Sandi (Password)"
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Button type="submit" variant="primary" className="w-full justify-center" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Daftar Sekarang
                </Button>

                <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
                    Masuk di sini
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
