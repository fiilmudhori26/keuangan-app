# PRD: Aplikasi Pencatatan Keuangan Pribadi (PWA)

| | |
|---|---|
| Versi | 0.2 (Draft) |
| Tanggal | 12 November 2026 |
| Pemilik | Akbar |
| Status | Siap dieksekusi bertahap di OpenCode |
| Perubahan v0.2 | Backend dari Supabase diganti Neon (Postgres) + Better Auth + penyimpanan objek terpisah |

---

## 1. Ringkasan

Aplikasi web progresif (PWA) untuk mencatat pemasukan dan pengeluaran pribadi dengan cepat dari HP. Pengguna dapat mengelola banyak dompet/rekening, menetapkan anggaran bulanan, melihat laporan, dan memasukkan transaksi lewat foto struk yang dibaca otomatis oleh AI.

**Tujuan produk:** mencatat satu transaksi dalam kurang dari 10 detik, dan memberi gambaran jelas ke mana uang pergi setiap bulan.

## 2. Masalah dan Peluang

- Pencatatan manual di buku atau spreadsheet merepotkan sehingga sering ditinggalkan.
- Banyak aplikasi keuangan terlalu kompleks, penuh iklan, atau berbayar.
- Uang tersebar di banyak tempat (tunai, rekening bank, e-wallet) sehingga saldo total sulit dilihat.
- Input struk satu per satu memakan waktu; AI dapat memangkas langkah ini.

## 3. Target Pengguna

**Persona utama:** individu usia 18-40 tahun di Indonesia yang memakai HP sebagai perangkat utama, memiliki lebih dari satu sumber dana (tunai, bank, e-wallet), dan ingin disiplin mengatur pengeluaran tanpa belajar aplikasi rumit.

**Di luar cakupan:** keluarga/pasangan berbagi akun dan UMKM (pertimbangan versi berikutnya).

## 4. Tujuan dan Metrik Keberhasilan

| Tujuan | Metrik | Target MVP |
|---|---|---|
| Pencatatan cepat | Waktu input transaksi manual | < 10 detik |
| Kebiasaan terbentuk | Pengguna aktif mencatat minimal 4 hari/minggu | ≥ 50% dari pengguna uji |
| Akurasi scan struk | Total nominal terbaca benar tanpa koreksi | ≥ 80% pada struk standar |
| Performa | Lighthouse PWA & Performance (mobile) | ≥ 90 |
| Instalasi | Bisa diinstal ke layar utama dan dipakai offline untuk lihat data terakhir | Lolos |

## 5. Ruang Lingkup MVP

### 5.1 Autentikasi dan Profil
- Daftar dan masuk dengan email + kata sandi, serta Google.
- Pengaturan dasar: mata uang (default IDR), awal bulan anggaran (default tanggal 1).

### 5.2 Multi Dompet / Rekening
- CRUD dompet: nama, tipe (tunai, bank, e-wallet, lainnya), saldo awal, ikon/warna.
- Saldo dompet dihitung dari saldo awal + total transaksi.
- Transfer antar dompet (tercatat sebagai satu pasangan transaksi, tidak dihitung sebagai pemasukan/pengeluaran).
- Dompet dapat diarsipkan (tidak dihapus bila sudah punya transaksi).

### 5.3 Pencatatan Pemasukan dan Pengeluaran
- Form cepat: nominal, tipe (masuk/keluar), kategori, dompet, tanggal (default hari ini), catatan opsional.
- Kategori bawaan (bisa diubah): Makan, Transportasi, Belanja, Tagihan, Kesehatan, Hiburan, Pendidikan, Gaji, Lainnya.
- Kategori kustom: tambah, ubah, arsipkan.
- Daftar transaksi dengan filter (rentang tanggal, dompet, kategori, tipe) dan pencarian catatan.
- Ubah dan hapus transaksi.

### 5.4 Anggaran dan Laporan Bulanan
- Anggaran per kategori per bulan (nominal batas).
- Indikator progres (terpakai vs batas); peringatan visual saat ≥ 80% dan ≥ 100%.
- Dashboard bulanan: total pemasukan, total pengeluaran, selisih, saldo total semua dompet.
- Grafik: pengeluaran per kategori (donat/bar) dan tren harian atau mingguan.
- Perbandingan dengan bulan sebelumnya.
- Ekspor laporan bulanan ke CSV.

### 5.5 Scan Struk / Input dengan AI
- Unggah atau ambil foto struk dari kamera HP.
- AI mengekstrak: total, tanggal, nama merchant, dan (opsional) rincian item.
- AI menyarankan kategori; hasil ditampilkan sebagai **draf yang wajib dikonfirmasi** pengguna sebelum disimpan.
- Input teks bebas, misalnya "makan siang 25rb gopay", diurai menjadi draf transaksi.
- Foto struk dapat dilampirkan ke transaksi (opsional, bisa dimatikan di pengaturan).

### 5.6 PWA
- Web app manifest, ikon, layar splash, bisa diinstal.
- Service worker: cache aset dan data terakhir untuk dilihat offline.
- Input transaksi saat offline disimpan lokal lalu disinkronkan saat online (antrean sinkronisasi sederhana).

## 6. Di Luar Cakupan MVP (Backlog)

- Berbagi dompet dengan pasangan/keluarga.
- Transaksi berulang (langganan, cicilan) dan pengingat.
- Target tabungan, pelacakan utang/piutang.
- Impor mutasi bank (CSV/PDF).
- Multi mata uang.
- Notifikasi push.
- Mode UMKM (stok, laba rugi).

## 7. Alur Pengguna Utama

1. **Catat pengeluaran cepat:** buka app, tombol "+", isi nominal, pilih kategori dan dompet, simpan.
2. **Scan struk:** tombol kamera, foto struk, tinjau draf AI, koreksi bila perlu, simpan.
3. **Cek anggaran:** buka dashboard, lihat progres per kategori, sesuaikan batas bila perlu.
4. **Tutup bulan:** buka laporan bulanan, lihat ringkasan dan grafik, ekspor CSV.

## 8. Kebutuhan Non-Fungsional

- **Mobile-first:** dirancang untuk layar 360-430 px, area sentuh ≥ 44 px.
- **Performa:** halaman utama termuat < 2 detik pada jaringan 4G.
- **Keamanan:** data per pengguna terisolasi lewat filter `user_id` wajib pada setiap query di server (helper terpusat) dan diverifikasi dengan tes; kunci API AI dan `DATABASE_URL` hanya di server; HTTPS wajib; kata sandi di-hash oleh library autentikasi, tidak pernah disimpan polos.
- **Privasi:** data keuangan tidak dijual atau dibagikan; foto struk disimpan privat; pengguna bisa menghapus akun beserta seluruh datanya.
- **Aksesibilitas:** kontras memadai, label form jelas, mendukung mode gelap.
- **Bahasa:** antarmuka Bahasa Indonesia; format angka dan tanggal lokal (Rp 25.000, 12 Nov 2026).
- **Akurasi uang:** nominal disimpan sebagai bilangan bulat (satuan terkecil), bukan floating point.

## 9. Usulan Arsitektur dan Teknologi

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Database | Neon (serverless PostgreSQL, free tier) |
| ORM dan migrasi | Drizzle ORM + drizzle-kit |
| Autentikasi | Better Auth (email + kata sandi, Google); sesi berbasis cookie |
| Penyimpanan foto struk | Cloudflare R2 atau Vercel Blob (bucket privat, akses lewat URL bertanda tangan sementara) |
| PWA | Manifest + service worker (mis. Serwist atau next-pwa) |
| Grafik | Recharts |
| Validasi | Zod + React Hook Form |
| AI struk | Route handler server yang memanggil API model dengan kemampuan baca gambar; keluaran dipaksa JSON terstruktur |
| Deploy | Vercel |

**Catatan Neon:** free tier memiliki batas penyimpanan kecil dan database dapat tidur saat tidak dipakai (cold start sekitar setengah detik saat query pertama). Pakai driver HTTP `@neondatabase/serverless` untuk fungsi Vercel, kompres foto struk, dan cek batas terbaru di halaman harga Neon sebelum rilis.

**Catatan AI:** hasil ekstraksi selalu berupa draf; validasi dengan Zod sebelum ditampilkan; batasi ukuran gambar (kompres di klien) dan terapkan rate limit per pengguna.

## 10. Model Data (Usulan)

```
-- Tabel user, session, account dikelola Better Auth (skema dari library).
profiles(user_id, display_name, currency, month_start_day, created_at)

wallets(id, user_id, name, type, initial_balance, color, icon, is_archived, created_at)

categories(id, user_id, name, type[income|expense], icon, color, is_archived)

transactions(id, user_id, wallet_id, category_id, type[income|expense|transfer],
             amount, occurred_at, note, merchant, receipt_path,
             transfer_group_id, source[manual|ai_scan|ai_text], created_at, updated_at)

budgets(id, user_id, category_id, month[YYYY-MM], limit_amount)
```

- Tanpa RLS bawaan: semua akses data lewat fungsi repository yang selalu menerima `userId` dari sesi dan menambahkan `WHERE user_id = :userId`. Dilarang query langsung ke tabel dari route handler tanpa helper ini.
- Indeks: `transactions(user_id, occurred_at)`, `transactions(wallet_id)`, `budgets(user_id, month)`.
- `amount` bertipe integer (Rupiah penuh).

## 11. Kebutuhan Layar

1. Masuk / Daftar
2. Dashboard (ringkasan bulan ini, saldo total, grafik, anggaran)
3. Daftar Transaksi (filter dan pencarian)
4. Tambah/Ubah Transaksi (form cepat + tombol scan)
5. Tinjau Hasil Scan (draf AI)
6. Dompet (daftar dan detail, transfer)
7. Anggaran (atur dan pantau)
8. Laporan Bulanan (grafik, ekspor)
9. Pengaturan (kategori, profil, tema, hapus akun)

Navigasi bawah: Dashboard, Transaksi, (+) Tambah, Anggaran, Lainnya.

## 12. Rencana Rilis (Milestone untuk OpenCode)

Kerjakan berurutan; setiap milestone harus berjalan dan lolos pengecekan sebelum lanjut.

| # | Milestone | Hasil yang dapat diverifikasi |
|---|---|---|
| M0 | Setup proyek | Next.js + TS + Tailwind + shadcn/ui, Neon terhubung lewat Drizzle, lint dan type-check lolos, deploy awal ke Vercel |
| M1 | Auth dan skema DB | Better Auth (email + Google), migrasi Drizzle, helper repository berfilter `user_id`, tes isolasi (pengguna A tidak bisa baca/ubah data B) |
| M2 | Dompet dan kategori | CRUD dompet dan kategori, kategori bawaan di-seed saat daftar |
| M3 | Transaksi | Form cepat, daftar, filter, ubah/hapus, transfer antar dompet, saldo dompet benar |
| M4 | Anggaran dan dashboard | Anggaran per kategori, progres, grafik, laporan bulanan, ekspor CSV |
| M5 | PWA | Bisa diinstal, cache offline, antrean sinkronisasi input offline |
| M6 | Scan struk AI | Unggah foto, ekstraksi JSON, layar tinjau draf, input teks bebas |
| M7 | Poles dan rilis | Mode gelap, empty/error/loading state, audit aksesibilitas dan Lighthouse, README |

## 13. Panduan Kerja dengan OpenCode

**Berkas konteks:** simpan PRD ini sebagai `docs/PRD.md` dan buat `AGENTS.md` di akar repo berisi: stack, struktur folder, konvensi penamaan, perintah (`dev`, `build`, `lint`, `typecheck`, `test`), aturan uang (integer), dan aturan keamanan (setiap query wajib lewat helper berfilter `user_id`, tidak ada kunci API di klien).

**Pola prompt per milestone:**
1. "Baca `docs/PRD.md` dan `AGENTS.md`. Kerjakan **M{n}** saja. Buat rencana singkat dulu, jangan ubah di luar cakupan."
2. Setelah selesai: "Jalankan lint, typecheck, dan tes. Perbaiki sampai lolos, lalu ringkas perubahan."
3. Commit kecil per fitur dengan pesan jelas; satu cabang per milestone.

**Aturan main:**
- Satu milestone per sesi agar konteks tetap fokus.
- Minta tes untuk logika penting (perhitungan saldo, anggaran, transfer, isolasi data antar pengguna).
- Tinjau setiap migrasi database sebelum dijalankan.
- Jangan pernah menaruh rahasia (`DATABASE_URL`, `BETTER_AUTH_SECRET`, kunci Google OAuth, kunci API AI, kunci R2/Blob) di kode klien atau repositori; gunakan variabel lingkungan.

## 14. Kriteria Penerimaan MVP

- [ ] Pengguna dapat mendaftar, masuk, dan hanya melihat datanya sendiri.
- [ ] Dapat membuat ≥ 2 dompet, mencatat transaksi, dan saldo setiap dompet akurat.
- [ ] Transfer antar dompet tidak mengubah total pemasukan/pengeluaran.
- [ ] Anggaran per kategori menampilkan progres dan peringatan 80% / 100%.
- [ ] Dashboard dan laporan bulanan menampilkan angka yang cocok dengan daftar transaksi.
- [ ] Ekspor CSV berisi seluruh transaksi bulan terpilih.
- [ ] Scan struk menghasilkan draf yang bisa dikoreksi; tidak ada data tersimpan tanpa konfirmasi.
- [ ] Dapat diinstal sebagai PWA dan menampilkan data terakhir saat offline.
- [ ] Lighthouse mobile ≥ 90 untuk Performance dan PWA.

## 15. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Akurasi AI rendah pada struk buram atau tulisan tangan | Salah catat | Draf wajib konfirmasi, tampilkan tingkat keyakinan, input manual selalu tersedia |
| Biaya API AI membengkak | Biaya operasional | Kompres gambar, batasi scan per hari per pengguna, cache hasil |
| Kebocoran data keuangan | Kepercayaan hilang | Helper query berfilter `user_id` + tes isolasi, bucket privat dengan URL sementara, tanpa kunci rahasia di klien |
| Batas free tier Neon (penyimpanan kecil, cold start) | Query lambat atau gagal | Kompres foto dan simpan di object storage (bukan di DB), indeks tepat, pantau ukuran DB, siapkan rencana pindah/upgrade |
| Sinkronisasi offline konflik | Data ganda/hilang | ID klien unik (UUID), strategi "terakhir diubah menang", antrean idempoten |
| Cakupan melebar | Proyek molor | Patuhi bagian "Di Luar Cakupan"; fitur baru masuk backlog |

## 16. Pertanyaan Terbuka

- Nama aplikasi dan identitas visual?
- Penyimpanan struk: Cloudflare R2 atau Vercel Blob (cek limit gratis terbaru keduanya)?
- Penyedia model AI untuk scan struk dan batas biaya per pengguna?
- Apakah perlu mode "tanpa akun" (data lokal saja) untuk percobaan awal?
- Apakah laporan perlu ekspor PDF selain CSV di versi berikutnya?
