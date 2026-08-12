import { NextResponse } from "next/server";
import { getSupabaseStats } from "@/lib/statsFromSupabase";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(`stats:${ip}`, 60, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const stats = await getSupabaseStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
