# TESTING.md

## 1. Piramida

| Lapisan | Alat | Cakupan |
|---|---|---|
| Unit | Vitest | `buildZodSchema`, perhitungan skor terbobot, `lib/time.ts` (UTC/WIB), `can()` |
| Database/RLS | pgTAP atau skrip SQL di `supabase/tests/` | Matriks RLS dan trigger |
| Komponen | Testing Library | Form dinamis, ScoreInput, StatusBadge, EmptyState |
| E2E | Playwright | Alur per peran, lintas viewport |
| Aksesibilitas | axe + manual keyboard | Semua layar utama |
| Beban | k6 | Pendaftaran dan upload menjelang deadline |

## 2. Matriks otorisasi (wajib lulus)

Untuk setiap baris: peran yang **diizinkan berhasil** dan peran lain **ditolak** (RLS dan Server Action).

| Skenario | Harus ditolak |
|---|---|
| Peserta B membaca/ubah pendaftaran, bukti bayar, karya peserta A | Peserta lain, juri tak ditugaskan |
| Peserta membaca `scores`, `judge_assignments`, `score_changes` | Peserta |
| Juri membaca karya yang tidak ditugaskan | Juri |
| Juri mengubah skor setelah `scores_locked_at` | Juri, panitia |
| Panitia lomba X memverifikasi pembayaran lomba Y | Panitia X |
| Panitia mengubah rubrik, lomba, peran | Panitia |
| Register dengan `role=super_admin` di body/metadata | Semua (hasil tetap `peserta`) |
| Upload setelah deadline / tipe salah / ukuran berlebih | Peserta |
| Upload ke path peserta lain | Peserta |
| `admin_override_score` tanpa alasan / non super admin | Semua selain super admin |
| Penulisan/penghapusan `audit_logs` dan `score_changes` | Semua |
| Akses `/dashboard/admin/*` oleh peserta (URL langsung) | Peserta, juri |

## 3. Alur E2E per peran

- **Peserta:** register -> verifikasi email -> pilih lomba -> bayar -> bukti ditolak -> unggah ulang -> terverifikasi -> unggah karya v1, v2 -> lihat hasil dirilis.
- **Panitia:** setujui/tolak bayar -> tugaskan juri -> pantau -> kunci nilai -> input hasil PES -> rilis.
- **Juri:** buka penugasan -> isi rubrik -> kirim -> coba ubah setelah kunci (ditolak).
- **Super admin:** buat lomba + form + rubrik -> naikkan akun juri -> koreksi darurat -> audit tercatat.

## 4. Viewport dan mode

Jalankan E2E di 375, 768, 1280. Panel admin/juri di terang dan gelap. Publik dan peserta di gelap.

## 5. Gerbang CI

`lint`, `typecheck`, `test`, `test:e2e` (smoke), uji RLS, `npm audit`. PR tidak boleh digabung bila merah.
