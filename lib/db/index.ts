import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const url = process.env.DATABASE_URL?.trim();

export const isDatabaseConfigured = Boolean(
  url && !url.includes("placeholder") && url.startsWith("postgres"),
);

/** Demo mode runs the UI against an in-memory store so the app works before Neon exists. */
export const isDemoMode = !isDatabaseConfigured && process.env.DEMO_MODE !== "false";

function createDb(connectionString: string) {
  return drizzle(neon(connectionString), { schema });
}

export type Database = ReturnType<typeof createDb>;

export const db: Database | null = isDatabaseConfigured ? createDb(url!) : null;

export function requireDb(): Database {
  if (!db) {
    throw new Error(
      "DATABASE_URL belum dikonfigurasi. Isi .env.local atau jalankan dalam mode demo.",
    );
  }
  return db;
}
