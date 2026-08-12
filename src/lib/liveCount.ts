/** Seeded live counter: slow simulated ticks until real traffic takes over. */

export const LIVE_COUNT_BASE = 20417;
export const LIVE_TICK_MS = 35_000;
/** Real sealed forecasts at/above this → freeze sim, add real, then only real grows. */
export const LIVE_REAL_MIN = 1000;
const EPOCH_MS = Date.UTC(2026, 7, 12, 0, 0, 0);
const FREEZE_KEY = "wwtellme-live-sim-freeze";

function incrementForTick(i: number): number {
  let x = ((i + 1) * 2654435761) >>> 0;
  x ^= x >>> 16;
  return 1 + (x % 4);
}

type TickCache = { ticks: number; count: number };
const tickCache: TickCache = { ticks: 0, count: LIVE_COUNT_BASE };

export function simulatedCountAt(now = Date.now()): number {
  const ticks = Math.max(0, Math.floor((now - EPOCH_MS) / LIVE_TICK_MS));
  if (ticks < tickCache.ticks) {
    tickCache.ticks = 0;
    tickCache.count = LIVE_COUNT_BASE;
  }
  while (tickCache.ticks < ticks) {
    tickCache.count += incrementForTick(tickCache.ticks);
    tickCache.ticks += 1;
  }
  return tickCache.count;
}

function readFrozenSim(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FREEZE_KEY);
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeFrozenSim(value: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FREEZE_KEY, String(value));
  } catch {
    /* ignore */
  }
}

/** Snapshot the visible sim total once; later ticks must not move this. */
export function freezeSimAt(now = Date.now()): number {
  const existing = readFrozenSim();
  if (existing !== null) return existing;
  const current = simulatedCountAt(now);
  writeFrozenSim(current);
  return current;
}

export function displayLiveCount(
  realTotal: number | null,
  now = Date.now(),
  serverFloor: number | null = null,
): {
  count: number;
  mode: "sim" | "real";
  simFloor: number;
} {
  if (typeof realTotal === "number" && realTotal >= LIVE_REAL_MIN) {
    const frozen =
      serverFloor && serverFloor > 0 ? serverFloor : freezeSimAt(now);
    return { count: frozen + realTotal, mode: "real", simFloor: frozen };
  }
  const sim = simulatedCountAt(now);
  return { count: sim, mode: "sim", simFloor: sim };
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
      simFloor: typeof data.simFloor === "number" ? data.simFloor : null,
    };
  } catch {
    return null;
  }
}

export async function fetchRealPredictionTotal(): Promise<number | null> {
  const stats = await fetchRealStats();
  return stats?.total ?? null;
}
