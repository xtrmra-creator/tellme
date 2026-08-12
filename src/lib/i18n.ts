import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import it from "@/locales/it.json";
import pl from "@/locales/pl.json";
import pt from "@/locales/pt.json";
import ru from "@/locales/ru.json";
import tr from "@/locales/tr.json";

export type Locale =
  | "en"
  | "tr"
  | "de"
  | "fr"
  | "es"
  | "ru"
  | "it"
  | "pl"
  | "pt";

/** Active locales users can switch to. */
export const ACTIVE_LOCALES: Locale[] = [
  "en",
  "tr",
  "de",
  "fr",
  "es",
  "ru",
  "it",
  "pl",
  "pt",
];

export const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  tr: "TR",
  de: "DE",
  fr: "FR",
  es: "ES",
  ru: "RU",
  it: "IT",
  pl: "PL",
  pt: "PT",
};

/** UI language → a country on the board, for share/dog-tag hooks. */
export const HOOK_COUNTRY_BY_LOCALE: Record<Locale, string> = {
  en: "US",
  tr: "TR",
  de: "DE",
  fr: "FR",
  es: "ES",
  ru: "RU",
  it: "IT",
  pl: "PL",
  pt: "PT",
};

export function hookCountryFromLocale(locale: Locale = getLocale()): string {
  return HOOK_COUNTRY_BY_LOCALE[locale] ?? "US";
}

const dictionaries: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  tr: tr as Record<string, unknown>,
  de: de as Record<string, unknown>,
  fr: fr as Record<string, unknown>,
  es: es as Record<string, unknown>,
  ru: ru as Record<string, unknown>,
  it: it as Record<string, unknown>,
  pl: pl as Record<string, unknown>,
  pt: pt as Record<string, unknown>,
};

const STORAGE_KEY = "wwtellme-locale";

let currentLocale: Locale = "en";

/**
 * Country → UI language. Only unambiguous official/majority matches.
 * Multilingual (CH, BE, CA) and unsupported languages (GR, BG, …) stay English.
 */
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  TR: "tr",
  DE: "de",
  AT: "de",
  LI: "de",
  FR: "fr",
  MC: "fr",
  ES: "es",
  MX: "es",
  AR: "es",
  CO: "es",
  CL: "es",
  PE: "es",
  VE: "es",
  EC: "es",
  GT: "es",
  CU: "es",
  BO: "es",
  PY: "es",
  UY: "es",
  CR: "es",
  PA: "es",
  DO: "es",
  HN: "es",
  SV: "es",
  NI: "es",
  IT: "it",
  SM: "it",
  PL: "pl",
  PT: "pt",
  BR: "pt",
  RU: "ru",
  BY: "ru",
};

export function localeFromCountryCode(code: string | null | undefined): Locale {
  if (!code) return "en";
  return COUNTRY_TO_LOCALE[code.toUpperCase()] ?? "en";
}

export function hasStoredLocale(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return !!(stored && isActiveLocale(stored));
  } catch {
    return false;
  }
}

/**
 * Stored choice if any, otherwise English.
 * IP guess is applied later and never overrides this.
 */
function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isActiveLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

/** Call once on client before first paint preference matters. Does not write storage. */
export function initLocaleFromStorage(): Locale {
  const next = detectInitialLocale();
  currentLocale = next;
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
  }
  return next;
}

/** Apply locale and persist the user's choice. */
export function setLocale(locale: Locale) {
  if (!(locale in dictionaries)) return;
  currentLocale = locale;
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }
}

export function getLocale(): Locale {
  return currentLocale;
}

export function isActiveLocale(code: string): code is Locale {
  return ACTIVE_LOCALES.includes(code as Locale);
}

function lookup(dict: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);
}

/**
 * Translate by dot-path key, e.g. t('home.tagline')
 * Optional `{name}` interpolation via vars.
 */
export function t(
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = dictionaries[currentLocale] ?? dictionaries.en;
  let value = lookup(dict, key);
  if (typeof value !== "string") {
    value = lookup(dictionaries.en, key);
  }
  if (typeof value !== "string") {
    return key;
  }
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`,
  );
}

export function getMonths(): { value: string; label: string }[] {
  return [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ].map((value) => ({ value, label: t(`months.${value}`) }));
}
