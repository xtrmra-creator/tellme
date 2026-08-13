/** Site origin helper (split so shareCard can import without circular share.ts). */

export function getSiteUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  return "https://wwtellme.com";
}
