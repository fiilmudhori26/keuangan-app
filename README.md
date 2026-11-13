# Keuangan — Pencatatan Keuangan Pribadi (PWA)

Aplikasi mobile-first untuk mencatat pemasukan/pengeluaran, mengelola dompet, anggaran bulanan, laporan, dan scan struk. Dibangun dengan Next.js App Router, Tailwind, Drizzle + Neon, dan Better Auth.

Dokumen sumber: `PRD-aplikasi-keuangan.md` (produk) dan `design.md` (sistem desain).

## Menjalankan

```bash
npm install
cp .env.example .env.local   # opsional; tanpa DATABASE_URL aplikasi jalan dalam mode demo
npm run dev                  # http://localhost:3000
```

### Mode demo

Tanpa `DATABASE_URL`, aplikasi berjalan dengan penyimpanan in-memory berisi data contoh dan satu pengguna demo (tanpa login). Cocok untuk mencoba UI. Data kembali ke awal setiap server dimulai ulang. Isi `DATABASE_URL` untuk memakai Neon.

### Mode database nyata

1. Isi `.env.local`: `DATABASE_URL`, `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `BETTER_AUTH_URL`.
2. `npm run db:push` (atau `npm run db:generate` lalu `npm run db:migrate`) — tinjau migrasi sebelum dijalankan.
3. Login Google hanya muncul bila `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` diisi.
4. Scan struk foto aktif bila `AI_API_KEY` diisi (endpoint OpenAI-compatible; atur `AI_BASE_URL`/`AI_MODEL`). Tanpa kunci, input teks tetap berfungsi.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Build & jalankan produksi |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit + isolasi data) |
| `npm run db:generate` | Buat file migrasi Drizzle |
| `npm run db:migrate` / `db:push` | Terapkan migrasi / dorong skema |

Urutan verifikasi sebelum menyelesaikan pekerjaan: `lint` → `typecheck` → `test` → `build`.

## Struktur

- `app/(app)/*` — layar setelah login: dashboard, transaksi, dompet, anggaran, laporan, scan, pengaturan.
- `app/(auth)/*` — masuk/daftar.
- `app/actions/*` — Server Actions (mutasi). Semua memanggil `requireUser()` lalu repository.
- `lib/data/*` — antarmuka `Repo` dengan dua implementasi: `repo.demo.ts` (in-memory) dan `repo.drizzle.ts` (Neon).
- `lib/services/finance.ts` — perhitungan saldo, total bulanan, anggaran, tren (fungsi murni, dites).
- `lib/db/schema.ts` — skema Drizzle, termasuk tabel Better Auth.
- `lib/ai/parse-text.ts` — pengurai input teks bebas, bekerja offline.
- `components/*` — UI mengikuti token `design.md`.

## Catatan implementasi

- Nominal selalu integer rupiah. Format hanya saat render (`lib/money.ts`).
- Transfer disimpan sebagai dua baris `type = 'transfer'` dengan kolom tambahan `transfer_direction` (`in`/`out`) agar saldo dompet dapat dihitung tanpa mengubah tipe transaksi.
- Setiap query lewat repository yang menerima `userId` dari sesi. Tidak ada RLS; isolasi diuji di `tests/isolation.test.ts`.
- Tabel `user`/`session`/`account`/`verification` mengikuti skema Better Auth. Setelah upgrade Better Auth, jalankan `npx @better-auth/cli generate` dan bandingkan.
- PWA memakai service worker manual (`public/sw.js`), bukan Serwist/next-pwa. Registrasi hanya di produksi.
- Antrean offline disimpan di `localStorage` (`lib/offline-queue.ts`) dan dikirim ulang saat online.

## Status milestone

M0–M7 kerangka selesai: setup, auth + skema, dompet/kategori, transaksi + transfer, anggaran + dashboard + laporan + CSV, PWA, scan struk + input teks, dan poles UI. Yang masih perlu sebelum rilis: verifikasi Lighthouse ≥ 90, uji auth dengan database Neon nyata, dan penyimpanan foto struk ke object storage (R2/Blob) bila fitur lampiran diaktifkan.
