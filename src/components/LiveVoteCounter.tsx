"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import {
  displayLiveCount,
  fetchRealStats,
  type RealStatsSnapshot,
} from "@/lib/liveCount";

export function useLiveCount() {
  const [realStats, setRealStats] = useState<RealStatsSnapshot | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const pull = () => {
      void fetchRealStats().then((n) => {
        if (!cancelled && n !== null) setRealStats(n);
      });
    };
    pull();
    const statsTimer = setInterval(pull, 60_000);
    const tickTimer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelled = true;
      clearInterval(statsTimer);
      clearInterval(tickTimer);
    };
  }, []);

  return {
    ...displayLiveCount(realStats?.total ?? null, now),
    byCountry: realStats?.byCountry ?? [],
  };
}

export function LiveVoteCounter() {
  const { locale } = useLocale();
  const { count } = useLiveCount();
  const formatted = count.toLocaleString(locale);

  return (
    <div
      className="flex flex-col items-center text-center shrink-0"
      title={t("home.liveCount", { count: formatted })}
    >
      <div className="flex items-center gap-2 text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        <span className="font-mono text-xl md:text-2xl tabular-nums tracking-wide leading-none">
          {formatted}
        </span>
      </div>
      <span className="mt-1 text-[9px] md:text-[10px] font-mono tracking-[0.14em] uppercase text-zinc-500">
        {t("home.liveCountLabel")}
      </span>
    </div>
  );
}
