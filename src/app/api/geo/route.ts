import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

function isIsoCountry(code: string): boolean {
  return /^[A-Z]{2}$/.test(code);
}

export async function GET(req: Request) {
  try {
    const ipKey = clientIp(req);
    if (!rateLimit(`geo:${ipKey}`, 30, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const headerCountry = (
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      ""
    )
      .trim()
      .toUpperCase();

    if (isIsoCountry(headerCountry) && headerCountry !== "XX") {
      return NextResponse.json({
        countryCode: headerCountry,
        source: "header",
      });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "";

    // Local / private IPs → no reliable geo
    if (
      !ip ||
      ip === "::1" ||
      ip.startsWith("127.") ||
      ip.startsWith("10.") ||
      ip.startsWith("192.168.")
    ) {
      return NextResponse.json({ countryCode: null, source: "local" });
    }

    const res = await fetch(`https://ipapi.co/${ip}/country/`, {
      headers: { "User-Agent": "WWtellme-local/0.1" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ countryCode: null, source: "lookup_failed" });
    }

    const code = (await res.text()).trim().toUpperCase();
    if (!isIsoCountry(code)) {
      return NextResponse.json({ countryCode: null, source: "lookup_failed" });
    }

    return NextResponse.json({
      countryCode: code,
      source: "ip",
    });
  } catch {
    return NextResponse.json({ countryCode: null, source: "error" });
  }
}
