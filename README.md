# Permifest × Devorkafest 2026 — Platform Kompetisi Terpadu

Platform web satu pintu untuk mengelola kompetisi di event **Permifest × Devorkafest 2026** bertema **Cybersecurity**. Dibangun sesuai spesifikasi **PRD Draft v2** dengan integrasi pendaftaran mandiri, pembayaran QRIS, submission karya, penilaian rubrik juri terstruktur, dan turnamen e-sport.

---

## 🚀 Fitur Utama & Kepatuhan PRD

### 1. Multi-Role RBAC (Role-Based Access Control)
- **Peserta**: Pendaftaran lomba, unggah bukti bayar QRIS/transfer, submission dokumen (DOCX/PDF) / tautan Figma, riwayat versi karya, melihat hasil akhir dan pengumuman.
- **Dewan Juri**: Lembar penilaian khusus karya yang ditugaskan, formulir penilaian rubrik interaktif dengan perhitungan bobot otomatis (*live weighted score*), pencatatan komentar kriteria, penguncian nilai.
- **Panitia / Admin**: Verifikasi bukti pembayaran (*approve/reject* disertai alasan), manajemen kuota & biaya lomba, penugasan juri ke karya, input skor pertandingan PES & Mobile Legends, rilis pengumuman resmi.
- **Super Admin**: Jalur darurat dengan audit trail lengkap (*immutable log*), konfigurasi rubrik & form dinamis.
- **Fitur Demo Role-Switcher**: Tersedia saklar pemilih peran (*Role Switcher*) di bilah navigasi untuk menguji dan mengevaluasi seluruh alur peran secara langsung.

### 2. 5 Cabang Perlombaan
| No | Cabang Lomba | Kategori | Format Partisipasi | Format Karya | Sistem Penilaian |
|---|---|---|---|---|---|
| 1 | **Esai Ilmiah Cybersecurity** | Akademik | Individu | DOCX / PDF (maks 15MB) | Rubrik Juri |
| 2 | **UI/UX Design Challenge** | Akademik | Individu | Tautan Publik Figma | Rubrik Juri |
| 3 | **IT System Architecture** | Akademik | Tim (1-3 org) | Dokumen PDF + Diagram | Rubrik Juri |
| 4 | **eFootball / PES Championship** | Non-Akademik | Individu | Pertandingan Langsung | Input Panitia |
| 5 | **Mobile Legends: Bang Bang** | Non-Akademik | Tim (5-6 org) | Turnamen 5v5 | Input Panitia |

### 3. Struktur Halaman & Sitemap Lengkap
- **Publik**:
  - `/` — Homepage Hero Cybersecurity, Showcase 5 Lomba, Statistik, dan Timeline.
  - `/kompetisi` — Katalog lomba dengan filter Akademik & E-Sport.
  - `/kompetisi/[slug]` — Detail persyaratan lomba, tahapan penyisihan & final, serta modal pendaftaran dinamis.
  - `/pengumuman` — Papan pengumuman resmi berkas keputusan panitia.
  - `/leaderboard` — Klasemen dan perolehan medali juara akhir.
  - `/informasi` — Pusat unduhan Guidebook teknis, FAQ interaktif, dan kontak narahubung.
- **Autentikasi**:
  - `/login` — Masuk ke akun peserta, juri, atau panitia.
  - `/register` — Pendaftaran akun peserta baru.
  - `/forgot-password` — Pemulihan kata sandi.
- **Dashboard Peserta**:
  - `/dashboard/peserta` — Overview metrik dan status terkini.
  - `/dashboard/peserta/kompetisi` — Daftar kompetisi yang diikuti.
  - `/dashboard/peserta/pembayaran` — Tampilan kode QRIS, detail transfer, status verifikasi & alasan tolak.
  - `/dashboard/peserta/submission` — Formulir unggah karya per tahapan, riwayat versi (v1, v2).
  - `/dashboard/peserta/hasil` — Melihat capaian peringkat dan kelulusan (tanpa membocorkan komentar rahasia juri).
  - `/dashboard/peserta/profil` — Pengaturan identitas dan kontak instansi.
- **Dashboard Juri**:
  - `/dashboard/juri` — Overview tugas penilaian.
  - `/dashboard/juri/penugasan` — Evaluasi karya dengan rubrik kriteria berbobot otomatis.
  - `/dashboard/juri/riwayat` — Arsip penilaian yang telah disubmit & terkunci.
- **Dashboard Panitia / Admin**:
  - `/dashboard/admin` — Ringkasan operasional dan kas terverifikasi.
  - `/dashboard/admin/pembayaran` — Verifikasi bukti transfer (Approve / Reject + Alasan).
  - `/dashboard/admin/kompetisi` — Manajemen konfigurasi lomba dan tahapan.
  - `/dashboard/admin/peserta` — Data peserta terdaftar dan fitur ekspor CSV.
  - `/dashboard/admin/submission` — Distribusi penugasan karya kepada dewan juri.
  - `/dashboard/admin/hasil` — Pencatatan juara turnamen PES dan Mobile Legends.
  - `/dashboard/admin/pengumuman` — Publikasi surat keputusan panitia.
  - `/dashboard/admin/audit-log` — Jejak audit trail aksi sensitif.

---

## 🛠️ Stack Teknologi

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Cybersecurity Dark Cyber Theme: Cyan `#06b6d4`, Emerald `#10b981`, Deep Slate `#090d16`)
- **Icons**: Lucide React
- **Database & Auth**: PostgreSQL / Supabase ready (`supabase/schema.sql` sudah disiapkan lengkap dengan 22 tabel relasional)
- **State & Demo Store**: React Context API (`src/lib/store.tsx`) dengan dukungan operasional *instant interactive state*

---

## 💻 Cara Menjalankan Project

1. Buka terminal di folder project:
   ```bash
   cd "D:\permifest x deforkavest\permifest-platform"
   ```

2. Jalankan development server:
   ```bash
   npm run dev
   ```

3. Buka browser pada alamat:
   ```
   http://localhost:3000
   ```

---

## 🧪 Akun Demo Siap Pakai

Gunakan tombol **Role Switcher** di bilah navigasi kanan atas atau login langsung dengan email berikut:
- **Peserta**: `peserta@permifest.id`
- **Juri**: `juri.cyber@permifest.id`
- **Panitia / Admin**: `panitia@permifest.id`
- **Super Admin**: `admin@permifest.id`
