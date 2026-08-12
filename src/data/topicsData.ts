// src/data/topicsData.ts
import { t } from "@/lib/i18n";

export interface ReactionOption {
  id: string;
  label: string;
  type: "positive" | "negative" | "neutral";
  badgeTitle: string;
  badgeColor: string;
}

export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  options: ReactionOption[];
}

/** Structural topic IDs — copy comes from i18n via getTopic() */
export const TOPIC_IDS = ["ww3"] as const;

export function getTopic(id: string): Topic | null {
  if (id === "ww3") {
    return {
      id: "ww3",
      title: t("topics.ww3.title"),
      subtitle: t("topics.ww3.subtitle"),
      description: t("topics.ww3.description"),
      options: [
        {
          id: "war",
          label: t("topics.ww3.options.war.label"),
          type: "negative",
          badgeTitle: t("topics.ww3.options.war.badgeTitle"),
          badgeColor: "text-red-500",
        },
        {
          id: "nowar",
          label: t("topics.ww3.options.nowar.label"),
          type: "positive",
          badgeTitle: t("topics.ww3.options.nowar.badgeTitle"),
          badgeColor: "text-emerald-400",
        },
      ],
    };
  }
  return null;
}

/** @deprecated Prefer getTopic() so copy tracks the active locale */
export const TOPICS_DATA: Record<string, Topic> = {
  get ww3() {
    return getTopic("ww3")!;
  },
};
