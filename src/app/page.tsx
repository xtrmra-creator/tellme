// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import Logo from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SoundToggle } from "@/components/SoundToggle";
import { useLocale } from "@/components/LocaleProvider";
import { getTopic } from "@/data/topicsData";
import WTFDynamicApp from "@/components/WTFDynamicApp";
import WeightedTypingGrid from "@/components/WeightedTypingGrid";
import HomeWorldGrid from "@/components/HomeWorldGrid";
import { LiveVoteCounter } from "@/components/LiveVoteCounter";
import { t } from "@/lib/i18n";
import {
  unlockKeyboardAudio,
  startTypingAmbience,
  stopTypingAmbience,
  subscribeSoundEnabled,
} from "@/lib/keyboardSound";

export default function Page() {
  const { locale } = useLocale();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [introStep, setIntroStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [teaserFlashId, setTeaserFlashId] = useState(null);
  const [teaserFlashToken, setTeaserFlashToken] = useState(0);
  const [taglineScan, setTaglineScan] = useState(false);
  const taglineRef = useRef(null);

  const handleTopicClick = (topicId: string) => {
    if (topicId === "ww3") {
      unlockKeyboardAudio();
      setSelectedTopicId("intro-ww3");
      setIntroStep(0);
      setTypedText("");
      return;
    }
    // Unready / teaser topics: stamp flash, then back
    setTeaserFlashId(topicId);
    setTeaserFlashToken((n) => n + 1);
  };

  useEffect(() => {
    if (!teaserFlashId) return;
    const hide = setTimeout(() => setTeaserFlashId(null), 3500);
    return () => clearTimeout(hide);
  }, [teaserFlashId, teaserFlashToken]);

  useEffect(() => {
    const el = taglineRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTaglineScan(false);
          // Restart animation on each enter into view
          requestAnimationFrame(() => setTaglineScan(true));
        } else {
          setTaglineScan(false);
        }
      },
      { threshold: 0.55, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (selectedTopicId === "intro-ww3" && introStep === 0) {
      const scanTimer = setTimeout(() => {
        setIntroStep(1);
      }, 350);
      return () => clearTimeout(scanTimer);
    }
  }, [selectedTopicId, introStep, locale]);

  useEffect(() => {
    if (selectedTopicId === "intro-ww3" && introStep === 1) {
      let i = 0;
      const message = t("intro.message");
      setTypedText("");
      startTypingAmbience();
      const typeInterval = setInterval(() => {
        if (i <= message.length) {
          setTypedText(message.slice(0, i));
          i++;
        } else {
          clearInterval(typeInterval);
          stopTypingAmbience();
          setTimeout(() => {
            setIntroStep(2);
          }, 400);
        }
      }, Math.round(60 / 1.3));

      return () => {
        clearInterval(typeInterval);
        stopTypingAmbience();
      };
    }
  }, [selectedTopicId, introStep, locale]);

  // Unmute mid-intro: resume ambience; mute: stop
  useEffect(() => {
    if (selectedTopicId !== "intro-ww3" || introStep !== 1) return;
    return subscribeSoundEnabled((on) => {
      if (on) startTypingAmbience();
      else stopTypingAmbience();
    });
  }, [selectedTopicId, introStep]);

  // Language change mid-intro: restart typing with new locale copy
  useEffect(() => {
    if (selectedTopicId === "intro-ww3") {
      stopTypingAmbience();
      setIntroStep(0);
      setTypedText("");
    }
  }, [locale]);

  const handleStartSimulation = (_choice: "date" | "nowar") => {
    stopTypingAmbience();
    setSelectedTopicId("ww3");
  };

  const handleBackToTopics = () => {
    stopTypingAmbience();
    setSelectedTopicId(null);
    setIntroStep(0);
    setTypedText("");
  };

  const topics = [
    {
      id: "ww3",
      title: t("home.topics.ww3.title"),
      description: t("home.topics.ww3.description"),
      status: "active" as const,
    },
    {
      id: "ai",
      title: t("home.topics.ai.title"),
      description: t("home.topics.ai.description"),
      status: "teaser" as const,
      soonLabel: t("home.topics.ai.badge"),
    },
  ];

  const ww3Topic = getTopic("ww3");

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 font-sans selection:bg-amber-500/30">
      <style jsx>{`
        @keyframes text-scan {
          0% {
            background-position: 0% 100%;
          }
          50% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 100%;
          }
        }
        .text-scan {
          background: linear-gradient(
            to bottom,
            #a1a1aa 40%,
            #ffffff 50%,
            #a1a1aa 60%
          );
          background-size: 100% 300%;
          background-position: 0% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
        .text-scan-run {
          animation: text-scan 2s ease-in-out forwards;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }

        @keyframes soon-stamp {
          0% {
            opacity: 0;
            transform: rotate(-6deg) scale(0.55);
          }
          18% {
            opacity: 1;
            transform: rotate(-6deg) scale(1.12);
          }
          32% {
            transform: rotate(-6deg) scale(0.96);
          }
          48%,
          100% {
            opacity: 1;
            transform: rotate(-6deg) scale(1);
          }
        }
        .animate-soon-stamp {
          animation: soon-stamp 0.65s cubic-bezier(0.22, 1.2, 0.36, 1) forwards;
        }
      `}</style>

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/10 via-[#050505] to-[#050505] z-0"></div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:3rem_3rem] z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-white/5 py-6 px-8 flex justify-between items-center bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <SoundToggle />
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-grow w-full max-w-5xl mx-auto px-6 py-16 flex flex-col items-center justify-center">
          {selectedTopicId === "ww3" && ww3Topic ? (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button
                onClick={handleBackToTopics}
                className="group mb-12 text-xs tracking-[0.15em] text-zinc-500 hover:text-amber-500 flex items-center gap-4 transition-all uppercase cursor-pointer"
              >
                <span className="w-8 h-[1px] bg-zinc-700 group-hover:bg-amber-500 transition-colors"></span>
                {t("nav.backHome")}
              </button>
              <WTFDynamicApp key={locale} topic={ww3Topic} />
            </div>
          ) : selectedTopicId === "intro-ww3" ? (
            <div className="w-full flex flex-col items-center animate-in fade-in duration-700">
              <button
                onClick={handleBackToTopics}
                className="self-start group mb-12 text-xs tracking-[0.15em] text-zinc-500 hover:text-amber-500 flex items-center gap-4 transition-all uppercase cursor-pointer"
              >
                <span className="w-8 h-[1px] bg-zinc-700 group-hover:bg-amber-500 transition-colors"></span>
                {t("nav.backTopics")}
              </button>

              <div className="w-full max-w-4xl flex flex-col items-center min-h-[220px]">
                <div className="w-full flex justify-center mb-1">
                  <SoundToggle />
                </div>
                <WeightedTypingGrid
                  text={typedText}
                  complete={introStep >= 2}
                  className="w-full px-2 py-6 mb-2"
                >
                  <div className="text-center text-lg md:text-xl font-light leading-relaxed text-zinc-300 min-h-[96px]">
                    <span data-wtg-text>{typedText}</span>
                    {introStep === 1 && (
                      <span className="inline-block w-px h-5 bg-zinc-300 ml-1 translate-y-1 animate-blink"></span>
                    )}
                  </div>
                </WeightedTypingGrid>

                {introStep >= 2 && (
                  <div className="text-center mb-10 animate-in fade-in duration-700">
                    <h3 className="text-2xl md:text-3xl font-light tracking-wide text-amber-500">
                      {t("intro.ask")}
                    </h3>
                  </div>
                )}

                <div
                  className={`w-full max-w-3xl flex flex-col md:flex-row gap-6 transition-all duration-1000 ${
                    introStep === 2
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                >
                  <button
                    onClick={() => handleStartSimulation("date")}
                    className="group relative flex-1 bg-zinc-900/40 hover:bg-amber-500/10 border border-zinc-800 hover:border-amber-500/50 p-6 flex items-center justify-center gap-4 transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-amber-500"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span className="text-sm font-light tracking-wide text-zinc-200">
                      {t("intro.leaveDate")}
                    </span>
                  </button>

                  <button
                    onClick={() => handleStartSimulation("nowar")}
                    className="group relative flex-1 bg-zinc-900/40 hover:bg-emerald-500/10 border border-zinc-800 hover:border-emerald-500/50 p-6 flex items-center justify-center gap-4 transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-emerald-500"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 2v20"></path>
                      <path d="M12 12l5.5 8"></path>
                      <path d="M12 12l-5.5 8"></path>
                    </svg>
                    <span className="text-sm font-light tracking-wide text-zinc-200">
                      {t("intro.noWar")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center animate-in fade-in duration-1000">
              <HomeWorldGrid
                className="w-full max-w-3xl px-4 pt-12 pb-14 mb-10 sm:pt-14 sm:pb-16"
                coords={{
                  nw: t("home.mottoNw"),
                  n: t("home.mottoN"),
                  se: t("home.mottoSe"),
                }}
              >
                <div className="text-center select-none flex flex-col items-center">
                  <h1 className="text-7xl md:text-[8rem] leading-none font-black tracking-tighter drop-shadow-2xl">
                    <span className="text-amber-500">WW</span>
                    <span className="text-zinc-200 italic font-light tracking-tight">
                      tellme
                    </span>
                  </h1>
                </div>
              </HomeWorldGrid>

              <div className="w-full max-w-4xl">
                <div className="flex items-end justify-between gap-4 mb-8 border-b border-white/5 pb-4">
                  <h2 className="text-sm md:text-base font-light tracking-wide text-zinc-400">
                    {t("home.sectionTitle")}
                  </h2>
                  <LiveVoteCounter />
                </div>

                <div className="flex flex-col gap-4">
                  {topics.map((topic) => {
                    const isActive = topic.status === "active";
                    const isTeaser = topic.status === "teaser";
                    const liveLook = isActive || isTeaser;
                    return (
                      <div
                        key={topic.id}
                        onClick={() => handleTopicClick(topic.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleTopicClick(topic.id);
                          }
                        }}
                        className={`group relative w-full overflow-hidden transition-all duration-500 border ${
                          liveLook
                            ? "border-zinc-800/80 hover:border-amber-500/40 bg-zinc-900/30 hover:bg-zinc-900/60 cursor-pointer shadow-xl shadow-black/50 hover:translate-x-1"
                            : "border-zinc-900 bg-black/40 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {liveLook && (
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center z-20"></div>
                        )}

                        {isTeaser &&
                          topic.soonLabel &&
                          teaserFlashId === topic.id && (
                          <div
                            aria-hidden
                            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/25"
                          >
                            <span
                              key={teaserFlashToken}
                              className="animate-soon-stamp select-none text-5xl md:text-7xl font-black tracking-[0.12em] uppercase text-zinc-300 drop-shadow-[0_0_40px_rgba(161,161,170,0.35)]"
                            >
                              {topic.soonLabel}
                            </span>
                          </div>
                        )}

                        <div
                          className={`relative z-10 flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 gap-6 md:gap-12 transition-opacity duration-300 ${
                            isTeaser && teaserFlashId === topic.id
                              ? "opacity-35"
                              : ""
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div
                                className={`text-[10px] tracking-wide font-mono flex items-center gap-2 ${
                                  isActive
                                    ? "text-amber-500"
                                    : isTeaser
                                      ? "text-zinc-500"
                                      : "text-zinc-600"
                                }`}
                              >
                                {isActive ? (
                                  <>
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                                    {t("home.statusActive")}
                                  </>
                                ) : isTeaser ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 shadow-[0_0_6px_rgba(113,113,122,0.45)]"></span>
                                    {t("home.statusTeaser")}
                                  </>
                                ) : (
                                  <>
                                    <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></span>
                                    {t("home.statusStandby")}
                                  </>
                                )}
                              </div>
                            </div>

                            <h3
                              className={`text-2xl md:text-3xl font-light tracking-wide mb-2 ${
                                isActive
                                  ? "text-white group-hover:text-amber-50 transition-colors"
                                  : isTeaser
                                    ? "text-zinc-200 group-hover:text-zinc-100 transition-colors"
                                    : "text-zinc-500"
                              }`}
                            >
                              {topic.title}
                            </h3>
                            <p
                              className={`text-sm leading-relaxed max-w-xl ${
                                isTeaser ? "text-zinc-500" : "text-zinc-400"
                              }`}
                            >
                              {topic.description}
                            </p>
                          </div>

                          <div className="flex-shrink-0 mt-4 md:mt-0 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 flex md:justify-end">
                            {isActive ? (
                              <div className="flex items-center gap-4 text-xs tracking-wide text-zinc-500 group-hover:text-amber-500 transition-colors">
                                {t("home.ctaEnter")}
                                <span className="w-8 md:w-16 h-[1px] bg-zinc-700 group-hover:bg-amber-500 transition-all duration-300 group-hover:translate-x-2"></span>
                              </div>
                            ) : isTeaser ? (
                              <div className="flex items-center gap-4 text-xs tracking-wide text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                {t("home.ctaEnter")}
                                <span className="w-8 md:w-16 h-[1px] bg-zinc-700 group-hover:bg-zinc-500 transition-all duration-300 group-hover:translate-x-2"></span>
                              </div>
                            ) : (
                              <div className="text-[10px] tracking-wide font-mono text-zinc-600">
                                {t("home.locked")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-auto border-t border-white/5 py-8 px-6 flex flex-col items-center gap-5 text-center">
          <div className="relative py-1 flex items-center justify-center gap-4 text-[10px] md:text-xs font-light tracking-wide max-w-3xl">
            <span className="hidden md:block w-8 md:w-16 h-[1px] bg-zinc-800 shrink-0"></span>
            <span
              ref={taglineRef}
              className={`text-scan ${taglineScan ? "text-scan-run" : ""}`}
            >
              {t("home.tagline")}
            </span>
            <span className="hidden md:block w-8 md:w-16 h-[1px] bg-zinc-800 shrink-0"></span>
          </div>
          <p className="text-[10px] font-mono tracking-widest text-zinc-700">
            {t("brand.footer")}
          </p>
          <p className="text-[9px] md:text-[10px] font-mono tracking-wide text-zinc-600 max-w-md leading-relaxed">
            {t("brand.footerNote")}
          </p>
        </footer>
      </div>
    </div>
  );
}
