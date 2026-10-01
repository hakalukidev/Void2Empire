import { useId } from "react";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
  tagline?: string;
}

/** The V silhouette every variant of the mark is cut from. */
const V_SHAPE = "M4 6 H13 L24 31 L35 6 H44 L28 42 H20 Z";

/** Slicing the V's right arm into three prongs is what makes it read as an E. */
const NOTCHES = [
  { x: 24, y: 13 },
  { x: 24, y: 23 },
];

const NOTCH_SIZE = { width: 24, height: 4.5 };

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-accent`} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-blue-300)" />
          <stop offset="0.55" stopColor="var(--brand-blue-500)" />
          <stop offset="1" stopColor="var(--brand-blue-600)" />
        </linearGradient>
        <mask id={`${id}-notch`}>
          <rect width="48" height="48" fill="white" />
          {NOTCHES.map((n) => (
            <rect key={n.y} x={n.x} y={n.y} {...NOTCH_SIZE} fill="black" />
          ))}
        </mask>
      </defs>
      <path
        d={V_SHAPE}
        fill={`url(#${id}-accent)`}
        mask={`url(#${id}-notch)`}
      />
    </svg>
  );
}

/* The skyline only shows through the V's opening, so it is drawn as a wedge
   that widens into the strip above the arms — the towers rise out of the
   counter the way they do in the artwork this variant is modelled on. */
const SKY_SHAPE = "M13 0 H35 V6 L24 31 L13 6 Z";

const CITY_BASE = 34;

const CITY_TOWERS = [
  { x: 13.4, w: 3.6, top: 11.5 },
  { x: 17.4, w: 4.2, top: 5.5 },
  { x: 22.1, w: 3.8, top: 1.8 },
  { x: 26.3, w: 4.2, top: 7.5 },
  { x: 31.0, w: 3.6, top: 13 },
];

/**
 * The welcome-band mark: the same V, read as lit glass over a neon city.
 *
 * Decorative and large, so unlike `LogoMark` it is built from the fixed dark
 * ramp — it only ever sits on a `night` band, where the tokens resolve to the
 * same bright values in both themes. Keep the 48-unit box so the two marks
 * scale identically.
 */
export function HeroMark({ size = 100, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-face`} x1="4" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-blue-300)" />
          <stop offset="0.45" stopColor="var(--brand-blue-400)" />
          <stop offset="1" stopColor="var(--brand-blue-600)" />
        </linearGradient>
        <linearGradient id={`${id}-deep`} x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-blue-500)" />
          <stop offset="0.6" stopColor="var(--brand-blue-700)" />
          <stop offset="1" stopColor="#0a1428" />
        </linearGradient>
        <linearGradient id={`${id}-bevel`} x1="24" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="var(--brand-blue-200)" stopOpacity="0.75" />
          <stop offset="1" stopColor="var(--brand-blue-200)" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`${id}-tower`} x1="24" y1="0" x2="24" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1b2f52" />
          <stop offset="1" stopColor="#070d1a" />
        </linearGradient>
        <radialGradient id={`${id}-city`} cx="24" cy="15" r="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-blue-500)" stopOpacity="0.6" />
          <stop offset="1" stopColor="var(--brand-blue-500)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-magenta`}>
          <stop stopColor="#ff7ad9" stopOpacity="0.75" />
          <stop offset="0.4" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#7fe6ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--brand-blue-500)" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-sky`}>
          <path d={SKY_SHAPE} />
        </clipPath>
        <mask id={`${id}-v`}>
          <path d={V_SHAPE} fill="white" />
          {NOTCHES.map((n) => (
            <rect key={n.y} x={n.x} y={n.y} {...NOTCH_SIZE} fill="black" />
          ))}
        </mask>
      </defs>

      <g clipPath={`url(#${id}-sky)`}>
        <rect x="13" y="0" width="22" height={CITY_BASE} fill={`url(#${id}-city)`} />
        {CITY_TOWERS.map((tower) => {
          const cols = Math.max(1, Math.floor((tower.w - 1.7) / 1.3) + 1);
          const rows = Math.max(1, Math.floor((CITY_BASE - tower.top - 2.6) / 2.2));
          return (
            <g key={tower.x}>
              <rect
                x={tower.x}
                y={tower.top}
                width={tower.w}
                height={CITY_BASE - tower.top}
                fill={`url(#${id}-tower)`}
              />
              {Array.from({ length: rows * cols }, (_, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                // A fixed remainder, so the same towers light up every render.
                if ((row * 7 + col * 5 + Math.round(tower.x * 10)) % 4 === 0) return null;
                return (
                  <rect
                    key={i}
                    x={tower.x + 0.55 + col * 1.3}
                    y={tower.top + 1.4 + row * 2.2}
                    width="0.6"
                    height="1"
                    fill={(row + col) % 6 === 0 ? "#ffb547" : "#9fe3ff"}
                    opacity="0.8"
                  />
                );
              })}
            </g>
          );
        })}
        <path d="M24 1.8 V0.3" stroke="#9fe3ff" strokeWidth="0.4" opacity="0.9" />
      </g>

      <g mask={`url(#${id}-v)`}>
        <path d={V_SHAPE} fill={`url(#${id}-face)`} />
        {/* The half of each arm that faces the opening falls away into shadow,
            which is what turns the flat silhouette into four bevelled facets. */}
        <path d="M8.5 6 H13 L24 31 V42 H22 Z" fill={`url(#${id}-deep)`} />
        <path d="M39.5 6 H35 L24 31 V42 H26 Z" fill={`url(#${id}-deep)`} />
        {/* Strokes ride the contours and the mask keeps only their inner half,
            so every edge reads as a lit bevel rather than an outline. */}
        <g fill="none" stroke={`url(#${id}-bevel)`} strokeWidth="1.5" strokeLinejoin="round">
          <path d="M4 6 L20 42" />
          <path d="M44 6 L28 42" />
        </g>
        <g fill="none" stroke="var(--brand-blue-200)" strokeOpacity="0.9" strokeWidth="1.6">
          <path d="M4 6 H13" />
          <path d="M35 6 H44" />
        </g>
        <g fill="none" stroke="#eaf4ff" strokeOpacity="0.85" strokeWidth="1.8">
          <path d="M13 6 L24 31" />
          <path d="M35 6 L24 31" />
        </g>
        <g fill="none" stroke={`url(#${id}-bevel)`} strokeWidth="1.2" opacity="0.45">
          <path d="M8.5 6 L22 42" />
          <path d="M39.5 6 L26 42" />
        </g>
      </g>

      {/* Every bloom is sized to stay inside the box, so none of them get cut by
          the viewport edge and leave a hard line on the band. */}
      <circle cx="8.5" cy="6.5" r="6.5" fill={`url(#${id}-magenta)`} />
      <circle cx="39.5" cy="6.5" r="6.5" fill={`url(#${id}-magenta)`} />
      <circle cx="24" cy="42" r="6" fill={`url(#${id}-glow)`} />
      <ellipse cx="24" cy="43.8" rx="9.5" ry="1.7" fill={`url(#${id}-glow)`} opacity="0.7" />
      <path
        transform="translate(13 6)"
        d="M0 -3.4 L0.6 -0.6 L3.4 0 L0.6 0.6 L0 3.4 L-0.6 0.6 L-3.4 0 L-0.6 -0.6 Z"
        fill="#ffffff"
        opacity="0.7"
      />
      <path
        transform="translate(35 6)"
        d="M0 -3.4 L0.6 -0.6 L3.4 0 L0.6 0.6 L0 3.4 L-0.6 0.6 L-3.4 0 L-0.6 -0.6 Z"
        fill="#ffffff"
        opacity="0.7"
      />
    </svg>
  );
}

export function Logo({ className, iconOnly = false, size = 32, tagline }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {!iconOnly && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight">
            Void
            <span className="bg-linear-to-r from-brand-blue-300 to-brand-blue-500 bg-clip-text text-transparent">
              2Empire
            </span>
          </span>
          {tagline && (
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
