import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { isDemoMode } from "./db";
import { DEMO_USER } from "./demo/store";
import type { AppUser } from "./types";

export async function getSessionUser(): Promise<AppUser | null> {
  if (isDemoMode) {
    return { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email };
  }
  if (!auth) return null;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };
}

export async function requireUser(): Promise<AppUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
