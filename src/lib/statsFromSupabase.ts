import { getSupabaseServer } from "@/lib/supabaseServer";
import {
  LIVE_REAL_MIN,
  simulatedCountAt,
} from "@/lib/liveCount";

export type PublicPrediction = {
  nationality: string;
  is_never: boolean;
  predicted_date: string | null;
  created_at: string;
};

async function readPredictions(): Promise<PublicPrediction[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  const cols = "nationality, is_never, predicted_date, created_at";
  const fromView = await supabase.from("predictions_public").select(cols);
  if (!fromView.error && fromView.data) {
    return fromView.data as PublicPrediction[];
  }

  const fromTable = await supabase.from("predictions").select(cols);
  if (fromTable.error || !fromTable.data) return [];
  return fromTable.data as PublicPrediction[];
}

async function readOrFreezeSimFloor(realTotal: number): Promise<number | null> {
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const existing = await supabase
    .from("live_counter_state")
    .select("sim_floor")
    .eq("id", 1)
    .maybeSingle();

  if (existing.data?.sim_floor) return existing.data.sim_floor as number;

  if (realTotal < LIVE_REAL_MIN) return null;

  const floor = simulatedCountAt();
  const { error } = await supabase.from("live_counter_state").upsert({
    id: 1,
    sim_floor: floor,
    frozen_at: new Date().toISOString(),
  });
  if (error) return floor;
  return floor;
}

export async function getSupabaseStats() {
  const predictions = await readPredictions();
  const total = predictions.length;
  const neverCount = predictions.filter((p) => p.is_never).length;
  const neverRate = total ? (neverCount / total) * 100 : 0;

  const byCountryMap = predictions.reduce(
    (acc: Record<string, { total: number; never: number }>, pred) => {
      const code = pred.nationality || "OTHER";
      if (!acc[code]) acc[code] = { total: 0, never: 0 };
      acc[code].total += 1;
      if (pred.is_never) acc[code].never += 1;
      return acc;
    },
    {},
  );

  const byCountry = Object.entries(byCountryMap).map(
    ([countryCode, stats]) => ({
      countryCode,
      total: stats.total,
      never: stats.never,
    }),
  );

  const simFloor = await readOrFreezeSimFloor(total);

  return {
    total,
    neverCount,
    neverRate,
    byCountry,
    simFloor,
  };
}
