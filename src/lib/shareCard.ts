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

/** Query keys kept short for Facebook / WhatsApp URL length limits. */
export function shareCardSearchParams(input: ShareCardInput): URLSearchParams {
  const q = new URLSearchParams();
  q.set("t", clamp(input.topicTitle, 64));
  q.set("p", clamp(input.prediction, 72));
  q.set("c", clamp(input.country, 40));
  q.set("r", String(Math.max(0, Math.min(100, Math.round(input.risk)))));
  if (input.handle?.trim()) q.set("h", clamp(input.handle.trim(), 28));
  if (input.isPeace) q.set("n", "1");
  if (input.locale) q.set("l", clamp(input.locale, 5));
  // Bump when OG card design changes so crawlers skip stale caches.
  q.set("v", "2");
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
    handle: get("h") ? clamp(get("h"), 28) : undefined,
    isPeace: get("n") === "1",
    locale: get("l") || undefined,
  };
}
