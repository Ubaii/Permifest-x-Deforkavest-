'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SakugaButton } from '@/components/ui/sakuga-button';
import { useAppStore } from '@/lib/store';
import { loginAction } from '@/features/auth/actions';
import { ArrowRight } from '@phosphor-icons/react';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useAppStore();

  const [email, setEmail] = useState('peserta@permifest.id');
  const [password, setPassword] = useState('password123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fillQuickAccount = (demoEmail: string, role: 'peserta' | 'juri' | 'panitia' | 'super_admin') => {
    setEmail(demoEmail);
    setPassword('password123');
    switchRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginAction({ email, password });
      if (!result.success || !result.data) {
        setErrorMessage(result.message || 'Gagal masuk akun. Periksa email dan password.');
        return;
      }

      // Sinkronkan role store demo agar konsisten
      const detectedRole = result.data.role;
      if (['peserta', 'juri', 'panitia', 'super_admin'].includes(detectedRole)) {
        switchRole(detectedRole as any);
      } else if (email.includes('juri')) {
        switchRole('juri');
      } else if (email.includes('panitia') || email.includes('admin')) {
        switchRole('panitia');
      } else {
        switchRole('peserta');
      }

      router.push(result.data.redirectUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0720] text-[#F5F2FF] relative overflow-hidden">
      {/* ── Ambient Glow Atmosphere ── */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(155, 107, 242, 0.22) 0%, rgba(213, 107, 217, 0.12) 50%, transparent 75%)',
          filter: 'blur(90px)',
        }}
      />

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16 relative z-10">
        <div className="w-full max-w-md">
          {/* Card Box Manga Pop Art */}
          <div className="relative rounded-3xl bg-[#140D33]/95 border-2 border-[#2E2266] p-7 sm:p-9 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-md">
            {/* Washi Tape Header */}
            <div className="inline-block px-3.5 py-1 rounded-md text-xs font-black uppercase tracking-wider text-[#0B0720] bg-[#FFE359] shadow-sm mb-5 -rotate-2 select-none border border-black/20">
              ★ Pintu Masuk Arena
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-bricolage)] text-[#F5F2FF] tracking-tight">
              Masuk ke Akunmu
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#A99FD1]">
              Satu pintu masuk untuk seluruh rangkaian kompetisi Permifest x Deforkafest.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {errorMessage && (
                <Alert variant="destructive" onClose={() => setErrorMessage(null)}>
                  <AlertTitle>Gagal Masuk</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <Input
                label="Alamat Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="bg-[#0B0720] border-[#2E2266] focus:border-[#9B6BF2]"
              />

              <div>
                <Input
                  label="Kata Sandi (Password)"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#0B0720] border-[#2E2266] focus:border-[#9B6BF2]"
                />
                <div className="flex justify-end mt-1.5">
                  <Link href="/forgot-password" className="text-xs text-[#9B6BF2] hover:text-[#D56BD9] transition-colors">
                    Lupa password?
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <SakugaButton
                  type="submit"
                  variant="brand"
                  size="lg"
                  isLoading={isLoading}
                  sfxText="MASUK!!"
                  className="w-full justify-center shadow-[0_4px_20px_rgba(155,107,242,0.4)]"
                  rightIcon={<ArrowRight size={16} weight="bold" />}
                >
                  Masuk Sekarang
                </SakugaButton>
              </div>

              {/* Quick One-Click Demo Accounts Selector */}
              <div className="mt-6 p-3.5 rounded-2xl bg-[#0B0720] border border-[#2E2266] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#A99FD1] uppercase tracking-wider">
                  <span>Pilih Akun Demo Cepat</span>
                  <span className="text-[#FFE359]">Klik untuk Isi Otomatis</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => fillQuickAccount('peserta@permifest.id', 'peserta')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#140D33] border border-[#2E2266] hover:border-[#9B6BF2] text-[#F5F2FF] hover:text-[#6CC4FF] transition-all text-left"
                  >
                    ⚡ Peserta
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickAccount('juri@permifest.id', 'juri')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#140D33] border border-[#2E2266] hover:border-[#9B6BF2] text-[#F5F2FF] hover:text-[#FFE359] transition-all text-left"
                  >
                    ⚖️ Juri
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickAccount('panitia@permifest.id', 'panitia')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#140D33] border border-[#2E2266] hover:border-[#9B6BF2] text-[#F5F2FF] hover:text-[#C4F15A] transition-all text-left"
                  >
                    📋 Panitia
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickAccount('admin@permifest.id', 'super_admin')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#140D33] border border-[#2E2266] hover:border-[#9B6BF2] text-[#F5F2FF] hover:text-[#D56BD9] transition-all text-left"
                  >
                    👑 Super Admin
                  </button>
                </div>
                <p className="text-[10px] text-[#A99FD1]/70 text-center pt-1 font-mono">
                  Password demo: <strong className="text-[#F5F2FF]">password123</strong>
                </p>
              </div>

              <div className="text-center text-xs text-[#A99FD1] pt-3 border-t border-[#2E2266]/80">
                Belum punya akun?{' '}
                <Link href="/register" className="text-[#F5F2FF] font-bold hover:text-[#9B6BF2] transition-colors underline">
                  Daftar akun peserta baru
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
