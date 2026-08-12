"use client";

import { useEffect, useRef, type ReactNode } from "react";

type WeightedTypingGridProps = {
  text: string;
  complete: boolean;
  children: ReactNode;
  className?: string;
};

const CELL = 24;
const FEATHER_PX = 18;
const FADE_DELAY_MS = 3000;
const FADE_DURATION_MS = 4000;

/**
 * Soft LED-desk: nearly invisible base grid + canvas glow under ALL typed
 * line footprints at once (union mask — previous lines stay lit).
 */
export default function WeightedTypingGrid({
  text,
  complete,
  children,
  className = "",
}: WeightedTypingGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

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

  const collectLineRects = (textEl: Element): DOMRect[] => {
    const node = textEl.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) {
      const box = textEl.getBoundingClientRect();
      return box.width > 0.5 ? [box] : [];
    }
    const raw = node.textContent || "";
    if (!raw.length) return [];

    let end = raw.length;
    while (end > 0 && /\s/.test(raw[end - 1])) end--;
    if (end === 0) return [];

    try {
      const range = document.createRange();
      range.setStart(node, 0);
      range.setEnd(node, end);
      return Array.from(range.getClientRects()).filter(
        (r) => r.width > 0.5 && r.height > 0.5,
      );
    } catch {
      const box = textEl.getBoundingClientRect();
      return box.width > 0.5 ? [box] : [];
    }
  };

  const drawGlowGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Same amber as the caret (#f59e0b) — half the previous intensity, no yellow shift
    ctx.strokeStyle = "rgba(245, 158, 11, 0.1)";
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
  };

  const paint = () => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const textLayer = textLayerRef.current;
    if (!root || !canvas || !textLayer) return;

    const { w, h, dpr } = sizeRef.current;
    if (w < 1 || h < 1) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.clearRect(0, 0, w, h);

    const textEl = textLayer.querySelector("[data-wtg-text]");
    const content = textEl?.textContent ?? "";
    if (!textEl || !content.length) return;

    const rootRect = root.getBoundingClientRect();
    const lines = collectLineRects(textEl);
    if (lines.length === 0) return;

    // 1) Full awakened grid
    drawGlowGrid(ctx, w, h);

    // 2) Build ONE soft union mask of ALL typed lines (so prior lines stay lit)
    const mask = ensureMask(w, h, dpr);
    const mctx = mask.getContext("2d");
    if (!mctx) return;
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mctx.clearRect(0, 0, w, h);
    mctx.globalCompositeOperation = "source-over";
    mctx.filter = `blur(${FEATHER_PX * 0.55}px)`;
    mctx.fillStyle = "#ffffff";
    const pad = FEATHER_PX * 0.4;

    for (const r of lines) {
      const x = r.left - rootRect.left - pad;
      const y = r.top - rootRect.top - pad;
      const rw = r.width + pad * 2;
      const rh = r.height + pad * 2;
      roundRect(mctx, x, y, rw, rh, Math.min(8, rh * 0.4));
      mctx.fill();
    }
    mctx.filter = "none";

    // 3) Apply mask once — keeps every line that was stamped into the union
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(mask, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  };

  const schedulePaint = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => paint());
    });
  };

  const resize = () => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = root.getBoundingClientRect();
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    sizeRef.current = { w, h, dpr };
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    schedulePaint();
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(root);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!complete) {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      canvas.style.transition = "none";
      canvas.style.opacity = "1";
      schedulePaint();
      return;
    }

    schedulePaint();
    canvas.style.transition = "none";
    canvas.style.opacity = "1";

    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    // Hold 3s fully lit, then fade out over 4s
    fadeTimerRef.current = setTimeout(() => {
      const c = canvasRef.current;
      if (!c) return;
      c.style.transition = `opacity ${FADE_DURATION_MS}ms ease-in-out`;
      c.style.opacity = "0";
    }, FADE_DELAY_MS);

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, complete]);

  return (
    <div
      ref={rootRef}
      className={`relative isolate overflow-hidden rounded-xl ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 158, 11, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 158, 11, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: `${CELL}px ${CELL}px`,
          opacity: 0.4,
        }}
      />

      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
      />

      <div ref={textLayerRef} className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
