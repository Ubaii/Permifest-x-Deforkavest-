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
import { registerAction } from '@/features/auth/actions';
import { CheckCircle, ArrowRight } from '@phosphor-icons/react';

export default function RegisterPage() {
  const router = useRouter();
  const { setCurrentUser } = useAppStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await registerAction({
        fullName,
        email,
        institution,
        phone,
        password,
        confirmPassword,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Pendaftaran gagal.');
        return;
      }

      // Sinkronkan ke store demo
      setCurrentUser({
        id: `user-${Date.now()}`,
        email,
        full_name: fullName,
        institution,
        phone,
        role: 'peserta',
        email_verified: !res.data?.requiresVerification,
      });

      setSuccessInfo(res.message || 'Pendaftaran akun berhasil!');

      setTimeout(() => {
        router.push('/dashboard/peserta');
      }, 1400);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kegagalan koneksi.';
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
          background: 'radial-gradient(circle, rgba(155, 107, 242, 0.2) 0%, rgba(213, 107, 217, 0.1) 50%, transparent 75%)',
          filter: 'blur(90px)',
        }}
      />

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-16 relative z-10">
        <div className="w-full max-w-lg">
          {/* Card Box Manga Pop Art */}
          <div className="relative rounded-3xl bg-[#140D33]/95 border-2 border-[#2E2266] p-7 sm:p-9 shadow-[0_16px_48px_rgba(0,0,0,0.6)] backdrop-blur-md">
            {/* Washi Tape Header */}
            <div className="inline-block px-3.5 py-1 rounded-md text-xs font-black uppercase tracking-wider text-[#0B0720] bg-[#C4F15A] shadow-sm mb-5 -rotate-2 select-none border border-black/20">
              ★ Pendaftaran Peserta
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-bricolage)] text-[#F5F2FF] tracking-tight">
              Daftar Akun Baru
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#A99FD1]">
              Satu akun untuk mengikuti cabang akademik (UI/UX, ITSA, Esai) dan non-akademik (PES, MLBB).
            </p>

            {successInfo ? (
              <div className="mt-6 p-6 rounded-2xl bg-[#0B0720] border border-[#2E2266] text-center space-y-3">
                <CheckCircle size={44} className="text-[#C4F15A] mx-auto" weight="fill" />
                <h4 className="text-base font-bold text-[#F5F2FF]">Pendaftaran Berhasil!</h4>
                <p className="text-xs text-[#A99FD1] leading-relaxed">
                  {successInfo}
                </p>
                <p className="text-[11px] text-[#6CC4FF] animate-pulse">
                  Mengalihkan kamu ke Dashboard Peserta...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {errorMessage && (
                  <Alert variant="destructive" onClose={() => setErrorMessage(null)}>
                    <AlertTitle>Pendaftaran Gagal</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <Input
                  label="Nama Lengkap"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama Lengkapmu"
                  className="bg-[#0B0720] border-[#2E2266] focus:border-[#9B6BF2]"
                />

                <Input
                  label="Alamat Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="bg-[#0B0720] border-[#2E2266] focus:border-[#9B6BF2]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Asal Instansi / Kampus"
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Contoh: UST Yogyakarta"
                    className="bg-[#0B0720] border-[#2E2266] focus:border-[#9B6BF2]"
                  />
                  <Input
                    label="Nomor WhatsApp (Aktif)"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="bg-[#0B0720] border-[#2E2266] focus:border-[#9B6BF2]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Kata Sandi (Password)"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className="bg-[#0B0720] border-[#2E2266] focus:border-[#9B6BF2]"
                  />
                  <Input
                    label="Konfirmasi Kata Sandi"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="bg-[#0B0720] border-[#2E2266] focus:border-[#9B6BF2]"
                  />
                </div>

                <div className="pt-2">
                  <SakugaButton
                    type="submit"
                    variant="brand"
                    size="lg"
                    isLoading={isLoading}
                    sfxText="DAFTAR!!"
                    className="w-full justify-center shadow-[0_4px_20px_rgba(155,107,242,0.4)]"
                    rightIcon={<ArrowRight size={16} weight="bold" />}
                  >
                    Daftar Akun Sekarang
                  </SakugaButton>
                </div>

                <div className="text-center text-xs text-[#A99FD1] pt-3 border-t border-[#2E2266]/80">
                  Sudah memiliki akun?{' '}
                  <Link href="/login" className="text-[#F5F2FF] font-bold hover:text-[#9B6BF2] transition-colors underline">
                    Masuk ke akunmu
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
