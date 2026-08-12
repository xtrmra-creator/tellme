import { promises as fs } from "fs";
import path from "path";
import {
  assignRarity,
  assignRole,
  assignThreat,
  generateBunkerId,
} from "./bunker";
import type {
  PredictionInput,
  PredictionRecord,
  StatsResponse,
  CountryStat,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PRED_FILE = path.join(DATA_DIR, "predictions.json");
const EMAIL_FILE = path.join(DATA_DIR, "emails.json");

async function ensureFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(PRED_FILE);
  } catch {
    await fs.writeFile(PRED_FILE, "[]", "utf8");
  }
  try {
    await fs.access(EMAIL_FILE);
  } catch {
    await fs.writeFile(EMAIL_FILE, "[]", "utf8");
  }
}

async function readPredictions(): Promise<PredictionRecord[]> {
  await ensureFiles();
  const raw = await fs.readFile(PRED_FILE, "utf8");
  return JSON.parse(raw) as PredictionRecord[];
}

async function writePredictions(rows: PredictionRecord[]) {
  await ensureFiles();
  await fs.writeFile(PRED_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function addPrediction(
  input: PredictionInput,
): Promise<PredictionRecord> {
  const role = assignRole(input.never, input.date);
  const record: PredictionRecord = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    role,
    threatLevel: assignThreat(input.never, input.date),
    rarity: assignRarity(role),
    bunkerId: generateBunkerId(input.countryCode),
  };

  const rows = await readPredictions();
  rows.push(record);
  await writePredictions(rows);

  if (input.email) {
    await saveEmail(input.email, record.id, input.locale, input.countryCode);
  }

  return record;
}

export async function saveEmail(
  email: string,
  predictionId: string,
  locale: string,
  countryCode: string,
) {
  await ensureFiles();
  const raw = await fs.readFile(EMAIL_FILE, "utf8");
  const rows = JSON.parse(raw) as Array<{
    email: string;
    predictionId: string;
    locale: string;
    countryCode: string;
    createdAt: string;
  }>;

  const normalized = email.trim().toLowerCase();
  if (!rows.some((r) => r.email === normalized)) {
    rows.push({
      email: normalized,
      predictionId,
      locale,
      countryCode,
      createdAt: new Date().toISOString(),
    });
    await fs.writeFile(EMAIL_FILE, JSON.stringify(rows, null, 2), "utf8");
  }
}

function median(nums: number[]): number | undefined {
  if (!nums.length) return undefined;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export async function getStats(): Promise<StatsResponse> {
  const rows = await readPredictions();
  const total = rows.length;
  const neverCount = rows.filter((r) => r.never).length;
  const neverRate = total ? neverCount / total : 0;

  const byCode = new Map<string, PredictionRecord[]>();
  for (const r of rows) {
    const list = byCode.get(r.countryCode) ?? [];
    list.push(r);
    byCode.set(r.countryCode, list);
  }

  const byCountry: CountryStat[] = [...byCode.entries()]
    .map(([countryCode, list]) => {
      const dated = list.filter((x) => !x.never && x.date).map((x) => x.date!);
      const years = dated.map((d) => new Date(d).getUTCFullYear());
      return {
        countryCode,
        total: list.length,
        never: list.filter((x) => x.never).length,
        soonest: dated.length ? dated.sort()[0] : undefined,
        latest: dated.length ? dated.sort().at(-1) : undefined,
        medianYear: median(years),
      };
    })
    .sort((a, b) => b.total - a.total);

  const yearMap = new Map<string, number>();
  for (const r of rows) {
    if (r.never || !r.date) continue;
    const y = String(new Date(r.date).getUTCFullYear());
    yearMap.set(y, (yearMap.get(y) ?? 0) + 1);
  }
  const yearBuckets = [...yearMap.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year));

  let topDoomCountry: string | undefined;
  let topCopeCountry: string | undefined;
  let bestDoom = -1;
  let bestCope = -1;

  for (const c of byCountry) {
    if (c.total < 3) continue;
    const doomRate = (c.total - c.never) / c.total;
    const copeRate = c.never / c.total;
    if (doomRate > bestDoom) {
      bestDoom = doomRate;
      topDoomCountry = c.countryCode;
    }
    if (copeRate > bestCope) {
      bestCope = copeRate;
      topCopeCountry = c.countryCode;
    }
  }

  return {
    total,
    neverCount,
    neverRate,
    byCountry,
    yearBuckets,
    topDoomCountry,
    topCopeCountry,
  };
}
