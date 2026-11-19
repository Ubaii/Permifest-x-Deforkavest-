'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';
import { User, Mail, Building, Phone, ShieldCheck, KeyRound } from 'lucide-react';

export default function PesertaProfilPage() {
  const { currentUser, setCurrentUser } = useAppStore();

  const [fullName, setFullName] = useState(currentUser.full_name);
  const [institution, setInstitution] = useState(currentUser.institution || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser({
      ...currentUser,
      full_name: fullName,
      institution: institution,
      phone: phone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout 
      title="Profil & Pengaturan Akun" 
      subtitle="Kelola informasi identitas akun peserta dan kontak verifikasi."
    >
      <div className="max-w-2xl space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              
              <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold text-2xl flex items-center justify-center">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-100">{currentUser.full_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="cyber">{ROLE_LABELS[currentUser.role]}</Badge>
                    <span className="text-xs text-slate-400 font-mono">{currentUser.email}</span>
                  </div>
                </div>
              </div>

              <Input
                label="Nama Lengkap"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <Input
                label="Alamat Email (Akun Utama)"
                disabled
                value={currentUser.email}
                helperText="Email tidak dapat diubah setelah terdaftar demi integritas sertifikat dan data perlombaan."
              />

              <Input
                label="Asal Sekolah / Universitas / Instansi"
                placeholder="Contoh: Institut Teknologi Bandung"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />

              <Input
                label="Nomor WhatsApp / Kontak Aktif"
                placeholder="Contoh: 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <div className="pt-2 flex items-center justify-between">
                {saved && (
                  <span className="text-xs text-emerald-400 font-semibold">
                    ✓ Profil berhasil diperbarui!
                  </span>
                )}
                <Button type="submit" variant="primary" className="ml-auto">
                  Simpan Perubahan
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

        {/* Security / Password section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Keamanan & Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-400">
            <p>
              Kata sandi Anda dilindungi menggunakan hashing argon2/bcrypt berstandar industri dengan proteksi CSRF dan rate limiting.
            </p>
            <Button variant="secondary" size="sm" onClick={() => alert('Link tautan reset sandi telah dikirim ke email terdaftar.')}>
              Kirim Tautan Reset Password ke Email
            </Button>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}
