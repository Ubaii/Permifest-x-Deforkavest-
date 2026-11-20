# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Versi: SemVer (pra-rilis `0.x`). Waktu UTC.

## [Unreleased]

### Added
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
