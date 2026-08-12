import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { isActiveLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 },
      );
    }

    const ip = clientIp(req);
    if (!rateLimit(`email:${ip}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();
    const email = String(body.email ?? "")
      .toLowerCase()
      .trim();
    const predictionId = body.prediction?.id || body.predictionId;
    const nationality = String(body.nationality ?? "OTHER")
      .toUpperCase()
      .slice(0, 8);
    const locale = isActiveLocale(String(body.locale ?? "en"))
      ? (body.locale as Locale)
      : "en";
    const wantsUpdates = Boolean(body.wantsUpdates);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const userAgent = (req.headers.get("user-agent") || "unknown").slice(0, 400);
    const row: Record<string, unknown> = {
      email,
      prediction_id: predictionId || null,
      nationality,
      locale,
      is_verified: false,
      wants_updates: wantsUpdates,
      wants_alerts: wantsUpdates,
      user_agent: userAgent,
    };
    if (ip !== "unknown") row.ip_address = ip;

    const { error } = await supabase.from("emails").insert(row);

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          message: "Email already registered",
        });
      }
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Email registered successfully",
    });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
