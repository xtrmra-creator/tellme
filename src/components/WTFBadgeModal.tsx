// @ts-nocheck
"use client";

import { t } from "@/lib/i18n";

export default function WTFBadgeModal({
  topic,
  selectedOption,
  userHandle,
  setUserHandle,
  selectedDate,
  onClose,
}) {
  const isPositive = selectedOption.type === "positive";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className={`relative w-full max-w-md bg-[#0a0a0a] border ${
          isPositive
            ? "border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            : "border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
        } p-8 flex flex-col items-center text-center`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white font-mono text-xs cursor-pointer"
        >
          {t("badgeModal.close")}
        </button>

        <span
          className={`text-[10px] font-mono ${
            isPositive ? "text-emerald-500" : "text-amber-500"
          } tracking-[0.3em] uppercase mb-1`}
        >
          {t("badgeModal.eyebrow")}
        </span>
        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-4">
          {t("badgeModal.title")}
        </h3>

        <div className="w-full mb-4 text-left">
          <label className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
            {t("badgeModal.handleLabel")}
          </label>
          <input
            type="text"
            value={userHandle}
            onChange={(e) => setUserHandle(e.target.value)}
            placeholder={t("badgeModal.handlePlaceholder")}
            className={`w-full bg-black border ${
              isPositive
                ? "border-emerald-500/40 text-emerald-400 focus:border-emerald-400"
                : "border-amber-500/40 text-amber-400 focus:border-amber-400"
            } px-3 py-2 text-xs font-mono outline-none`}
          />
        </div>

        <div className="w-full bg-black border border-zinc-800 p-6 space-y-4 mb-6 text-left font-mono">
          <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
            <span>{t("badgeModal.signature")}</span>
            <span
              className={
                isPositive
                  ? "text-emerald-400 font-bold"
                  : "text-amber-400 font-bold"
              }
            >
              {userHandle || t("dynamic.anon")}
            </span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
            <span>{t("badgeModal.topicLabel")}</span>
            <span className="text-white">{topic.title}</span>
          </div>

          {!isPositive && selectedDate && (
            <div className="flex justify-between text-xs text-zinc-400 border-b border-zinc-900 pb-2">
              <span>{t("badgeModal.targetDate")}</span>
              <span className="text-amber-400 font-bold">{selectedDate}</span>
            </div>
          )}

          <div className="flex justify-between text-xs text-zinc-400">
            <span>{t("badgeModal.worldSays")}</span>
            <span
              className={`${
                selectedOption.badgeColor ||
                (isPositive ? "text-emerald-400" : "text-red-500")
              } font-bold text-base`}
            >
              ?
            </span>
          </div>
        </div>

        <button
          onClick={() => alert(t("badgeModal.copied"))}
          className={`w-full ${
            isPositive
              ? "bg-emerald-500 hover:bg-emerald-400"
              : "bg-amber-500 hover:bg-amber-400"
          } text-black py-3 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer`}
        >
          {t("badgeModal.shareCta")}
        </button>
      </div>
    </div>
  );
}
