"use client";

import { useEffect, useRef } from "react";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  onConfirm,
  onClose,
  loading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="animate-overlay-in absolute inset-0 bg-overlay" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        tabIndex={-1}
        className="animate-pop-in relative w-full max-w-[360px] rounded-hero border border-border bg-surface-raised p-5"
      >
        <h2 id="confirm-title" className="text-[18px] font-semibold text-foreground">
          {title}
        </h2>
        <p id="confirm-desc" className="mt-2 text-[16px] leading-6 text-muted-foreground">
          {description}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Batal
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} type="button">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
