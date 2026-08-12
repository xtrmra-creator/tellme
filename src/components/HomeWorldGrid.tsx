"use client";

import { useEffect, useRef, type ReactNode } from "react";

const CELL = 24;
/** Match WeightedTypingGrid awakened amber (#f59e0b @ 0.1). */
const GLOW = "rgba(245, 158, 11, 0.1)";
const GLOW_SOFT = "rgba(245, 158, 11, 0.06)";
const FEATHER = 28;

type HomeWorldGridProps = {
  children: ReactNode;
  className?: string;
  /** Radar-style motto fragments around the globe */
  coords?: {
    nw?: string;
    n?: string;
    se?: string;
  };
};

/**
 * Static flattened-world LED desk behind the home logo + tagline.
 * Same amber tone/force as the intro typing grid — not dynamic.
 */
export default function HomeWorldGrid({
  children,
  className = "",
  coords,
}: HomeWorldGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);

  const ensureMask = (w: number, h: number, dpr: number) => {
    if (!maskRef.current) maskRef.current = document.createElement("canvas");
    const m = maskRef.current;
    const cw = Math.max(1, Math.floor(w * dpr));
    const ch = Math.max(1, Math.floor(h * dpr));
    if (m.width !== cw || m.height !== ch) {
      m.width = cw;
      m.height = ch;
    }
    return m;
  };

  const paint = () => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = root.getBoundingClientRect();
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Flattened world ellipse — wider than tall ("basık dünya")
    const cx = w * 0.5;
    const cy = h * 0.46;
    const rx = Math.min(w * 0.48, 420);
    const ry = Math.min(h * 0.42, rx * 0.58);

    // --- Awakened grid across canvas ---
    ctx.strokeStyle = GLOW;
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += CELL) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += CELL) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }

    // --- Soft longitude / latitude arcs (same amber force) ---
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = GLOW_SOFT;
    ctx.lineWidth = 1;

    // Parallels (horizontal ellipses)
    for (let i = -3; i <= 3; i++) {
      if (i === 0) continue;
      const t = i / 4;
      const pry = ry * Math.sqrt(Math.max(0, 1 - t * t));
      const py = cy + t * ry;
      ctx.beginPath();
      ctx.ellipse(cx, py, rx * 0.98, Math.max(2, pry * 0.22), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Equator
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx * 0.98, ry * 0.12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Meridians
    for (let i = -3; i <= 3; i++) {
      const t = i / 4;
      ctx.beginPath();
      ctx.ellipse(cx + t * rx * 0.15, cy, Math.max(4, rx * (0.22 + Math.abs(t) * 0.12)), ry * 0.98, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Prime meridian hint
    ctx.beginPath();
    ctx.moveTo(cx + 0.5, cy - ry);
    ctx.lineTo(cx + 0.5, cy + ry);
    ctx.stroke();

    ctx.restore();

    // Soft rim of the flattened world
    ctx.strokeStyle = "rgba(245, 158, 11, 0.14)";
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Soft elliptical mask — glow only inside the basık dünya footprint
    const mask = ensureMask(w, h, dpr);
    const mctx = mask.getContext("2d");
    if (!mctx) return;
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mctx.clearRect(0, 0, w, h);
    mctx.filter = `blur(${FEATHER * 0.55}px)`;
    mctx.fillStyle = "#fff";
    mctx.beginPath();
    mctx.ellipse(cx, cy, rx + FEATHER * 0.25, ry + FEATHER * 0.25, 0, 0, Math.PI * 2);
    mctx.fill();
    mctx.filter = "none";

    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    paint();
    const ro = new ResizeObserver(() => paint());
    ro.observe(root);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className={`relative isolate overflow-visible ${className}`}
    >
      {/* Resting desk — nearly invisible outside the world */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 158, 11, 0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 158, 11, 0.012) 1px, transparent 1px)
          `,
          backgroundSize: `${CELL}px ${CELL}px`,
          opacity: 0.35,
        }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
      />

      {/* Coordinate motto fragments — matte amber radar labels */}
      {(coords?.nw || coords?.n || coords?.se) && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] font-mono tracking-[0.14em] uppercase"
        >
          {coords.nw && (
            <p
              className="absolute -left-10 top-[14%] max-w-[42%] text-left text-[8px] leading-snug sm:-left-12 sm:top-[16%] sm:max-w-[36%] sm:text-[9px] md:-left-14 md:text-[10px]"
              style={{ color: "rgba(255, 176, 0, 0.42)" }}
            >
              {coords.nw}
            </p>
          )}
          {coords.n && (
            <p
              className="absolute left-1/2 top-1 max-w-[90%] -translate-x-1/2 text-center text-[8px] leading-snug sm:top-2 sm:text-[9px] md:text-[10px]"
              style={{ color: "rgba(255, 176, 0, 0.48)" }}
            >
              {coords.n}
            </p>
          )}
          {coords.se && (
            <p
              className="absolute bottom-[10%] right-1 max-w-[48%] text-right text-[8px] leading-snug sm:bottom-[12%] sm:right-2 sm:max-w-[40%] sm:text-[9px] md:right-3 md:text-[10px]"
              style={{ color: "rgba(255, 176, 0, 0.42)" }}
            >
              {coords.se}
            </p>
          )}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
