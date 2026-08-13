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

/** Normalize callsign for share URLs / OG (always @prefix, no spaces collapse). */
export function normalizeShareHandle(raw?: string): string | undefined {
  if (!raw) return undefined;
  let h = raw.trim().replace(/\s+/g, " ");
  if (!h) return undefined;
  if (!h.startsWith("@")) h = `@${h}`;
  // Keep letters/numbers/_/./space/- for display names like "@Ali Veli"
  h = h.replace(/[^\p{L}\p{N}_.@ -]/gu, "");
  if (h === "@") return undefined;
  return clamp(h, 36);
}

/** Query keys kept short for Facebook / WhatsApp URL length limits. */
export function shareCardSearchParams(input: ShareCardInput): URLSearchParams {
  const q = new URLSearchParams();
  // `h` early — some crawlers/clients truncate long query strings from the end.
  const handle = normalizeShareHandle(input.handle);
  if (handle) q.set("h", handle);
  q.set("t", clamp(input.topicTitle, 64));
  q.set("p", clamp(input.prediction, 72));
  q.set("c", clamp(input.country, 40));
  q.set("r", String(Math.max(0, Math.min(100, Math.round(input.risk)))));
  if (input.isPeace) q.set("n", "1");
  // Always set locale — Facebook crawler ignores browser cookies/language.
  q.set("l", clamp(input.locale || "en", 5));
  // Bump when OG card design / meta locale changes so crawlers refresh.
  q.set("v", "5");
  return q;
}

export function buildSharePageUrl(input: ShareCardInput): string {
  return `${getSiteUrl()}/s?${shareCardSearchParams(input).toString()}`;
}

export function buildOgImageUrl(
  input: ShareCardInput,
  origin = getSiteUrl(),
): string {
  return `${origin}/api/og?${shareCardSearchParams(input).toString()}`;
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
