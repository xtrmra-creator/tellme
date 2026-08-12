import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#09090b" />
          <path
            d="M16 16 L16 1.5 A14.5 14.5 0 0 1 24.52 27.73 Z"
            fill="#dc2626"
          />
          <path
            d="M16 16 L24.52 27.73 A14.5 14.5 0 0 1 2.86 22.13 Z"
            fill="#f59e0b"
          />
          <path
            d="M16 16 L2.86 22.13 A14.5 14.5 0 0 1 16 1.5 Z"
            fill="#10b981"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
