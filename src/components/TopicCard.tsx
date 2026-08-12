// @ts-nocheck
import React from "react";
import { t } from "@/lib/i18n";

interface TopicCardProps {
  title: string;
  description: string;
  status: "active" | "upcoming";
  badgeText?: string;
  onClick?: () => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  title,
  description,
  status,
  badgeText,
  onClick,
}) => {
  const isActive = status === "active";

  return (
    <div
      className={`
        relative p-6 border transition-all duration-300 cursor-pointer
        bg-black/80 backdrop-blur-sm
        ${
          isActive
            ? "border-amber-500/40 hover:border-amber-500 hover:bg-black/90"
            : "border-zinc-800/60 bg-black/50 opacity-60"
        }
        rounded-none
        border-l-4 ${isActive ? "border-l-amber-500" : "border-l-zinc-700"}
        hover:shadow-lg ${isActive ? "hover:shadow-amber-500/10" : "hover:shadow-zinc-800/20"}
      `}
      onClick={onClick}
    >
      <div className="absolute top-3 left-3 text-xs terminal-font tracking-wider">
        <div className={`${isActive ? "text-emerald-400" : "text-zinc-600"}`}>
          [STATUS: {isActive ? "ACTIVE" : "STANDBY"}]
        </div>
        <div
          className={`text-xs ${isActive ? "text-amber-500" : "text-zinc-600"} mt-1`}
        >
          {isActive ? "[THREAT_LEVEL: HIGH]" : "[THREAT_LEVEL: MEDIUM]"}
        </div>
      </div>

      <div className="absolute bottom-3 right-3 text-xs terminal-font text-zinc-500">
        {isActive ? "[ID: WW3-2026]" : "[ID: AI-2027]"}
      </div>

      {!isActive && badgeText && (
        <div className="absolute -top-2 -right-2 bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold px-3 py-1 rounded-none terminal-font">
          {badgeText}
        </div>
      )}

      <div className="pt-8 pb-6">
        <h3
          className={`text-xl font-bold mb-3 terminal-font tracking-wider ${isActive ? "text-white" : "text-zinc-400"}`}
        >
          {title}
          {isActive && (
            <span className="ml-2 text-emerald-400 terminal-cursor">_</span>
          )}
        </h3>

        <p
          className={`text-sm terminal-font ${isActive ? "text-zinc-300" : "text-zinc-500"}`}
        >
          {">_"} {description}
        </p>

        {isActive && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-amber-500 text-sm font-medium terminal-font tracking-wider">
                {t("topicCard.makePrediction")}
              </span>
              <div className="ml-3 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-xs text-zinc-500 terminal-font">
              [CLICK_TO_PROCEED]
            </div>
          </div>
        )}

        {!isActive && (
          <div className="text-xs text-zinc-600 terminal-font mt-6">
            [SYSTEM_LOCKED] [EST_ACTIVATION: Q3 2027]
          </div>
        )}
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${isActive ? "bg-gradient-to-r from-amber-500/50 to-transparent" : "bg-zinc-800/50"}`}
      ></div>
    </div>
  );
};

export default TopicCard;
