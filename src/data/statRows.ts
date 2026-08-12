/** Country forecast bars. `pop` is population in millions (vote weight). */

export type StatRow = {
  flag: string;
  code: string;
  pop: number;
  risk: number;
  stable: number;
};

function nearSplit(code: string): { risk: number; stable: number } {
  const n = code.charCodeAt(0) + code.charCodeAt(1);
  const risk = 49 + (n % 3);
  return { risk, stable: 100 - risk };
}

const RAW: { flag: string; code: string; pop: number }[] = [
  { flag: "🇺🇸", code: "US", pop: 340 },
  { flag: "🇩🇪", code: "DE", pop: 84 },
  { flag: "🇹🇷", code: "TR", pop: 85 },
  { flag: "🇬🇧", code: "GB", pop: 68 },
  { flag: "🇷🇺", code: "RU", pop: 144 },
  { flag: "🇨🇳", code: "CN", pop: 1412 },
  { flag: "🇫🇷", code: "FR", pop: 68 },
  { flag: "🇮🇱", code: "IL", pop: 10 },
  { flag: "🇪🇸", code: "ES", pop: 48 },
  { flag: "🇮🇹", code: "IT", pop: 59 },
  { flag: "🇵🇱", code: "PL", pop: 37 },
  { flag: "🇵🇹", code: "PT", pop: 10 },
  { flag: "🇮🇳", code: "IN", pop: 1428 },
  { flag: "🇧🇷", code: "BR", pop: 216 },
  { flag: "🇯🇵", code: "JP", pop: 123 },
  { flag: "🇰🇷", code: "KR", pop: 52 },
  { flag: "🇺🇦", code: "UA", pop: 37 },
  { flag: "🇳🇱", code: "NL", pop: 18 },
  { flag: "🇸🇪", code: "SE", pop: 10 },
  { flag: "🇳🇴", code: "NO", pop: 6 },
  { flag: "🇫🇮", code: "FI", pop: 6 },
  { flag: "🇬🇷", code: "GR", pop: 10 },
  { flag: "🇷🇴", code: "RO", pop: 19 },
  { flag: "🇭🇺", code: "HU", pop: 10 },
  { flag: "🇨🇿", code: "CZ", pop: 11 },
  { flag: "🇦🇹", code: "AT", pop: 9 },
  { flag: "🇨🇭", code: "CH", pop: 9 },
  { flag: "🇧🇪", code: "BE", pop: 12 },
  { flag: "🇮🇪", code: "IE", pop: 5 },
  { flag: "🇨🇦", code: "CA", pop: 41 },
  { flag: "🇲🇽", code: "MX", pop: 130 },
  { flag: "🇦🇷", code: "AR", pop: 46 },
  { flag: "🇦🇺", code: "AU", pop: 27 },
  { flag: "🇸🇦", code: "SA", pop: 37 },
  { flag: "🇪🇬", code: "EG", pop: 114 },
  { flag: "🇿🇦", code: "ZA", pop: 63 },
  { flag: "🇮🇩", code: "ID", pop: 279 },
  { flag: "🇵🇰", code: "PK", pop: 241 },
  { flag: "🇮🇷", code: "IR", pop: 89 },
];

export const STAT_ROWS: StatRow[] = RAW.map((row) => ({
  ...row,
  ...nearSplit(row.code),
}));

export const STAT_POP_TOTAL = STAT_ROWS.reduce((sum, row) => sum + row.pop, 0);

export const STATS_PER_PAGE = 8;

export type CountryTally = { war: number; peace: number };

function hash32(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  return (x ^ (x >>> 16)) >>> 0;
}

const tallyCache: { count: number; tallies: CountryTally[] } = {
  count: 0,
  tallies: STAT_ROWS.map(() => ({ war: 0, peace: 0 })),
};

/** Deterministic: each vote lands on a random country + war/peace side. */
export function simTalliesForCount(count: number): CountryTally[] {
  const n = Math.max(0, Math.floor(count));
  if (n < tallyCache.count) {
    tallyCache.count = 0;
    tallyCache.tallies = STAT_ROWS.map(() => ({ war: 0, peace: 0 }));
  }
  const countries = STAT_ROWS.length;
  while (tallyCache.count < n) {
    const h = hash32(tallyCache.count * 0x9e3779b1);
    const idx = h % countries;
    const war = (h >>> 10) % 2 === 0;
    if (war) tallyCache.tallies[idx].war += 1;
    else tallyCache.tallies[idx].peace += 1;
    tallyCache.count += 1;
  }
  return tallyCache.tallies;
}

export function mergeTalliesWithReal(
  sim: CountryTally[],
  byCountry: { countryCode: string; total: number; never: number }[],
): CountryTally[] {
  const extra = new Map(
    byCountry.map((c) => [c.countryCode, c] as const),
  );
  return sim.map((row, i) => {
    const real = extra.get(STAT_ROWS[i].code);
    if (!real) return { ...row };
    return {
      war: row.war + Math.max(0, real.total - real.never),
      peace: row.peace + Math.max(0, real.never),
    };
  });
}

export function tallyToPercents(tally: CountryTally): {
  risk: number;
  stable: number;
  votes: number;
} {
  const votes = tally.war + tally.peace;
  if (votes < 1) return { risk: 50, stable: 50, votes: 0 };
  const risk = Math.round((tally.war / votes) * 100);
  return { risk, stable: 100 - risk, votes };
}
