import { logtail } from "@/lib/logger/logtail";
import { flushLogtail } from "@/lib/logger/logtail-flush";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  // Never trust client input blindly; keep it limited.
  logtail.error("Client error reported", {
    message: body?.message,
    stack: body?.stack,
    digest: body?.digest,
    href: body?.href,
    userAgent: body?.userAgent,
  });

  await flushLogtail();
  return NextResponse.json({ ok: true });
}
