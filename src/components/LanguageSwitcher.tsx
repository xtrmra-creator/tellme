"use client";

import { LOCALE_LABELS, isActiveLocale } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

const SWITCHER_CODES = [
  "en",
  "tr",
  "de",
  "fr",
  "es",
  "ru",
  "it",
  "pl",
  "pt",
] as const;

export function LanguageSwitcher() {
  const { locale, changeLanguage } = useLocale();

  return (
    <div className="flex items-center gap-3 text-[10px] tracking-widest font-mono text-zinc-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-500"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
        {SWITCHER_CODES.map((code, i) => {
          const active = isActiveLocale(code);
          const selected = locale === code;
          return (
            <span key={code} className="flex items-center gap-2">
              {i > 0 && <span className="text-zinc-800">|</span>}
              <button
                type="button"
                onClick={() => active && changeLanguage(code)}
                disabled={!active}
                className={`uppercase transition-colors ${
                  selected
                    ? "text-amber-500 cursor-default"
                    : active
                      ? "hover:text-zinc-300 cursor-pointer"
                      : "text-zinc-700 cursor-not-allowed opacity-50"
                }`}
                aria-pressed={selected}
                aria-label={`Language ${LOCALE_LABELS[code]}`}
                title={
                  active
                    ? LOCALE_LABELS[code]
                    : `${LOCALE_LABELS[code]} (soon)`
                }
              >
                {LOCALE_LABELS[code]}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
