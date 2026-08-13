import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import it from "@/locales/it.json";
import pl from "@/locales/pl.json";
import pt from "@/locales/pt.json";
import ru from "@/locales/ru.json";
import tr from "@/locales/tr.json";
import { STAT_ROWS } from "@/data/statRows";
import type { ShareCardInput } from "@/lib/shareCard";

const dicts = { en, tr, de, fr, es, ru, it, pl, pt } as const;
type Loc = keyof typeof dicts;

function loc(code?: string): Loc {
  const k = (code || "en").slice(0, 2).toLowerCase();
  return k in dicts ? (k as Loc) : "en";
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`,
  );
}

/** Facebook/X link-preview title — must follow share URL `l` (crawler ignores cookies). */
export function shareOgTitle(card: ShareCardInput): string {
  const L = loc(card.locale);
  const who = card.handle?.trim() || (L === "tr" ? "@anonim" : "@anon");
  const topic = card.topicTitle;
  const country = card.country;

  const titles: Record<Loc, string> = {
    en: `${who} sealed “${topic}” — what does ${country} say?`,
    tr: `${who} “${topic}” tahminini mühürledi — ${country} ne diyor?`,
    de: `${who} hat “${topic}” versiegelt — was sagt ${country}?`,
    fr: `${who} a scellé « ${topic} » — que dit ${country} ?`,
    es: `${who} selló “${topic}” — ¿qué dice ${country}?`,
    ru: `${who} запечатал «${topic}» — что говорит ${country}?`,
    it: `${who} ha sigillato “${topic}” — cosa dice ${country}?`,
    pl: `${who} zapieczętował „${topic}” — co mówi ${country}?`,
    pt: `${who} selou “${topic}” — o que diz ${country}?`,
  };
  return titles[L];
}

/** Same teaser caption used for social share text (locale from URL `l`). */
export function shareOgDescription(card: ShareCardInput): string {
  const L = loc(card.locale);
  const caption = (dicts[L] as { dynamic?: { shareCaption?: string } }).dynamic
    ?.shareCaption;
  const fallback = (dicts.en as { dynamic: { shareCaption: string } }).dynamic
    .shareCaption;
  return fill(caption || fallback, {
    topic: card.topicTitle,
    count: STAT_ROWS.length,
  });
}
