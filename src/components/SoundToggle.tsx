"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";
import {
  getSoundEnabled,
  initSoundPreference,
  setSoundEnabled,
  subscribeSoundEnabled,
  unlockKeyboardAudio,
} from "@/lib/keyboardSound";

export function SoundToggle() {
  const { locale } = useLocale();
  const [on, setOn] = useState(true);
  void locale;

  useEffect(() => {
    setOn(initSoundPreference());
    return subscribeSoundEnabled(setOn);
  }, []);

  const toggle = () => {
    const next = !getSoundEnabled();
    if (next) unlockKeyboardAudio();
    setSoundEnabled(next);
    setOn(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
        on
          ? "text-amber-500 hover:text-amber-400"
          : "text-zinc-600 hover:text-zinc-400"
      }`}
      aria-pressed={on}
      aria-label={on ? t("nav.soundOn") : t("nav.soundOff")}
      title={on ? t("nav.soundOn") : t("nav.soundOff")}
    >
      {on ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
}
