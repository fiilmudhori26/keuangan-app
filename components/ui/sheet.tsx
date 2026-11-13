"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const EXIT_MS = 240;

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [present, setPresent] = useState(open);
  const [active, setActive] = useState(open);

  // Callers pass inline arrows; keep the latest handler without restarting effects.
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Keep the panel mounted long enough to play the closing transition.
  useEffect(() => {
    let enterFrame = 0;
    let exitFrame = 0;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;

    if (open) {
      enterFrame = requestAnimationFrame(() => {
        setPresent(true);
        exitFrame = requestAnimationFrame(() => setActive(true));
      });
    } else {
      exitFrame = requestAnimationFrame(() => setActive(false));
      exitTimer = setTimeout(() => setPresent(false), EXIT_MS);
    }

    return () => {
      cancelAnimationFrame(enterFrame);
      cancelAnimationFrame(exitFrame);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, [open]);

  // Focus, ESC, and scroll lock only once the panel is actually mounted.
  useEffect(() => {
    if (!open || !present) return;
    const panel = panelRef.current;
    if (!panel) return;

    if (!triggerRef.current && document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }
    panel.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger && document.contains(trigger)) trigger.focus();
    };
  }, [open, present]);

  if (!present) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className={cn(
          "absolute inset-0 bg-overlay transition-opacity ease-out",
          active ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDuration: active ? "var(--motion-base)" : "var(--motion-slow)" }}
        onClick={() => onCloseRef.current()}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{ transitionDuration: active ? "var(--motion-sheet)" : "var(--motion-slow)" }}
        className={cn(
          "relative flex max-h-[92dvh] w-full max-w-[480px] flex-col rounded-t-sheet border border-border bg-surface-raised sm:rounded-hero",
          "pb-[env(safe-area-inset-bottom)] transition-[opacity,transform] ease-out",
          active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          className,
        )}
      >
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <span aria-hidden className="absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full bg-border" />
          <h2 className="mt-3 text-[18px] font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label="Tutup"
            className="mt-3 flex size-11 items-center justify-center rounded-btn text-muted-foreground transition-colors duration-150 ease-out hover:bg-muted"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer ? <div className="border-t border-border px-5 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}
