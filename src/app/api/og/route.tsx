import { ImageResponse } from "next/og";
import { parseShareCardParams } from "@/lib/shareCard";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const card = parseShareCardParams(searchParams);
  const handle = card.handle || "@anon";
  const riskColor = card.isPeace ? "#34d399" : "#f59e0b";
  const predLabel = card.prediction;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#050505",
          color: "#e4e4e7",
          fontFamily: "ui-monospace, monospace",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "56px 64px",
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
              <span style={{ color: "#f59e0b", fontSize: 42, fontWeight: 900 }}>
                WW
              </span>
              <span
                style={{
                  color: "#e4e4e7",
                  fontSize: 36,
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
                fontSize: 18,
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
              Verified
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
              marginTop: 24,
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
                Callsign
              </span>
              <span style={{ color: "#fbbf24", fontSize: 44, fontWeight: 700 }}>
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
                Threat
              </span>
              <span style={{ color: "#fafafa", fontSize: 36, fontWeight: 600 }}>
                {card.topicTitle}
              </span>
            </div>

            <div style={{ display: "flex", gap: 48 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    color: "#71717a",
                    fontSize: 18,
                    letterSpacing: 6,
                    textTransform: "uppercase",
                  }}
                >
                  My prediction
                </span>
                <span
                  style={{ color: riskColor, fontSize: 32, fontWeight: 700 }}
                >
                  {predLabel}
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
                  World says
                </span>
                <span style={{ color: "#fafafa", fontSize: 32, fontWeight: 700 }}>
                  {card.country} · {card.risk}% war
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                width: "100%",
                height: 16,
                borderRadius: 999,
                overflow: "hidden",
                background: "#27272a",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: `${card.risk}%`,
                  height: "100%",
                  background: "#dc2626",
                  display: "flex",
                }}
              />
              <div
                style={{
                  width: `${100 - card.risk}%`,
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
              alignItems: "flex-end",
              marginTop: 32,
            }}
          >
            <span
              style={{
                color: "#a1a1aa",
                fontSize: 22,
                letterSpacing: 2,
              }}
            >
              What does your country say?
            </span>
            <span
              style={{
                color: "#71717a",
                fontSize: 20,
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
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=86400",
      },
    },
  );
}
