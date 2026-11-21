'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { updatePasswordAction } from '@/features/auth/actions';
import { Key, ArrowRight, CheckCircle } from '@phosphor-icons/react';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await updatePasswordAction({ password, confirmPassword });
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal memperbarui kata sandi.');
        return;
      }

      setSuccessMessage(res.message || 'Kata sandi berhasil diperbarui.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 cyber-grid py-16">
        <Card className="w-full max-w-md border-cyan-500/30 glow-cyan">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
              <Key className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <CardTitle className="justify-center text-xl">Atur Ulang Kata Sandi</CardTitle>
            <CardDescription>
              Masukkan kata sandi baru untuk mengamankan kembali akun Anda
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {successMessage ? (
              <div className="p-6 text-center space-y-3">
                <CheckCircle size={48} className="text-emerald-400 mx-auto" weight="fill" />
                <h4 className="text-base font-bold text-white">Kata Sandi Berhasil Diperbarui</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{successMessage}</p>
                <p className="text-[11px] text-cyan-400">
                  Mengalihkan ke halaman masuk secara otomatis...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <Alert variant="destructive" onClose={() => setErrorMessage(null)}>
                    <AlertTitle>Gagal Memperbarui</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <Input
                  label="Kata Sandi Baru"
                  type="password"
                  required
                  placeholder="Minimal 8 karakter (huruf &amp; angka)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <Input
                  label="Konfirmasi Kata Sandi Baru"
                  type="password"
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Simpan Kata Sandi Baru
                </Button>

                <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                  Kembali ke{' '}
                  <Link href="/login" className="text-cyan-400 font-semibold hover:underline">
                    Halaman Masuk
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
