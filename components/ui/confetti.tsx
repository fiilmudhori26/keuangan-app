"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const PIECE_COUNT = 18;
// Turunan token --gold (design.md §2, §10) — bukan hex langsung di komponen.
const GOLD_SHADES = [
  "var(--gold)",
  "color-mix(in oklab, var(--gold), white 35%)",
  "color-mix(in oklab, var(--gold), black 25%)",
  "var(--gold-text)",
  "color-mix(in oklab, var(--gold), var(--gold-text))",
];

type Piece = {
  left: number;
  size: number;
  delay: number;
  rotate: string;
  color: string;
  round: boolean;
};

/**
 * "Serbuk emas" saat target tabungan tercapai 100% lewat form setoran.
 * Dirender hanya bila `fireNonce > 0` (nonce berubah per milestone) dan
 * tidak pada render awal. `prefers-reduced-motion` mematikan sepenuhnya.
 */
export function Confetti({ fireNonce }: { fireNonce: number }) {
  const reducedMotion = usePrefersReducedMotion();
  // Tutup otomatis setelah animasi (~1,5 detik); penghilangan mengikuti
  // nonce yang di-dismiss, tanpa setState sinkron di body effect.
  const [dismissedNonce, setDismissedNonce] = useState(0);
  const visible = fireNonce > 0 && fireNonce !== dismissedNonce && !reducedMotion;

  useEffect(() => {
    if (fireNonce <= 0 || reducedMotion) return;
    const timer = setTimeout(() => setDismissedNonce(fireNonce), 1500);
    return () => clearTimeout(timer);
  }, [fireNonce, reducedMotion]);

  // Posisi acak stabil per nonce.
  const pieces = useMemo<Piece[]>(() => {
    if (fireNonce <= 0) return [];
    let seed = fireNonce * 2654435761;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    return Array.from({ length: PIECE_COUNT }, () => ({
      left: rand() * 100,
      size: 6 + Math.round(rand() * 5), // 6–10 px
      delay: rand() * 0.35,
      rotate: `${360 + Math.round(rand() * 540)}deg`,
      color: GOLD_SHADES[Math.floor(rand() * GOLD_SHADES.length)],
      round: rand() < 0.25,
    }));
  }, [fireNonce]);

  if (!visible || reducedMotion) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
    >
      {pieces.map((piece, index) => (
        <span
          key={`${fireNonce}-${index}`}
          className="confetti-piece absolute top-0 block"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.round ? "9999px" : 2,
            animationDelay: `${piece.delay}s`,
            ["--confetti-rotate" as string]: piece.rotate,
          }}
        />
      ))}
    </div>
  );
}
