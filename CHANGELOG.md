# Changelog

Format: [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/). Versi: SemVer (pra-rilis `0.x`). Waktu UTC.

## [Unreleased]

### Added
- Paket dokumentasi agentic: `AGENTS.md`, `docs/ARCHITECTURE.md`, `SITEMAP_RBAC.md`, `SCHEMA.md`, `SECURITY.md`, `DESIGN_SYSTEM.md`, `UI_KIT.md`, `TESTING.md`, `TASKS.md`, `DECISIONS.md`.
- UI Kit visual (publik, peserta, panel admin/juri).
- Komponen UI atomik baru: `Modal` (compound + `ConfirmDialog`), `Drawer` (slide-over detail), `Alert` (semantic variants), `Pagination`, `Section` (`PageHeader`, `SectionHeader`, `SectionCard`), `Tabs`, dan `DataTable` (generic dengan search, sorting, pagination).
- CRUD penuh di panel admin:
  - **Manajemen Kompetisi**: Create via Modal, Update parameter, Delete dengan ConfirmDialog, dan toggle publish.
  - **Manajemen Pengguna (Peserta, Juri, Panitia, Admin)**: Tambah akun baru, Edit peran dan profil, Hapus akun, filter peran tab.
  - **Verifikasi Pembayaran**: StatCards ringkasan, Review Drawer resi besar, Edit nominal manual, Setujui/Tolak dengan dialog alasan, Hapus transaksi.
  - **Manajemen Pengumuman**: Create, Edit, dan Delete pengumuman via Modal.
  - **Hasil E-Sport & Penugasan Juri**: Create, Edit skor/juara, Hapus catatan hasil, dan cabut penugasan juri.

### Changed
- Keputusan desain: panel admin dan juri mendukung terang/gelap; publik dan peserta dark only (ADR-009).

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
