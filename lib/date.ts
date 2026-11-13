/** All display formatting uses id-ID (PRD §8, design.md §7). */

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MONTHS_SHORT_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/** Date-only ISO string (YYYY-MM-DD) in local time. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** Month key used by budgets: YYYY-MM */
export function monthKey(date: Date = new Date()): string {
  return toDateKey(date).slice(0, 7);
}

export function isValidMonthKey(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return monthKey(date);
}

export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const start = `${month}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const end = `${month}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

/** "Jumat, 14 November" — tanggal hari ini untuk header dashboard (design.md §6). */
export function formatIndonesianLongDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return `${d} ${MONTHS_SHORT_ID[m - 1]} ${y}`;
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS_ID[m - 1]} ${y}`;
}

/** "Hari ini" / "Kemarin" / formatted date (design.md §7). */
export function formatRelativeDate(dateKey: string): string {
  const today = todayKey();
  if (dateKey === today) return "Hari ini";
  const [y, m, d] = today.split("-").map(Number);
  const yesterday = toDateKey(new Date(y, m - 1, d - 1));
  if (dateKey === yesterday) return "Kemarin";
  return formatDateKey(dateKey);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${formatDateKey(toDateKey(date))} ${String(date.getHours()).padStart(2, "0")}.${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}
