# DESIGN_SYSTEM.md

Fondasi visual, token, dan aturan komponen. Detail gaya dan anti-slop ada di skill `permifest-deforkafest-ui` (dokumen ini tidak menggantikannya, hanya memperluas ke dashboard). Katalog komponen dan template layar ada di `UI_KIT.md`.

## 1. Tiga permukaan

| Permukaan | Rute | Mode | Karakter | Kepadatan |
|---|---|---|---|---|
| **Publik** | `(public)`, `(auth)` | dark only | Playful, ilustrasi, blob gradien, stiker | Longgar |
| **Panel peserta** | `/dashboard/peserta` | dark only | Turunan publik: warna sama, ilustrasi kecil, tanpa blob besar | Sedang |
| **Panel admin** (panitia, super admin) dan **juri** | `/dashboard/admin`, `/dashboard/juri` | **terang dan gelap** (ikut sistem, bisa diganti) | Tenang gaya shadcn/Vercel, ikon dan badge saja sebagai aksen | Padat |

Aturan: semakin dekat ke pekerjaan (verifikasi, menilai), semakin sedikit dekorasi. Tidak ada blob, glow, atau stiker miring di panel admin dan juri. Juri mengutamakan keterbacaan karya.

## 2. Token

Nama mengikuti shadcn agar komponennya langsung kompatibel. Nilai hex adalah estimasi dari poster Deforkafest (belum ada brand guideline); perbarui di satu tempat (`globals.css`) bila logo vektor tersedia.

```css
:root {                       /* terang: panel admin & juri */
  --background:#fbfaff; --foreground:#150d33;
  --card:#ffffff; --card-foreground:#150d33;
  --muted:#f1edfc; --muted-foreground:#5b5282;
  --border:#e2dbf5; --input:#e2dbf5;
  --primary:#7c4ddb; --primary-foreground:#ffffff;
  --accent:#f1edfc; --accent-foreground:#3b1f8f;
  --ring:#7c4ddb; --destructive:#d92d3a;
  --success:#1f7a3d; --warning:#a15c00; --info:#0b6aa2;
}
.dark {                       /* publik & peserta selalu; admin opsional */
  --background:#0b0720; --foreground:#f5f2ff;
  --card:#140d33; --card-foreground:#f5f2ff;
  --muted:#1d1347; --muted-foreground:#a99fd1;
  --border:#2e2266; --input:#2e2266;
  --primary:#9b6bf2; --primary-foreground:#0b0720;
  --accent:#241a57; --accent-foreground:#e4d8ff;
  --ring:#b48cf7; --destructive:#ff6b76;
  --success:#c4f15a; --warning:#e6c978; --info:#6cc4ff;
}
:root,.dark {
  --brand-violet-500:#9b6bf2; --brand-violet-600:#7c4ddb;
  --brand-pink:#d56bd9; --brand-gold:#c9a04a; --brand-pin:#ef4444;
  --gradient-brand:linear-gradient(135deg,#7c4ddb,#d56bd9);
  --radius:.75rem;
}
```

Halaman publik dan panel peserta membungkus konten dengan kelas `dark` secara permanen. Panel admin/juri memakai `next-themes` (`attribute="class"`, default `system`).

### Makna warna (semua permukaan)

| Warna | Makna |
|---|---|
| Ungu (`primary`) | Aksi utama, fokus, tautan aktif. Satu aksi utama per layar |
| Pink | Hanya ujung gradien dan sorotan dekoratif (publik/peserta) |
| Emas | Juara, peringkat 1-3, penanda resmi |
| `success` | Terverifikasi, tersimpan, live |
| `warning` | Menunggu, mendekati deadline |
| `info` | Informasi, kategori |
| `destructive` | Error, ditolak, aksi destruktif, **koreksi darurat** |

**Status tidak boleh hanya berbasis warna**: selalu ikon + teks.

### Peta status ke badge

| Domain | Status -> label, ikon (Phosphor), varian |
|---|---|
| Pembayaran | `awaiting_proof` Belum ada bukti `Receipt` netral; `pending_review` Menunggu `Hourglass` warning; `verified` Terverifikasi `CheckCircle` success; `rejected` Ditolak `XCircle` destructive |
| Pendaftaran | `draft` Draf; `registered` Terdaftar; `cancelled` Dibatalkan; `disqualified` Didiskualifikasi |
| Submission | Belum unggah; Terunggah (v3); Lewat deadline |
| Penugasan juri | `assigned` Belum dinilai; `in_progress` Sedang dinilai; `submitted` Terkirim |
| Nilai | Terbuka; **Terkunci** `Lock`; Dikoreksi darurat `Warning` destructive |
| Lomba | Segera buka; Buka; Penuh; Ditutup |

## 3. Tipografi

`next/font/google`, `display: swap`.
- Heading: **Bricolage Grotesque** 700-800, `letter-spacing:-.02em`.
- Isi/UI: **Plus Jakarta Sans** 400-700, minimal 16px di mobile.
- Angka, skor, kode, ID: **JetBrains Mono**, `tabular-nums`.

| Token | Mobile / desktop |
|---|---|
| display (hanya publik) | 40 / 72 |
| h1 | 32 / 48 (panel: 24 / 28) |
| h2 | 26 / 36 (panel: 20 / 22) |
| body | 16 / 16 (tabel panel: 14) |
| small | 14 |

## 4. Bentuk, spasi, elevasi

- Skala spasi 4px. Radius: kontrol 12px, kartu 16px, panel besar 24px, badge penuh.
- Elevasi: flat + border 1px. Bayangan hanya untuk popover/dialog. Glow ungu hanya satu elemen hero publik.
- Container: publik 1160px; panel peserta 1040px; panel admin penuh lebar dengan sidebar 248px (collapsible).
- Mobile-first 375px; breakpoint 640/768/1024/1280. Target sentuh >= 44px.

## 5. Komponen inti

Basis shadcn/ui + Radix. Ikon Phosphor saja (hapus `lucide-react` kecuali dependensi internal shadcn yang tak terganti; tugas T0.8).

Wajib ada: Button (primary, gradient hanya CTA publik, outline, ghost, destructive), Input/Textarea/Select/Checkbox/Radio/Switch, FormField (label, bantuan, error), FileDropzone, Card, Badge/StatusBadge, Tabs, Accordion, Dialog, Sheet, Popover, Tooltip, Toast, Skeleton, EmptyState, Table + Pagination + FilterBar, Stepper, Countdown, Calendar, Avatar, Breadcrumb, Sidebar, Topbar, Stat, ScoreInput.

Setiap komponen punya state: default, hover, focus-visible, active, disabled, loading, error. Spesifikasi per permukaan: `UI_KIT.md`.

## 6. Pola

- **Form:** label di atas, bantuan di bawah, error dengan ikon + teks, ringkasan error di atas form panjang, simpan progres otomatis untuk pendaftaran. Form dinamis lomba memakai komponen yang sama.
- **Tabel (panel):** header sticky, kolom aksi di kanan, filter + pencarian di atas, pagination (halaman + ukuran), baris klik membuka drawer detail. Di bawah `md` menjadi daftar kartu.
- **Dialog destruktif:** judul menyebut objek, tombol berlabel kata kerja ("Tolak bukti bayar"), alasan wajib bila PRD meminta (tolak bayar, koreksi darurat).
- **Koreksi darurat:** varian visual terpisah (border dan ikon `destructive`, banner "Tindakan ini tercatat permanen"), alasan wajib, ringkasan nilai lama -> baru.
- **Waktu:** selalu tampil WIB dengan penanda ("17 Des 2026, 23.59 WIB"); countdown memakai `lib/time.ts`.
- **Kosong:** ilustrasi kecil + satu kalimat + satu aksi.

## 7. Aksesibilitas (WCAG 2.2 AA)

Kontras 4.5:1 (teks) dan 3:1 (UI); ukur setiap pasangan baru, terutama `muted-foreground` dan teks di atas gradien. Fokus 2px `--ring` offset 2px. Semua fitur bisa dipakai dengan keyboard; tautan "Lewati ke konten". Dialog menjebak fokus. Pembaruan live `aria-live="polite"`. Hormati `prefers-reduced-motion`. Tabel punya `caption`/label dan header `th scope`. Teks bisa diperbesar 200%.

## 8. Copy (santai-akrab, hangat, lucu)

Sapaan **kamu**. Humor hanya di momen ringan (kosong, sukses, loading); pada error, pembayaran, penolakan, dan nilai: jelas dulu. Error menjawab apa, kenapa, apa yang bisa dilakukan.

| Konteks | Contoh |
|---|---|
| Bukti bayar ditolak | "Bukti bayarmu belum bisa kami terima: nominalnya tidak cocok. Unggah ulang yang sesuai, ya." |
| Menunggu verifikasi | "Bukti bayar sudah masuk. Panitia akan memeriksanya." (jangan berjanji waktu yang belum dikonfigurasi) |
| Lewat deadline | "Pengumpulan sudah ditutup. Versi terakhirmu (v2) yang akan dinilai." |
| Juri, nilai terkunci | "Nilai sudah dikunci panitia, jadi tidak bisa diubah lagi." |
| Admin, aksi destruktif | "Tindakan ini tercatat di audit log dan tidak bisa dibatalkan." |
| Kosong | "Belum ada pembayaran yang perlu diperiksa. Santai dulu." |

## 9. Ilustrasi dan motion

Vektor datar membulat, 2-3 warna palet, satu gaya. Maskot: kupu-kupu (mengacu ke logo Deforkafest). Dilarang isometrik 3D mengilap, orang stok, mesh acak. Motion 150-250ms; hormati `prefers-reduced-motion`. Panel admin: tanpa animasi dekoratif.

## 9b. Aset

Logo Permikomnas Yogyakarta, IMPSI UST, Deforkafest: file asli di `public/brand/`, tanpa dimodifikasi. Jika belum ada, placeholder bertanda; **jangan buat logo tiruan**.

## 10. Anti-slop

Ikuti util antislop. Tambahan: tidak ada statistik/testimoni palsu, tidak ada grid fitur 3 kolom berulang, tidak ada struktur landing SaaS (logo klien, harga tiga tingkat). Panel: tidak ada kartu statistik dekoratif tanpa tindakan; setiap angka harus bisa diklik ke daftar sumbernya.
