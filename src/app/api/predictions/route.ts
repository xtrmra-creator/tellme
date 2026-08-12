import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { getSupabaseStats } from "@/lib/statsFromSupabase";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { STAT_ROWS } from "@/data/statRows";
import { isActiveLocale } from "@/lib/i18n";
import type { Locale, BunkerRole, ThreatLevel, Rarity } from "@/lib/types";

const ALLOWED_NATIONS = new Set([
  ...STAT_ROWS.map((r) => r.code),
  "OTHER",
]);

export const runtime = "nodejs";

// Bunker role generation logic
function generateBunkerData(isNever: boolean, date?: string) {
  const roles: BunkerRole[] = [
    "doom_prophet",
    "bunker_architect", 
    "cope_diplomat",
    "supply_hoarder",
    "shadow_strategist",
    "frontline_meme_lord",
    "neutral_observer"
  ];

  const threats: ThreatLevel[] = ["coffee", "elevated", "red", "cosmic_cope"];
  const rarities: Rarity[] = ["common", "classified", "eyes_only"];

  // Generate bunker ID
  const bunkerId = `BNK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // Role selection based on prediction
  let role: BunkerRole;
  let threatLevel: ThreatLevel;
  let rarity: Rarity;

  if (isNever) {
    // Optimistic roles for "never" predictions
    role = Math.random() > 0.5 ? "cope_diplomat" : "neutral_observer";
    threatLevel = "coffee";
    rarity = "common";
  } else if (date) {
    const predictionDate = new Date(date);
    const now = new Date();
    const yearsFromNow = (predictionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365);

    if (yearsFromNow < 1) {
      // Very soon predictions
      role = Math.random() > 0.5 ? "doom_prophet" : "shadow_strategist";
      threatLevel = "cosmic_cope";
      rarity = "eyes_only";
    } else if (yearsFromNow < 3) {
      // Near future predictions
      role = roles[Math.floor(Math.random() * roles.length)];
      threatLevel = Math.random() > 0.5 ? "red" : "elevated";
      rarity = Math.random() > 0.7 ? "classified" : "common";
    } else {
      // Far future predictions
      role = Math.random() > 0.6 ? "bunker_architect" : "supply_hoarder";
      threatLevel = Math.random() > 0.5 ? "elevated" : "coffee";
      rarity = "common";
    }
  } else {
    // Default case
    role = roles[Math.floor(Math.random() * roles.length)];
    threatLevel = threats[Math.floor(Math.random() * threats.length)];
    rarity = rarities[Math.floor(Math.random() * rarities.length)];
  }

  return { bunkerId, role, threatLevel, rarity };
}

function bearerToken(req: Request): string | null {
  const h = req.headers.get("authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m?.[1]?.trim() || null;
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const ip = clientIp(req);
    if (!rateLimit(`pred:${ip}`, 4, 10 * 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    let userId: string | null = null;
    const token = bearerToken(req);
    if (token) {
      const { data: authData } = await supabase.auth.getUser(token);
      userId = authData.user?.id ?? null;
    }

    if (userId) {
      const { data: existing } = await supabase
        .from("predictions")
        .select("id, nationality, locale, predicted_date, is_never, bunker_id, threat_level")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          {
            error: "already_voted",
            prediction: {
              bunkerId: existing.bunker_id,
              threatLevel: existing.threat_level,
              predictedDate: existing.predicted_date,
              isNever: existing.is_never,
              nationality: existing.nationality,
              locale: existing.locale,
            },
          },
          { status: 409 },
        );
      }
    }

    const body = await req.json();
    const locale = isActiveLocale(String(body.locale ?? "en"))
      ? (body.locale as Locale)
      : "en";
    const nationalityRaw = String(body.nationality ?? "OTHER").toUpperCase();
    const nationality = ALLOWED_NATIONS.has(nationalityRaw)
      ? nationalityRaw
      : "OTHER";
    const isNever = Boolean(body.isNever);
    const date = isNever ? "never" : String(body.date ?? "");

    if (!isNever) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
      }
      const d = new Date(date + "T00:00:00Z");
      if (Number.isNaN(d.getTime()) || d.getTime() < Date.now() - 86400000) {
        return NextResponse.json({ error: "Date must be in the future" }, { status: 400 });
      }
    }

    const bunkerData = generateBunkerData(isNever, isNever ? undefined : date);
    const userAgent = (req.headers.get("user-agent") || "unknown").slice(0, 400);

    const row: Record<string, unknown> = {
      nationality,
      locale,
      predicted_date: isNever ? null : date,
      is_never: isNever,
      bunker_id: bunkerData.bunkerId,
      role: bunkerData.role,
      threat_level: bunkerData.threatLevel,
      rarity: bunkerData.rarity,
      user_agent: userAgent,
    };
    if (ip !== "unknown") row.ip_address = ip;
    if (userId) row.user_id = userId;

    const { error } = await supabase.from("predictions").insert(row);

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === "23505" && userId) {
        return NextResponse.json({ error: "already_voted" }, { status: 409 });
      }
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({
      prediction: {
        bunkerId: bunkerData.bunkerId,
        threatLevel: bunkerData.threatLevel,
        predictedDate: isNever ? null : date,
        isNever,
        nationality,
        locale,
      },
    });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const stats = await getSupabaseStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
