/** Three-slice poll pie: risk / split / peace — not a two-tone flag. */
export const RATIO_PIE_PATHS = {
  red: "M16 16 L16 1.5 A14.5 14.5 0 0 1 24.52 27.73 Z",
  amber: "M16 16 L24.52 27.73 A14.5 14.5 0 0 1 2.86 22.13 Z",
  green: "M16 16 L2.86 22.13 A14.5 14.5 0 0 1 16 1.5 Z",
} as const;

export function RatioMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <circle cx="16" cy="16" r="16" fill="#09090b" />
      <path d={RATIO_PIE_PATHS.red} fill="#dc2626" />
      <path d={RATIO_PIE_PATHS.amber} fill="#f59e0b" />
      <path d={RATIO_PIE_PATHS.green} fill="#10b981" />
      <circle
        cx="16"
        cy="16"
        r="15.2"
        fill="none"
        stroke="#27272a"
        strokeWidth="1.25"
      />
    </svg>
  );
}
