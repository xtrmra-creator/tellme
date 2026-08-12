/** Best-effort in-memory limit (serverless instances do not share this map). */

type Bucket = { times: number[] };
const buckets = new Map<string, Bucket>();

function prune(times: number[], windowMs: number, now: number) {
  return times.filter((t) => now - t < windowMs);
}

export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const prev = buckets.get(key) ?? { times: [] };
  const times = prune(prev.times, windowMs, now);
  if (times.length >= max) {
    buckets.set(key, { times });
    return false;
  }
  times.push(now);
  buckets.set(key, { times });
  return true;
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const raw =
    forwarded?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "";
  if (!raw || raw.length > 45) return "unknown";
  if (!/^[\d.a-fA-F:]+$/.test(raw)) return "unknown";
  return raw;
}
