"use client";

import { t } from "@/lib/i18n";
import { useLiveCount } from "@/components/LiveVoteCounter";

const MIN_COUNTRIES = 3;

/** Subtle footer line: unique sealed countries, or open-world fallback. */
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
      className="text-[9px] md:text-[10px] font-mono tracking-[0.14em] uppercase leading-relaxed"
      style={{ color: "#555555" }}
    >
      {label}
    </p>
  );
}
