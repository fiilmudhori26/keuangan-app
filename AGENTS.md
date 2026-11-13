# AGENTS.md

## Status

App is implemented end to end (M0–M7 skeleton): dashboard, transactions, wallets, budgets, reports, scan, settings, auth, PWA. It runs in **demo mode by default** — no `DATABASE_URL` means an in-memory store with seeded data and a fixed demo user (no login). Never assume a database is present while developing or testing.

Authoritative docs (read before changing product behavior or UI):
- `PRD-aplikasi-keuangan.md` — scope, data model, security rules.
- `design.md` — single source of truth for UI tokens. No colors, font sizes, radii, or animations outside it.

`README.md` covers setup. This file covers what is easy to get wrong.

## Commands

```bash
npm run dev        # Turbopack dev server
npm run lint       # ESLint (must be 0 errors)
npm run typecheck  # tsc --noEmit
npm test           # Vitest: money, budgets, parsing, data isolation
npm run build      # production build; also runs typecheck
npm run db:push    # apply schema to Neon (or db:generate + db:migrate)
```

Verify in this order before finishing: `lint` → `typecheck` → `test` → `build`.

## Architecture

- `app/(app)/*` — authenticated screens; `app/(auth)/*` — login/register; `app/actions/*` — all mutations (Server Actions, each calls `requireUser()`).
- `lib/data/repo.demo.ts` and `lib/data/repo.drizzle.ts` implement the same `Repo` interface; `repo` picks one based on `isDemoMode`. **Any new data operation must be added to both implementations.**
- `lib/services/finance.ts` — pure calculations (balances, monthly totals, budget progress, trend). Add tests here for any money rule.
- `lib/db/schema.ts` — Drizzle schema plus Better Auth tables.
- `lib/services/queries.ts` — shared page queries; `lib/validation.ts` — Zod schemas shared by actions and forms.

## Non-obvious constraints

- **Every query goes through `repo`, which always filters by `userId` from the session.** No RLS exists. `tests/isolation.test.ts` must keep passing; extend it for new tables.
- Transfers are two rows with `type: "transfer"` plus `transfer_direction` (`in`/`out`), a deliberate addition beyond the PRD model so wallet balances work. They never count as income/expense. Deleting one deletes the pair.
- Money is integer rupiah everywhere; format only with `lib/money.ts` (`Intl.NumberFormat("id-ID")`). UI money uses the `.num` class.
- `next.config.ts` must keep the `turbopack.rules` CSS loader (`@tailwindcss/turbopack`). Removing it makes Tailwind 4 directives fail silently and ships unstyled pages.
- `app/(app)/layout.tsx` sets `dynamic = "force-dynamic"` on purpose: in demo mode the session check does not read `headers()`, so without it pages would be prerendered and freeze seeded data at build time.
- Next 16: `searchParams`/`params` are Promises — `await` them. This repo also has the `next dev`-generated block at the bottom of this file; leave it in place.
- Auth tables mirror Better Auth's schema. After upgrading Better Auth, run `npx @better-auth/cli generate` and diff before migrating.
- PWA uses a hand-written `public/sw.js` (not Serwist/next-pwa) and registers only in production. Offline queue lives in `localStorage` (`lib/offline-queue.ts`) and replays through the same server action.
- The ESLint rule `react-hooks/set-state-in-effect` is downgraded to a warning because modal forms intentionally hydrate from the record being edited when opened. Do not add new effects that reset state for other reasons.

## Product rules

- AI scan output and text parsing results are **drafts** until the user confirms; never persist without the review step. Photo scan returns 503 without `AI_API_KEY`; the text parser (`lib/ai/parse-text.ts`) must always work offline.
- UI copy is Bahasa Indonesia with fixed vocabulary: Transaksi, Dompet, Kategori, Anggaran, Laporan, Pemasukan, Pengeluaran, Transfer.
- Transaction rows use `border` separators, not cards; touch targets ≥ 44 px; check 360 px and 430 px, both themes, and empty/loading/error states.

## Working style

Small commits, one concern per change. Plan briefly, then implement; finish with the verification chain and a summary. Update this file when a command, convention, or workaround changes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
