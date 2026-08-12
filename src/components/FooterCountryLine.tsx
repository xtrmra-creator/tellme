"use client";

import { t } from "@/lib/i18n";
import { useLiveCount } from "@/components/LiveVoteCounter";

const MIN_COUNTRIES = 3;

/** Live country reach under the brand expand line. */
export function FooterCountryLine() {
  const { byCountry } = useLiveCount();
  const countryCount = byCountry.filter(
    (row) =>
      row.total > 0 &&
      row.countryCode &&
      row.countryCode.toUpperCase() !== "OTHER",
  ).length;

  const label =
    countryCount >= MIN_COUNTRIES
      ? t("brand.footerCountries", { count: countryCount })
      : t("brand.footerCountriesFallback");

  return (
    <p
      className="inline-flex items-center justify-center gap-2 max-w-[20rem] sm:max-w-md px-3 text-center font-mono text-[9px] sm:text-[10px] leading-snug tracking-[0.14em] uppercase"
      style={{ color: "#555555" }}
    >
      <span
        aria-hidden
        className="w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.55)]"
      />
      <span>{label}</span>
    </p>
  );
}
