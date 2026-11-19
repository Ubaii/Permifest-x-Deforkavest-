# SITEMAP_RBAC.md

Sumber: PRD Lampiran B dan bagian 3. Satu dashboard admin dengan menu yang difilter per izin dan scope lomba *(asumsi PRD)*.

## 1. Rute kanonis

Status: `ada` = sudah di kode, `baru` = perlu dibuat, `cek` = ada tapi perlu disesuaikan.

### Publik

| Path | Akses | Status |
|---|---|---|
| `/` | semua | ada |
| `/kompetisi`, `/kompetisi/[slug]` | semua | ada |
| `/pengumuman` | semua | ada |
| `/leaderboard` | semua (mode dari konfigurasi, lihat DECISIONS C-09) | cek |
| `/informasi` | semua (kerangka; isi belum ditentukan) | ada |

### Auth

| Path | Akses | Status |
|---|---|---|
| `/login`, `/register`, `/forgot-password` | tamu | ada |
| `/reset-password` | tautan reset valid | baru |
| `/verifikasi-email` | tautan verifikasi / info | baru |

### Peserta (`/dashboard/peserta`)

| Path | Fungsi | Status |
|---|---|---|
| `/` | Overview status | ada |
| `/kompetisi` | Daftar lomba, form dinamis | ada |
| `/kompetisi/[id]` | Detail pendaftaran, tim | baru |
| `/pembayaran` | QR, unggah bukti, status, alasan tolak | ada |
| `/submission` | Unggah karya, riwayat versi | ada |
| `/hasil` | Hasil akhir dan pengumuman | ada |
| `/profil` | Profil, identitas, akun | ada |

### Juri (`/dashboard/juri`)

| Path | Fungsi | Status |
|---|---|---|
| `/` | Ringkasan penugasan | ada |
| `/penugasan` | Daftar karya ditugaskan | ada |
| `/penugasan/[assignmentId]` | Detail karya + form rubrik | baru |
| `/riwayat` | Penilaian terkirim | ada |
| `/pengaturan` | Akun | baru |

### Admin (`/dashboard/admin`) - panitia dan super admin

| Path | Izin minimal | Status |
|---|---|---|
| `/` | `dashboard.view` | ada |
| `/peserta` | `registrations.read` | ada |
| `/pembayaran` | `payments.verify` | ada |
| `/submission` | `submissions.read` | ada |
| `/juri` (penugasan juri) | `assignments.manage` | baru |
| `/penilaian` (monitoring + kunci) | `scores.monitor`, `scores.lock` | baru |
| `/hasil` (PES, ML) | `results.write` | ada |
| `/pengumuman` | `announcements.publish` | ada |
| `/kompetisi` | `competitions.manage` (super admin) | ada |
| `/rubrik` | `rubrics.manage` (super admin) | baru |
| `/pengguna` | `users.manage` (super admin) | baru |
| `/audit-log` | `audit.read` (super admin; panitia hanya entri lomba sendiri untuk koreksi darurat) | ada |
| `/koreksi-darurat` | `scores.override` (super admin) | baru |
| `/pengaturan` | `settings.manage` (super admin) | baru |

## 2. Peran dan izin

Izin = `resource.action`. Scope: `own` (milik sendiri/tim), `assigned` (ditugaskan), `competition` (lomba yang dikelola), `all`.

| Izin | Peserta | Juri | Panitia | Super admin |
|---|---|---|---|---|
| `registrations.create/read` | own | - | competition | all |
| `payments.upload` | own | - | - | all |
| `payments.verify` | - | - | competition | all |
| `submissions.write` (sebelum deadline) | own | - | - | all |
| `submissions.read` | own | assigned | competition | all |
| `scores.write` (sebelum kunci) | - | assigned | - | all |
| `scores.monitor`, `scores.lock` | - | - | competition | all |
| `scores.override` (darurat, alasan wajib) | - | - | - | all |
| `assignments.manage` | - | - | competition | all |
| `results.write` (PES, ML) | - | - | competition | all |
| `announcements.publish` | - | - | competition | all |
| `leaderboard.read` (yang dirilis) | ya | ya | ya | ya |
| `competitions.manage`, `rubrics.manage` | - | - | - | all |
| `users.manage` | - | - | - | all |
| `audit.read` | - | - | terbatas | all |

Aturan tambahan:
- **Tolak secara default.** Izin yang tidak terdaftar = ditolak.
- Satu orang boleh punya beberapa peran (`user_roles`). Benturan kepentingan (panitia yang ikut lomba, juri satu instansi dengan peserta): diatur konfigurasi, default **ditolak** pada penugasan juri (lihat DECISIONS C-14, C-15).
- Perubahan peran tercatat di `audit_logs`.
- Super admin tidak dapat melihat password siapa pun.

## 3. Urutan penjaga

1. `proxy.ts`: belum login ke `/dashboard/*` -> `/login?next=`.
2. `dashboard/<area>/layout.tsx`: `requireRole(area)`; role tidak cocok -> `/dashboard` (redirect ke area sendiri) atau 403.
3. Halaman/Action: `requirePermission(izin, { competitionId })`.
4. RLS: data tetap terlindungi.

## 4. Menu per peran (sidebar)

- **Peserta:** Overview, Kompetisi Saya, Pembayaran, Submission, Hasil, Profil.
- **Juri:** Overview, Penugasan, Riwayat, Pengaturan.
- **Panitia:** Overview, Peserta, Pembayaran, Submission, Juri, Penilaian, Hasil, Pengumuman, (Audit lomba sendiri).
- **Super admin:** semua menu panitia + Kompetisi, Rubrik, Pengguna, Koreksi Darurat, Audit Log, Pengaturan.

Menu yang tidak diizinkan **tidak dirender**, tetapi rute tetap diblokir di server.
