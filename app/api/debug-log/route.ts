import { NextResponse } from "next/server";
import { appendDebug } from "@/lib/debug-log";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        sessionId?: string;
        runId: string;
        hypothesisId: string;
        location: string;
        message: string;
        data?: unknown;
        timestamp: number;
      }
    | null;

  if (!body || !body.runId || !body.hypothesisId || !body.location || !body.message) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await appendDebug(body);
  return NextResponse.json({ ok: true });
}

