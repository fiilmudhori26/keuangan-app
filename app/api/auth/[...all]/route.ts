import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const handler = auth ? toNextJsHandler(auth) : null;

function unavailable() {
  return Response.json(
    { error: "Autentikasi belum dikonfigurasi. Isi DATABASE_URL dan BETTER_AUTH_SECRET." },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  if (!handler) return unavailable();
  return handler.GET(request);
}

export async function POST(request: Request) {
  if (!handler) return unavailable();
  return handler.POST(request);
}
