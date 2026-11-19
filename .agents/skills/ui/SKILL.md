---
name: permifest-deforkafest-ui
description: Panduan desain UI untuk sistem perlombaan "Permifest x Deforkafest" (Permikomnas Yogyakarta x IMPSI UST Yogyakarta) berbasis Next.js + Supabase + Tailwind. Gunakan skill ini setiap kali diminta mendesain, menulis, atau merevisi tampilan apa pun untuk event ini - landing page, daftar cabang lomba, kalender timeline, alur pendaftaran, leaderboard publik, halaman room meeting, maupun shell admin panel - walau user tidak menyebut kata "skill" atau "desain". Wajib dipakai bersama util antislop (antislop, antislop-ui, antislop-layoutmobile, antislop-copywriting, antislop-guide, antislop-code, antislop-human) supaya hasilnya tidak terlihat seperti output AI generik.
---
# Permifest x Deforkafest - UI Skill

Skill ini mengatur arah visual, token, komponen, dan microcopy untuk sistem perlombaan **Permifest x Deforkafest**. Fokus tahap ini: **landing page publik**. Panel admin dan juri hanya diberi fondasi token supaya konsisten nanti.

> Penulisan nama: **Deforkafest**, bukan "Devorkafest". Tulis "Permifest x Deforkafest" dengan huruf kecil `x`.

---

## 0. Cara memakai skill ini

1. Baca seluruh bagian 1-3 sebelum mengerjakan apa pun.
2. Jalankan util antislop sesuai tabel di bagian 1, **lalu** terapkan aturan spesifik event di file ini. Jika ada konflik, aturan event di file ini menang untuk soal identitas visual; aturan antislop menang untuk soal kualitas dan anti-klise.
3. Kerjakan mobile-first: rancang di lebar 375px dulu, baru naik ke 768 dan 1280.
4. Sebelum menyerahkan hasil, jalankan checklist di bagian 15.

---

## 1. Util antislop

Skill ini **merujuk** util antislop, tidak menyalin isinya. Ikuti aturan terbaru dari masing-masing util. Sumber: repo `miqdadbadjuber/anti-slop`.

| Util                      | Kapan dipakai di proyek ini                                          |
| ------------------------- | -------------------------------------------------------------------- |
| `antislop`              | Selalu aktif, sebagai lapisan dasar                                  |
| `antislop-ui`           | Setiap keputusan visual: warna, spasi, komponen, hierarki            |
| `antislop-layoutmobile` | Semua layout (prioritas mobile-first)                                |
| `antislop-copywriting`  | Semua teks UI: heading, tombol, empty state, error                   |
| `antislop-guide`        | Rujukan umum saat ragu atau ada kasus tepi                           |
| `antislop-code`         | Saat menghasilkan kode komponen Next.js/Tailwind                     |
| `antislop-human`        | Final pass: hilangkan kesan "ditulis AI" pada teks dan detail visual |

**Urutan kerja:** `antislop-guide` (orientasi) -> `antislop-ui` + `antislop-layoutmobile` (rancang) -> `antislop-copywriting` (isi teks) -> `antislop-code` (implementasi) -> `antislop-human` (poles akhir).

Jika util antislop tersedia sebagai MCP/tool, panggil tool-nya. Jika tidak tersedia di sesi ini, katakan terus terang dan tetap terapkan prinsip anti-slop di bagian 14.

---

## 2. Konteks event

| Item                | Isi                                                           |
| ------------------- | ------------------------------------------------------------- |
| Nama                | Permifest x Deforkafest                                       |
| Penyelenggara       | Permikomnas Yogyakarta x IMPSI UST Yogyakarta                 |
| Cabang akademik     | UI/UX, IT System Architecture, Esai bertema Cyber Security    |
| Cabang non-akademik | Machine Learning, PES                                         |
| Bahasa UI           | Indonesia, sapaan **"kamu"**                            |
| Stack               | Next.js (App Router) + Supabase + Tailwind CSS                |
| Pengguna            | Peserta (mayoritas di HP), Juri, Panitia, Super Admin, Publik |
| Prioritas           | Mobile-first, aksesibilitas penuh                             |

**Data dinamis, jangan di-hardcode.** Cabang lomba, tahapan timeline, biaya, dan syarat berkas semuanya dikelola panitia lewat CRUD di admin panel dan dibaca dari Supabase. Semua komponen UI harus bisa menampilkan 1 sampai N cabang/tahap tanpa layout rusak. Daftar cabang di bagian 2 hanyalah **data contoh** untuk mockup.

---

## 3. Arah visual

**Satu kalimat:** festival mahasiswa teknologi yang ceria dan berwarna, dibangun di atas komponen yang rapi ala shadcn/Vercel.

- **Karakter:** playful dan berwarna di level *komposisi* (latar, ilustrasi, kalender, stiker, aksen), tetapi **tenang di level komponen** (kartu, tombol, input, tabel mengikuti pola shadcn: border tipis, radius sedang, bayangan nyaris tidak ada).
- **Mode:** halaman publik **dark only**. Admin panel mendukung light dan dark.
- **Bentuk:** rounded sedang (lihat token radius).
- **Ikon:** Phosphor Icons. **Ilustrasi:** custom, vektor, gaya konsisten (bagian 11).
- **Referensi gaya** (ambil prinsip, jangan tiru mentah):
  - `arkavidia.com` - narasi bagian demi bagian, atmosfer, ilustrasi sebagai identitas
  - `itfest.ub.ac.id/home` - struktur informasi event: cabang, timeline, CTA daftar
  - `find-it.id` - kerapian kartu kompetisi dan hierarki informasi

### Sumber warna: poster & logo

Palet diturunkan dari materi visual Deforkafest dan logo penyelenggara:

- Latar poster: ungu tua hampir hitam dengan blob gradien ungu lavender yang kabur dan besar.
- Logo Deforkafest: simbol berbentuk kupu-kupu/panah dengan gradien pink-ungu.
- Logo IMPSI UST: lambang bulat bernuansa **emas** dengan motif sirkuit.
- Pin lokasi: merah.

> **Asumsi:** tidak ada brand guideline resmi. Nilai hex di bawah adalah estimasi dari poster. Jika logo vektor asli tersedia, ambil warna dengan color picker dan perbarui token. Logo Permikomnas Yogyakarta belum dianalisis; periksa warnanya sebelum dipakai sebagai aksen.

---

## 4. Design tokens

Gunakan variabel CSS bernama ala shadcn supaya komponen shadcn/ui langsung kompatibel. Halaman publik membungkus konten dengan kelas `dark` secara permanen.

```css
/* app/globals.css */
:root {
  /* Mode terang - dipakai admin panel saja */
  --background: #fbfaff;
  --foreground: #150d33;
  --card: #ffffff;
  --card-foreground: #150d33;
  --muted: #f1edfc;
  --muted-foreground: #5b5282;
  --border: #e2dbf5;
  --input: #e2dbf5;
  --primary: #7c4ddb;
  --primary-foreground: #ffffff;
  --accent: #f1edfc;
  --accent-foreground: #3b1f8f;
  --ring: #7c4ddb;
  --destructive: #d92d3a;
  --radius: 0.75rem;
}

.dark {
  /* Publik: dark only. Admin: dark opsional */
  --background: #0b0720;          /* ungu-malam, bukan hitam murni */
  --foreground: #f5f2ff;
  --card: #140d33;
  --card-foreground: #f5f2ff;
  --muted: #1d1347;
  --muted-foreground: #a99fd1;
  --border: #2e2266;
  --input: #2e2266;
  --primary: #9b6bf2;             /* ungu poster */
  --primary-foreground: #0b0720;
  --accent: #241a57;
  --accent-foreground: #e4d8ff;
  --ring: #b48cf7;
  --destructive: #ff6b76;
}

:root, .dark {
  /* Warna identitas & dukungan (sama di kedua mode) */
  --brand-violet-300: #d2bcfb;
  --brand-violet-400: #b48cf7;
  --brand-violet-500: #9b6bf2;
  --brand-violet-600: #7c4ddb;
  --brand-pink: #d56bd9;          /* ujung gradien logo Deforkafest */
  --brand-gold: #c9a04a;          /* emas lambang IMPSI */
  --brand-gold-soft: #e6c978;
  --brand-pin: #ef4444;           /* merah pin lokasi */

  /* Warna dukungan playful (ekstensi, bukan dari logo) */
  --support-lime: #c4f15a;        /* status live, sukses */
  --support-sky: #6cc4ff;         /* info, cabang non-akademik */

  --gradient-brand: linear-gradient(135deg, #7c4ddb 0%, #d56bd9 100%);
}
```

Daftarkan ke Tailwind (v4 contoh; untuk v3 petakan lewat `theme.extend.colors`):

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-primary: var(--primary);
  --color-brand-pink: var(--brand-pink);
  --color-brand-gold: var(--brand-gold);
  --color-support-lime: var(--support-lime);
  --color-support-sky: var(--support-sky);
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
}
```

### Aturan pemakaian warna

- **Ungu** = aksi utama, fokus, tautan aktif. Satu tombol primer per viewport.
- **Pink** = hanya sebagai ujung gradien dan sorotan dekoratif. Jangan jadikan warna teks isi.
- **Emas** = juara, peringkat 1-3, penanda "resmi/terverifikasi". Jangan dipakai untuk dekorasi biasa supaya maknanya terjaga.
- **Lime** = status "sedang berlangsung/live" dan keberhasilan.
- **Sky** = informasi dan penanda kategori.
- **Merah** = hanya error dan aksi destruktif (bukan dekorasi).
- Latar publik tidak boleh hitam murni `#000`. Pakai `--background`.
- Gradien maksimal dua warna dari palet di atas. Dilarang gradien pelangi.

### Spasi, radius, elevasi

- Skala spasi 4px: `4, 8, 12, 16, 24, 32, 48, 64, 96`.
- Radius: kontrol (tombol, input) `md` 12px, kartu `lg` 16px, panel besar dan blob `xl` 24px, chip/badge `full`.
- Elevasi: **flat + border 1px**. Bayangan hanya untuk popover/dialog (`0 8px 24px rgb(0 0 0 / .35)`). Kedalaman dibuat dengan lapisan latar (`background` -> `card` -> `muted`), bukan bayangan tebal.
- Glow ungu (`box-shadow: 0 0 0 1px var(--border), 0 0 48px -12px var(--brand-violet-600)`) boleh dipakai **hanya** pada satu elemen hero.

---

## 5. Tipografi

Muat lewat `next/font/google` dengan `display: swap` dan subset `latin`.

| Peran             | Font                          | Catatan                                                                      |
| ----------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| Display / heading | **Bricolage Grotesque** | Karakter hangat dan sedikit nyentrik, cocok playful tanpa terlihat kekanakan |
| Isi / UI          | **Plus Jakarta Sans**   | Terbaca baik di layar HP, akrab untuk audiens Indonesia                      |
| Angka, skor, kode | **JetBrains Mono**      | Tabular, dipakai di leaderboard, hitung mundur, nomor peserta                |

Skala (mobile -> desktop):

| Token        | Mobile | Desktop | Pemakaian                                          |
| ------------ | ------ | ------- | -------------------------------------------------- |
| `display`  | 40/44  | 72/76   | Judul hero, satu per halaman                       |
| `h1`       | 32/38  | 48/54   | Judul halaman                                      |
| `h2`       | 26/32  | 36/42   | Judul section                                      |
| `h3`       | 20/28  | 24/32   | Judul kartu                                        |
| `body`     | 16/26  | 16/26   | Teks isi, **jangan di bawah 16px** di mobile |
| `small`    | 14/22  | 14/22   | Metadata, caption                                  |
| `mono-num` | 14-32  | 14-48   | Angka, `font-variant-numeric: tabular-nums`      |

Aturan: heading `font-weight` 700-800 dengan `letter-spacing` -0.02em; panjang baris isi maksimal ~65 karakter; maksimal tiga ukuran berbeda dalam satu viewport.

---

## 6. Layout & mobile-first

Ikuti `antislop-layoutmobile`. Tambahan khusus proyek:

- Breakpoint: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Desain dimulai dari 375px.
- Container: padding horizontal 16px (mobile), 24px (md), lebar maksimal 1200px.
- Target sentuh minimal **44x44px**. Jarak antar target minimal 8px.
- Zona jempol: CTA utama ("Daftar sekarang") ditempatkan di bawah layar pada mobile lewat **sticky bottom bar** yang muncul setelah hero lewat dan hilang di dekat footer.
- Navigasi mobile: header ringkas (logo + tombol menu), menu sebagai *sheet* dari kanan atau bawah. Dilarang hamburger yang membuka dropdown kecil.
- Hormati `env(safe-area-inset-*)` untuk bar sticky.
- Tidak ada scroll horizontal pada body. Tabel lebar (leaderboard) menjadi **daftar kartu** di bawah `md`.
- Latar blob gradien tidak boleh menyebabkan overflow: bungkus dengan `overflow-clip` dan `pointer-events-none`.

---

## 7. Komponen

Basis: **shadcn/ui** (Radix) dengan ikon Phosphor (`@phosphor-icons/react`, bobot `regular` untuk UI, `fill` untuk status aktif, `duotone` untuk ilustrasi kecil).

| Komponen                 | Spesifikasi                                                                                                                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Button**         | Varian `primary` (ungu solid), `gradient` (hanya CTA hero), `outline`, `ghost`. Tinggi 44 (mobile) / 40 (desktop). Radius `md`. Status: hover, focus-visible, active, disabled, loading (spinner + teks tetap). |
| **Card**           | `bg-card`, border 1px, radius `lg`, padding 20-24. Hover (jika bisa diklik): border berubah ke `--brand-violet-600`, tanpa mengangkat berlebihan.                                                                   |
| **Badge/Chip**     | `rounded-full`, teks 12-13px, ikon Phosphor 14px opsional. Varian status: `live` (lime), `segera` (sky), `selesai` (muted), `penuh` (destructive).                                                              |
| **Input / Select** | Tinggi 44, label selalu terlihat di atas (bukan placeholder-sebagai-label), pesan bantu dan error di bawah, ikon error + teks (bukan warna saja).                                                                         |
| **Tabs**           | Dipakai untuk filter akademik / non-akademik. Indikator aktif = garis bawah ungu atau pil berlatar `muted`.                                                                                                             |
| **Accordion**      | FAQ. Satu terbuka sekaligus, ikon `CaretDown` berputar.                                                                                                                                                                 |
| **Sheet**          | Menu mobile dan filter.                                                                                                                                                                                                   |
| **Dialog**         | Konfirmasi dan detail cabang. Fokus terjebak di dalam, `Esc` menutup.                                                                                                                                                   |
| **Toast**          | Posisi atas pada mobile (agar tidak tertutup bar sticky). Maksimal 1 aktif.                                                                                                                                               |
| **Skeleton**       | Wajib untuk daftar cabang, timeline, dan leaderboard (koneksi lambat).                                                                                                                                                    |
| **Countdown**      | Angka `JetBrains Mono`, blok per satuan (hari, jam, menit, detik), `aria-live="off"` dengan label teks statis untuk pembaca layar.                                                                                    |
| **Stepper**        | Untuk alur pendaftaran, horizontal di desktop, ringkas "Langkah 2 dari 4" di mobile.                                                                                                                                      |

---

## 8. Landing page: struktur section

Urutan dari atas ke bawah. Setiap section punya satu tujuan, satu heading, dan maksimal satu CTA.

### 8.1 Header

Logo gabungan (lihat bagian 10), tautan: **Lomba, Jadwal, Peringkat, FAQ**, tombol **Masuk** (ghost) dan **Daftar** (primary). Sticky dengan latar `background/80` + `backdrop-blur` tipis, border bawah 1px muncul setelah scroll.

### 8.2 Hero

- Heading `display`: nama event, dengan kata atau "x" diberi aksen gradien (bukan seluruh judul).
- Subjudul 1-2 kalimat, santai, menyebut kedua penyelenggara.
- CTA ganda: **Daftar sekarang** (gradient) dan **Lihat cabang lomba** (outline).
- Meta di bawah CTA: tanggal pendaftaran terdekat + hitung mundur ke deadline aktif (dari data timeline).
- Latar: 2-3 blob gradien ungu/pink blur besar seperti poster, ditambah satu ilustrasi tokoh/objek utama (bagian 11). Tidak ada foto stok.
- Hanya hero yang boleh memakai glow.

### 8.3 Strip penyelenggara

Logo Permikomnas Yogyakarta dan IMPSI UST, monokrom terang opacity 70% dengan label "Diselenggarakan oleh". Tanpa marquee.

### 8.4 Cabang lomba

- Tabs: **Semua / Akademik / Non-akademik**.
- Grid kartu: 1 kolom (mobile), 2 (md), 3 (lg). Bisa menampung N kartu.
- Isi kartu: ikon/ilustrasi kecil, nama cabang, badge kategori, format (individu/tim + jumlah anggota), biaya, status (buka/penuh/segera), tombol "Lihat detail".
- Detail dibuka di *dialog* (desktop) atau *sheet bawah* (mobile): deskripsi, syarat berkas, hadiah, tombol daftar.
- Kartu dirender dari data, tanpa nama cabang di-hardcode di komponen.
- Empty state bila belum ada cabang: lihat bagian 12.

### 8.5 Kalender timeline (playful)

Lihat bagian 9.

### 8.6 Peringkat live (teaser)

Cuplikan top 3 per cabang dengan penanda **Live** (titik lime berdenyut pelan). Tombol "Lihat peringkat lengkap" menuju halaman leaderboard. Rincian di bagian 10.5.

### 8.7 Cara daftar

Empat langkah bergaya stepper vertikal bernomor: **Buat akun -> Pilih lomba -> Isi data tim dan unggah berkas -> Bayar dan tunggu verifikasi**. Satu ilustrasi kecil per langkah.

### 8.8 Biaya & pembayaran

Ringkasan biaya per cabang (dari data) dan penjelasan singkat pembayaran lewat **QRIS**. Tidak menampilkan QRIS asli di landing, hanya ilustrasi/ikon. QRIS asli muncul di langkah pembayaran setelah login.

### 8.9 FAQ

Accordion, 6-8 pertanyaan, jawaban singkat dengan nada santai.

### 8.10 CTA penutup

Satu blok besar berlatar gradien merek, satu kalimat, satu tombol.

### 8.11 Footer

Logo, tautan cepat, kontak/sosial kedua organisasi (Instagram dan lainnya, **ambil dari akun resmi**, jangan mengarang), hak cipta.

---

## 9. Kalender timeline (playful)

Tahapan bersifat **dinamis** (dari Supabase). Tampilan kalender menjadi pusat bagian ini.

**Struktur data minimal:** `id, judul, deskripsi, tanggal_mulai, tanggal_selesai, jenis (daftar | technical-meeting | penyisihan | final | pengumuman | lainnya), cabang_id (opsional), warna_jenis`.

**Tampilan:**

- **Mobile:** daftar agenda vertikal dikelompokkan per bulan. Di atasnya, strip kalender mingguan yang bisa digeser. Titik berwarna pada tanggal menandai agenda.
- **Desktop:** kalender bulanan penuh di kiri, panel "Agenda terdekat" di kanan.
- Sel tanggal berisi agenda tampil sebagai **stiker**: pil kecil bersudut membulat, sedikit miring (`rotate(-2deg)`) dan warna per jenis agenda. Miring hanya pada elemen dekoratif; teks tetap terbaca.
- Hari ini diberi cincin ungu dan label "Hari ini". Deadline mendekat (<= 3 hari) memakai penanda pink + ikon `Alarm`.
- Pilih tanggal membuka detail agenda (sheet/popover) berisi jam, lokasi atau tautan room, dan tombol "Ingatkan aku" bila fitur pengingat ada.
- Filter per cabang lewat chip di atas kalender.
- Navigasi bulan: tombol sebelumnya/berikutnya (44px) + tombol "Hari ini".

**Aksesibilitas kalender:** gunakan pola grid ARIA (`role="grid"`), panah keyboard untuk pindah tanggal, `Enter` membuka detail. Sediakan **tampilan daftar** sebagai alternatif yang bisa dipilih lewat toggle (Kalender / Daftar). Warna jenis agenda selalu disertai ikon dan teks.

**Jika data kosong:** tampilkan empty state bagian 12, bukan kalender kosong.

---

## 10. Layar pendukung (kerangka)

Bagian ini memberi arah agar halaman lain konsisten dengan landing page. Detailnya dikerjakan setelah landing page disetujui.

### 10.1 Logo gabungan

Susun logo Permikomnas Yogyakarta, IMPSI UST, dan Deforkafest dengan pemisah "x" tipis. Jaga ruang kosong minimal setinggi logo di sekelilingnya. Versi monokrom terang untuk latar gelap. **Jangan mengubah proporsi, memutar, atau mewarnai ulang logo.** Pakai file asli dari akun resmi, bukan hasil tiruan.

### 10.2 Pendaftaran

Stepper 4 langkah. Berkas yang diminta **dinamis per cabang**: komponen upload dirender dari daftar syarat (label, format, ukuran maksimal, wajib/tidak). Status verifikasi memakai badge: `Menunggu`, `Diterima`, `Ditolak` (disertai alasan dan tombol unggah ulang). Simpan progres otomatis dan beri tahu pengguna.

### 10.3 Pembayaran

Tampilkan gambar QRIS statis (diunggah admin), nominal dengan `JetBrains Mono`, tombol "Salin nominal", unggah bukti bayar dengan pratinjau gambar.

### 10.4 Room meeting

Kartu sesi: nama sesi, cabang, jam, status (`Segera`, `Live`, `Selesai`), tombol **Gabung**. Tombol aktif beberapa menit sebelum mulai (angka menit dari pengaturan), saat nonaktif tampilkan hitung mundur dan alasan. Passcode disembunyikan dengan tombol "Tampilkan" + "Salin". Berlaku untuk Zoom maupun platform lain (tampilkan nama platform sebagai badge, jangan mengunci ke satu merek).

### 10.5 Peringkat live (publik)

- Header: pilih cabang (Tabs/Select), penanda **Live** dengan waktu pembaruan terakhir ("Diperbarui 12 detik lalu"), sumber pembaruan Supabase Realtime.
- Desktop: tabel dengan kolom `#`, Tim/Peserta, Institusi, Skor. Mobile: daftar kartu.
- Peringkat 1-3 memakai emas, perak, perunggu **ditambah angka dan ikon medali** (bukan warna saja). Perubahan posisi ditandai panah naik/turun kecil, dianimasikan singkat.
- Angka skor selalu `tabular-nums` agar tidak bergeser.
- Pagination atau "Muat lebih banyak" untuk daftar panjang, dengan pencarian nama.
- Bila skor dibekukan (freeze), tampilkan banner informatif, bukan error.

### 10.6 Admin panel

Mendukung light dan dark. Pakai token yang sama, kerapatan lebih tinggi (tabel padat, pagination, filter). Tidak memakai blob gradien. Aksen playful dikurangi menjadi ikon, badge, dan empty state saja.

---

## 11. Ilustrasi, ikon, motion

### Ilustrasi

- Gaya: vektor datar dengan bentuk geometris membulat, 2-3 warna dari palet, kontur tebal seragam atau tanpa kontur. **Pilih satu gaya dan pertahankan.**
- Tema: objek teknologi yang ramah (laptop, kursor, awan, kunci/perisai untuk cyber security, jaringan saraf, gamepad untuk PES) berkarakter, bukan robot generik.
- Gunakan SVG inline atau `next/image` dengan `.svg`. Beri `alt` bermakna bila informatif, `alt=""` bila dekoratif.
- Dilarang: ilustrasi isometrik 3D mengilap bawaan generator, orang dengan wajah kosong bergaya stok, dan gradien mesh acak yang tidak berhubungan dengan identitas event.

### Ikon

Phosphor saja. Ukuran 16/20/24, bobot konsisten per konteks. Ikon yang membawa makna wajib punya label teks atau `aria-label`.

### Motion

- Durasi 150-250ms untuk UI, hingga 600ms untuk transisi section. Easing `cubic-bezier(.2,.8,.2,1)`.
- Animasi yang dipakai: fade/slide-up halus saat section muncul (sekali), blob latar bergerak sangat lambat, titik "Live" berdenyut, angka countdown berganti.
- **Hormati `prefers-reduced-motion`**: matikan blob bergerak, parallax, dan denyut; ganti dengan keadaan statis.
- Dilarang: animasi berulang tanpa henti pada banyak elemen, parallax berat di mobile, efek ketik pada heading.

---

## 12. Microcopy (santai-akrab, hangat, lucu)

Ikuti `antislop-copywriting`. Aturan tambahan:

- Sapa dengan **"kamu"**, kalimat pendek, bahasa sehari-hari yang masih rapi. Hindari gaul berlebihan, singkatan membingungkan, dan emoji beruntun (maksimal satu emoji per pesan, dan hanya pada pesan non-kritis).
- Lucu **hanya** di momen ringan (empty state, sukses, loading). Pada error, pembayaran, dan penolakan berkas: jelaskan masalah dan solusinya dulu, humor dikecilkan.
- Setiap error menjawab tiga hal: apa yang terjadi, kenapa, apa yang bisa dilakukan sekarang.
- Tombol berupa kata kerja spesifik ("Daftar lomba ini", bukan "Kirim" atau "OK").
- Hindari klise: "Wujudkan potensimu", "Era baru", "Revolusi", "Platform terdepan". Tulis fakta: tanggal, hadiah, siapa yang boleh ikut.

Contoh (boleh disesuaikan, jangan disalin mentah-mentah):

| Situasi                    | Contoh                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------- |
| Empty: belum ada cabang    | "Cabang lomba lagi disiapkan panitia. Mampir lagi sebentar lagi, ya."               |
| Empty: peringkat belum ada | "Belum ada skor masuk. Papan ini masih kosong dan siap diperebutkan."               |
| Empty: agenda kosong       | "Jadwal belum diumumkan. Begitu ada, langsung muncul di sini."                      |
| Sukses daftar              | "Berkas kamu sudah masuk. Panitia akan memeriksa dalam 1x24 jam."                   |
| Berkas ditolak             | "Berkas belum bisa kami terima: fotonya buram. Coba unggah ulang yang lebih jelas." |
| Error jaringan             | "Koneksimu lagi putus-nyambung. Data kamu aman, coba lagi sebentar."                |
| Form wajib kosong          | "Nama tim wajib diisi supaya panitia tahu siapa yang daftar."                       |
| Pendaftaran ditutup        | "Pendaftaran sudah ditutup. Pantau jadwal untuk tahap berikutnya."                  |
| Countdown nol              | "Waktunya habis. Sampai ketemu di tahap selanjutnya."                               |

> Nilai seperti "1x24 jam" hanyalah contoh. Ambil angka sebenarnya dari pengaturan atau konfirmasi panitia.

---

## 13. Aksesibilitas (target WCAG 2.2 AA)

- Kontras teks isi minimal 4.5:1, teks besar dan komponen UI 3:1. **Ukur setiap pasangan warna** yang baru ditambahkan, terutama `muted-foreground` di atas `card` dan teks di atas gradien.
- Teks tidak boleh diletakkan langsung di atas blob gradien tanpa lapisan latar solid atau scrim yang menjamin kontras.
- Fokus terlihat jelas: cincin 2px `--ring` dengan offset 2px pada semua elemen interaktif. Dilarang `outline: none` tanpa pengganti.
- Seluruh fitur bisa dipakai dengan keyboard. Urutan tab mengikuti urutan visual. Sediakan tautan "Lewati ke konten utama".
- Gunakan elemen semantik (`header`, `nav`, `main`, `section` dengan heading, `footer`). Satu `h1` per halaman, tanpa melompati level heading.
- Status tidak hanya berbasis warna: selalu tambah ikon dan teks.
- Form: label terhubung, `aria-describedby` untuk bantuan dan error, ringkasan error di atas form, `autocomplete` yang tepat.
- Dialog dan sheet menjebak fokus lalu mengembalikannya ke pemicu.
- Pembaruan live (leaderboard, toast) memakai `aria-live="polite"`, dengan frekuensi dibatasi agar tidak membanjiri pembaca layar.
- Hormati `prefers-reduced-motion` dan `prefers-contrast`. Teks bisa diperbesar sampai 200% tanpa kehilangan fungsi.
- **Koneksi lambat:** skeleton untuk setiap data async, gambar `loading="lazy"` kecuali hero, ukuran gambar eksplisit untuk mencegah layout shift, keadaan offline dan retry yang jelas. Target LCP < 2.5 detik di 4G.

---

## 14. Anti-slop khusus proyek

Selain util antislop, hindari hal-hal berikut yang sering muncul pada UI hasil AI untuk event kampus:

**Visual**

- Gradien ungu-ke-biru pada seluruh latar, kartu kaca (glassmorphism) di semua tempat, dan glow neon di semua tombol.
- Grid fitur 3 kolom berisi ikon di lingkaran dengan judul + dua baris teks, diulang berkali-kali.
- Ilustrasi roket, bola lampu, dan grafik naik sebagai pengisi.
- Statistik palsu ("10.000+ peserta") atau testimoni karangan. Jika belum ada data, jangan tampilkan.
- Semua kartu berukuran sama dengan ritme monoton. Variasikan ukuran dan penekanan, mis. cabang unggulan atau yang pendaftarannya segera ditutup lebih menonjol.

**Struktur**

- Menyalin struktur landing SaaS (logo klien, harga tiga tingkat, "Trusted by"). Ini event kompetisi: yang penting cabang, jadwal, biaya, hadiah, dan cara daftar.
- Section tanpa tujuan jelas yang hanya mengisi ruang.

**Teks**

- Placeholder "Lorem ipsum" atau copy generik. Pakai data contoh yang realistis dan konsisten dengan event.
- Tanda seru berlebihan dan heading berformat "Bukan X, tapi Y".

**Kode**

- Komponen tunggal raksasa, warna hex tertanam di JSX, ukuran magis tanpa token, `div` sebagai tombol.

---

## 15. Checklist sebelum menyerahkan hasil

- [ ] Nama event ditulis "Permifest x Deforkafest" (dengan F).
- [ ] Util antislop dijalankan sesuai urutan bagian 1 (atau dicatat jika tidak tersedia).
- [ ] Tampilan 375px sudah benar sebelum melebar; tidak ada scroll horizontal.
- [ ] Semua warna berasal dari token, bukan hex tertanam.
- [ ] Hanya satu aksi primer per viewport, satu hero glow.
- [ ] Cabang, timeline, dan syarat berkas dirender dari data, tahan terhadap 0, 1, dan banyak item.
- [ ] Ada keadaan: loading (skeleton), kosong, error, dan sukses untuk setiap data async.
- [ ] Kontras diukur; status tidak bergantung pada warna saja; fokus keyboard terlihat.
- [ ] `prefers-reduced-motion` ditangani.
- [ ] Teks memakai "kamu", spesifik, tanpa klise, humor hanya pada momen ringan.
- [ ] Tidak ada statistik, testimoni, atau tautan sosial karangan.
- [ ] Logo asli dipakai tanpa dimodifikasi dan sumbernya dicatat.
- [ ] `antislop-human` dijalankan sebagai pass terakhir.

---

## 16. Asumsi dan hal yang masih terbuka

Asumsi yang dipakai karena belum ada jawaban pasti. Konfirmasi dan perbarui bagian ini:

1. Hex warna adalah estimasi dari poster Deforkafest; belum ada brand guideline. Warna logo Permikomnas Yogyakarta belum diverifikasi.
2. Warna dukungan **lime** dan **sky** adalah ekstensi untuk kebutuhan status dan kategori, bukan dari logo.
3. Pilihan font (Bricolage Grotesque, Plus Jakarta Sans, JetBrains Mono) adalah usulan; dapat diganti jika ada preferensi.
4. Skala peserta tidak dikunci; pagination dan skeleton disiapkan secara umum.
5. Tahapan lomba, daftar cabang, biaya, dan syarat berkas belum final dan sepenuhnya dinamis.
6. Fitur room meeting bersifat umum (Zoom atau platform lain, link manual atau API) sampai ada keputusan.
7. Panel admin dan juri belum didesain; hanya fondasi token yang disiapkan.
8. Isi util antislop tidak diverifikasi saat skill ini ditulis. Jika repo berubah, ikuti versi terbaru util.
9. Hierarki konten landing (urutan section 8.x) dapat dirombak setelah data nyata (hadiah, tanggal, biaya) tersedia.
