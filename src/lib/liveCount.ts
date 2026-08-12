/**
 * Live participation counter.
 *
 * Cold start: UI always shows INITIAL_BASE_VOTES + real DB seals so the
 * counter never collapses when real traffic begins.
 *
 * TODO: Wire full Supabase Google + Apple OAuth (Google is partially live;
 * Apple sign-in still pending). Session should unlock stats and optionally
 * attribute seals to auth.users.
 */

/** Pre-launch / soft-launch base so the board never looks empty. */
export const INITIAL_BASE_VOTES = 20_000;

/** @deprecated Use INITIAL_BASE_VOTES */
export const LIVE_COUNT_BASE = INITIAL_BASE_VOTES;

export const LIVE_TICK_MS = 75_000;
/** Kept for server freeze helpers / bar merge threshold if needed. */
export const LIVE_REAL_MIN = 1000;
const EPOCH_MS = Date.UTC(2026, 7, 12, 0, 0, 0);

function incrementForTick(i: number): number {
  let x = ((i + 1) * 2654435761) >>> 0;
  x ^= x >>> 16;
  return 1 + (x % 2);
}

type TickCache = { ticks: number; count: number };
const tickCache: TickCache = { ticks: 0, count: INITIAL_BASE_VOTES };

/** Slow ambient climb from INITIAL_BASE_VOTES (+1–2 every LIVE_TICK_MS). */
export function simulatedCountAt(now = Date.now()): number {
  const ticks = Math.max(0, Math.floor((now - EPOCH_MS) / LIVE_TICK_MS));
  if (ticks < tickCache.ticks) {
    tickCache.ticks = 0;
    tickCache.count = INITIAL_BASE_VOTES;
  }
  while (tickCache.ticks < ticks) {
    tickCache.count += incrementForTick(tickCache.ticks);
    tickCache.ticks += 1;
  }
  return tickCache.count;
}

/**
 * Visible total = slow ambient base + real seals (never drops below base).
 */
export function displayLiveCount(
  realTotal: number | null,
  now = Date.now(),
  _serverFloor: number | null = null,
): {
  count: number;
  mode: "sim" | "real";
  simFloor: number;
} {
  const real =
    typeof realTotal === "number" && Number.isFinite(realTotal)
      ? Math.max(0, Math.floor(realTotal))
      : 0;
  const ambient = simulatedCountAt(now);
  return {
    count: ambient + real,
    mode: real > 0 ? "real" : "sim",
    simFloor: ambient,
  };
}

export type RealStatsSnapshot = {
  total: number;
  byCountry: { countryCode: string; total: number; never: number }[];
  simFloor: number | null;
};

export async function fetchRealStats(): Promise<RealStatsSnapshot | null> {
  try {
    const res = await fetch("/api/stats", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<RealStatsSnapshot>;
    if (typeof data.total !== "number") return null;
    return {
      total: data.total,
      byCountry: Array.isArray(data.byCountry) ? data.byCountry : [],
      simFloor:
        typeof data.simFloor === "number"
          ? data.simFloor
          : INITIAL_BASE_VOTES,
    };
  } catch {
    return null;
  }
}

export async function fetchRealPredictionTotal(): Promise<number | null> {
  const stats = await fetchRealStats();
  return stats?.total ?? null;
}
