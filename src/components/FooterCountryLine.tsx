"use client";

import { t } from "@/lib/i18n";
import { STAT_ROWS } from "@/data/statRows";

/** Live country count + secondary CTA under brand expand. */
export function FooterCountryLine() {
  const countryCount = STAT_ROWS.length;
  const liveLabel = t("brand.footerCountriesLive", { count: countryCount });

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p
        className="inline-flex items-center justify-center gap-2 max-w-[22rem] sm:max-w-lg px-3 text-center font-mono text-[9px] sm:text-[10px] leading-snug tracking-[0.14em] uppercase"
        style={{ color: "#555555" }}
      >
        <span
          aria-hidden
          className="w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.55)]"
        />
        <span>{liveLabel}</span>
      </p>
      <p
        className="max-w-[22rem] sm:max-w-lg px-3 text-center font-mono text-[8px] sm:text-[9px] leading-snug tracking-[0.12em] uppercase"
        style={{ color: "#6b6b6b" }}
      >
        Konulara gir ve seçimini yap!
      </p>
    </div>
  );
}
