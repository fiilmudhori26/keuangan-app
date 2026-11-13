"use client";

/**
 * Offline queue (PRD §5.6): transactions captured without a connection are
 * stored locally with a client-generated UUID and replayed when back online.
 * The payload matches the createTransaction server action input.
 */
const KEY = "keuangan-offline-queue";

export type QueuedTransaction = {
  clientId: string;
  createdAt: string;
  input: {
    type: "income" | "expense";
    amount: number;
    walletId: string;
    categoryId: string;
    occurredAt: string;
    note?: string;
    merchant?: string;
    source: "manual" | "ai_text" | "ai_scan";
  };
};

function read(): QueuedTransaction[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as QueuedTransaction[]) : [];
  } catch {
    return [];
  }
}

function write(queue: QueuedTransaction[]) {
  localStorage.setItem(KEY, JSON.stringify(queue));
  window.dispatchEvent(new CustomEvent("keuangan-queue-change"));
}

export function enqueue(input: QueuedTransaction["input"]): QueuedTransaction {
  const item: QueuedTransaction = {
    clientId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    input,
  };
  write([...read(), item]);
  return item;
}

export function listQueue(): QueuedTransaction[] {
  return read();
}

export function removeFromQueue(clientId: string) {
  write(read().filter((item) => item.clientId !== clientId));
}

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function queueSize(): number {
  return read().length;
}
