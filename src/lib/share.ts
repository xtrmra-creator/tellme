/** Social share: native app schemes on mobile, web/store fallback if app missing. */

import { isActiveLocale, setLocale, t, type Locale } from "@/lib/i18n";
import { STAT_ROWS } from "@/data/statRows";
import { buildSharePageUrl, type ShareCardInput } from "@/lib/shareCard";
import { getSiteUrl } from "@/lib/shareSite";

export { getSiteUrl };

export type SharePayload = {
  url: string;
  title: string;
  /** Caption without trailing URL (for platforms that take url separately). */
  text: string;
  /** Caption including site URL (for text-only share intents). */
  textWithUrl: string;
};

function resolveShareLocale(explicit?: string): string {
  if (explicit && isActiveLocale(explicit)) return explicit;
  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang?.slice(0, 2);
    if (lang && isActiveLocale(lang)) return lang;
  }
  return "en";
}

export function buildSharePayload(input: ShareCardInput): SharePayload {
  const locale = resolveShareLocale(input.locale);
  if (isActiveLocale(locale)) setLocale(locale as Locale);

  const card: ShareCardInput = { ...input, locale };
  const url = buildSharePageUrl(card);
  const text = t("dynamic.shareCaption", {
    topic: card.topicTitle,
    count: STAT_ROWS.length,
  });
  return {
    url,
    title: card.topicTitle,
    text,
    textWithUrl: `${text}\n\n🔗 ${url}`,
  };
}

export type SharePlatform =
  | "x"
  | "facebook"
  | "whatsapp"
  | "telegram"
  | "linkedin"
  | "vk"
  | "instagram"
  | "tiktok";

type AppTarget = {
  /** Custom URL scheme that opens the native app (iOS / generic). */
  native: string | null;
  /** Android Intent URI with built-in browser_fallback_url when available. */
  androidIntent?: string | null;
  /** HTTPS share / web fallback. */
  web: string;
  /** App Store / Play Store when web share is not useful. */
  store?: string;
  /** Prefer copying text before opening (Instagram / TikTok). */
  copyFirst?: boolean;
};

const FALLBACK_MS = 1600;

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Android|iPhone|iPad|iPod|IEMobile|Mobile/i.test(ua)) return true;
  if (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)) return true;
  return false;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))
  );
}

function isAndroid(): boolean {
  return (
    typeof navigator !== "undefined" &&
    /Android/i.test(navigator.userAgent || "")
  );
}

function storeUrl(iosId: string, androidPackage: string): string {
  if (isIOS()) return `https://apps.apple.com/app/id${iosId}`;
  if (isAndroid()) {
    return `https://play.google.com/store/apps/details?id=${androidPackage}`;
  }
  return `https://apps.apple.com/app/id${iosId}`;
}

/** Android Intent that opens the app, else the HTTPS fallback. */
function androidIntent(
  scheme: string,
  pathAndQuery: string,
  pkg: string,
  fallbackWeb: string,
): string {
  const fallback = encodeURIComponent(fallbackWeb);
  return `intent://${pathAndQuery}#Intent;scheme=${scheme};package=${pkg};S.browser_fallback_url=${fallback};end`;
}

function openExternal(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Try a native app URL scheme; if the page is still visible after a short
 * delay (app not installed / scheme ignored), open the fallback URL.
 * Android Intent URIs carry their own browser_fallback_url — open those
 * via location so the system handles missing apps.
 */
function openNativeOrFallback(
  native: string | null,
  androidIntentUrl: string | null | undefined,
  fallback: string,
): void {
  if (!isMobileDevice()) {
    openExternal(fallback);
    return;
  }

  // Android Chrome: Intent URI includes store/web fallback natively.
  if (isAndroid() && androidIntentUrl) {
    window.location.href = androidIntentUrl;
    return;
  }

  if (!native) {
    openExternal(fallback);
    return;
  }

  let leftPage = false;
  const markLeft = () => {
    leftPage = true;
  };

  document.addEventListener("visibilitychange", markLeft);
  window.addEventListener("pagehide", markLeft);
  window.addEventListener("blur", markLeft);

  const cleanup = () => {
    document.removeEventListener("visibilitychange", markLeft);
    window.removeEventListener("pagehide", markLeft);
    window.removeEventListener("blur", markLeft);
  };

  // Hidden iframe keeps the SPA on-page if the scheme is ignored.
  const iframe = document.createElement("iframe");
  iframe.style.cssText =
    "position:fixed;width:0;height:0;border:0;visibility:hidden;pointer-events:none";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  const started = Date.now();
  try {
    iframe.src = native;
  } catch {
    /* ignore */
  }

  window.setTimeout(() => {
    cleanup();
    try {
      iframe.remove();
    } catch {
      /* ignore */
    }

    const stillHere =
      !leftPage &&
      !document.hidden &&
      document.visibilityState === "visible";

    if (stillHere && Date.now() - started >= FALLBACK_MS - 200) {
      openExternal(fallback);
    }
  }, FALLBACK_MS);
}

function buildTargets(payload: SharePayload): Record<SharePlatform, AppTarget> {
  const { url, text, textWithUrl, title } = payload;
  const encodedText = encodeURIComponent(text);
  const encodedTextWithUrl = encodeURIComponent(textWithUrl);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // text + url separately so X attaches the large image card from OG tags.
  const xWeb = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  const fbWeb = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const waWeb = `https://api.whatsapp.com/send?text=${encodedTextWithUrl}`;
  const tgWeb = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
  const liWeb = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const vkWeb = `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}&comment=${encodedText}`;
  const igWeb = "https://www.instagram.com/";
  const ttWeb = "https://www.tiktok.com/upload";

  return {
    x: {
      native: `twitter://post?message=${encodeURIComponent(`${text}\n${url}`)}`,
      androidIntent: androidIntent(
        "twitter",
        `post?message=${encodeURIComponent(`${text}\n${url}`)}`,
        "com.twitter.android",
        xWeb,
      ),
      web: xWeb,
      store: storeUrl("333903271", "com.twitter.android"),
    },
    facebook: {
      // Open the Facebook APP with our /s?d=… link (compact — params stay intact).
      // Avoid fb://facewebmodal nesting (it used to strip query params → English/broken OG).
      native: `fb://share/?link=${encodedUrl}`,
      androidIntent: androidIntent(
        "https",
        `www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        "com.facebook.katana",
        fbWeb,
      ),
      web: fbWeb,
      store: storeUrl("284882215", "com.facebook.katana"),
      // Facebook blocks pre-filled captions — copy so the user can paste.
      copyFirst: true,
    },
    whatsapp: {
      native: `whatsapp://send?text=${encodedTextWithUrl}`,
      androidIntent: androidIntent(
        "whatsapp",
        `send?text=${encodedTextWithUrl}`,
        "com.whatsapp",
        waWeb,
      ),
      web: waWeb,
      store: storeUrl("310633997", "com.whatsapp"),
    },
    telegram: {
      native: `tg://msg_url?url=${encodedUrl}&text=${encodedText}`,
      androidIntent: androidIntent(
        "tg",
        `msg_url?url=${encodedUrl}&text=${encodedText}`,
        "org.telegram.messenger",
        tgWeb,
      ),
      web: tgWeb,
      store: storeUrl("686449807", "org.telegram.messenger"),
    },
    linkedin: {
      native: null,
      web: liWeb,
      store: storeUrl("288429040", "com.linkedin.android"),
      copyFirst: true,
    },
    vk: {
      native: `vk://share?url=${encodedUrl}&title=${encodedTitle}`,
      androidIntent: androidIntent(
        "vk",
        `share?url=${encodedUrl}&title=${encodedTitle}`,
        "com.vkontakte.android",
        vkWeb,
      ),
      web: vkWeb,
      store: storeUrl("564177515", "com.vkontakte.android"),
    },
    instagram: {
      native: "instagram://app",
      androidIntent: androidIntent(
        "instagram",
        "app",
        "com.instagram.android",
        igWeb,
      ),
      web: igWeb,
      store: storeUrl("389801252", "com.instagram.android"),
      copyFirst: true,
    },
    tiktok: {
      native: "tiktok://",
      androidIntent: androidIntent(
        "tiktok",
        "",
        "com.zhiliaoapp.musically",
        ttWeb,
      ),
      web: ttWeb,
      store: storeUrl("835599320", "com.zhiliaoapp.musically"),
      copyFirst: true,
    },
  };
}

export async function shareTo(
  platform: SharePlatform,
  payload: SharePayload,
): Promise<{ copied: boolean }> {
  const { url, textWithUrl, title } = payload;

  // OS share sheet when available (best path for Instagram on mobile).
  if (
    platform === "instagram" &&
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    try {
      await navigator.share({ title, text: textWithUrl, url });
      return { copied: false };
    } catch {
      /* cancelled or unsupported */
    }
  }

  const target = buildTargets(payload)[platform];
  if (!target) return { copied: false };

  let copied = false;
  if (target.copyFirst) {
    copied = await copyText(textWithUrl);
  }

  // Desktop: HTTPS intents only.
  if (!isMobileDevice()) {
    openExternal(target.web);
    return { copied };
  }

  // Instagram / TikTok: no real share scheme → app, else store (caption already copied).
  const fallback =
    platform === "instagram" || platform === "tiktok"
      ? target.store || target.web
      : target.web;

  openNativeOrFallback(target.native, target.androidIntent, fallback);
  return { copied };
}
