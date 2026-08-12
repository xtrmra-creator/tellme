import type { BunkerRole, Rarity, ThreatLevel } from "./types";

export function daysFromNow(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00Z").getTime();
  const now = Date.now();
  return Math.floor((target - now) / (1000 * 60 * 60 * 24));
}

export function assignRole(never: boolean, date?: string): BunkerRole {
  if (Math.random() < 0.05) return "shadow_strategist";
  if (never) return "cope_diplomat";
  if (!date) return "neutral_observer";

  const days = daysFromNow(date);
  if (days < 180) return "doom_prophet";
  if (days < 730) return "frontline_meme_lord";
  if (days < 1825) return "bunker_architect";
  if (days < 3650) return "supply_hoarder";
  return "neutral_observer";
}

export function assignThreat(never: boolean, date?: string): ThreatLevel {
  if (never) return "cosmic_cope";
  if (!date) return "coffee";
  const days = daysFromNow(date);
  if (days < 180) return "red";
  if (days < 730) return "elevated";
  return "coffee";
}

export function assignRarity(role: BunkerRole): Rarity {
  if (role === "shadow_strategist") return "eyes_only";
  if (Math.random() < 0.12) return "classified";
  return "common";
}

export function generateBunkerId(countryCode: string): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `WW-${countryCode}-${n}`;
}

export const ROLE_META: Record<
  BunkerRole,
  { color: string; accent: string }
> = {
  doom_prophet: { color: "#ff3b30", accent: "#ff6b63" },
  bunker_architect: { color: "#e8a317", accent: "#f0c14b" },
  cope_diplomat: { color: "#6b8f71", accent: "#9bbb9f" },
  supply_hoarder: { color: "#c47a3a", accent: "#e0a06a" },
  shadow_strategist: { color: "#7a9e9f", accent: "#b5d0d1" },
  frontline_meme_lord: { color: "#ff5c00", accent: "#ff8a4c" },
  neutral_observer: { color: "#8a8a8a", accent: "#b0b0b0" },
};
