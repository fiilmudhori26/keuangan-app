# design.md: Sistem Desain Aplikasi Keuangan Pribadi

Versi 0.3 · Pelengkap `docs/PRD.md` · Platform: PWA mobile-first · Stack UI: Next.js, Tailwind CSS, shadcn/ui

Dokumen ini adalah satu-satunya sumber kebenaran untuk tampilan. OpenCode wajib memakai token di sini dan tidak boleh menambah warna, ukuran, atau radius di luar yang tercantum.

---

## 1. Arah Desain

**Karakter (arah A — "premium tenang tapi mahal", Apple Card / Mercury):** tenang, disiplin, dan lapang; angka adalah tokoh utama yang dibungkus ruang napas lega dan permukaan penuh warna yang disengaja, bukan dekorasi. Panel saldo hero adalah bidang `brand` penuh dengan teks `on-brand` — satu-satunya panel berwarna penuh di aplikasi, seperti kartu fisik premium. Antarmuka sisanya tetap sunyi: garis tipis, tanpa bayangan, tanpa gradien.

**Satu elemen yang diingat:** angka saldo total di dashboard, besar dan tegas, dengan garis tren bulan berjalan di bawahnya. Elemen lain sengaja dibuat sunyi agar angka ini menonjol. Di sampingnya, **mark "K"** (lihat §6 "Logo dan identitas") menjadi jangkar identitas aplikasi di seluruh titik sentuh: ikon PWA, favicon, dan layar masuk.

**Prinsip:**
1. **Angka dulu.** Nominal selalu paling kontras dan paling mudah dipindai; label bersifat pendukung.
2. **Hierarki lewat ukuran dan berat huruf, bukan dekorasi.** Tanpa gradien dekoratif, tanpa bayangan tebal.
3. **Warna membawa makna.** Hijau = uang masuk dan aksi utama; merah = uang keluar atau melampaui anggaran; kuning = hampir melampaui. Warna tidak pernah menjadi satu-satunya penanda (selalu disertai tanda +/− atau ikon).
4. **Cepat dipakai satu tangan.** Aksi utama berada di jangkauan ibu jari; mencatat transaksi maksimal 10 detik.
5. **Hemat gerak.** Animasi adalah respons atas tindakan pengguna, kecuali tiga pengecualian yang disengaja di §9: saldo total menghitung naik sekali saat dashboard dimuat, baris transaksi muncul berurutan singkat saat daftar pertama tampil, dan kerangka memuat berdenyut lembut. Sisanya tidak bergerak tanpa sebab.
6. **Identitas lewat mark.** Mark "K" putih tebal di atas rounded-square `brand` dipakai konsisten di ikon PWA, favicon, layar masuk, dan (opsional) header. Mark tidak pernah diberi gradien, bayangan, atau warna lain.

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
| `expense-text` | `#B33226` | Teks merah di atas `expense-soft` (kontras AA, ≈ 5,2:1) |
| `warn` | `#B7791F` | Isi bar/ikon anggaran ≥ 80% (bukan untuk teks) |
| `warn-text` | `#8F5A0A` | Teks peringatan kuning |
| `warn-soft` | `#FBF0D9` | Latar peringatan kuning |
| `on-brand` | `#FFFFFF` | Teks di atas `brand` |
| `overlay` | `ink` 40% | Peredup latar di belakang sheet/dialog |

### 2.2 Tema gelap

| Token | Hex | Fungsi |
|---|---|---|
| `canvas` | `#0C1210` | Latar halaman |
| `surface` | `#141C18` | Panel, sheet, input |
| `surface-raised` | `#1B2520` | Sheet/menu di atas panel |
| `ink` | `#E8F0EC` | Teks utama, nominal |
| `muted` | `#A8B9AE` | Teks sekunder, label |
| `line` | `#2E3E35` | Garis pemisah, border |
| `brand` | `#34C38A` | Aksi utama, uang masuk |
| `brand-soft` | `#12352A` | Latar ikon, chip terpilih |
| `expense` | `#F0716A` | Uang keluar, galat |
| `expense-soft` | `#3A1B19` | Latar peringatan merah |
| `expense-text` | `#F0716A` | Teks merah di atas `expense-soft` (kontras AA, ≈ 5,4:1) |
| `warn` | `#E0A93B` | Isi bar/ikon anggaran ≥ 80% |
| `warn-text` | `#F0C66B` | Teks peringatan kuning |
| `warn-soft` | `#33280F` | Latar peringatan kuning |
| `on-brand` | `#06130D` | Teks di atas `brand` |
| `overlay` | hitam 60% | Peredup latar di belakang sheet/dialog |

**Aturan penggunaan:**
- Hijau `brand` dipakai hemat: tombol utama, angka pemasukan, indikator aktif. Jangan mewarnai seluruh panel dengan hijau.
- Di tema gelap, `line` (`#2E3E35`) dan `muted` (`#A8B9AE`) diangkat dibanding versi awal agar border tetap terbaca di atas `canvas` dan teks sekunder menjaga kontras WCAG AA.
- Di tema gelap, kedalaman dibentuk oleh perbedaan nada permukaan, bukan bayangan.
- `overlay` adalah peredup di belakang sheet/dialog: terang `color-mix(in oklab, #0E1A15 40%, transparent)`, gelap `color-mix(in oklab, #000000 60%, transparent)`. Jangan memakai warna hitam/putih transparan langsung.
- Pasangan teks/latar harus memenuhi kontras WCAG AA (4,5:1 untuk teks biasa). `warn` tidak boleh dipakai sebagai warna teks.
- `on-brand` di atas `brand` adalah satu-satunya pasangan teks/latar berwarna penuh yang dipakai (panel saldo hero dan slot navigasi aktif). Elemen transparan di atas panel hero memakai latar gelap/terang transparan yang menjaga AA — lihat §6 "Panel saldo".

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

**Keluarga huruf:** **Inter Tight** (next/font/google, bobot 400/500/600/700, `display: swap`, variable `--font-inter`), satu keluarga untuk seluruh antarmuka. Cadangan: `ui-sans-serif, system-ui, sans-serif`. Font dimuat lewat `next/font/google` pada `app/layout.tsx` dan diekspos ke CSS lewat variable `--font-inter`; `--font-sans` memetakan ke `var(--font-inter)` (§10).

**Angka:** semua nominal memakai `font-variant-numeric: tabular-nums` agar kolom rata (kelas `.num`). Bila bobot yang dimuat tidak mendukung fitur ini, ganti keluarga khusus angka dengan Manrope (cek dukungan fitur sebelum memutuskan).

**Tracking:** Judul (title-1) dan angka display memakai tracking −0.02em; judul bagian (title-2) tanpa tracking. Nominal tetap `tabular-nums`.

**Skala (mobile, basis 16 px):**

| Peran | Ukuran / tinggi baris | Bobot | Pemakaian |
|---|---|---|---|
| `display` | 40 / 44 | 700 | Nominal numpad (lihat §10) |
| `display-lg` | 44 / 48 | 700 | Saldo total di dashboard (hero, lihat §6 "Panel saldo") |
| `title-1` | 24 / 30 | 700 | Judul layar |
| `title-2` | 18 / 24 | 600 | Judul bagian, nominal ringkasan |
| `body` | 16 / 24 | 400 | Teks isi, nama transaksi |
| `body-strong` | 16 / 24 | 600 | Nominal pada daftar |
| `body-sm` | 15 / 22 | 400 | Teks pendukung, pesan toast |
| `label` | 14 / 20 | 600 | Tombol kecil, chip (termasuk chip cepat nominal), kendali bantu |
| `caption` | 13 / 18 | 500 | Tanggal, kategori, label |
| `micro` | 12 / 16 | 500 | Label navigasi bawah |

**Aturan:**
- Teks sentence case. Jangan memakai huruf kapital semua untuk label.
- Judul (title-1) dan angka display memakai tracking −0.02em; judul bagian (title-2) tanpa tracking. Nominal tetap `tabular-nums`.
- Panjang baris di bawah 80 karakter.
- Label kecil tidak diletakkan di atas setiap judul; tambahkan hanya bila informasinya memang diperlukan.
- Ukuran teks minimal 12 px; hormati pengaturan ukuran teks sistem.

---

## 4. Tata Letak, Jarak, Bentuk

**Grid jarak (basis 4 px):** 4, 8, 12, 16, 20, 24, 32, 40. Margin halaman 16 px. Lebar konten maksimum 480 px di layar lebar (dipusatkan).

**Jarak antar bagian:** di layar ringkasan padat (dashboard, laporan), jarak antar section memakai 24 px (`space-y-6`). Di layar formulir dan pengaturan boleh 16–20 px (`space-y-4`/`space-y-5`). Panel hero saldo memakai padding 24 px (`p-6`).

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
│ Keuangan                 ◐ ⚙  │  wordmark brand 13px 600 di atas sapaan; ikon tema & pengaturan
│ (A) Halo, Akbar          (+)  │  avatar inisial 36–40px, "Halo" title-2 18/24 600, tombol catat
│ Jumat, 14 November ▾          │  tanggal caption muted + pemilih bulan di baris berikutnya
│                               │
│ Saldo total [+Rp 1,2 jt]  (A) │  PANEL BRAND PENUH: chip on-brand transparan, avatar 64px kanan atas
│ Rp 12.450.000                 │  display-lg 44, on-brand
│ ▁▂▃▃▄▅▅▆▆▇                    │  garis tren bulan berjalan, stroke on-brand
│                               │
│ Cash flow bulan ini   +Rp 1,2 jt│  label + selisih net (brand/destructive, compact)
│ ┌──────────────────┬──────────┐│
│ │ Masuk  57%       │ Kel 43%  ││  STRIP penuh lebar, dua segmen proporsional
│ │ Rp 5.200.000     │ Rp 3,98jt││  min 34% per segmen; dua tautan terfilter
│ └──────────────────┴──────────┘│
│                               │
│ Target tabungan           Lihat│  HANYA bila ada ≥1 goal; tautan ke /goals
│ 🐷 Dana darurat     42%       │  goal progres tertinggi <100% (semua tercapai → terakhir)
│ ████████░░░░░░░░░░░░          │  bar primary, ikon goal 40 px (gold hanya bila tercapai)
│ Sisa Rp 5,8 jt dari target Rp 10 jt · 42%│
│                               │
│ Pengeluaran bulan ini          │  panel donut mini; hanya tampil bila ada pengeluaran
│ ◉ Makan 34%   Belanja 18%      │  donut 96 px + legend 5 teratas, persen saja + label
│   Transport 22%  …             │  tanpa nominal; ringkasan sr-only
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

### Logo dan identitas
Mark: huruf "K" putih tebal (bobot 700) di atas rounded-square `brand` (`#0B7A4B`), radius ±22% dari sisi. Wordmark: "Keuangan" memakai Inter Tight 700, tracking −0.02em, warna `ink`. Mark dipakai untuk favicon dan ikon PWA (192, 512, dan *maskable* dengan zona aman 80%; versi maskable dan apple-touch-icon penuh tanpa radius karena platform yang memberi masker). Komponen `components/brand/logo.tsx` (prop `size` dalam px, `showWordmark`, `animate?: boolean`) merender mark sebagai SVG inline; tidak ada aset raster yang dibundel ke komponen. Mark tidak diberi gradien, bayangan, atau warna lain. Mark dianimasikan hanya lewat prop `animate` (lihat §9 "stroke-draw") — dipakai pada mark hero di layar masuk/daftar saja (72 px); tidak dipakai pada nav atau render berulang. Tanpa `animate`, mark tampil langsung jadi.

### Panel saldo (hero dashboard)
Panel **penuh `brand`** (`primary`: terang `#0B7A4B`, gelap `#34C38A`), radius 20, padding 24 px (`p-6`), tanpa border (`border-transparent`). Seluruh teks dan ikon di dalam panel memakai `on-brand`, kecuali tooltip grafik yang memakai permukaan popover (terang `#FFFFFF`, gelap `#1B2520`) - kontras ≥ 4,5:1 di kedua tema (5,39:1 terang; 8,42:1 gelap). Panel ini satu-satunya bidang berwarna penuh di aplikasi; sisa antarmuka tetap sunyi. **Avatar inisial** melayang di pojok kanan atas panel: lingkaran 64 px (`size-16`) `absolute` (`top-6 right-6`), latar transparan di atas panel (kelas `.hero-scrim`, lihat di bawah), inisial pertama (bobot 700, 24 px, `on-brand`), `aria-hidden` (nama sudah terbaca dari sapaan di header). Baris label/chip diberi ruang `pr-20` agar tidak tumpang tindih dengan avatar pada 360 px; angka dan grafik memakai lebar penuh. Isi dari atas ke bawah:
1. Baris label: "Saldo total" (`caption` 13/18, bobot 500, `on-brand` penuh) di kiri; **chip selisih** di kanan baris (sebelum ruang avatar): chip radius 10, teks `label` 14/20 600, latar transparan di atas panel — terang `#0E1A15` 16% (gelap transparan), gelap `on-brand` (`#06130D`) 15% (kelas `.hero-scrim`). Teks chip selalu `on-brand` penuh dengan tanda `+`/`−` dan ikon panah kecil (mis. `+Rp 1,2 jt`), tidak mengandalkan warna saja; tanpa akhiran teks agar muat di layar 360 px — makna ("selisih bulan ini dibanding bulan lalu") dijelaskan lewat `role="img"` + `aria-label` pada chip. *(Catatan AA: `on-brand` putih 15% di atas `#0B7A4B` hanya ≈ 4,05:1 untuk teks 14 px — di bawah ambang 4,5:1 — sehingga tema terang memakai tinta gelap 16% ≈ 5,5:1; arah warna chip (gelap transparan di atas panel) tetap sesuai maksud awal.)*
2. Angka saldo: `display-lg` 44/48, bobot 700, tracking −0.02em, tabular-nums, `on-brand`.
3. Garis tren bulan berjalan di bawahnya (lihat "Grafik"): stroke `on-brand` (bukan `brand`, agar terbaca di atas panel); teks keadaan kosong juga `on-brand` penuh.
Angka hero lebih besar dari `display` numpad; seluruh pemakaian hero memakai kelas langsung `text-[44px] leading-[48px]` (tidak ada kelas `.display-lg` khusus).

### Strip Cash flow (dashboard)
Satu strip penuh lebar menggantikan dua kartu Masuk/Keluar; bukan dua kotak terpisah. Panel `surface` radius hero (`rounded-hero`, 20 px) dengan border `line`, padding 16 px. Isi dari atas ke bawah:
1. **Baris label:** kiri — "Cash flow bulan ini" (`caption` 13/18, bobot 500, `muted`); kanan — **selisih bersih** bulan ini (`totals.net`) dengan tanda `+`/`−`, `formatCompact` (mis. `+Rp 1,2 jt`), `num`, bobot 600, warna `brand` bila ≥ 0 dan `destructive` bila < 0, dibungkus `MaskedAmount`. Makna angka (pemasukan dikurangi pengeluaran) dijelaskan lewat teks baris kiri; tidak ada chip tambahan.
2. **Strip:** flex penuh lebar, tinggi 64 px (`h-16`), radius 10 px, `overflow-hidden`, dua segmen berdampingan dengan celah 2 px tipis (warna panel, seperti kartu kredit). Segmen kiri berlatar `primary` (uang masuk), segmen kanan berlatar `destructive` (uang keluar). Lebar tiap segmen proporsional terhadap jumlah: `bagian / (masuk + keluar) × 100 %`, dengan **lebar minimum 34 %** per segmen (agar area sentuh memadai); total 0 → 50/50. Teks di atas setiap segmen memakai `on-brand` (terang putih di atas `destructive #C8372D` ≈ 5,0:1; gelap `#06130D` di atas `destructive #F0716A` ≈ 6,4:1).
   - Tiap segmen berisi dua baris: baris 1 — label ("Masuk"/"Keluar", `micro` 12/16 bobot 500, `on-brand` penuh) di kiri dan **persen** bagian terhadap total (`num`) di kanan baris yang sama; baris 2 — nominal (`caption` 13/18 bobot 600, `num`, `truncate`).
   - **Masing-masing segmen adalah tautan** ke daftar transaksi terfilter: kiri → `/transactions?type=income`, kanan → `/transactions?type=expense`. Fokus keyboard terlihat (cincin 2 px `on-brand` inset, `z-index` teratas); `aria-label` menyebut arah saja (tanpa nominal, agar tidak membocorkan angka saat mode "Sembunyikan saldo"), mis. "Masuk — lihat transaksi pemasukan". Tidak ada kontrol lain di dalam strip.
   - Nilai besar tidak boleh meluber: `text-[13px]` + `tabular-nums` + `truncate`; pada layar sempit nominal boleh terpotong dengan ellipsis.
3. Segmen terisi dari 0 ke lebar akhir saat pertama tampil (`bar-fill`, strip memakai `--motion-bar` 420 ms `ease-out`, pola yang sama dengan bar anggaran); perubahan berikutnya (pindah bulan) memakai transisi `width` 420 ms (`--motion-bar`). Dimatikan pada `prefers-reduced-motion`.
Selisih vs bulan lalu tidak lagi ditampilkan di sini (persen vs bulan lalu digantikan persen bagian terhadap total); perbandingan vs bulan lalu tetap tersedia sebagai chip selisih di panel saldo. Baris nominal strip ikut mode sembunyikan saldo ("Sembunyikan saldo").

### Pengeluaran bulan ini (donut mini, dashboard)
Panel ringkas tepat setelah strip Cash flow, sebelum Anggaran; **hanya tampil bila ada pengeluaran bulan ini** (total keluar > 0), jika nol panel disembunyikan. Isi: `SectionHeader` "Pengeluaran bulan ini" + panel `surface` berisi `CategoryDonut` varian `compact` (prop `compact?: boolean` di `components/charts/category-charts.tsx`): donut 96 px (`h-24 w-24`) dengan total di tengah dihilangkan, legend **5 kategori teratas** berupa titik warna + label + **persentase saja** (tanpa nominal). Warna irisan memakai `CHART_COLORS` (atau warna kategori bila ada). Ringkasan `sr-only` menyebut nominal per kategori untuk pembaca layar. Data dihitung dari `spendingByCategory(monthTransactions)` (sama dengan sumber Laporan), diurutkan menurun. Panel tidak memuat tautan atau kontrol lain; nominal tidak disamarkan oleh mode privasi (ikut aturan "grafik tidak disamarkan").

### Header dashboard
Susunan dari atas ke bawah di kolom sapaan: **wordmark "Keuangan"** (`caption` 13/18, bobot 600, warna `brand`/`primary`, sentence case) di atas **"Halo, \<nama\>"** (`title-2` 18/24, bobot 600, `ink`, tanpa tracking) di atas tanggal hari ini dalam Bahasa Indonesia (`caption` 13/18, bobot 500, `muted`), format `Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })` — mis. "Jumat, 14 November". Di samping kiri kolom teks tampil **avatar inisial** 36–40 px: lingkaran `brand-soft` berisi inisial pertama nama (`label`/`body-strong`, warna `brand`), `aria-hidden` (nama sudah terbaca dari teks sapaan). Pemilih bulan tampil di baris berikutnya di bawah tanggal. Header ini tidak memakai animasi stroke-draw (itu khusus mark hero masuk/daftar saja).

### Sembunyikan saldo (privasi)
Mode privasi untuk dashboard; berguna saat layar terlihat orang lain. Preferensi disimpan **hanya di client** pada localStorage key `keuangan-hide-balance` (default tampil; `1` = disembunyikan); tidak disimpan di server, database, atau profil. Dua titik kendali yang sinkron (lewat event `storage` dan event khusus `keuangan-hide-balance-change`):
1. Tombol ikon **mata / mata-off** (`Eye`/`EyeOff`) di header dashboard, target sentuh 44 px, `aria-pressed` dan `aria-label` yang menyebut state ("Sembunyikan saldo" / "Tampilkan saldo").
2. Sakelar "Tampilkan saldo" di Pengaturan ▸ Preferensi (on = saldo tampil, default).

Saat tersembunyi, nominal di dashboard dan `/goals` dirender `Rp •••••`: saldo total (hero), nominal Masuk dan Keluar pada strip Cash flow, baris nominal pada anggaran (spent/limit), serta nominal target, terkumpul, dan sisa pada Target tabungan (kartu `/goals` dan kartu mini dashboard). Teks disamarkan, bukan dihapus dari tata letak (tidak ada layout shift), dan diberi `role="img"` + `aria-label="Nominal disembunyikan"`. Daftar transaksi terbaru, chip selisih, dan grafik tidak disamarkan. Tidak ada animasi baru; pergantian langsung.

### Keadaan kosong (Empty state)
Komponen terpusat `components/ui/empty-state.tsx`. Struktur: panel `surface` radius 14, border `line`; ikon besar (32 px) di dalam lingkaran `brand-soft` (64 px), warna ikon `brand`; kalimat `body` `muted-foreground` (maks ±32 ch, di tengah); CTA `Button` variant `primary` (size `auto`) atau tautan bergaya tombol utama. Dipakai di lima layar: belum ada transaksi, belum ada dompet, belum ada anggaran, belum ada laporan, belum ada target tabungan. Salinan mengikuti kosakata baku §8.

### Layar masuk dan daftar
Mobile-first 360–430 px, kedua tema. Susunan dari atas: mark besar (72 px) → wordmark "Keuangan" (`title-1` 24/30, Inter Tight 700, tracking −0.02em) → tagline "Catat uangmu dalam hitungan detik" (`body-sm`, muted), semuanya rata tengah. Di bawahnya, formulir dibungkus panel rapi (`surface`, border `line`, radius 14, padding 20–24 px) — bukan maket kosong tanpa bingkai. Aksi kirim memakai tombol utama lebar penuh di dalam panel; tautan ganti mode (Masuk ↔ Daftar) di bawah panel. Fokus keyboard tetap terlihat; target sentuh ≥ 44 px.

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
Angka sangat besar (`display`), awalan "Rp" lebih kecil dan `muted`. Pemisah ribuan titik muncul saat mengetik. Hanya menerima bilangan bulat; nominal dibatasi `MAX_AMOUNT` (Rp 999.999.999.999) — input dipotong di batas. Keypad 3×4 ("1"–"9", "000", "0", ⌫) di bawahnya. Di antara tampilan nominal dan keypad tersedia **chip cepat** satu baris empat kolom: "+10 rb", "+25 rb", "+50 rb", "+100 rb". Menekan chip **menambahkan** kelipatan itu ke nominal berjalan (mis. 50.000 + "+25 rb" = 75.000); pada nominal 0 chip mengisi langsung (mis. 25.000). Hasil penjumlahan ikut dibatasi `MAX_AMOUNT`. Chip memakai peran `label` (14/20), tinggi 44 px (`h-11`), radius 10 px (`rounded-btn`), border `line`, tanpa latar isi; target sentuh ≥ 44 px dengan jarak `gap-2`.

### Date picker (bottom sheet kalender)
Pengganti `<input type="date">` pada form transaksi dan draf scan; komponen `components/ui/date-picker-sheet.tsx` membungkus `Sheet` yang sudah ada. Isi dari atas ke bawah: baris navigasi — tombol ikon ‹ (`aria-label` "Bulan sebelumnya"), label bulan Indonesia lengkap + tahun (format id-ID, mis. "November 2026"), tombol ikon › (`aria-label` "Bulan berikutnya", dinonaktifkan saat menampilkan bulan berjalan — tanggal masa depan tidak dipilih); grid kalender Senin–Minggu dengan nama hari "Sen Sel Rab Kam Jum Sab Min"; tombol teks "Hari ini" (`aria-label` "Hari ini") yang melompat ke hari ini. Hari terpilih ditandai latar `brand` dengan teks `on-brand` bobot 600 dan `aria-pressed="true"`; hari ini yang belum terpilih diberi cincin border `brand`; hari di atas `max` (bawaan hari ini) nonaktif: opasitas 40%, tidak dapat difokuskan. Struktur ARIA `grid`/`row`/`gridcell`; tombol hari memakai `aria-label` tanggal lengkap id-ID dan dapat dinavigasi dengan tombol panah (kiri/kanan ±1 hari, atas/bawah ±7 hari). Saat terbuka fokus mendarat di sel tanggal 1; `Esc` menutup picker saja (sheet induk tetap terbuka) dan fokus kembali ke pemicu. Pemicu berupa tombol bergaya field (label "Tanggal" terlihat di atas, bukan placeholder): tinggi 48 px, radius 10 px, border `input`, latar `surface`, ikon kalender `muted`, teks `formatDateKey` id-ID ("12 Nov 2026"), target sentuh ≥ 44 px, `aria-haspopup="dialog"`. Animasi: konten grid memakai `.animate-fade-up-fast` hanya saat terbuka dan mati total pada `prefers-reduced-motion` (konsisten dengan pola repo).

### Ikon kategori (solid)
Kategori tampil sebagai **lingkaran solid berwarna kategori** dengan ikon Lucide **putih/gelap** di tengahnya — terasa seperti ikon aplikasi nyata, bukan Lucide outline di atas latar lembut. Komponen terpusat `components/ui/category-icon.tsx`: `CategoryIcon({ category, size })` — `size` = diameter lingkaran dalam px (default 40); ikon di dalamnya berukuran ±50% dari `size`, dirender `<Icon fill="currentColor" strokeWidth={1.5} aria-hidden />` (filled solid). Lingkaran: `rounded-full`, latar `category.color` penuh, tanpa border. Nama ikon diambil dari `category.icon` (string) lewat peta statis (`Utensils`, `Bus`, `ShoppingBag`, `ReceiptText`, `HeartPulse`, `Gamepad2`, `GraduationCap`, `Briefcase`, `Shapes`); nama tak dikenal / kategori tanpa ikon memakai fallback `Shapes`.

Warna ikon di atas lingkaran dipilih per kategori dengan helper `contrastOn(color): "#FFFFFF" | "#262012"` di `lib/utils.ts` (luminance relatif WCAG dari hex 3/6/8 digit; ambang **lum > 0,6 → teks gelap `#262012`**, selain itu putih). Kedelapan warna palet §2.3 berada di bawah ambang (selalu putih); ambang ini melindungi warna terang pilihan pengguna (mis. pastel kuning). Bila warna bukan hex valid, fallback putih. Ikon selalu `aria-hidden` — nama kategori terbaca dari teks di sebelahnya. Jangan menulis hex warna ikon langsung di komponen; selalu lewat `contrastOn`.

Dipakai di: baris transaksi (`transaction-list.tsx`, `size-10`) dan chip kategori pada form tambah/ubah transaksi (`transaction-sheet.tsx`, lingkaran 20 px menggantikan titik warna). Baris transfer (tanpa kategori) memakai lingkaran netral `muted` 15% berisi ikon `ArrowLeftRight` warna `muted-foreground` — transfer tidak diberi warna kategori. Ikon dompet (`wallet-manager.tsx`) **tidak** berubah; ikon grafik & donat tetap memakai titik warna / irisan warna seperti sebelumnya.

### Baris transaksi
Ikon kategori solid `size-10` (40 px; lihat "Ikon kategori (solid)"), nama dan catatan di kiri (`body`, `caption`), nominal di kanan (`body-strong`). Pemasukan `brand` dengan "+", pengeluaran `destructive` dengan "-" - daftar transaksi boleh memakai merah untuk pengeluaran karena tandanya eksplisit; transfer tetap `muted-foreground` dengan "↔".

**Geser untuk aksi (swipe):** baris mendukung geser horizontal dengan pointer events (`onPointerDown/Move/Up` + `setPointerCapture`, `touch-action: pan-y` agar gulir vertikal tidak terganggu). Threshold **72 px**:
- Geser ke **kiri** → aksi **Hapus**: ikon `Trash2` + teks warna `danger`/`destructive`, latar aksi `expense-soft` saat melewati threshold (di bawah threshold latar `muted`).
- Geser ke **kanan** → aksi **Ubah**: ikon `Pencil` + teks warna `primary`, latar aksi `secondary` saat melewati threshold.
- **Transfer:** hanya geser kiri ("Hapus transfer"); geser kanan diabaikan - transfer tidak dapat diubah.
- Latar aksi ("haptic-like") muncul saat ambang 72 px terlewati, sebagai umpan balik sebelum aksi dilepas.
- Pelepasan di atas threshold menjalankan aksi: Hapus → dialog konfirmasi (alur yang sama dengan menu); Ubah → membuka sheet ubah. Di bawah threshold baris kembali ke posisi semula.
- **Aksesibilitas:** tombol menu "Aksi untuk transaksi…" (ikon `MoreHorizontal`) selalu tersedia pada setiap baris dan tidak dihapus; aksi geser bersifat tambahan dan dekoratif (lapisan aksi `aria-hidden`).
- **Reduced motion:** bila `prefers-reduced-motion: reduce`, transisi geser (transform & warna latar aksi) dimatikan; baris berpindah langsung. State geser direset saat baris unmount atau tipe transaksi berubah.
- Saat daftar pertama tampil, baris muncul berurutan: `fade-up` 240 ms dengan jeda 30 ms per baris, dibatasi maksimal 8 baris pertama. Baris punya latar hover `muted` 40% di desktop.

### Bar anggaran
Tinggi 8, radius penuh, latar `line`. Isi: `brand` di bawah 80%, `warn` mulai 80%, `expense` mulai 100%. Selalu disertai persentase dan sisa nominal sebagai teks; saat 80% dan 100% tampilkan ikon peringatan. Isi bar terisi dari 0 ke persentase saat pertama tampil (420 ms `ease-out`); perubahan berikutnya memakai transisi lebar 200 ms.

### Target tabungan
Halaman `/goals` (entri lewat Pengaturan ▸ Manajemen → "Target tabungan", ikon `PiggyBank`; slot navigasi bawah tidak bertambah) dan kartu mini di dashboard. Kosakata: **Target tabungan**, **Setor**, **Tarik**, **Tercapai**.

**Halaman /goals** — satu kolom, `SectionHeader`-less header halaman: judul "Target tabungan" (`title-1` 24/30, 700, tracking −0.02em) + subjudul 13 px `muted` "Kumpulkan dana untuk tujuanmu, satu setoran tiap kali." Tombol utama lebar penuh "Tambah target" (ikon `Plus`) membuka sheet; di bawahnya daftar **kartu penuh lebar** (`Panel` radius 14, padding 16):
- Baris isi: **ikon goal** 48 px lingkaran solid warna goal (`goal.color`, ikon Lucide di dalamnya memakai `contrastOn`, pola sama dengan ikon kategori), lalu kolom tengah — nama (`body-strong` 16/600, `truncate`) di atas "Terkumpul **Rp X** dari **Rp Y**" (`caption`, nominal `.num`, disembunyikan mode privasi), tombol menu `MoreHorizontal` 44 px di kanan (menu kecil: hanya "Hapus", ikon `Trash2`, teks `expense`, membuka `ConfirmDialog`; "Ubah" tidak tersedia).
- Di bawahnya **persen besar** (`display`-kecil: 28 px/32, bobot 700, `.num`, tracking −0.02em); bila target tercapai 100% tampil **chip "Tercapai"** di kanan (latar `gold-soft`, teks `gold-text`, ikon `Check` 14 px).
- **Progress bar** tinggi 8, radius penuh, latar `line`: isi `brand` (`primary`) selama belum tercapai, **`gold`** saat tercapai. `warn` tidak dipakai di sini (khusus anggaran). Bar terisi dengan animasi `bar-fill` 420 ms `ease-out`.
- Baris bawah: kiri — "Sisa **Rp X**" (`caption`, nominal `.num`, disembunyikan mode privasi; bila tercapai: teks `gold-text` "Target tercapai. Mantap!"); kanan — tombol **"Setor"** (`variant="secondary"`, size `sm`).
- Bila ada target tercapai, tampil ringkasan `caption` `muted` di atas daftar: "N dari M target tercapai."
- **Keadaan kosong:** `EmptyState` ikon `PiggyBank`, salinan "Buat target tabungan pertamamu. Sisihkan dana sedikit demi sedikit sampai tercapai.", CTA "Buat target tabungan" (membuka sheet yang sama).

**Sheet "Tambah target"** (komponen `Sheet`): isian — **Nama target** (`Input`, maks 60 karakter), **Target (Rp)** (input numerik dengan pemisah ribuan, dibatasi `MAX_AMOUNT`), **Ikon** (`Select`: Target / PiggyBank / TrendingUp / Home / GraduationCap, nilai tersimpan = nama ikon), warna bawaan `#0B7A4B` (tidak ada pemilih warna di UI). CTA lebar penuh "Simpan target"; galat tampil `role="alert"` di dalam sheet; setelah simpan, toast "Target tabungan dibuat" + `router.refresh()`.

**Sheet "Setor"** (per kartu): nominal (`Input` numerik + **chip cepat "+1 jt" / "+500 rb"** yang menambahkan ke nominal berjalan, tinggi 44, border `line`), baris dua kolom — **Tanggal** (tombol bergaya field, bawaan hari ini, `DatePickerSheet`, maks hari ini) dan **Catatan** (`Input`, maks 200, opsional). Di bawah form tersedia **toggle kecil "Tarik dana dari target"** (ikon `Minus`, tinggi 44) yang mengubah sheet menjadi mode penarikan (judul "Tarik dari …", CTA "Tarik dana", amount tersimpan negatif, chip cepat disembunyikan); menekan lagi kembali ke mode setor. CTA "Simpan setoran". Toast "Setoran tercatat" / "Penarikan tercatat".

**Kartu mini dashboard** (antara strip Cash flow dan Anggaran; **hanya tampil bila ada ≥ 1 goal**): `SectionHeader` "Target tabungan" + tautan "Lihat" → `/goals`; panel berisi ikon goal 40 px, nama (15/600, `truncate`), bar `primary` (**`gold` hanya bila goal yang ditampilkan tercapai 100%**, persis aturan bar di `/goals`; kartu mini dengan progres tertinggi `< 100%` karena itu selalu `primary`), dan teks "Sisa **Rp X** dari target **Rp Y** · **Z%**" (nominal `.num`, disembunyikan mode privasi; bila tercapai, "Sisa …" diganti teks `gold-text` "**Tercapai**" — bukan "Sisa Rp 0 · 137%"). Goal yang ditampilkan: progres tertinggi yang **< 100%**; bila semua tercapai, tampilkan goal terakhir dibuat. Tanpa goal, panel tidak dirender (dashboard tidak boleh ramai). Persen ditampilkan apa adanya (boleh > 100, boleh negatif); lebar bar tetap dikunci 0–100.

**Confetti ("serbuk emas")** — lihat §9. Hanya dipicu dari form Setor saat sebuah setoran positif memindahkan goal dari belum tercapai → tercapai 100%, sekali per goal per sesi; tidak pernah pada render awal.

**Mode privasi ("Sembunyikan saldo"):** nominal target, terkumpul, sisa, dan baris kartu mini dashboard disembunyikan (`Rp •••••`), pola yang sama dengan anggaran; persen tidak disamarkan.

**Warna `gold`:** dipakai eksklusif untuk milestone "Tercapai" target tabungan (bar tercapai, chip, teks pencapaian, serbuk confetti). Jangan menggantikan `warn` anggaran.

### Chip dompet
Radius 10, ikon + nama + saldo kecil. Terpilih: latar `brand-soft`, border `brand`.

### Chip kategori (form transaksi)
Pada form tambah/ubah transaksi, chip kategori satu baris (`h-11`, radius `btn`, border `line`) menampilkan lingkaran kategori solid 20 px (lihat "Ikon kategori (solid)") menggantikan titik warna 10 px, diikuti nama kategori. Chip terpilih: border `primary` + latar `secondary` + teks `secondary-foreground` (tidak berubah). Target sentuh tetap ≥ 44 px dengan `gap-2`.

### Navigasi bawah
Lima slot: Beranda, Transaksi, Tambah (tombol bulat `brand`, ukuran 56, menonjol di tengah), Anggaran, Lainnya. Ikon 24 px dengan label `micro`. Slot aktif = **lingkaran `brand` penuh** berisi ikon `on-brand` (putih terang / `#06130D` gelap) dengan label berwarna `brand`; slot non-aktif tetap `muted-foreground`. Latar lingkaran dan warna label bertransisi 180 ms (`--motion-base`) tanpa menggeser tata letak; bobot ikon berganti langsung (`strokeWidth` tidak dapat dianimasikan CSS). `aria-current="page"` tetap dipakai pada slot aktif. Transisi dimatikan saat `prefers-reduced-motion`.

### Pengaturan ("Lainnya") terstruktur
Satu halaman `/settings`, dikelompokkan dengan `SectionHeader` per grup — **tidak ada route baru**. Urutan dari atas:
- **Profil** — Panel berisi avatar inisial besar (64 px, `brand-soft`, inisial `brand`, warna teks `brand`, bobot 700), nama tampilan (`body-strong`), dan email (`caption`, `muted`, tidak dapat diubah). Di bawahnya dalam panel yang sama: isian nama tampilan, mata uang (statis IDR), awal bulan anggaran, dan tombol "Simpan pengaturan".
- **Preferensi** — Panel berisi: segmen tema (Ikuti sistem / Terang / Gelap, langsung berlaku); sakelar "Tampilkan saldo" (lihat "Sembunyikan saldo"; default on); baris Bahasa ("Indonesia", statis — satu-satunya bahasa saat ini, dengan keterangan kecil).
- **Manajemen** — Panel-list (baris dipisah garis `line`, tinggi 56 px, ikon `muted` + chevron): Dompet → `/wallets`, Kategori → jangkar `#kategori` pada halaman ini, Anggaran → `/budgets`, Target tabungan → `/goals` (ikon `PiggyBank`).
- **Kategori** — manajer kategori apa adanya (diberi `id="kategori"` agar jangkar Manajemen mendarat tepat).
- **Tentang** — Panel berisi mark "K" kecil (32 px), "Keuangan", dan teks `caption` `muted`: "Keuangan v0.1 · PWA pencatatan keuangan pribadi".
- **Zona berbahaya** — tetap paling bawah dengan header sendiri, seperti sebelumnya.

### Banner offline
Saat perangkat offline atau ada antrean transaksi belum terkirim, tampil banner di atas konten: latar `warn-soft`, border `line`, ikon `WifiOff` (offline) atau `RefreshCw` (antrean menunggu), teks `warn-text` 13 px. Ikon selalu disertai teks penjelas. Banner hilang otomatis saat online dan antrean kosong.

### Bottom sheet
Radius atas 24, handle dekoratif 4 × 36, latar `surface-raised` (gelap) / `surface` (terang), peredup latar sesuai token `overlay`, dan tombol tutup. Saat dibuka, peredup memudar 180 ms dan panel naik 24 px selama 260 ms `ease-out`; saat ditutup, keduanya berbalik dalam 240 ms sebelum panel dilepas. Fokus dipindah ke panel, ESC menutup, dan gulir halaman dikunci selama sheet terbuka.

### Grafik
- Donat: pengeluaran per kategori, total di tengah, legenda dengan nominal dan persen. Varian `compact` (dashboard) memakai donut 96 px tanpa total di tengah dan legenda 5 teratas berisi persen saja + label.
- Garis tren: satu seri, tanpa titik kecuali saat disentuh; sumbu minimal.
- Bar perbandingan bulan: dua batang per kategori (bulan ini vs lalu).
- Semua grafik punya ringkasan teks yang dapat dibaca pembaca layar.

### Onboarding pertama (welcome)
Muncul di dashboard hanya saat pengguna belum punya dompet **atau** belum punya transaksi, dan belum pernah ditutup. Panel `surface` radius 14, border `line`, padding 20 px, memuat: tombol tutup (ikon `X`, 44 px) di kanan atas; ikon besar (32 px) di dalam lingkaran `brand-soft` (64 px, warna `brand`, mis. `Sparkles`); judul "Selamat datang di Keuangan!" (`title-2`); satu kalimat pengantar; lalu **dua langkah bernomor**: 1 "Tambah dompet pertamamu" (tautan `/wallets`), 2 "Catat pengeluaran pertamamu" (tautan `/transactions?add=1`). Langkah yang sudah terpenuhi diberi ikon centang di lingkaran `brand`; langkah yang belum berupa nomor di lingkaran `brand-soft`. Tombol primer membawa ke langkah yang belum selesai (dompet dulu, baru transaksi); tombol teks "Nanti saja" menutup panel dan menyimpan flag `keuangan-welcomed` di localStorage. Panel tidak muncul bila flag tersimpan atau setelah dompet dan transaksi sama-sama ada.

### Toast dan dialog
Toast di atas navigasi bawah, hilang otomatis 4 detik, menyebut tindakan dengan kata yang sama seperti tombolnya ("Transaksi disimpan"). Toast masuk dengan geser 10 px + pudar (240 ms). Toast dapat membawa **satu aksi**: tombol teks (`label`, mis. "Urungkan") di sisi kanan, tinggi sentuh 44 px, warna `brand`, bobot 600; menekannya menjalankan aksi lalu menutup toast. Toast beraksi tampil **6 detik** (bukan 4). Menghapus transaksi biasa memakai toast aksi ini: salinan data transaksi disimpan di memori sebelum hapus; "Urungkan" membuat ulang transaksi dengan id baru via action yang sama. Transfer tidak bisa diurungkan lewat jalur ini (dihapus permanen; dialog konfirmasi menyebutnya). Aksi yang tidak bisa dibatalkan memakai dialog konfirmasi; aksi lain menyediakan "Urungkan" pada toast. Dialog konfirmasi muncul dengan `pop-in` ringan (skala 0,96 → 1, 180 ms) di atas peredup yang memudar.

### Kerangka memuat
Gunakan komponen `.skeleton`: latar `muted`, radius mengikuti elemen aslinya, kilau horizontal tipis (`foreground` 8%) berulang 1,4 detik. Susun kerangka meniru layout akhir (judul, panel, baris) agar tidak ada pergeseran tata letak saat data tiba. Saat data tiba, konten halaman menggantikan kerangka dengan **`fade-up` 180 ms** (`.animate-fade-up-fast`, `--motion-base`) pada root kontainer halaman; transisi ini hanya terjadi saat konten pertama tampil setelah memuat dan hilang total saat `prefers-reduced-motion`. Saat `prefers-reduced-motion`, kilau dimatikan dan kerangka tampil datar.

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
| Toast aksi (undo) | "Transaksi dihapus" + tombol "Urungkan" (6 detik) |
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
Durasi, kurva, dan jeda memakai token pada bagian 10: `--motion-fast` 120 ms, `--motion-base` 180 ms, `--motion-slow` 240 ms, `--motion-sheet` 260 ms, `--motion-bar` 420 ms, `--motion-count` 700 ms, `--motion-logo` 600 ms; easing `--ease-out`, `--ease-in-out`; jeda bertahap `--stagger-step` 30 ms.

- **Respons tindakan pengguna:** tombol (150 ms), sheet buka/tutup, toast masuk, dialog konfirmasi, segmented control, chip kategori, dan perubahan nominal (120 ms).
- **Otomatis, hanya saat konten pertama tampil:** Saldo total menghitung naik sekali saat pertama tampil; perubahan nilai berikutnya (pindah bulan, refresh setelah simpan) berpindah dengan transisi 700 ms dari nilai sebelumnya, bukan dari 0. Baris transaksi `fade-up` berurutan (maksimal 8 baris), isi bar anggaran terisi dari 0, konten halaman (dashboard, transaksi, laporan) muncul `fade-up` 180 ms saat menggantikan kerangka memuat, dan garis tren saldo tergambar sekali.
- **Stroke-draw logo (`animate` pada `Logo`):** mark "K" menggambar ulang sekali saat mount pertama — `stroke-dasharray`/`stroke-dashoffset` dari penuh (1) ke 0 selama **600 ms** `--ease-out` (`--motion-logo`), kedua `<path>` bersamaan, implementasi murni CSS (tanpa JS). Hanya untuk mark hero di layar masuk/daftar saja (72 px) — bukan pada nav, header, atau render berulang; tanpa prop `animate`, tidak ada animasi. Total mati pada `prefers-reduced-motion` (durasi efektif 0 ms via aturan global, mark langsung tampil jadi).
- **Confetti serbuk emas (`Confetti` pada `/goals`):** hanya dipicu oleh form Setor/Tarik saat sebuah setoran **positif** memindahkan target tabungan dari belum tercapai → tercapai 100%, sekali per goal per sesi klien. 18 kotak kecil emas (6–10 px, nuansa `--gold`) jatuh dari atas layar dengan rotasi dan jeda acak, durasi ≈ **1,4 detik**, `pointer-events: none`, tanpa suara. Tidak pernah tampil pada render awal atau saat navigasi. Mati total pada `prefers-reduced-motion` (komponen tidak merender apa pun).
- Tidak ada animasi masuk pada bagian halaman lain.
- **Saat menunggu data:** kilau `.skeleton`. Ini satu-satunya animasi yang berulang.
- Tidak ada animasi saat berpindah halaman atau menggulir.
- Hormati `prefers-reduced-motion`: durasi dipangkas, kilau kerangka dimatikan, hitungan saldo langsung menampilkan nilai akhir, stroke-draw logo langsung menampilkan mark utuh, confetti serbuk emas tidak dirender, dan transformasi tekan dinonaktifkan.

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
  /* Gold HANYA untuk milestone "tercapai" target tabungan (§6) */
  --gold: #D4AF37;
  --gold-soft: #FBF6E3;
  --gold-text: #8A6A10;
  --expense-soft: #FBE7E5;
  --expense-text: #B33226;
  --surface-raised: #FFFFFF;
  --overlay: color-mix(in oklab, #0E1A15 40%, transparent);
  --radius: 10px;
  /* gerak */
  --motion-fast: 120ms;
  --motion-base: 180ms;
  --motion-slow: 240ms;
  --motion-sheet: 260ms;
  --motion-bar: 420ms;
  --motion-count: 700ms;
  --motion-logo: 600ms;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
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
  --muted-foreground: #A8B9AE;
  --accent: #12352A;
  --accent-foreground: #34C38A;
  --destructive: #F0716A;
  --border: #2E3E35;
  --input: #2E3E35;
  --ring: #34C38A;
  --warn: #E0A93B;
  --warn-text: #F0C66B;
  --warn-soft: #33280F;
  /* Gold HANYA untuk milestone "tercapai" target tabungan (§6) */
  --gold: #F0C85E;
  --gold-soft: #33290F;
  --gold-text: #F5DC8A;
  --expense-soft: #3A1B19;
  --expense-text: #F0716A;
  --surface-raised: #1B2520;
  --overlay: color-mix(in oklab, #000000 60%, transparent);
}

@media (prefers-color-scheme: dark) {
  :root:not(.light) { /* salin nilai .dark di sini */ }
}
```

**Tailwind:** petakan `warn`, `warn-text`, `warn-soft`, `expense-soft`, `expense-text`, `gold`, `gold-soft`, `gold-text` ke variabel di atas pada `@theme inline`; jangan memakai warna bawaan Tailwind di komponen. `gold` (dan turunannya) hanya untuk milestone "tercapai" target tabungan; `warn` tetap khusus anggaran ≥ 80%.

**Hero saldo — kelas utilitas tambahan di `globals.css`:**
```css
/* Latar transparan di atas panel saldo penuh (design.md §6 "Panel saldo") */
.hero-scrim {
  background-color: color-mix(in oklab, #0E1A15 16%, transparent); /* terang: gelap transparan, menjaga AA */
}
.dark .hero-scrim {
  background-color: color-mix(in oklab, var(--primary-foreground) 15%, transparent); /* gelap: on-brand 15% */
}

/* Serbuk emas milestone target tabungan (§6 "Target tabungan", §9). */
@keyframes confetti-fall {
  from { opacity: 1; transform: translateY(-12vh) rotate(0deg); }
  to   { opacity: 0.9; transform: translateY(108vh) rotate(var(--confetti-rotate, 540deg)); }
}
.confetti-piece { animation: confetti-fall 1.4s var(--ease-in-out) both; }

/* Stroke-draw logo (design.md §6 "Logo dan identitas", §9) */
@keyframes stroke-draw {
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
}
.animate-stroke-draw path {
  stroke-dasharray: 1;   /* pathLength=1 pada <path> */
  stroke-dashoffset: 1;
  animation: stroke-draw var(--motion-logo) var(--ease-out) both;
}
```
Tanpa kelas-kelas ini panel hero tidak punya latar transparan chip/avatar dan prop `animate` pada `Logo` tidak berefek. `prefers-reduced-motion` mematikan `stroke-draw` lewat aturan global (durasi efektif 0 ms).

**Skala `display`:** skala `display` (40 / 44, bobot 700) dipakai untuk nominal numpad; `display-lg` (44 / 48) dipakai khusus untuk saldo total di hero dashboard. Keduanya ditulis langsung di kode (mis. `text-[40px] leading-[44px]` dan `text-[44px] leading-[48px]`, bobot 700, tracking −0.02em) — tidak ada kelas `.display`/`.display-lg` khusus.

**Font:** muat lewat `next/font/google` (Inter Tight, bobot 400/500/600/700, `display: swap`, variable `--font-inter`) pada `app/layout.tsx`; variable diset pada `body`, `--font-sans` memetakan ke `var(--font-inter)`, dan aktifkan `tabular-nums` pada kelas utilitas `.num` yang dipakai di semua nominal.

**PWA:**
- `theme_color`: `#0B7A4B` di manifest, dan `<meta name="theme-color">` per mode lewat `viewport` di `app/layout.tsx` (`#0B7A4B` terang, `#0C1210` gelap). Keduanya wajib konsisten dengan brand hijau dan kanvas gelap — jangan memakai warna lain.
- `background_color` manifest: `#F6F8F7` (tetap; layar splash mengikuti warna ini).
- Ikon: mark "K" putih tebal (700) di atas rounded-square hijau `#0B7A4B` (radius ±22% untuk versi `any`; maskable dan apple-touch-icon penuh tanpa radius dengan zona aman 80%). Ukuran 192, 512, *maskable* 512, dan apple-touch-icon 180; lihat §6 "Logo dan identitas".
- Layar splash: mengikuti `background_color` manifest + ikon maskable; iOS memakai `apple-touch-icon` yang sama. Splash PWA **bersifat otomatis dari OS** (Android/Chrome dari `background_color` + ikon; iOS dari warna latar + apple-touch-icon) — tidak ada komponen splash kustom di kode dan tidak perlu `apple-touch-startup-image` per ukuran perangkat (kompleks dan redundan). `config.appleWebApp.startupImage` **tidak dipakai**; jangan menambahkan startup image, splash screen komponen, atau layar loading buatan. `appleWebApp.capable` dan `statusBarStyle: "default"` dibiarkan apa adanya. `theme_color` `#0B7A4B` (manifest + `viewport`) sudah benar dan dipertahankan. Catatan: layar splash OS tidak dapat dianimasikan dan tidak menampilkan wordmark; identitas animasi (stroke-draw) hanya ada di layar masuk/daftar saja.

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

- Nama dan logo aplikasi: ditetapkan — mark "K" di atas rounded-square `brand` (§6 "Logo dan identitas").
- Ikon kategori emoji atau set ikon garis Lucide? Ditetapkan (v0.3): Lucide **filled solid** di atas lingkaran solid warna kategori — lihat §6 "Ikon kategori (solid)".
- Mode tampilan "sembunyikan saldo" (privasi): ditetapkan dan diimplementasikan — lihat §6 "Sembunyikan saldo".
- Target tabungan ("tujuan tabungan"): ditetapkan dan diimplementasikan — lihat §6 "Target tabungan" dan §5.1.
