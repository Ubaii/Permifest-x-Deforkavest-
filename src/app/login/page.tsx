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
import { Shield, Lock, ArrowRight } from '@phosphor-icons/react';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useAppStore();

  const [email, setEmail] = useState('peserta@permifest.id');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      // Determine role by email for testing
      if (email.includes('juri')) {
        switchRole('juri');
        router.push('/dashboard/juri');
      } else if (email.includes('panitia') || email.includes('admin')) {
        switchRole('panitia');
        router.push('/dashboard/admin');
      } else {
        switchRole('peserta');
        router.push('/dashboard/peserta');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 cyber-grid py-16">
        <Card className="w-full max-w-md border-cyan-500/30 glow-cyan">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
              <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <CardTitle className="justify-center text-xl">Masuk ke Akun Anda</CardTitle>
            <CardDescription>
              Platform Kompetisi Terpadu Permifest x Deforkafest
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Alamat Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
              />

              <div>
                <Input
                  label="Kata Sandi (Password)"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <div className="flex justify-end mt-1.5">
                  <Link href="/forgot-password" className="text-xs text-cyan-400 hover:underline">
                    Lupa password?
                  </Link>
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full justify-center" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Masuk ke Dashboard
              </Button>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">Akun Uji Coba Cepat (Demo):</span>
                <div>• Peserta: <span className="text-cyan-400 font-mono">peserta@permifest.id</span></div>
                <div>• Juri: <span className="text-cyan-400 font-mono">juri.cyber@permifest.id</span></div>
                <div>• Panitia/Admin: <span className="text-cyan-400 font-mono">panitia@permifest.id</span></div>
              </div>

              <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                Belum memiliki akun?{' '}
                <Link href="/register" className="text-cyan-400 font-semibold hover:underline">
                  Daftar Peserta Baru
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
