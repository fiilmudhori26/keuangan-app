# design.md: Sistem Desain Aplikasi Keuangan Pribadi

Versi 0.1 · Pelengkap `docs/PRD.md` · Platform: PWA mobile-first · Stack UI: Next.js, Tailwind CSS, shadcn/ui

Dokumen ini adalah satu-satunya sumber kebenaran untuk tampilan. OpenCode wajib memakai token di sini dan tidak boleh menambah warna, ukuran, atau radius di luar yang tercantum.

---

## 1. Arah Desain

**Karakter:** modern fintech, tegas, berorientasi data. Angka adalah tokoh utama; antarmuka di sekelilingnya tenang dan disiplin.

**Satu elemen yang diingat:** angka saldo total di dashboard, besar dan tegas, dengan garis tren bulan berjalan di bawahnya. Elemen lain sengaja dibuat sunyi agar angka ini menonjol.

**Prinsip:**
1. **Angka dulu.** Nominal selalu paling kontras dan paling mudah dipindai; label bersifat pendukung.
2. **Hierarki lewat ukuran dan berat huruf, bukan dekorasi.** Tanpa gradien dekoratif, tanpa bayangan tebal.
3. **Warna membawa makna.** Hijau = uang masuk dan aksi utama; merah = uang keluar atau melampaui anggaran; kuning = hampir melampaui. Warna tidak pernah menjadi satu-satunya penanda (selalu disertai tanda +/− atau ikon).
4. **Cepat dipakai satu tangan.** Aksi utama berada di jangkauan ibu jari; mencatat transaksi maksimal 10 detik.
5. **Hemat gerak.** Animasi adalah respons atas tindakan pengguna, kecuali tiga pengecualian yang disengaja di §9: saldo total menghitung naik sekali saat dashboard dimuat, baris transaksi muncul berurutan singkat saat daftar pertama tampil, dan kerangka memuat berdenyut lembut. Sisanya tidak bergerak tanpa sebab.

---

## 2. Token Warna

Semua warna dipakai lewat variabel CSS (bagian 10). Jangan menulis hex langsung di komponen.

### 2.1 Tema terang

| Token | Hex | Fungsi |
|---|---|---|
| `canvas` | `#F6F8F7` | Latar halaman |
| `surface` | `#FFFFFF` | Panel, sheet, input |
| `ink` | `#0E1A15` | Teks utama, nominal |
| `muted` | `#5B6B63` | Teks sekunder, label |
| `line` | `#DCE4E0` | Garis pemisah, border |
| `brand` | `#0B7A4B` | Aksi utama, tautan, uang masuk |
| `brand-soft` | `#E3F3EA` | Latar ikon, chip terpilih |
| `expense` | `#C8372D` | Uang keluar, galat, melampaui anggaran |
| `expense-soft` | `#FBE7E5` | Latar peringatan merah |
| `warn` | `#B7791F` | Isi bar/ikon anggaran ≥ 80% (bukan untuk teks) |
| `warn-text` | `#8F5A0A` | Teks peringatan kuning |
| `warn-soft` | `#FBF0D9` | Latar peringatan kuning |
| `on-brand` | `#FFFFFF` | Teks di atas `brand` |

### 2.2 Tema gelap

| Token | Hex | Fungsi |
|---|---|---|
| `canvas` | `#0C1210` | Latar halaman |
| `surface` | `#141C18` | Panel, sheet, input |
| `surface-raised` | `#1B2520` | Sheet/menu di atas panel |
| `ink` | `#E8F0EC` | Teks utama, nominal |
| `muted` | `#93A59B` | Teks sekunder, label |
| `line` | `#26332C` | Garis pemisah, border |
| `brand` | `#34C38A` | Aksi utama, uang masuk |
| `brand-soft` | `#12352A` | Latar ikon, chip terpilih |
| `expense` | `#F0716A` | Uang keluar, galat |
| `expense-soft` | `#3A1B19` | Latar peringatan merah |
| `warn` | `#E0A93B` | Isi bar/ikon anggaran ≥ 80% |
| `warn-text` | `#F0C66B` | Teks peringatan kuning |
| `warn-soft` | `#33280F` | Latar peringatan kuning |
| `on-brand` | `#06130D` | Teks di atas `brand` |

**Aturan penggunaan:**
- Hijau `brand` dipakai hemat: tombol utama, angka pemasukan, indikator aktif. Jangan mewarnai seluruh panel dengan hijau.
- Di tema gelap, kedalaman dibentuk oleh perbedaan nada permukaan, bukan bayangan.
- Pasangan teks/latar harus memenuhi kontras WCAG AA (4,5:1 untuk teks biasa). `warn` tidak boleh dipakai sebagai warna teks.

### 2.3 Palet grafik kategori (8 warna)

Dipakai berurutan untuk donat dan bar per kategori. Selalu sertakan label atau legenda, jangan mengandalkan warna saja.

| # | Terang | Gelap |
|---|---|---|
| 1 | `#0B7A4B` | `#34C38A` |
| 2 | `#2F6FDE` | `#6C9CF0` |
| 3 | `#C98A0B` | `#E0A93B` |
| 4 | `#7C5CD6` | `#A18AEA` |
| 5 | `#0E9AA7` | `#4CC3CE` |
| 6 | `#D6457A` | `#EE7FA3` |
| 7 | `#64748B` | `#94A3B8` |
| 8 | `#E0622D` | `#F08A5E` |

Kategori di atas 8 digabung ke "Lainnya".

---

## 3. Tipografi

**Keluarga huruf:** **Plus Jakarta Sans** (Google Fonts), satu keluarga untuk seluruh antarmuka. Bobot yang dimuat: 400, 500, 600, 700. Cadangan: `ui-sans-serif, system-ui, sans-serif`.

**Angka:** semua nominal memakai `font-variant-numeric: tabular-nums` agar kolom rata. Bila bobot yang dimuat tidak mendukung fitur ini, ganti keluarga khusus angka dengan Manrope (cek dukungan fitur sebelum memutuskan).

**Skala (mobile, basis 16 px):**

| Peran | Ukuran / tinggi baris | Bobot | Pemakaian |
|---|---|---|---|
| `display` | 40 / 44 | 700 | Saldo total di dashboard |
| `title-1` | 24 / 30 | 700 | Judul layar |
| `title-2` | 18 / 24 | 600 | Judul bagian, nominal ringkasan |
| `body` | 16 / 24 | 400 | Teks isi, nama transaksi |
| `body-strong` | 16 / 24 | 600 | Nominal pada daftar |
| `caption` | 13 / 18 | 500 | Tanggal, kategori, label |
| `micro` | 12 / 16 | 500 | Label navigasi bawah |

**Aturan:**
- Teks sentence case. Jangan memakai huruf kapital semua untuk label.
- Panjang baris di bawah 80 karakter.
- Label kecil tidak diletakkan di atas setiap judul; tambahkan hanya bila informasinya memang diperlukan.
- Ukuran teks minimal 12 px; hormati pengaturan ukuran teks sistem.

---

## 4. Tata Letak, Jarak, Bentuk

**Grid jarak (basis 4 px):** 4, 8, 12, 16, 20, 24, 32, 40. Margin halaman 16 px. Lebar konten maksimum 480 px di layar lebar (dipusatkan).

**Radius (bertingkat, bukan seragam):**

| Elemen | Radius |
|---|---|
| Input, tombol, chip | 10 px |
| Panel kecil (daftar, kartu anggaran) | 14 px |
| Panel utama (saldo) | 20 px |
| Bottom sheet (sudut atas) | 24 px |
| Avatar ikon kategori | bulat penuh |

**Permukaan:**
- Daftar transaksi **tidak dibungkus kartu per baris**; baris dipisahkan garis tipis `line`, sehingga data lebih padat dan mudah dipindai.
- Panel hanya dipakai untuk kelompok informasi utama (saldo, anggaran, grafik).
- Tema terang: pembeda permukaan memakai border 1 px `line`, tanpa bayangan. Tema gelap: pembeda memakai nada `surface` / `surface-raised`.
- Saat memuat, tampilkan **kerangka** (`.skeleton`) yang meniru tata letak akhir: latar `muted`, kilau tipis dari `foreground` 8%, radius mengikuti elemen aslinya. Jangan memakai spinner halaman penuh atau menggeser tata letak.

**Area sentuh:** minimal 44 × 44 px. Jarak antar target sentuh minimal 8 px.

**Safe area:** hormati `env(safe-area-inset-*)` untuk navigasi bawah dan sheet.

---

## 5. Wireframe Layar Utama

### 5.1 Dashboard

```
┌───────────────────────────────┐
│ November 2026  ▾        ◐  ⚙  │  header: pilih bulan, tema, pengaturan
│                               │
│ Saldo total                   │
│ Rp 12.450.000                 │  display 40, ink
│ ▁▂▃▃▄▅▅▆▆▇  +Rp 1,2 jt bln ini│  garis tren + selisih bulan ini
│                               │
│ ┌──────────┐ ┌──────────┐     │
│ │ Masuk    │ │ Keluar   │     │  dua ringkasan bulan ini
│ │ 5.200.000│ │ 3.980.000│     │  hijau / merah, tanda +/−
│ └──────────┘ └──────────┘     │
│                               │
│ Anggaran                  Lihat│
│ Makan      ████████░░ 82%     │  bar + persen
│ Transport  ███░░░░░░░ 31%     │
│                               │
│ Transaksi terbaru         Lihat│
│ Hari ini                      │
│ 🍜 Makan siang      −25.000   │  baris tanpa kartu
│ ───────────────────────────── │
│ Kemarin                       │
│ 💼 Gaji          +5.200.000   │
├───────────────────────────────┤
│ Beranda Transaksi (+) Anggaran Lainnya│  navigasi bawah, tombol tengah menonjol
└───────────────────────────────┘
```

Rata kiri untuk teks dan label; rata kanan untuk nominal.

### 5.2 Tambah transaksi (bottom sheet)

```
┌───────────────────────────────┐
│ ▬                             │  handle
│ [ Keluar ] [ Masuk ] [Transfer]│  segmented control
│                               │
│            Rp 0               │  nominal besar, fokus otomatis
│ ┌───────────────────────────┐ │
│ │ 1  2  3                   │ │  keypad numerik kustom
│ │ 4  5  6                   │ │
│ │ 7  8  9                   │ │
│ │ 000 0  ⌫                  │ │
│ └───────────────────────────┘ │
│ Kategori  [Makan ▾] Dompet [Tunai ▾]│
│ Tanggal   Hari ini   Catatan ...    │
│ [📷 Scan struk]                │
│ [        Simpan transaksi     ]│  tombol utama, lebar penuh
└───────────────────────────────┘
```

### 5.3 Tinjau hasil scan

```
┌───────────────────────────────┐
│ ←  Tinjau hasil scan          │
│ [foto struk, bisa dibuka]     │
│ Merchant   Indomaret          │
│ Total      Rp 87.500   ✎      │
│ Tanggal    12 Nov 2026 ✎      │
│ Kategori   Belanja  (saran AI)│
│ Dompet     [Tunai ▾]          │
│ ⚠ Periksa total sebelum disimpan│
│ [ Simpan transaksi ] [ Ulangi scan ]│
└───────────────────────────────┘
```

Hasil AI selalu berstatus draf; kolom yang diisi AI diberi penanda ikon kecil dan bisa diubah.

---

## 6. Komponen

### Tombol
| Varian | Tampilan | Pemakaian |
|---|---|---|
| Utama | Latar `brand`, teks `on-brand`, tinggi 48 | Satu per layar: "Simpan transaksi" |
| Sekunder | Border `line`, teks `ink`, latar transparan | Aksi pendamping |
| Teks | Tanpa latar, teks `brand` | Aksi ringan ("Lihat") |
| Bahaya | Teks/border `expense` | Hapus (selalu dengan konfirmasi) |

Status: *hover* (desktop) menaikkan kontras 1 tingkat; *pressed* mengecilkan skala ke 0,98; *disabled* opasitas 40%; *loading* menampilkan indikator dan mengunci tombol. Semua perubahan warna, skala, dan opasitas memakai transisi 150 ms `ease-out`; saat memuat, label dipertahankan dengan opasitas 80%.

### Input
Tinggi 48, radius 10, border `line`, latar `surface`. Fokus: cincin 2 px `brand`. Galat: border `expense` + pesan di bawah input. Label selalu terlihat (tidak hanya placeholder).

### Input nominal
Angka sangat besar (`display`), awalan "Rp" lebih kecil dan `muted`. Pemisah ribuan titik muncul saat mengetik. Hanya menerima bilangan bulat.

### Baris transaksi
Ikon kategori bulat (latar `brand-soft` atau warna kategori 15%), nama dan catatan di kiri (`body`, `caption`), nominal di kanan (`body-strong`). Pemasukan hijau dengan "+", pengeluaran `ink` dengan "−" (merah hanya untuk kondisi bermasalah agar layar tidak didominasi merah). Geser untuk ubah/hapus, dengan alternatif tombol menu untuk aksesibilitas. Saat daftar pertama tampil, baris muncul berurutan: `fade-up` 240 ms dengan jeda 30 ms per baris, dibatasi maksimal 8 baris pertama. Baris punya latar hover `muted` 40% di desktop.

### Bar anggaran
Tinggi 8, radius penuh, latar `line`. Isi: `brand` di bawah 80%, `warn` mulai 80%, `expense` mulai 100%. Selalu disertai persentase dan sisa nominal sebagai teks; saat 80% dan 100% tampilkan ikon peringatan. Isi bar terisi dari 0 ke persentase saat pertama tampil (420 ms `ease-out`); perubahan berikutnya memakai transisi lebar 200 ms.

### Chip dompet
Radius 10, ikon + nama + saldo kecil. Terpilih: latar `brand-soft`, border `brand`.

### Navigasi bawah
Lima slot: Beranda, Transaksi, Tambah (tombol bulat `brand`, ukuran 56, menonjol di tengah), Anggaran, Lainnya. Ikon 24 px dengan label `micro`. Slot aktif memakai `brand` dan bobot ikon lebih tebal, ditandai pil latar `brand-soft` di belakang ikon. Pil, warna teks, dan bobot ikon bertransisi 200 ms tanpa menggeser tata letak.

### Bottom sheet
Radius atas 24, handle 4 × 36, latar `surface-raised` (gelap) / `surface` (terang), peredup latar 40%. Dapat ditutup dengan geser ke bawah dan tombol tutup. Saat dibuka, peredup memudar 180 ms dan panel naik 24 px selama 260 ms `ease-out`; saat ditutup, keduanya berbalik dalam 240 ms sebelum panel dilepas. Fokus dipindah ke panel, ESC menutup, dan gulir halaman dikunci selama sheet terbuka.

### Grafik
- Donat: pengeluaran per kategori, total di tengah, legenda dengan nominal dan persen.
- Garis tren: satu seri, tanpa titik kecuali saat disentuh; sumbu minimal.
- Bar perbandingan bulan: dua batang per kategori (bulan ini vs lalu).
- Semua grafik punya ringkasan teks yang dapat dibaca pembaca layar.

### Toast dan dialog
Toast di atas navigasi bawah, hilang otomatis 4 detik, menyebut tindakan dengan kata yang sama seperti tombolnya ("Transaksi disimpan"). Toast masuk dengan geser 10 px + pudar (240 ms). Aksi yang tidak bisa dibatalkan memakai dialog konfirmasi; aksi lain menyediakan "Urungkan" pada toast. Dialog konfirmasi muncul dengan `pop-in` ringan (skala 0,96 → 1, 180 ms) di atas peredup yang memudar.

### Kerangka memuat
Gunakan komponen `.skeleton`: latar `muted`, radius mengikuti elemen aslinya, kilau horizontal tipis (`foreground` 8%) berulang 1,4 detik. Susun kerangka meniru layout akhir (judul, panel, baris) agar tidak ada pergeseran tata letak saat data tiba. Saat `prefers-reduced-motion`, kilau dimatikan dan kerangka tampil datar.

---

## 7. Format Data

- Mata uang: `Rp 25.000` (titik pemisah ribuan, tanpa desimal).
- Negatif memakai tanda minus sebenarnya: `−Rp 25.000`; pemasukan `+Rp 5.200.000`.
- Ringkas untuk ruang sempit: `Rp 1,2 jt`, `Rp 850 rb`, `Rp 2,4 M`.
- Tanggal: `12 Nov 2026`; relatif untuk 2 hari terakhir ("Hari ini", "Kemarin").
- Bulan: nama Indonesia lengkap (November 2026).
- Gunakan `Intl.NumberFormat('id-ID')` dan `Intl.DateTimeFormat('id-ID')`; simpan nominal sebagai bilangan bulat.

---

## 8. Bahasa dan Nada

Bahasa Indonesia sehari-hari yang sopan, kalimat aktif, sentence case, tanpa basa-basi.

**Kosakata baku (konsisten di seluruh aplikasi):** Transaksi, Dompet, Kategori, Anggaran, Laporan, Pemasukan, Pengeluaran, Transfer. Jangan berganti istilah antar layar.

| Situasi | Contoh |
|---|---|
| Tombol utama | "Simpan transaksi", "Tambah dompet" |
| Toast sukses | "Transaksi disimpan" |
| Galat form | "Nominal belum diisi. Masukkan angka lebih dari 0." |
| Galat jaringan | "Tidak ada koneksi. Transaksi disimpan di perangkat dan dikirim saat online." |
| Galat scan | "Struk belum terbaca. Foto ulang dengan cahaya lebih terang atau isi manual." |
| Peringatan anggaran | "Anggaran Makan terpakai 82%. Sisa Rp 180.000." |
| Kosong: transaksi | "Belum ada transaksi bulan ini. Catat pengeluaran pertamamu." + tombol "Tambah transaksi" |
| Kosong: dompet | "Tambahkan dompet untuk mulai mencatat." |
| Konfirmasi hapus | "Hapus transaksi ini? Saldo dompet akan dihitung ulang." |

Pesan galat menjelaskan apa yang terjadi dan cara memperbaikinya; tidak meminta maaf dan tidak samar.

---

## 9. Gerak dan Aksesibilitas

**Gerak:**
Durasi, kurva, dan jeda memakai token pada bagian 10: `--motion-fast` 120 ms, `--motion-base` 180 ms, `--motion-slow` 240 ms, `--motion-sheet` 260 ms, `--motion-bar` 420 ms, `--motion-count` 700 ms; easing `--ease-out`, `--ease-in-out`, `--ease-spring`; jeda bertahap `--stagger-step` 30 ms.

- **Respons tindakan pengguna:** tombol (150 ms), sheet buka/tutup, toast masuk, dialog konfirmasi, segmented control, chip kategori, dan perubahan nominal (120 ms).
- **Otomatis, hanya saat konten pertama tampil:** saldo total menghitung naik sekali (`--motion-count`), baris transaksi `fade-up` berurutan (maksimal 8 baris), isi bar anggaran terisi dari 0, dan garis tren saldo tergambar sekali. Tidak ada animasi masuk pada bagian halaman lain.
- **Saat menunggu data:** kilau `.skeleton`. Ini satu-satunya animasi yang berulang.
- Tidak ada animasi saat berpindah halaman atau menggulir.
- Hormati `prefers-reduced-motion`: durasi dipangkas, kilau kerangka dimatikan, hitungan saldo langsung menampilkan nilai akhir, dan transformasi tekan dinonaktifkan.

**Aksesibilitas:**
- Kontras minimal WCAG AA pada kedua tema.
- Fokus keyboard selalu terlihat (cincin 2 px `brand`, offset 2 px).
- Semua ikon fungsional punya label; ikon dekoratif disembunyikan dari pembaca layar.
- Pemasukan/pengeluaran dibedakan dengan tanda, bukan warna saja.
- Formulir memakai `label` yang terhubung, galat dengan `aria-describedby`.
- Perubahan nominal di layar transaksi diumumkan lewat `aria-live`; animasi angka bersifat visual dan tidak menggandakan pengumuman.
- Dukung zoom teks hingga 200% tanpa kehilangan fungsi.

---

## 10. Implementasi (Tailwind + shadcn/ui)

**Tema:** ikuti sistem lewat `prefers-color-scheme`, dengan kelas `.dark` sebagai override. Tambahkan pengaturan "Tema: Ikuti sistem / Terang / Gelap" di Pengaturan.

`app/globals.css` (nama variabel mengikuti konvensi shadcn/ui):

```css
:root {
  --background: #F6F8F7;
  --foreground: #0E1A15;
  --card: #FFFFFF;
  --card-foreground: #0E1A15;
  --popover: #FFFFFF;
  --popover-foreground: #0E1A15;
  --primary: #0B7A4B;
  --primary-foreground: #FFFFFF;
  --secondary: #E3F3EA;
  --secondary-foreground: #0B7A4B;
  --muted: #EEF2F0;
  --muted-foreground: #5B6B63;
  --accent: #E3F3EA;
  --accent-foreground: #0B7A4B;
  --destructive: #C8372D;
  --border: #DCE4E0;
  --input: #DCE4E0;
  --ring: #0B7A4B;
  --warn: #B7791F;
  --warn-text: #8F5A0A;
  --warn-soft: #FBF0D9;
  --expense-soft: #FBE7E5;
  --radius: 10px;
  /* gerak */
  --motion-fast: 120ms;
  --motion-base: 180ms;
  --motion-slow: 240ms;
  --motion-sheet: 260ms;
  --motion-bar: 420ms;
  --motion-count: 700ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.4, 0.64, 1);
  --stagger-step: 30ms;
}

.dark {
  --background: #0C1210;
  --foreground: #E8F0EC;
  --card: #141C18;
  --card-foreground: #E8F0EC;
  --popover: #1B2520;
  --popover-foreground: #E8F0EC;
  --primary: #34C38A;
  --primary-foreground: #06130D;
  --secondary: #12352A;
  --secondary-foreground: #34C38A;
  --muted: #1B2520;
  --muted-foreground: #93A59B;
  --accent: #12352A;
  --accent-foreground: #34C38A;
  --destructive: #F0716A;
  --border: #26332C;
  --input: #26332C;
  --ring: #34C38A;
  --warn: #E0A93B;
  --warn-text: #F0C66B;
  --warn-soft: #33280F;
  --expense-soft: #3A1B19;
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) { /* salin nilai .dark di sini */ }
}
```

**Tailwind:** petakan `warn`, `warn-text`, `warn-soft`, `expense-soft` ke variabel di atas pada `theme.extend.colors`; jangan memakai warna bawaan Tailwind di komponen.

**Font:** muat lewat `next/font/google` (Plus Jakarta Sans, bobot 400/500/600/700, `display: swap`), set pada `body`, dan aktifkan `tabular-nums` pada kelas utilitas `.num` yang dipakai di semua nominal.

**PWA:**
- `theme_color`: `#0B7A4B` (terang) dan `#0C1210` (gelap) lewat `<meta name="theme-color" media="(prefers-color-scheme: ...)">`.
- `background_color` manifest: `#F6F8F7`.
- Ikon: bentuk sederhana dan tegas (panah naik atau koin abstrak) putih di atas hijau `#0B7A4B`; sediakan ukuran 192, 512, dan versi *maskable* dengan zona aman 80%.
- Layar splash mengikuti warna latar dan ikon.

---

## 11. Panduan untuk OpenCode

1. Baca `docs/PRD.md` dan `docs/design.md` sebelum menyentuh UI.
2. Bangun token (bagian 10) dan layout dasar terlebih dahulu, baru komponen, lalu layar.
3. Pakai komponen shadcn/ui sebagai dasar lalu sesuaikan dengan token; jangan menambah pustaka UI lain.
4. Jangan menambah warna, ukuran huruf, radius, atau animasi di luar dokumen ini. Bila perlu hal baru, usulkan perubahan pada `design.md` lebih dulu.
5. Setiap layar harus dicek di lebar 360 px dan 430 px, pada tema terang dan gelap, serta dalam keadaan kosong, memuat, dan galat.
6. Daftar periksa sebelum menyelesaikan satu layar:
   - [ ] Semua warna berasal dari token
   - [ ] Nominal memakai `.num` dan format `id-ID`
   - [ ] Target sentuh ≥ 44 px
   - [ ] Fokus keyboard terlihat
   - [ ] Pemasukan/pengeluaran punya tanda selain warna
   - [ ] Kontras AA di kedua tema
   - [ ] `prefers-reduced-motion` dihormati
   - [ ] Keadaan memuat memakai kerangka yang meniru tata letak akhir
   - [ ] Teks UI mengikuti kosakata baku (bagian 8)

---

## 12. Pertanyaan Terbuka

- Nama aplikasi dan logo final (memengaruhi ikon PWA dan layar splash).
- Apakah ikon kategori memakai emoji (cepat, tanpa aset) atau set ikon garis seperti Lucide (lebih konsisten)? Rekomendasi awal: Lucide.
- Perlu mode tampilan "sembunyikan saldo" (privasi saat di tempat umum) di dashboard?
