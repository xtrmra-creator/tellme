export type Locale =
  | "en"
  | "tr"
  | "de"
  | "fr"
  | "es"
  | "it"
  | "ru"
  | "pl"
  | "pt";

export type BunkerRole =
  | "doom_prophet"
  | "bunker_architect"
  | "cope_diplomat"
  | "supply_hoarder"
  | "shadow_strategist"
  | "frontline_meme_lord"
  | "neutral_observer";

export type ThreatLevel = "coffee" | "elevated" | "red" | "cosmic_cope";

export type Rarity = "common" | "classified" | "eyes_only";

export interface PredictionInput {
  locale: Locale;
  nationality: string; // Country code
  isNever: boolean;
  date?: string; // YYYY-MM-DD or "never"
}

export interface PredictionRecord {
  id: string;
  created_at: string;
  updated_at: string;
  nationality: string;
  locale: Locale;
  predicted_date?: string;
  is_never: boolean;
  bunker_id: string;
  role: BunkerRole;
  threat_level: ThreatLevel;
  rarity: Rarity;
  ip_address?: string;
  user_agent?: string;
}

export interface EmailRecord {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  prediction_id?: string;
  nationality?: string;
  locale: Locale;
  is_verified: boolean;
  verification_token?: string;
  verification_sent_at?: string;
  wants_updates: boolean;
  wants_alerts: boolean;
  ip_address?: string;
  user_agent?: string;
}

export interface CountryStat {
  countryCode: string;
  total: number;
  never: number;
  soonest?: string;
  latest?: string;
  medianYear?: number;
}

export interface StatsResponse {
  total: number;
  neverCount: number;
  neverRate: number;
  byCountry: CountryStat[];
  yearBuckets: { year: string; count: number }[];
  topDoomCountry?: string;
  topCopeCountry?: string;
}
