"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type ToastAction = { label: string; onAction: () => void };
type Toast = {
  id: number;
  message: string;
  tone: "success" | "error";
  action?: ToastAction;
  duration: number;
};

type ToastOptions = { action?: ToastAction; duration?: number };

const ToastContext = createContext<{
  push: (message: string, tone?: Toast["tone"], options?: ToastOptions) => void;
}>({
  push: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string, tone: Toast["tone"] = "success", options?: ToastOptions) => {
      const id = Date.now() + Math.random();
      const duration = options?.duration ?? (options?.action ? 6000 : 4000);
      setToasts((current) => [
        ...current,
        { id, message, tone, action: options?.action, duration },
      ]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-toast-in pointer-events-auto flex w-full max-w-[420px] items-center gap-2 rounded-btn border border-border bg-surface-raised py-2 pl-4 pr-2 text-[15px] leading-[22px] text-foreground shadow-sm"
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 self-center text-primary" aria-hidden />
            ) : (
              <AlertCircle className="size-4 shrink-0 self-center text-destructive" aria-hidden />
            )}
            <span className="min-w-0 flex-1">{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  dismiss(toast.id);
                  toast.action?.onAction();
                }}
                className="inline-flex h-11 shrink-0 items-center rounded-btn px-3 text-[14px] font-semibold leading-5 text-primary transition-colors duration-150 ease-out hover:bg-muted"
              >
                {toast.action.label}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
