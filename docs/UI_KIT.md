# UI_KIT.md

Spesifikasi komponen dan template layar per permukaan. Pratinjau visual: artefak **UI Kit Permifest x Deforkafest** (kanvas dengan tiga papan: Publik, Peserta, Panel). Token dan aturan: `DESIGN_SYSTEM.md`.

## 1. Kit publik (dark, playful)

**Komponen:** Navbar (logo gabungan, tautan, Daftar), StickyBottomBar (mobile), Hero + maskot, CompetitionCard, KalenderStiker, PodiumLeaderboard, StepCard, FaqAccordion, CtaBlock, Footer, OrganizerStrip.

| Komponen | Spesifikasi |
|---|---|
| Navbar | Sticky, `background/80` + blur tipis, border bawah muncul saat scroll; mobile: logo + menu (Sheet) |
| CompetitionCard | Ikon 56px di tile warna, judul h3, badge kategori, deskripsi 1-2 baris, `Format` dan `Biaya` dari data, tombol "Lihat detail"; status Buka/Penuh/Segera |
| KalenderStiker | Grid 7 kolom; agenda sebagai stiker pil miring `-3deg` per jenis; toggle Kalender/Daftar; navigasi bulan + "Hari ini"; grid ARIA |
| PodiumLeaderboard | Urutan 2-1-3; angka mono; medali ikon + angka; badge Live; skeleton; hanya data yang dirilis |
| Footer | Logo, tautan cepat, kontak/sosial resmi (jangan mengarang) |

**Layar:** Home, Daftar Kompetisi (filter Akademik/Non-akademik, pagination bila banyak), Detail Kompetisi (tab: Ringkasan, Syarat, Timeline, Biaya; CTA sticky), Pengumuman (daftar + detail), Leaderboard, Informasi (kerangka), Login, Register, Lupa/Reset password, Verifikasi email.

## 2. Kit panel peserta (dark, turunan publik)

**Shell:** sidebar 248px di desktop; bottom tab bar 5 item di mobile (Overview, Lomba, Bayar, Karya, Profil). Topbar: judul halaman, avatar, notifikasi.

**Komponen:** StatusStepper (Daftar -> Bayar -> Verifikasi -> Karya -> Hasil), ActionCard ("Langkah berikutnya", satu per layar), PaymentCard (QR, nominal mono, salin nominal, unggah bukti), ProofDropzone (pratinjau, progres, ulang), PaymentStatusBanner (ditolak + alasan + unggah ulang), SubmissionCard (versi, deadline countdown, riwayat), TeamPanel (kode undangan, anggota, cadangan, batas), DynamicForm, ResultCard (hanya hasil akhir yang dirilis).

**Layar:** Overview, Kompetisi Saya (+ detail pendaftaran, tim), Pembayaran, Submission, Hasil & Pengumuman, Profil/Akun (termasuk identitas bila diminta).

**Aturan:** satu "Langkah berikutnya" dominan; dekorasi hanya ilustrasi kecil di empty state; tidak ada blob besar; tidak pernah menampilkan nilai/komentar juri.

## 3. Kit panel admin (terang/gelap, padat)

**Shell:** Sidebar bergrup (Operasional, Penilaian, Konten, Pengaturan), Topbar (pemilih lomba untuk panitia, pencarian global `Ctrl K`, pengalih tema, menu akun), Breadcrumb.

**Komponen umum:** StatCard (angka + tautan ke daftar), DataTable (sort, filter, pagination, pilih baris, ekspor CSV), FilterBar, Drawer detail, StatusBadge, EmptyState, ConfirmDialog, ReasonDialog (alasan wajib), AuditEntry, ScopeSwitcher.

**Per peran:**

| Peran | Komponen khas | Layar |
|---|---|---|
| Panitia | PaymentReviewPanel (bukti besar + data pendaftar + Setujui/Tolak + alasan, navigasi antrean J/K), AssignmentMatrix (karya x juri), ScoringProgress (progres per juri, rata-rata), LockScoresBar, ResultEntryForm (juara 1-3), AnnouncementEditor | Overview, Peserta, Pembayaran, Submission, Juri, Penilaian, Hasil, Pengumuman |
| Super admin | CompetitionEditor (tab: Umum, Form builder, Tahap & jadwal, Biaya & kuota, Aturan file, Aturan penilaian), FormFieldBuilder (seret-susun), RubricEditor (bobot total 100 + indikator sisa), UserRoleManager, BreakGlassForm, AuditTable + filter, SettingsForm (konfigurasi pertanyaan terbuka) | Kompetisi, Rubrik, Pengguna, Koreksi Darurat, Audit Log, Pengaturan |
| Juri | SubmissionViewer (tab Karya / Rubrik, sisi-ke-sisi di desktop), RubricForm (ScoreInput per kriteria, skor terbobot otomatis mono, komentar), LockNotice, AssignmentList (status, progres) | Overview, Penugasan, Detail + Form, Riwayat, Pengaturan |

**Aturan khusus:**
- **ScoreInput:** angka dengan batas `max_score`, langkah dapat dikonfigurasi, validasi inline, total terbobot diperbarui langsung; simpan draf otomatis; tombol "Kirim penilaian" dengan konfirmasi.
- **ReasonDialog:** minimal 10 karakter, penghitung karakter, tombol nonaktif sampai valid.
- **BreakGlassForm:** varian destruktif, tampilkan nilai lama -> baru, banner permanen.
- **Blind review:** bila `scoring_config.blind`, SubmissionViewer menyembunyikan identitas; tidak ada nama di judul tab atau nama file.
- **Dark mode:** semua komponen diuji di terang dan gelap; badge status memakai pasangan token `success/warning/info`.

## 4. Template halaman

1. **Daftar (tabel):** judul + aksi utama kanan, FilterBar, DataTable, pagination, EmptyState.
2. **Detail (drawer/halaman):** header + status, tab, panel aksi sticky di bawah (mobile).
3. **Form:** satu kolom, bagian dengan judul, bar aksi lengket, ringkasan error.
4. **Overview:** StatCard (maks. 4) + "Perlu tindakan" (daftar kerja) + aktivitas terbaru.

## 5. Checklist komponen baru

- [ ] Ada di terang dan gelap (admin) atau gelap (publik/peserta).
- [ ] State: default, hover, fokus, aktif, nonaktif, loading, error, kosong.
- [ ] Target sentuh >= 44px, kontras AA, label aksesibel.
- [ ] Tanpa hex tertanam; token saja.
- [ ] Copy sesuai `DESIGN_SYSTEM.md` bagian 8.
