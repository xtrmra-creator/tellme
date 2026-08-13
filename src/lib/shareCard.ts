import { getSiteUrl } from "@/lib/shareSite";

export type ShareCardInput = {
  topicTitle: string;
  prediction: string;
  handle?: string;
  country: string;
  risk: number;
  isPeace?: boolean;
  locale?: string;
};

function clamp(s: string, n: number): string {
  const t = s.trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1)}…`;
}

/** Normalize callsign for share URLs / OG (always @prefix). */
export function normalizeShareHandle(raw?: string): string | undefined {
  if (!raw) return undefined;
  let h = raw.trim().replace(/\s+/g, " ");
  if (!h) return undefined;
  if (!h.startsWith("@")) h = `@${h}`;
  h = h.replace(/[^\p{L}\p{N}_.@ -]/gu, "");
  if (h === "@") return undefined;
  return clamp(h, 36);
}

type WireCard = {
  h?: string;
  t: string;
  p: string;
  c: string;
  r: number;
  l: string;
  n?: 1;
};

function toBase64Url(json: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  // Browser
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(d: string): string | null {
  try {
    const pad = d.length % 4 === 0 ? "" : "=".repeat(4 - (d.length % 4));
    const b64 = d.replace(/-/g, "+").replace(/_/g, "/") + pad;
    if (typeof Buffer !== "undefined") {
      return Buffer.from(b64, "base64").toString("utf8");
    }
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeShareCard(input: ShareCardInput): string {
  const wire: WireCard = {
    t: clamp(input.topicTitle, 64),
    p: clamp(input.prediction, 72),
    c: clamp(input.country, 40),
    r: Math.max(0, Math.min(100, Math.round(input.risk))),
    l: clamp(input.locale || "en", 5),
  };
  const handle = normalizeShareHandle(input.handle);
  if (handle) wire.h = handle;
  if (input.isPeace) wire.n = 1;
  return toBase64Url(JSON.stringify(wire));
}

export function decodeShareCard(d: string): ShareCardInput | null {
  const json = fromBase64Url(d.trim());
  if (!json) return null;
  try {
    const wire = JSON.parse(json) as WireCard;
    if (!wire || typeof wire.t !== "string") return null;
    return {
      topicTitle: clamp(wire.t || "WWtellme", 64),
      prediction: clamp(wire.p || "—", 72),
      country: clamp(wire.c || "World", 40),
      risk: Number.isFinite(wire.r)
        ? Math.max(0, Math.min(100, Number(wire.r)))
        : 50,
      handle: normalizeShareHandle(wire.h),
      isPeace: wire.n === 1,
      locale: wire.l ? clamp(String(wire.l), 5) : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Compact share query: single `d` payload.
 * Avoids Facebook native sharer stripping `&`-separated params when nested.
 */
export function shareCardSearchParams(input: ShareCardInput): URLSearchParams {
  const q = new URLSearchParams();
  q.set("d", encodeShareCard(input));
  q.set("v", "6");
  return q;
}

export function buildSharePageUrl(input: ShareCardInput): string {
  return `${getSiteUrl()}/s?${shareCardSearchParams(input).toString()}`;
}

export function buildOgImageUrl(
  input: ShareCardInput,
  origin = getSiteUrl(),
  opts?: { format?: "og" | "ig" },
): string {
  const q = shareCardSearchParams(input);
  if (opts?.format === "ig") q.set("fmt", "ig");
  return `${origin}/api/og?${q.toString()}`;
}

export function parseShareCardParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): ShareCardInput {
  const get = (key: string): string => {
    if (params instanceof URLSearchParams) return params.get(key) ?? "";
    const v = params[key];
    if (Array.isArray(v)) return v[0] ?? "";
    return v ?? "";
  };

  const packed = get("d");
  if (packed) {
    const decoded = decodeShareCard(packed);
    if (decoded) return decoded;
  }

  // Legacy flat query (pre-v6) for old links / debugger
  const riskRaw = Number(get("r"));
  return {
    topicTitle: clamp(get("t") || "WWtellme", 64),
    prediction: clamp(get("p") || "—", 72),
    country: clamp(get("c") || "World", 40),
    risk: Number.isFinite(riskRaw) ? Math.max(0, Math.min(100, riskRaw)) : 50,
    handle: normalizeShareHandle(get("h") || get("handle")),
    isPeace: get("n") === "1",
    locale: get("l") || undefined,
  };
}
