# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Versi: SemVer (pra-rilis `0.x`). Waktu UTC.

## [Unreleased]

### Added
<<<<<<< HEAD
- Mesin validasi form dinamis Zod (`src/lib/config/dynamic-form.ts`) yang membangun validator dari JSONB `form_fields` untuk klien dan server.
- Modul konfigurasi kebijakan event (`src/lib/config/settings.ts`) mematuhi Golden Rule #2 dan DECISIONS.md C-01 s/d C-17 (kebijakan partisipasi ganda, filter benturan instansi juri, mode leaderboard).
- Halaman Detail Pendaftaran Lomba Peserta (`/dashboard/peserta/kompetisi/[id]`) untuk melihat berkas pendaftaran, kode undangan tim, dan anggota tim.
- Hardening keamanan Role Switcher: disembunyikan secara otomatis di environment produksi (`process.env.NODE_ENV === 'production'`) untuk mencegah eskalasi peran demo.
- Server-side Layout Guards (`src/app/dashboard/admin/layout.tsx`, `src/app/dashboard/juri/layout.tsx`, `src/app/dashboard/peserta/layout.tsx`) menerapkan prinsip Defense-in-Depth dengan `requireRole` di level Server Component.
- Halaman Reset Kata Sandi publik (`/reset-password`) terhubung dengan Server Action `updatePasswordAction`.
- Halaman konfirmasi email baru (`/verifikasi-email`) dengan panduan langkah aktivasi akun.
- Security Headers di `next.config.ts` (HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy).
- Modul Supabase Auth SSR lengkap: skema validasi Zod (`src/features/auth/schema.ts`), Server Actions (`loginAction`, `registerAction`, `logoutAction`, `forgotPasswordAction` di `src/features/auth/actions.ts`), serta session helper server-only (`src/lib/auth/session.ts`).
- Penegakan Golden Rule #3: pendaftaran akun publik secara server-side selalu menghasilkan role `peserta`.
- Matriks izin RBAC granular (`src/lib/auth/permissions.ts`) dan helper `hasPermission()`, `can()`, `requireRole()`, `requirePermission()`.
- Lapisan Database Repository (`src/lib/repositories/`): abstraksi antarmuka `ICompetitionRepository`, `IRegistrationRepository`, `ISubmissionRepository`, `IScoreRepository`, `IUserRepository`.
- Implementasi ganda repository: `MockRepository` (dev/offline) dan `SupabaseRepository` (live Postgres query via client SSR & Admin Service Role).
- Next.js Proxy Middleware (`src/proxy.ts`): penyegaran cookie sesi Supabase dan route guard redirection otomatis untuk `/dashboard/*` serta rute auth publik.
- Arsitektur Supabase Storage lengkap untuk 4 bucket (`payment-proofs`, `submissions`, `identity-docs`, `public-assets`) dengan batasan ukuran berkas dan MIME whitelist.
- RLS Policies granular pada `storage.objects` dengan helper Postgres `is_staff()` dan `is_assigned_judge_for_submission()`.
- Validasi Zod skema berkas (`SignedUploadUrlSchema`, `SignedDownloadUrlSchema`, `ConfirmUaploadSchema`) dengan verifikasi ukuran, anti path-traversal nama berkas (`sanitizeFilename`), dan kesesuaian ekstensi-MIME.
- Server Actions (`getSignedUploadUrlAction`, `getSignedDownloadUrlAction`, `verifyAndConfirmUploadAction`) dengan arsitektur server-only via `createAdminClient()`.
- Client helper `uploadFileDirectly` (browser -> direct PUT signed URL) dan `getFileDownloadUrl` (signed download URL privat berumur pendek).
- Integrasi direct upload dan indikator progress pada form upload bukti pembayaran (`/dashboard/peserta/pembayaran`) dan form pengumpulan karya (`/dashboard/peserta/submission`).
- Integrasi signed download viewer pada panel pratinjau submission admin (`/dashboard/admin/submission`).
- Integrasi signed download URL & dukungan dokumen PDF pada panel review bukti transfer admin (`/dashboard/admin/pembayaran`).
- Integrasi signed download URL pada lembar penugasan juri (`/dashboard/juri/penugasan`) untuk unduh proposal/karya terproteksi.
- Script `"typecheck": "tsc --noEmit"` pada `package.json`.
=======
- Standardisasi migrasi database Supabase di `supabase/migrations/` (Schema, Functions & Triggers, RLS, Storage).
- Skema 20 tabel PostgreSQL, custom enum, constraints, dan index performa sesuai `docs/SCHEMA.md`.
- Fungsi keamanan dan trigger: `has_role` berlingkup lomba, `handle_new_user` (default registrasi selalu peserta), `guard_locked_scores` (kunci nilai), `admin_override_score` (audit darurat), serta view `v_final_scores`.
- Row Level Security (RLS) aktif pada seluruh tabel dengan kebijakan bertingkat (Peserta, Juri, Panitia, Super Admin).
- Konfigurasi bucket Supabase Storage (`payment-proofs`, `submissions`, `identity-docs`, `public-assets`) dengan storage policies.
- Data awal `supabase/seed.sql` berisi peran, event Permifest x Deforkafest, tema, 5 cabang lomba, tahapan, dan contoh rubrik penilaian berbobot 100%.
- Server-side admin client `src/lib/supabase/admin.ts` berpelindung isolasi server.
>>>>>>> 91c0ada (feat(database): implement target supabase migrations, rls policies, and seed data)
- Standardisasi CRUD lewat `Drawer` di seluruh panel admin (Cabang Lomba, Rubrik, Pengguna, Hasil E-Sport, Pengumuman).
- Drawer khusus manajemen Rubrik Penilaian per-lomba dengan validasi total bobot 100% langsung di daftar kompetisi.
- Drawer pratinjau submission karya (`SubmissionPreviewDrawer`) dengan dukungan viewer dokumen PDF dan kartu launcher Figma.
- Analitik dan grafik visual di Admin Overview (tren registrasi 7 hari, komposisi akademik vs non-akademik, dan status pembayaran).
- Format turnamen dan podium visual untuk hasil cabang E-Sport (PES & Mobile Legends).
- Matriks evaluasi rubrik interaktif pada penilaian karya dengan kalkulasi skor terbobot otomatis.
- Kartu ATM rekening bank dan barcode QRIS live preview di halaman Pengaturan Sistem.

### Changed
- Perbaikan token semantic pada komponen `Alert` dan callout status agar kompatibel penuh dengan Light dan Dark mode.
- Tabel `DataTable` diperbarui menjadi mode compact dengan padding sel yang rapat (`compact: true`) dan ekspor CSV yang selaras.
- Eliminasi karakter ASCII mentah (`&rarr;`, `&larr;`) dan redundansi tombol di seluruh halaman dashboard.
- Standardisasi dropdown filter select pada seluruh tabel di dashboard.

### Security
- Daftar temuan audit awal dicatat di `DECISIONS.md` B.2 (RBAC server/RLS, role-switcher, upload, 2FA).

## [0.1.0] - pra-rilis, baseline (dari laporan progres)

### Added
- Landing page publik (Hero, OrganizerStrip, Competitions, Timeline, LeaderboardTeaser, HowToRegister, FAQ, CTA, StickyBottomBar).
- Halaman publik: `/kompetisi`, `/kompetisi/[slug]`, `/leaderboard`, `/pengumuman`, `/informasi`.
- Halaman auth (frontend): `/login`, `/register`, `/forgot-password`.
- Dashboard peserta, juri, admin (UI + store mock), role-switcher demo.
- Draf `schema.sql` 22 tabel.

### Known issues
- Belum ada koneksi Supabase live, RLS, atau Storage; otorisasi baru di UI. Lihat `DECISIONS.md` B.2.
