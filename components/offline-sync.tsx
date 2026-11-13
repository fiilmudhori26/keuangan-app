"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { WifiOff, RefreshCw } from "lucide-react";
import { createTransactionAction } from "@/app/actions/transactions";
import { listQueue, removeFromQueue } from "@/lib/offline-queue";
import { useToast } from "@/components/ui/toast";

export function OfflineSync() {
  const router = useRouter();
  const { push } = useToast();
  const [, startTransition] = useTransition();
  const [online, setOnline] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    setCount(listQueue().length);

    async function flush() {
      const queue = listQueue();
      let sent = 0;
      for (const item of queue) {
        const result = await createTransactionAction(item.input);
        if (result.ok) {
          removeFromQueue(item.clientId);
          sent += 1;
        }
      }
      setCount(listQueue().length);
      if (sent > 0) {
        push(`${sent} transaksi offline dikirim`);
        router.refresh();
      }
    }

    function onOnline() {
      setOnline(true);
      startTransition(() => {
        void flush();
      });
    }
    function onOffline() {
      setOnline(false);
    }
    function onQueueChange() {
      setCount(listQueue().length);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("keuangan-queue-change", onQueueChange);
    if (navigator.onLine && listQueue().length > 0) {
      startTransition(() => {
        void flush();
      });
    }
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("keuangan-queue-change", onQueueChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (online && count === 0) return null;

  return (
    <div className="mb-3 flex items-start gap-2 rounded-[10px] border border-border bg-warn-soft px-3 py-2 text-[13px] text-warn-text">
      {online ? (
        <RefreshCw className="mt-0.5 size-4 shrink-0" aria-hidden />
      ) : (
        <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <p>
        {online
          ? `${count} transaksi menunggu dikirim.`
          : "Tidak ada koneksi. Transaksi baru disimpan di perangkat dan dikirim saat online."}
      </p>
    </div>
  );
}
