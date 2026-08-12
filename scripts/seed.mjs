import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");
const PRED_FILE = path.join(DATA_DIR, "predictions.json");

const countries = [
  "TR", "US", "DE", "FR", "GB", "RU", "CN", "IN", "BR", "JP",
  "KR", "IT", "ES", "PL", "UA", "NL", "AR", "CA", "MX", "IL",
];

const roles = [
  "doom_prophet",
  "bunker_architect",
  "cope_diplomat",
  "supply_hoarder",
  "shadow_strategist",
  "frontline_meme_lord",
  "neutral_observer",
];

const threats = ["coffee", "elevated", "red", "cosmic_cope"];
const rarities = ["common", "classified", "eyes_only"];
const locales = ["en", "tr", "de", "fr", "es", "it", "ru"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate() {
  const year = 2026 + Math.floor(Math.random() * 12);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const rows = [];
const COUNT = 240;

for (let i = 0; i < COUNT; i++) {
  const countryCode = pick(countries);
  const never = Math.random() < 0.22;
  const date = never ? undefined : randomDate();
  const role = never
    ? Math.random() < 0.08
      ? "shadow_strategist"
      : "cope_diplomat"
    : pick(roles.filter((r) => r !== "cope_diplomat"));

  rows.push({
    id: randomUUID(),
    locale: pick(locales),
    countryCode,
    never,
    date,
    createdAt: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString(),
    role,
    threatLevel: never ? "cosmic_cope" : pick(threats.filter((t) => t !== "cosmic_cope")),
    rarity: role === "shadow_strategist" ? "eyes_only" : pick(rarities),
    bunkerId: `WW-${countryCode}-${1000 + Math.floor(Math.random() * 9000)}`,
  });
}

await fs.mkdir(DATA_DIR, { recursive: true });
await fs.writeFile(PRED_FILE, JSON.stringify(rows, null, 2), "utf8");
await fs.writeFile(path.join(DATA_DIR, "emails.json"), "[]", "utf8");
console.log(`Seeded ${COUNT} predictions → data/predictions.json`);
