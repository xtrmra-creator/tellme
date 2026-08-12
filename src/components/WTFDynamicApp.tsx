// @ts-nocheck
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getMonths, hookCountryFromLocale, t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import { buildSharePayload, shareTo, type SharePlatform } from "@/lib/share";
import {
  STAT_ROWS,
  STATS_PER_PAGE,
  mergeTalliesWithReal,
  simTalliesForCount,
  tallyToPercents,
} from "@/data/statRows";
import { useLiveCount } from "@/components/LiveVoteCounter";
import { signInWithGoogle, supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  saveSealResume,
  clearSealResume,
  loadAnySeal,
} from "@/lib/sealResume";

const DAYS = Array.from({ length: 31 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const YEARS = Array.from({ length: 20 }, (_, i) => String(2026 + i));

export default function WTFDynamicApp({ topic, resume = null }) {
  const { locale } = useLocale();
  const MONTHS = getMonths();
  const initialResume = loadAnySeal() ?? resume ?? null;

  const [userHandle, setUserHandle] = useState(initialResume?.userHandle ?? "");
  const [handleFocused, setHandleFocused] = useState(false);

  const [selectedOpt, setSelectedOpt] = useState(() =>
    initialResume?.optionId
      ? (topic.options.find((o) => o.id === initialResume.optionId) ?? null)
      : null,
  );

  const [step, setStep] = useState(
    initialResume?.step === "result" ? "result" : "initial",
  );
  const [day, setDay] = useState(initialResume?.day ?? "01");
  const [month, setMonth] = useState(initialResume?.month ?? "10");
  const [year, setYear] = useState(initialResume?.year ?? "2027");

  const [isUnlockedWithData, setIsUnlockedWithData] = useState(false);
  const [isBadgeOnly, setIsBadgeOnly] = useState(false);

  const [emailInput, setEmailInput] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [notifyAiTopic, setNotifyAiTopic] = useState(
    initialResume?.notifyAiTopic ?? false,
  );
  const [statsPage, setStatsPage] = useState(0);
  const [nationality, setNationality] = useState(
    () => initialResume?.nationality || hookCountryFromLocale(locale),
  );
  const sealedRef = useRef(initialResume?.step === "result");
  const skipLocaleNationality = useRef(Boolean(initialResume?.nationality));
  const [voteLocked, setVoteLocked] = useState(() =>
    Boolean(initialResume?.step === "result"),
  );
  const { mode: liveMode, simFloor, byCountry } = useLiveCount();

  const applyExistingPrediction = (pred) => {
    if (!pred) return;
    const warOpt = topic.options.find((o) => o.type === "negative") ?? null;
    const peaceOpt = topic.options.find((o) => o.type === "positive") ?? null;
    if (pred.isNever) {
      setSelectedOpt(peaceOpt);
    } else {
      setSelectedOpt(warOpt);
      const raw = String(pred.predictedDate || "").slice(0, 10);
      const [y, m, d] = raw.split("-");
      if (y) setYear(y);
      if (m) setMonth(m);
      if (d) setDay(d);
    }
    if (pred.nationality) setNationality(pred.nationality);
    setStep("result");
    setIsUnlockedWithData(true);
    setIsBadgeOnly(false);
    sealedRef.current = true;
    setVoteLocked(true);
    skipLocaleNationality.current = true;
    saveSealResume({
      topicId: "ww3",
      step: "result",
      optionId: pred.isNever ? "nowar" : "war",
      day: pred.isNever
        ? "01"
        : String(pred.predictedDate || "").slice(8, 10) || "01",
      month: pred.isNever
        ? "10"
        : String(pred.predictedDate || "").slice(5, 7) || "10",
      year: pred.isNever
        ? "2027"
        : String(pred.predictedDate || "").slice(0, 4) || "2027",
      nationality: pred.nationality || hookCountryFromLocale(locale),
      userHandle: userHandle,
      notifyAiTopic,
    });
  };

  const liveTallies = useMemo(() => {
    const sim = simTalliesForCount(simFloor);
    if (liveMode !== "real") return sim;
    return mergeTalliesWithReal(sim, byCountry);
  }, [simFloor, liveMode, byCountry]);

  const sortedStatRows = useMemo(() => {
    return STAT_ROWS.map((row, i) => {
      const { risk, stable, votes } = tallyToPercents(liveTallies[i]);
      return { ...row, risk, stable, votes };
    }).sort((a, b) =>
      t(`dynamic.statCountries.${a.code}`).localeCompare(
        t(`dynamic.statCountries.${b.code}`),
        locale,
        { sensitivity: "base" },
      ),
    );
  }, [locale, liveTallies]);

  const statsPageCount = Math.max(
    1,
    Math.ceil(sortedStatRows.length / STATS_PER_PAGE),
  );

  const pagedStatRows = useMemo(() => {
    const start = statsPage * STATS_PER_PAGE;
    return sortedStatRows.slice(start, start + STATS_PER_PAGE);
  }, [sortedStatRows, statsPage]);

  useEffect(() => {
    setStatsPage(0);
    if (skipLocaleNationality.current) {
      skipLocaleNationality.current = false;
      return;
    }
    setNationality(hookCountryFromLocale(locale));
  }, [locale]);

  useEffect(() => {
    if (statsPage > statsPageCount - 1) setStatsPage(0);
  }, [statsPage, statsPageCount]);

  const handleOptionClick = (opt) => {
    if (voteLocked) return;
    setSelectedOpt(opt);
    if (opt.type === "positive") {
      setStep("country");
    } else {
      setStep("calendar");
    }
  };

  const handleResetChoice = () => {
    if (voteLocked) return;
    setStep("initial");
    setSelectedOpt(null);
    setIsUnlockedWithData(false);
    setIsBadgeOnly(false);
    sealedRef.current = false;
    clearSealResume();
  };

  const sealForecast = () => {
    if (voteLocked) return;
    setStep("result");
  };

  const formattedDate = `${day} ${MONTHS.find((m) => m.value === month)?.label} ${year}`;
  const isEmailValid = emailInput.includes("@") && emailInput.includes(".");
  const isLocked = step === "result" && !isUnlockedWithData && !isBadgeOnly;
  // Dog-tag + share live preview as soon as the prediction is sealed
  const showBadge = step === "result";

  const displayHandle = userHandle.trim()
    ? userHandle.startsWith("@")
      ? userHandle
      : `@${userHandle}`
    : t("dynamic.displayNamePlaceholder");

  const hasCustomHandle = Boolean(userHandle.trim());

  const predictionLabel =
    selectedOpt?.type === "positive"
      ? t("dynamic.peaceLine")
      : formattedDate;

  const hookCode =
    STAT_ROWS.some((row) => row.code === nationality)
      ? nationality
      : hookCountryFromLocale(locale);
  const hookIdx = STAT_ROWS.findIndex((row) => row.code === hookCode);
  const hookTally = tallyToPercents(
    liveTallies[hookIdx] ?? { war: 1, peace: 1 },
  );
  const hookCountryName = t(`dynamic.statCountries.${hookCode}`);

  const countryOptions = useMemo(
    () =>
      [...STAT_ROWS].sort((a, b) =>
        t(`dynamic.statCountries.${a.code}`).localeCompare(
          t(`dynamic.statCountries.${b.code}`),
          locale,
          { sensitivity: "base" },
        ),
      ),
    [locale],
  );

  useEffect(() => {
    if (step !== "result" || sealedRef.current || !selectedOpt) return;
    sealedRef.current = true;
    setVoteLocked(true);
    const isNever = selectedOpt.type === "positive";
    void (async () => {
      let authHeader = {};
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (token) authHeader = { Authorization: `Bearer ${token}` };
      }
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          locale,
          nationality,
          isNever,
          date: isNever ? undefined : `${year}-${month}-${day}`,
        }),
      }).catch(() => null);
      if (res?.status === 409) {
        const body = await res.json().catch(() => null);
        if (body?.prediction) applyExistingPrediction(body.prediction);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedOpt, locale, nationality, year, month, day]);

  const submitEmailAndUnlock = () => {
    setIsUnlockedWithData(true);
    if (!isEmailValid) return;
    void fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.trim(),
        nationality,
        locale,
        wantsUpdates: notifyAiTopic,
      }),
    }).catch(() => {
      /* unlock anyway */
    });
  };

  const persistSealResume = () => {
    if (!selectedOpt) return;
    saveSealResume({
      topicId: "ww3",
      step: "result",
      optionId: selectedOpt.id,
      day,
      month,
      year,
      nationality,
      userHandle,
      notifyAiTopic,
    });
  };

  const handleGoogleSignIn = () => {
    persistSealResume();
    void signInWithGoogle().catch(() => {
      /* OAuth not configured or blocked */
    });
  };

  useEffect(() => {
    if (step !== "result" || !selectedOpt) return;
    persistSealResume();
    // persistSealResume closes over latest fields
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedOpt, day, month, year, nationality, userHandle, notifyAiTopic]);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const loadMine = async (accessToken) => {
      try {
        const res = await fetch("/api/predictions/mine", {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
        if (!res.ok || cancelled) return;
        const body = await res.json();
        if (!cancelled && body?.prediction) {
          applyExistingPrediction(body.prediction);
        } else if (!cancelled) {
          setIsUnlockedWithData(true);
        }
      } catch {
        if (!cancelled) setIsUnlockedWithData(true);
      }
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session?.access_token) {
        void loadMine(data.session.access_token);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.access_token) return;
      void loadMine(session.access_token);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = (platform: SharePlatform) => {
    const payload = buildSharePayload({
      topicTitle: topic.title,
      prediction: predictionLabel,
      handle: userHandle.trim() ? displayHandle : undefined,
      country: hookCountryName,
      risk: hookTally.risk,
      isPeace: selectedOpt?.type === "positive",
    });
    void shareTo(platform, payload);
  };

  const faceSelect = ({ value, display, onChange, children, className = "" }) => (
    <div
      className={`relative flex min-w-0 items-stretch overflow-hidden rounded-xl border border-zinc-700 bg-black focus-within:border-amber-500 ${className}`}
    >
      <span className="pointer-events-none flex-1 truncate py-3 pl-2 text-center font-mono text-sm text-white">
        {display}
      </span>
      <span
        aria-hidden
        className="pointer-events-none flex w-7 shrink-0 items-center justify-center text-[8px] leading-none text-zinc-500"
      >
        ▼
      </span>
      <select
        value={value}
        onChange={onChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        {children}
      </select>
    </div>
  );

  const nationalitySelect = (
    <div className="w-full max-w-xs mx-auto">
      {faceSelect({
        value: nationality,
        display: `${
          countryOptions.find((row) => row.code === nationality)?.flag ?? ""
        } ${t(`dynamic.statCountries.${nationality}`)}`,
        onChange: (e) => setNationality(e.target.value),
        children: countryOptions.map((row) => (
          <option key={row.code} value={row.code}>
            {row.flag} {t(`dynamic.statCountries.${row.code}`)}
          </option>
        )),
      })}
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 relative">
      {step !== "result" && (
        <div className="p-8 border border-zinc-800 bg-zinc-900/30 flex flex-col gap-6 text-center relative rounded-3xl">
          {step !== "initial" && (
            <button
              onClick={handleResetChoice}
              className="absolute top-6 left-6 text-[10px] font-mono tracking-wide text-zinc-500 hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {t("dynamic.back")}
            </button>
          )}

          <span className="text-[10px] font-mono text-amber-500 tracking-wide mt-4">
            {t("dynamic.boardTitle")}
          </span>
          <h2 className="text-3xl font-light text-white">{topic.title}</h2>
          <p className="text-zinc-400 text-xs max-w-lg mx-auto">
            {topic.description}
          </p>

          {step === "initial" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {topic.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleOptionClick(opt)}
                  className={`py-4 px-6 text-xs font-bold tracking-wide transition-all rounded-2xl border cursor-pointer ${
                    opt.type === "positive"
                      ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-black shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                      : "bg-red-950/30 border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]"
                  }`}
                >
                  ⚡ {opt.label}
                </button>
              ))}
            </div>
          )}

          {step === "calendar" && (
            <div className="flex flex-col items-center gap-5 mt-2 animate-in fade-in duration-300">
              <span className="text-xs text-amber-500 font-mono tracking-wide mb-1">
                {t("dynamic.myPrediction")}
              </span>

              <div className="flex flex-col gap-2 w-full max-w-md sm:flex-row sm:gap-3">
                <div className="flex gap-2 min-w-0 sm:contents">
                  <div className="min-w-0 flex-1">
                    {faceSelect({
                      value: day,
                      display: day,
                      onChange: (e) => setDay(e.target.value),
                      children: DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      )),
                    })}
                  </div>
                  <div className="min-w-0 flex-[1.7] sm:flex-[2]">
                    {faceSelect({
                      value: month,
                      display:
                        MONTHS.find((m) => m.value === month)?.label ?? month,
                      onChange: (e) => setMonth(e.target.value),
                      children: MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      )),
                    })}
                  </div>
                </div>
                <div className="w-full sm:min-w-[8rem] sm:w-auto sm:flex-[1.25]">
                  {faceSelect({
                    value: year,
                    display: year,
                    onChange: (e) => setYear(e.target.value),
                    children: YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    )),
                  })}
                </div>
              </div>

              <span className="text-xs text-zinc-500 font-mono tracking-wide">
                {t("dynamic.yourCountry")}
              </span>
              {nationalitySelect}

              <button
                onClick={sealForecast}
                className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 mt-2 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                {t("dynamic.seal")}
              </button>
            </div>
          )}

          {step === "country" && (
            <div className="flex flex-col items-center gap-5 mt-2 animate-in fade-in duration-300">
              <span className="text-xs text-amber-500 font-mono tracking-wide mb-1">
                {t("dynamic.yourCountry")}
              </span>
              {nationalitySelect}
              <button
                onClick={sealForecast}
                className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 mt-2 rounded-xl text-xs font-bold tracking-wide cursor-pointer transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                {t("dynamic.seal")}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative p-8 border border-zinc-800 bg-zinc-900/10 min-h-[400px] flex flex-col justify-center items-center rounded-3xl overflow-visible">
        {step === "result" && !voteLocked && (
          <button
            onClick={handleResetChoice}
            className="absolute top-6 left-6 z-30 text-[10px] font-mono tracking-wide text-zinc-500 hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
          >
            {t("dynamic.back")}
          </button>
        )}

        {step !== "result" && (
          <div className="absolute inset-0 z-20 bg-black/5 backdrop-blur-[1px] pointer-events-none rounded-3xl"></div>
        )}

        {showBadge && (
          <div
            className={`relative z-30 flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-700 ${
              !isBadgeOnly ? "mb-8" : ""
            } w-full`}
          >
            <div className="flex flex-col items-center gap-1 text-center pt-4">
              <span className="text-xs text-red-500 font-mono tracking-wide">
                {t("dynamic.sealed")}
              </span>
              <p className="text-[10px] text-red-500/90 font-mono max-w-xs leading-relaxed">
                {t("dynamic.sealedHint")}
              </p>
            </div>

            <div className="relative w-full max-w-[300px]">
              <input
                type="text"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                onFocus={() => setHandleFocused(true)}
                onBlur={() => setHandleFocused(false)}
                placeholder={
                  handleFocused || userHandle.trim()
                    ? t("dynamic.displayNamePlaceholder")
                    : ""
                }
                className="w-full bg-black/90 border border-zinc-700 rounded-2xl text-amber-400 p-3 text-xs font-mono text-center outline-none focus:border-amber-500 shadow-xl placeholder:text-zinc-600 caret-amber-500"
              />
              {!userHandle.trim() && !handleFocused && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 flex items-center justify-center px-3"
                >
                  <span className="flex items-center max-w-full text-xs font-mono text-zinc-600">
                    <span className="idle-input-caret mr-0.5 inline-block h-[0.9em] w-px shrink-0 self-center bg-amber-500/80" />
                    <span className="truncate">
                      {t("dynamic.displayNamePlaceholder")}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div className="relative w-full max-w-[300px] aspect-[1/1.618] bg-gradient-to-b from-[#121212] to-black rounded-[2.5rem] border border-zinc-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-clip flex flex-col pt-4 font-mono">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full border border-zinc-700/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 blur-[40px] pointer-events-none"></div>

              <div className="px-6 py-4 mt-2 flex justify-end items-center z-10 border-b border-zinc-900/50">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <span className="text-[8px] text-amber-500/80 tracking-[0.25em]">
                    {t("dynamic.verified")}
                  </span>
                </div>
              </div>

              <div className="flex-1 px-6 py-4 flex flex-col justify-center gap-4 z-10">
                <div className="flex flex-col gap-1 text-center">
                  <span className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">
                    {t("dynamic.tagSignature")}
                  </span>
                  <span
                    className={`text-center px-1 leading-snug ${
                      hasCustomHandle
                        ? "text-lg text-amber-400 font-bold tracking-[0.15em] uppercase"
                        : "text-xs font-mono font-normal tracking-wide text-zinc-600 normal-case"
                    }`}
                  >
                    {displayHandle}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-center">
                  <span className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">
                    {t("dynamic.threatTitle")}
                  </span>
                  <span className="text-xs text-white uppercase tracking-[0.15em] leading-relaxed font-bold">
                    {topic.title}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-center">
                  <span className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">
                    {t("dynamic.myGuess")}
                  </span>
                  <span
                    className={`text-xs font-bold tracking-[0.15em] uppercase ${
                      selectedOpt?.type === "positive"
                        ? "text-emerald-400"
                        : "text-amber-500"
                    }`}
                  >
                    {selectedOpt?.type === "positive"
                      ? t("dynamic.peaceLine")
                      : formattedDate}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 mt-1">
                  <span className="text-[9px] text-zinc-500 tracking-[0.2em] uppercase">
                    {t("dynamic.worldSays")}
                  </span>
                  <span className="text-[11px] text-zinc-200 font-bold tracking-wide text-center leading-tight">
                    {hookCountryName} %{hookTally.risk} {t("dynamic.statRisk")}
                  </span>

                  <div className="w-full px-4 mt-1 flex items-center gap-1.5">
                    <span className="text-[8px] text-red-400/80 font-bold tabular-nums">
                      {hookTally.risk}
                    </span>
                    <div className="w-full h-[3px] bg-zinc-800 rounded-full flex overflow-hidden shadow-inner">
                      <div
                        className="bg-red-600"
                        style={{ width: `${hookTally.risk}%` }}
                      ></div>
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${hookTally.stable}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] text-emerald-400/80 font-bold tabular-nums">
                      {hookTally.stable}
                    </span>
                  </div>

                  <span className="text-[9px] text-amber-500/90 tracking-wide text-center leading-snug px-3 mt-1">
                    {t("dynamic.shareHookAsk")}
                  </span>
                  <span className="text-[9px] text-zinc-500 tracking-[0.25em] uppercase mt-1">
                    WWTELLME.COM
                  </span>
                </div>
              </div>

              <div className="px-4 py-3 z-10 flex flex-col items-center justify-center gap-1 border-t border-zinc-900/50 bg-black/40">
                <span className="text-zinc-600 text-[8px] tracking-[0.2em] select-none opacity-60 uppercase font-bold text-center">
                  W&nbsp;O&nbsp;R&nbsp;L&nbsp;D&nbsp;&nbsp;&nbsp;&nbsp;W&nbsp;O&nbsp;R&nbsp;L&nbsp;D&nbsp;&nbsp;&nbsp;&nbsp;T&nbsp;E&nbsp;L&nbsp;L&nbsp;&nbsp;&nbsp;&nbsp;M&nbsp;E
                </span>
                <span className="text-zinc-700 text-[7px] select-none tracking-[0.25em]">
                  WW-SYS-992026
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-1.5 w-full max-w-[340px] flex-wrap">
              <button
                type="button"
                onClick={() => handleShare("x")}
                title="X (Twitter)"
                className="w-9 h-9 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-zinc-400 text-zinc-400 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleShare("instagram")}
                title="Instagram"
                className="w-9 h-9 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-pink-500/50 text-zinc-400 hover:text-pink-400 transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleShare("tiktok")}
                title="TikTok"
                className="w-9 h-9 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-zinc-200 text-zinc-400 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleShare("telegram")}
                title="Telegram"
                className="w-9 h-9 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-sky-500/50 text-zinc-400 hover:text-sky-400 transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.21 3.45-.49.34-.94.5-1.35.49-.45-.01-1.31-.25-1.95-.46-.78-.26-1.4-.4-1.35-.85.03-.23.36-.47 1-.72 3.91-1.7 6.52-2.82 7.82-3.36 3.73-1.54 4.51-1.8 5.01-1.81.11 0 .36.03.49.13.11.08.14.2.16.28.01.07.01.21 0 .28z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleShare("whatsapp")}
                title="WhatsApp"
                className="w-9 h-9 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-emerald-500/50 text-zinc-400 hover:text-emerald-400 transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleShare("facebook")}
                title="Facebook"
                className="w-9 h-9 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-blue-500/50 text-zinc-400 hover:text-blue-400 transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.37 14.5 5 15.5 5H18V0h-3.808C10.5 0 9 1.583 9 4.615V8z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleShare("vk")}
                title="VKontakte"
                className="w-9 h-9 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-indigo-500/50 text-zinc-400 hover:text-indigo-400 transition-all flex items-center justify-center cursor-pointer shadow-md"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M15.684 21h-2.116c-.477 0-.624-.383-1.455-1.472-.756-.991-1.325-1.115-1.579-1.115-.316 0-.411.096-.411.564v1.542c0 .385-.122.621-1.139.621-1.776 0-3.753-1.077-5.145-3.27-2.67-4.223-3.407-7.391-3.407-7.925 0-.352.133-.679.563-.679h2.316c.307 0 .425.138.544.464.595 1.705 1.587 3.208 2.016 3.425.155.078.234.117.316.117.133 0 .195-.052.195-.337v-3.32c-.055-1.114-.633-1.206-.633-1.602 0-.195.161-.355.416-.355h3.644c.316 0 .425.148.425.482v4.88c0 .197.085.267.14.267.11 0 .198-.06.395-.252 1.201-1.332 2.062-3.023 2.062-3.023.11-.252.316-.482.684-.482h2.316c.353 0 .43.181.353.679-.17 1.096-2.023 3.861-2.023 3.861-.161.252-.224.364 0 .633.155.195.666.671 1.009 1.082 1.084 1.285 1.91 2.365 2.138 2.766.223.385.04.595-.477.595z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Stats + email gate — unchanged content; overlay scoped to this block only */}
        <div className="relative w-full max-w-lg">
          {isLocked && (
            <div className="relative z-20 bg-black/75 backdrop-blur-[10px] sm:bg-black/65 sm:backdrop-blur-[8px] flex flex-col items-center justify-start p-3 sm:p-6 text-center animate-in fade-in rounded-3xl mb-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="w-full max-w-md mb-4 rounded-2xl border border-zinc-800/70 bg-black/85 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.55)] px-3 py-4 sm:px-4 scroll-mt-24">
                <div className="mb-3 font-mono space-y-1.5">
                  <p className="text-amber-500 text-xs tracking-wide leading-relaxed">
                    {t("dynamic.unlockStatsLead")}
                  </p>
                  <p className="text-amber-500 text-[11px] tracking-wide leading-relaxed">
                    {t("dynamic.unlockStatsSub")}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <div className="relative w-full">
                    <input
                      type="email"
                      name="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      autoComplete="email"
                      spellCheck={false}
                      inputMode="email"
                      enterKeyHint="go"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onFocus={(e) => {
                        setEmailFocused(true);
                        const el = e.currentTarget;
                        window.setTimeout(() => {
                          el.scrollIntoView({
                            block: "center",
                            behavior: "smooth",
                          });
                        }, 350);
                      }}
                      onBlur={() => setEmailFocused(false)}
                      placeholder={
                        emailFocused || emailInput.trim()
                          ? t("dynamic.emailPlaceholder")
                          : ""
                      }
                      className="w-full bg-black/90 border border-zinc-700 rounded-xl text-white p-3.5 text-sm font-mono outline-none focus:border-amber-500 lowercase shadow-xl caret-amber-500"
                    />
                    {!emailInput.trim() && !emailFocused && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 flex items-center px-3.5"
                      >
                        <span className="flex items-center max-w-full text-sm font-mono text-zinc-600 lowercase">
                          <span className="idle-input-caret mr-0.5 inline-block h-[0.9em] w-px shrink-0 self-center bg-amber-500/80" />
                          <span className="truncate">
                            {t("dynamic.emailPlaceholder")}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={submitEmailAndUnlock}
                      disabled={!isEmailValid}
                      className={`min-w-[5.5rem] px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide font-mono transition-all shadow-xl ${
                        isEmailValid
                          ? "bg-amber-500 hover:bg-amber-400 text-black cursor-pointer"
                          : "bg-amber-500/30 text-black/50 cursor-not-allowed"
                      }`}
                    >
                      {t("dynamic.view")}
                    </button>
                  </div>
                </div>

                <label className="mt-3 flex items-start gap-2.5 cursor-pointer text-left group rounded-xl border border-zinc-700 bg-black/90 px-3 py-2.5 hover:border-[#4285F4]/50 transition-colors">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border-2 border-[#4285F4] bg-black">
                    <input
                      type="checkbox"
                      checked={notifyAiTopic}
                      onChange={(e) => setNotifyAiTopic(e.target.checked)}
                      className="h-4 w-4 accent-[#4285F4] cursor-pointer"
                    />
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-mono tracking-wide leading-snug text-amber-500 break-words whitespace-normal">
                    {t("dynamic.notifyAiTopic")}
                  </span>
                </label>
              </div>

              <div className="flex flex-col items-center gap-2.5 w-full max-w-md mb-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-zinc-700 py-3 px-4 text-[10px] font-mono tracking-wide cursor-pointer transition-colors shadow-xl"
                >
                  <svg
                    className="w-4 h-4 shrink-0"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {t("dynamic.continueGoogle")}
                </button>
                <p className="text-[9px] font-mono tracking-wide leading-relaxed text-zinc-500 max-w-[20rem] text-center px-1">
                  {t("dynamic.authLegalLead")}{" "}
                  <Link
                    href="/terms"
                    className="text-zinc-400 hover:text-amber-500/90 underline underline-offset-2 decoration-zinc-700 hover:decoration-amber-500/50 transition-colors"
                  >
                    {t("dynamic.termsOfUse")}
                  </Link>{" "}
                  {t("dynamic.authLegalMid")}{" "}
                  <Link
                    href="/privacy"
                    className="text-zinc-400 hover:text-amber-500/90 underline underline-offset-2 decoration-zinc-700 hover:decoration-amber-500/50 transition-colors"
                  >
                    {t("dynamic.privacyPolicy")}
                  </Link>
                  {t("dynamic.authLegalEnd")}
                </p>
              </div>

              <button
                onClick={() => setIsBadgeOnly(true)}
                className="px-5 py-2 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-mono tracking-wide cursor-pointer transition-all shadow-md"
              >
                {t("dynamic.badgeOnly")}
              </button>
            </div>
          )}

          {!isBadgeOnly && (
            <div
              className={`w-full select-none space-y-4 font-mono text-xs transition-all duration-700 ${
                isUnlockedWithData ? "opacity-100" : "opacity-25 blur-[2px]"
              }`}
            >
              {pagedStatRows.map((row) => (
                <div key={row.code} className="space-y-1">
                  <div className="text-center text-[10px] text-zinc-200 leading-tight">
                    {row.flag} {t(`dynamic.statCountries.${row.code}`)}
                    <span className="ml-1.5 text-zinc-600 tabular-nums">
                      {row.votes.toLocaleString(locale)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2 text-[9px] sm:text-[10px] leading-tight">
                    <span className="text-left text-red-400/90 tabular-nums">
                      %{row.risk}{" "}
                      <span className="text-red-400/70">
                        {t("dynamic.statRisk")}
                      </span>
                    </span>
                    <span className="text-right text-emerald-400/90 tabular-nums">
                      %{row.stable}{" "}
                      <span className="text-emerald-400/70">
                        {t("dynamic.statStable")}
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full flex overflow-hidden">
                    <div
                      className="bg-red-600"
                      style={{ width: `${row.risk}%` }}
                    ></div>
                    <div
                      className="bg-emerald-500"
                      style={{ width: `${row.stable}%` }}
                    ></div>
                  </div>
                </div>
              ))}

              {statsPageCount > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  {Array.from({ length: statsPageCount }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStatsPage(i)}
                      aria-label={`${i + 1}`}
                      aria-current={statsPage === i ? "page" : undefined}
                      className={`min-w-7 h-7 px-2 rounded-md border text-[10px] font-mono transition-colors cursor-pointer ${
                        statsPage === i
                          ? "border-amber-500/60 bg-amber-500/15 text-amber-400"
                          : "border-zinc-800 bg-zinc-950/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
