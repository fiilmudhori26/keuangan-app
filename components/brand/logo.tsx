import { cn } from "@/lib/utils";

export function Logo({
  size = 40,
  showWordmark = true,
  className,
}: {
  /** Ukuran sisi mark dalam px. Wordmark ikut diskalakan (±0,42× size). */
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      role={showWordmark ? undefined : "img"}
      aria-label={showWordmark ? undefined : "Keuangan"}
      aria-hidden={showWordmark || undefined}
      className="shrink-0"
    >
      <rect width="512" height="512" rx="112" fill="#0B7A4B" />
      <g
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={56}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M182 150 V362" />
        <path d="M352 150 L218 256 L352 362" />
      </g>
    </svg>
  );

  if (!showWordmark) {
    return <span className={cn("inline-flex", className)}>{mark}</span>;
  }

  return (
    <span
      role="img"
      aria-label="Keuangan"
      className={cn("inline-flex items-center gap-[0.35em]", className)}
    >
      {mark}
      <span
        className="font-bold leading-none tracking-display text-foreground"
        style={{ fontSize: Math.round(size * 0.42) }}
      >
        Keuangan
      </span>
    </span>
  );
}
