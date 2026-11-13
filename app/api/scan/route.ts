import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";

export const runtime = "nodejs";

const receiptSchema = z.object({
  total: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  merchant: z.string().max(120).optional(),
  categoryGuess: z.string().max(40).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

const PROMPT = `Baca foto struk belanja ini. Balas HANYA JSON dengan bentuk:
{"total": number, "date": "YYYY-MM-DD" (opsional), "merchant": string (opsional), "categoryGuess": string (opsional), "confidence": number 0-1}
"total" adalah jumlah akhir yang dibayar dalam rupiah penuh (bilangan bulat, tanpa titik/koma).
Jika struk tidak terbaca, balas {"error":"tidak terbaca"}.`;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak memiliki akses." }, { status: 401 });
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Scan struk belum dikonfigurasi. Isi AI_API_KEY di server, atau catat manual / gunakan input teks.",
      },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("receipt");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Foto struk tidak ditemukan." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Ukuran foto maksimal 5 MB." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
  const baseUrl = (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Layanan AI sedang tidak tersedia. Coba lagi atau isi manual." },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Struk belum terbaca. Foto ulang dengan cahaya lebih terang." }, { status: 422 });
    }

    const json = JSON.parse(content) as unknown;
    const parsed = receiptSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Struk belum terbaca. Foto ulang atau isi manual." },
        { status: 422 },
      );
    }

    // Never persists anything: the client shows this as an editable draft.
    return NextResponse.json({ draft: { ...parsed.data, source: "ai_scan" } });
  } catch {
    return NextResponse.json({ error: "Struk gagal diproses. Coba lagi." }, { status: 500 });
  }
}
