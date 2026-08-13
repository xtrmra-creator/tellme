import { ImageResponse } from "next/og";
import { parseShareCardParams } from "@/lib/shareCard";

const COPY = {
  en: {
    callsign: "Callsign",
    threat: "Threat",
    myGuess: "My prediction",
    worldSays: "World says",
    ask: "What does your country say?",
    verified: "Verified",
  },
  tr: {
    callsign: "İmza",
    threat: "Tehdit",
    myGuess: "Benim tahminim",
    worldSays: "Dünya ne söylüyor?",
    ask: "Senin ülken ne diyor?",
    verified: "Verified",
  },
  de: {
    callsign: "Rufzeichen",
    threat: "Bedrohung",
    myGuess: "Meine Prognose",
    worldSays: "Die Welt sagt",
    ask: "Was sagt dein Land?",
    verified: "Verified",
  },
  fr: {
    callsign: "Indicatif",
    threat: "Menace",
    myGuess: "Ma prévision",
    worldSays: "Le monde dit",
    ask: "Que dit ton pays ?",
    verified: "Verified",
  },
  es: {
    callsign: "Indicativo",
    threat: "Amenaza",
    myGuess: "Mi predicción",
    worldSays: "El mundo dice",
    ask: "¿Qué dice tu país?",
    verified: "Verified",
  },
  ru: {
    callsign: "Позывной",
    threat: "Угроза",
    myGuess: "Мой прогноз",
    worldSays: "Мир говорит",
    ask: "Что говорит твоя страна?",
    verified: "Verified",
  },
  it: {
    callsign: "Indicativo",
    threat: "Minaccia",
    myGuess: "La mia previsione",
    worldSays: "Il mondo dice",
    ask: "Cosa dice il tuo paese?",
    verified: "Verified",
  },
  pl: {
    callsign: "Sygnał",
    threat: "Zagrożenie",
    myGuess: "Moja prognoza",
    worldSays: "Świat mówi",
    ask: "Co mówi twój kraj?",
    verified: "Verified",
  },
  pt: {
    callsign: "Indicativo",
    threat: "Ameaça",
    myGuess: "A minha previsão",
    worldSays: "O mundo diz",
    ask: "O que diz o teu país?",
    verified: "Verified",
  },
} as const;

type CopyLocale = keyof typeof COPY;

function labels(locale?: string) {
  const key = (locale || "en").slice(0, 2).toLowerCase() as CopyLocale;
  return COPY[key] ?? COPY.en;
}

/** Open dog-tag card — full prediction visible, nothing redacted. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const card = parseShareCardParams(searchParams);
  const handle = card.handle || "@anon";
  const topic = card.topicTitle || "WWtellme";
  const pred = card.prediction || "—";
  const riskColor = card.isPeace ? "#34d399" : "#f59e0b";
  const L = labels(card.locale);
  const risk = Math.max(0, Math.min(100, card.risk));
  const stable = 100 - risk;

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
            height: 500,
            borderRadius: 28,
            border: "1px solid #3f3f46",
            background:
              "linear-gradient(160deg, #141414 0%, #0a0a0a 55%, #111 100%)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.65)",
            padding: "36px 44px",
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
              <span style={{ color: "#f59e0b", fontSize: 32, fontWeight: 900 }}>
                WW
              </span>
              <span
                style={{
                  color: "#d4d4d8",
                  fontSize: 26,
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
                color: "#f59e0b",
                fontSize: 16,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#f59e0b",
                  display: "flex",
                }}
              />
              {L.verified}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  color: "#71717a",
                  fontSize: 14,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                }}
              >
                {L.callsign}
              </span>
              <span style={{ color: "#fbbf24", fontSize: 34, fontWeight: 700 }}>
                {handle}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  color: "#71717a",
                  fontSize: 14,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                }}
              >
                {L.threat}
              </span>
              <span style={{ color: "#fafafa", fontSize: 30, fontWeight: 600 }}>
                {topic}
              </span>
            </div>

            <div style={{ display: "flex", gap: 40 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span
                  style={{
                    color: "#71717a",
                    fontSize: 14,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {L.myGuess}
                </span>
                <span
                  style={{ color: riskColor, fontSize: 26, fontWeight: 700 }}
                >
                  {pred}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span
                  style={{
                    color: "#71717a",
                    fontSize: 14,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {L.worldSays}
                </span>
                <span style={{ color: "#fafafa", fontSize: 26, fontWeight: 700 }}>
                  {card.country} · {risk}%
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                width: "100%",
                height: 12,
                borderRadius: 999,
                overflow: "hidden",
                background: "#27272a",
                marginTop: 4,
              }}
            >
              <div
                style={{
                  width: `${risk}%`,
                  height: "100%",
                  background: "#dc2626",
                  display: "flex",
                }}
              />
              <div
                style={{
                  width: `${stable}%`,
                  height: "100%",
                  background: "#10b981",
                  display: "flex",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#a1a1aa", fontSize: 18, letterSpacing: 1 }}>
              {L.ask}
            </span>
            <span
              style={{
                color: "#52525b",
                fontSize: 14,
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
