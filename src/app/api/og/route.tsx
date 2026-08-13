import { ImageResponse } from "next/og";
import { parseShareCardParams } from "@/lib/shareCard";

const TEASE = {
  en: {
    sealedLine: (h: string) => `${h} sealed a forecast`,
    classified: "classified",
    ask: "What does your country say? →",
  },
  tr: {
    sealedLine: (h: string) => `${h} bir tahmin mühürledi`,
    classified: "gizli",
    ask: "Senin ülken ne diyor? →",
  },
  de: {
    sealedLine: (h: string) => `${h} hat eine Prognose versiegelt`,
    classified: "geheim",
    ask: "Was sagt dein Land? →",
  },
  fr: {
    sealedLine: (h: string) => `${h} a scellé une prévision`,
    classified: "classifié",
    ask: "Que dit ton pays ? →",
  },
  es: {
    sealedLine: (h: string) => `${h} selló un pronóstico`,
    classified: "clasificado",
    ask: "¿Qué dice tu país? →",
  },
  ru: {
    sealedLine: (h: string) => `${h} запечатал прогноз`,
    classified: "секретно",
    ask: "Что говорит твоя страна? →",
  },
  it: {
    sealedLine: (h: string) => `${h} ha sigillato una previsione`,
    classified: "classificato",
    ask: "Cosa dice il tuo paese? →",
  },
  pl: {
    sealedLine: (h: string) => `${h} zapieczętował prognozę`,
    classified: "tajne",
    ask: "Co mówi twój kraj? →",
  },
  pt: {
    sealedLine: (h: string) => `${h} selou uma previsão`,
    classified: "classificado",
    ask: "O que diz o teu país? →",
  },
} as const;

type TeaseLocale = keyof typeof TEASE;

function teaseCopy(locale?: string) {
  const key = (locale || "en").slice(0, 2).toLowerCase() as TeaseLocale;
  return TEASE[key] ?? TEASE.en;
}

/** Teaser card: enough to hook, not enough to spoil — curiosity over data dump. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const card = parseShareCardParams(searchParams);
  const handle = card.handle || "@anon";
  const topic = card.topicTitle || "WWtellme";
  const copy = teaseCopy(card.locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#030303",
          fontFamily: "ui-monospace, monospace",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 35%, #030303 85%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 920,
            height: 460,
            borderRadius: 28,
            border: "1px solid #3f3f46",
            background:
              "linear-gradient(160deg, #141414 0%, #0a0a0a 55%, #111 100%)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
            padding: "40px 48px",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ color: "#f59e0b", fontSize: 34, fontWeight: 900 }}>
                WW
              </span>
              <span
                style={{
                  color: "#d4d4d8",
                  fontSize: 28,
                  fontWeight: 300,
                  fontStyle: "italic",
                }}
              >
                tellme
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1px solid #b45309",
                borderRadius: 999,
                padding: "8px 16px",
                color: "#fbbf24",
                fontSize: 16,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              ● SEALED
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
              marginTop: 8,
            }}
          >
            <span
              style={{
                color: "#71717a",
                fontSize: 16,
                letterSpacing: 5,
                textTransform: "uppercase",
              }}
            >
              {copy.sealedLine(handle)}
            </span>
            <span
              style={{
                color: "#fafafa",
                fontSize: 40,
                fontWeight: 700,
                lineHeight: 1.15,
              }}
            >
              {topic}
            </span>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  height: 28,
                  width: 220,
                  borderRadius: 6,
                  background: "#27272a",
                }}
              />
              <div
                style={{
                  display: "flex",
                  height: 28,
                  width: 120,
                  borderRadius: 6,
                  background: "#3f3f46",
                }}
              />
              <span
                style={{
                  color: "#52525b",
                  fontSize: 18,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {copy.classified}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #27272a",
              paddingTop: 22,
            }}
          >
            <span
              style={{
                color: "#f59e0b",
                fontSize: 22,
                letterSpacing: 1,
              }}
            >
              {copy.ask}
            </span>
            <span
              style={{
                color: "#52525b",
                fontSize: 16,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              WWTELLME.COM
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
