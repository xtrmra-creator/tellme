"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  hasStoredLocale,
  initLocaleFromStorage,
  isActiveLocale,
  localeFromCountryCode,
  setLocale as setModuleLocale,
  type Locale,
} from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  changeLanguage: (code: string) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  // Always start EN so SSR HTML matches the first client paint.
  // Stored language is applied after mount (avoids Next.js hydration "1 Issue").
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const restored = initLocaleFromStorage();
    if (restored !== "en") setLocaleState(restored);
  }, []);

  useEffect(() => {
    // User already picked a language → never guess from IP.
    if (hasStoredLocale()) return;

    let cancelled = false;
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data: { countryCode?: string | null }) => {
        if (cancelled || hasStoredLocale()) return;
        // No country → leave English unpersisted so we can retry next visit.
        if (!data?.countryCode) return;
        const guessed = localeFromCountryCode(data.countryCode);
        setModuleLocale(guessed);
        setLocaleState(guessed);
      })
      .catch(() => {
        /* stay on English */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setModuleLocale(next);
    setLocaleState(next);
  }, []);

  const changeLanguage = useCallback(
    (code: string) => {
      if (!isActiveLocale(code)) return;
      setLocale(code);
    },
    [setLocale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, changeLanguage }),
    [locale, setLocale, changeLanguage],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
