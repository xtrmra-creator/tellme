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

type CardBits = {
  handle: string;
  topic: string;
  pred: string;
  riskColor: string;
  risk: number;
  stable: number;
  country: string;
  L: (typeof COPY)[CopyLocale];
};

/** Instagram Feed/Story — square 1080×1080, vertical dog-tag (no landscape crop). */
function igSquare(card: CardBits) {
  const { handle, topic, pred, riskColor, risk, stable, country, L } = card;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050505",
          fontFamily: "ui-monospace, monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 860,
            height: 980,
            borderRadius: 48,
            border: "1px solid #3f3f46",
            background:
              "linear-gradient(180deg, #161616 0%, #0a0a0a 55%, #050505 100%)",
            padding: "48px 52px",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ color: "#f59e0b", fontSize: 42, fontWeight: 900 }}>
                WW
              </span>
              <span
                style={{
                  color: "#d4d4d8",
                  fontSize: 34,
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
                gap: 10,
                color: "#f59e0b",
                fontSize: 20,
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
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
              gap: 36,
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                style={{
                  color: "#71717a",
                  fontSize: 18,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                }}
              >
                {L.callsign}
              </span>
              <span style={{ color: "#fbbf24", fontSize: 48, fontWeight: 700 }}>
                {handle}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                style={{
                  color: "#71717a",
                  fontSize: 18,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                }}
              >
                {L.threat}
              </span>
              <span
                style={{
                  color: "#fafafa",
                  fontSize: 36,
                  fontWeight: 600,
                  maxWidth: 720,
                }}
              >
                {topic}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span
                style={{
                  color: "#71717a",
                  fontSize: 18,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                }}
              >
                {L.myGuess}
              </span>
              <span style={{ color: riskColor, fontSize: 34, fontWeight: 700 }}>
                {pred}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: "100%",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#71717a",
                  fontSize: 18,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                }}
              >
                {L.worldSays}
              </span>
              <span style={{ color: "#fafafa", fontSize: 30, fontWeight: 700 }}>
                {country} · {risk}%
              </span>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: 14,
                  borderRadius: 999,
                  overflow: "hidden",
                  background: "#27272a",
                  marginTop: 8,
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
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ color: "#a1a1aa", fontSize: 22 }}>{L.ask}</span>
            <span
              style={{
                color: "#52525b",
                fontSize: 16,
                letterSpacing: 4,
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
      width: 1080,
      height: 1080,
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}

/** Facebook / X / link previews — 1200×630 landscape. */
function ogLandscape(card: CardBits) {
  const { handle, topic, pred, riskColor, risk, stable, country, L } = card;
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
            display: "flex",
            flexDirection: "column",
            width: 920,
            height: 500,
            borderRadius: 28,
            border: "1px solid #3f3f46",
            background:
              "linear-gradient(160deg, #141414 0%, #0a0a0a 55%, #111 100%)",
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

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                  {country} · {risk}%
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
            <span style={{ color: "#a1a1aa", fontSize: 18 }}>{L.ask}</span>
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const card = parseShareCardParams(searchParams);
  const handle =
    card.handle ||
    ((card.locale || "").startsWith("tr") ? "@anonim" : "@anon");
  const bits: CardBits = {
    handle,
    topic: card.topicTitle || "WWtellme",
    pred: card.prediction || "—",
    riskColor: card.isPeace ? "#34d399" : "#f59e0b",
    risk: Math.max(0, Math.min(100, card.risk)),
    stable: 100 - Math.max(0, Math.min(100, card.risk)),
    country: card.country,
    L: labels(card.locale),
  };

  const fmt = (searchParams.get("fmt") || "og").toLowerCase();
  if (fmt === "ig") return igSquare(bits);
  return ogLandscape(bits);
}
