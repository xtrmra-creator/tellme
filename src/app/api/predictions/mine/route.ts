import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function bearerToken(req: Request): string | null {
  const h = req.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m?.[1]?.trim() || null;
}

function mapPrediction(row: {
  id: string;
  nationality: string;
  locale: string;
  predicted_date: string | null;
  is_never: boolean;
  bunker_id: string;
}) {
  return {
    id: row.id,
    nationality: row.nationality,
    locale: row.locale,
    predictedDate: row.predicted_date,
    isNever: row.is_never,
    bunkerId: row.bunker_id,
  };
}

/** Signed-in user's existing seal (if any). */
export async function GET(req: Request) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const ip = clientIp(req);
    if (!rateLimit(`pred-mine:${ip}`, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const token = bearerToken(req);
    if (!token) {
      return NextResponse.json({ prediction: null });
    }

    const { data: authData, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !authData.user) {
      return NextResponse.json({ prediction: null });
    }

    const { data, error } = await supabase
      .from("predictions")
      .select("id, nationality, locale, predicted_date, is_never, bunker_id")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("mine prediction error:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json(
      { prediction: data ? mapPrediction(data) : null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
