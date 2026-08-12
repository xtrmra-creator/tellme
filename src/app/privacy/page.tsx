"use client";

import Link from "next/link";
import { t } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

export default function PrivacyPage() {
  useLocale();
  return (
    <main className="min-h-screen bg-black text-zinc-300 px-6 py-16 max-w-2xl mx-auto font-mono text-sm leading-relaxed">
      <Link
        href="/"
        className="text-[10px] tracking-wide text-zinc-500 hover:text-amber-500"
      >
        ← {t("nav.backHome")}
      </Link>
      <h1 className="mt-8 text-xl text-white tracking-wide">
        {t("dynamic.privacyPolicy")}
      </h1>
      <p className="mt-6 text-zinc-400 text-xs">
        We collect the email or Google account you use to unlock stats, your
        forecast (date / peace), country code, UI language, and basic technical
        metadata (IP, user agent) to run the board, prevent abuse, and contact
        you if you opt in. We do not sell personal data. Contact: privacy at
        wwtellme.com.
      </p>
      <p className="mt-4 text-zinc-500 text-[10px]">Last updated: 2026-08-12</p>
    </main>
  );
}
