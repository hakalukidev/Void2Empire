import { useId } from "react";

/*
 * The welcome-band artwork: a wide glass V over a night skyline, mountains at
 * its foot, a pool of light where the tip lands, and lightning striking the
 * V's shoulders every few seconds.
 *
 * Unlike `HeroMark`, the V here is translucent — the towers behind it show
 * through the arms, which is what makes it read as glass rather than metal.
 * Coordinates are in scene units: the V spans -6..54 across and 4..46 down.
 */

const BOX = { x: -14, y: -21, w: 76, h: 76 };
const FLOOR = BOX.y + BOX.h;
const TIP = { x: 24, y: 46 };

/* Each arm is two facets split along its midline: the outer face catches the
   light, the inner one falls away into shadow. The right arm mirrors the left. */
const LEFT_OUTER = "-6 4 -1.5 4 24 39.5 24 46";
const LEFT_INNER = "-1.5 4 3 4 24 33 24 39.5";
const mirror = (points: string) =>
  points
    .split(" ")
    .map((n, i) => (i % 2 === 0 ? String(48 - Number(n)) : n))
    .join(" ");

const TOWERS = [
  { x: 3, w: 3, top: 6 },
  { x: 6.4, w: 3.6, top: -3 },
  { x: 10.4, w: 3.4, top: -9 },
  { x: 14.2, w: 4, top: -13 },
  { x: 18.6, w: 3.6, top: -7 },
  { x: 22.6, w: 4.4, top: -18 },
  { x: 27.4, w: 3.8, top: -11 },
  { x: 31.6, w: 4, top: -15 },
  { x: 36, w: 3.4, top: -6 },
  { x: 39.8, w: 3.6, top: -1 },
  { x: 43.8, w: 3, top: 5 },
];
const TOWER_BASE = 40;

/* Ridges run left to right and are closed down to the floor, so the rim stroke
   reuses the same points. The back ranges meet in a valley under the tip. */
const RIDGE_LEFT = "-14 41 -10 34 -6 36 -2 28 1 31 4 26 7 32 10 30 14 36 19 41 24 46";
const RIDGE_RIGHT = mirror(RIDGE_LEFT).split(" ").reduceRight<string[]>(
  // Mirrored, then walked backwards a point at a time so it still runs left to right.
  (out, n, i, all) => (i % 2 ? [...out, `${all[i - 1]} ${n}`] : out),
  []
).join(" ");
const RIDGE_FRONT = "-14 49 -9 44 -4 47 1 42 6 46 11 44 16 48 24 51 32 48 37 44 42 47 47 42 52 46 57 44 62 49";

/* Each bolt drops from the top of the scene onto one of the V's shoulders.
   The two run on different cycles so the strikes never fall into a pattern. */
const BOLTS = [
  {
    x: -1.5,
    main: "M-3 -21 L-0.5 -14 L-3.2 -11 L0.6 -5.5 L-1.6 -3 L-1.5 4",
    branch: "M-0.5 -14 L2.5 -11.5 L1.8 -8.5 M0.6 -5.5 L3 -4",
    duration: "5.5s",
    delay: "-1s",
  },
  {
    x: 49.5,
    main: "M51 -21 L48.6 -14.5 L51.2 -11 L47.6 -6 L49.8 -3.2 L49.5 4",
    branch: "M48.6 -14.5 L45.6 -12 L46.2 -9 M47.6 -6 L45 -4.5",
    duration: "7.5s",
    delay: "-4.2s",
  },
];

const STARS = [
  [-10, -15, 0.35], [-6, 2, 0.25], [1, -18, 0.3], [47, -17, 0.3], [55, -8, 0.35],
  [58, 10, 0.2], [-11, 14, 0.2], [53, 1, 0.25],
] as const;

const SPARKLE = "M0 -3.4 L0.6 -0.6 L3.4 0 L0.6 0.6 L0 3.4 L-0.6 0.6 L-3.4 0 L-0.6 -0.6 Z";

// Keyframe names are global, so they carry a prefix. Motion is decorative and
// stops entirely for people who ask for reduced motion.
const STYLES = `
@keyframes v2e-bolt { 0%, 86%, 100% { opacity: 0 } 87% { opacity: 1 } 88.5% { opacity: .15 } 90% { opacity: 1 } 93% { opacity: 0 } }
@keyframes v2e-flash { 0%, 86%, 100% { opacity: 0 } 87% { opacity: .55 } 88.5% { opacity: .1 } 90% { opacity: .45 } 95% { opacity: 0 } }
@keyframes v2e-current { from { stroke-dashoffset: 100 } to { stroke-dashoffset: 0 } }
@keyframes v2e-pulse { 0%, 100% { opacity: .7 } 50% { opacity: 1 } }
.v2e-bolt { opacity: 0; animation: v2e-bolt linear infinite }
.v2e-flash { opacity: 0; animation: v2e-flash linear infinite }
.v2e-current { animation: v2e-current 2.4s linear infinite }
.v2e-pulse { animation: v2e-pulse 3s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .v2e-bolt, .v2e-flash { animation: none; opacity: 0 }
  .v2e-current, .v2e-pulse { animation: none }
}`;

const closed = (ridge: string) => {
  const points = ridge.split(" ");
  return `M${ridge} L${points[points.length - 2]} ${FLOOR} L${points[0]} ${FLOOR} Z`;
};

export function HeroScene({ height = 180, className }: { height?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const url = (name: string) => `url(#${id}-${name})`;

  return (
    <svg
      height={height}
      width={(height * BOX.w) / BOX.h}
      viewBox={`${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <style>{STYLES}</style>
      <defs>
        <radialGradient id={`${id}-aura`} cx="24" cy="10" r="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b6dff" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#6d3cf0" stopOpacity="0.2" />
          <stop offset="1" stopColor="#6d3cf0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-tower`} x1="0" y1="-18" x2="0" y2={TOWER_BASE} gradientUnits="userSpaceOnUse">
          <stop stopColor="#2a4a80" />
          <stop offset="0.35" stopColor="#12224a" />
          <stop offset="1" stopColor="#060b18" />
        </linearGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="4" x2="0" y2={TIP.y} gradientUnits="userSpaceOnUse">
          <stop stopColor="#7cb2ff" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="#3b6dff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#1d3fb8" stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="4" x2="0" y2={TIP.y} gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e3a8a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0a1638" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`${id}-rock`} x1="0" y1="26" x2="0" y2={FLOOR} gradientUnits="userSpaceOnUse">
          <stop stopColor="#24406f" />
          <stop offset="0.4" stopColor="#0f1d3a" />
          <stop offset="1" stopColor="#04070e" />
        </linearGradient>
        <linearGradient id={`${id}-rock-front`} x1="0" y1="42" x2="0" y2={FLOOR} gradientUnits="userSpaceOnUse">
          <stop stopColor="#122245" />
          <stop offset="1" stopColor="#03060c" />
        </linearGradient>
        <linearGradient id={`${id}-rim`} x1={BOX.x} y1="0" x2={BOX.x + BOX.w} y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4c8dff" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#9fe3ff" />
          <stop offset="1" stopColor="#4c8dff" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id={`${id}-pool`}>
          <stop stopColor="#e6fbff" />
          <stop offset="0.25" stopColor="#7fe6ff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#3b6dff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-magenta`}>
          <stop stopColor="#ff7ad9" stopOpacity="0.8" />
          <stop offset="0.4" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-flash`}>
          <stop stopColor="#dbeafe" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7c9cff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        {/* Every edge of the scene fades out, so the art melts into the band. */}
        <linearGradient id={`${id}-fade-x`} x1={BOX.x} y1="0" x2={BOX.x + BOX.w} y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="0.08" stopColor="white" />
          <stop offset="0.92" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-fade-y`} x1="0" y1={BOX.y} x2="0" y2={FLOOR} gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="0.06" stopColor="white" />
          <stop offset="0.88" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-fade-y-mask`}>
          <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} fill={url("fade-y")} />
        </mask>
        <mask id={`${id}-fade`}>
          <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} fill={url("fade-x")} mask={url("fade-y-mask")} />
        </mask>
      </defs>

      <g mask={url("fade")}>
        <ellipse cx="24" cy="10" rx="40" ry="34" fill={url("aura")} />
        {STARS.map(([x, y, o]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.35" fill="#dbeafe" opacity={o} />
        ))}

        {/* Sky flashes sit behind the city, so the towers silhouette against them. */}
        {BOLTS.map((bolt) => (
          <ellipse
            key={`flash-${bolt.main}`}
            className="v2e-flash"
            style={{ animationDuration: bolt.duration, animationDelay: bolt.delay }}
            cx={bolt.x}
            cy="-8"
            rx="22"
            ry="18"
            fill={url("flash")}
          />
        ))}

        {TOWERS.map((tower) => {
          const cols = Math.max(1, Math.floor((tower.w - 1.7) / 1.3) + 1);
          const rows = Math.floor((TOWER_BASE - tower.top - 2.6) / 2.2);
          return (
            <g key={tower.x}>
              <rect x={tower.x} y={tower.top} width={tower.w} height={TOWER_BASE - tower.top} fill={url("tower")} />
              {/* A lit left edge is what makes each slab read as glass. */}
              <path
                d={`M${tower.x + 0.15} ${tower.top} V${TOWER_BASE}`}
                stroke="#8cc4ff"
                strokeOpacity="0.45"
                strokeWidth="0.3"
              />
              {Array.from({ length: rows * cols }, (_, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                // A fixed remainder, so the same windows light up every render.
                if ((row * 7 + col * 5 + Math.round(tower.x * 10)) % 3 === 0) return null;
                return (
                  <rect
                    key={i}
                    x={tower.x + 0.55 + col * 1.3}
                    y={tower.top + 1.4 + row * 2.2}
                    width="0.6"
                    height="1"
                    fill={(row + col) % 7 === 0 ? "#ffb547" : "#9fe3ff"}
                    opacity="0.75"
                  />
                );
              })}
            </g>
          );
        })}
        <path d="M24.8 -18 V-20.5" stroke="#9fe3ff" strokeWidth="0.35" />

        {/* The glass V: a blurred halo, translucent facets, then lit edges. */}
        <path
          d={`M-6 4 H3 L24 33 L45 4 H54 L${TIP.x} ${TIP.y} Z`}
          stroke="#3b6dff"
          strokeWidth="2"
          filter={url("soft")}
          opacity="0.9"
        />
        <polygon points={LEFT_OUTER} fill={url("face")} />
        <polygon points={LEFT_INNER} fill={url("shade")} />
        <polygon points={mirror(LEFT_OUTER)} fill={url("face")} />
        <polygon points={mirror(LEFT_INNER)} fill={url("shade")} />
        <g strokeLinejoin="round" strokeLinecap="round">
          <path d="M-6 4 L24 46 L54 4" stroke="#e6f1ff" strokeWidth="0.55" />
          <path d="M3 4 L24 33 L45 4" stroke="#bcd6ff" strokeWidth="0.45" />
          <path d="M-1.5 4 L24 39.5 L49.5 4" stroke="#93c5fd" strokeWidth="0.3" opacity="0.7" />
          <path d="M-6 4 H3 M45 4 H54" stroke="#dbeafe" strokeWidth="0.55" />
        </g>
        {/* Current running down both outer edges into the tip. */}
        <g className="v2e-current" stroke="#e6fbff" strokeWidth="0.7" strokeLinecap="round" filter={url("glow")}>
          <path d="M-6 4 L24 46" pathLength={100} strokeDasharray="7 93" />
          <path d="M54 4 L24 46" pathLength={100} strokeDasharray="7 93" />
        </g>

        {[RIDGE_LEFT, RIDGE_RIGHT].map((ridge) => (
          <g key={ridge}>
            <path d={closed(ridge)} fill={url("rock")} />
            <path d={`M${ridge}`} stroke={url("rim")} strokeWidth="0.4" strokeLinejoin="round" />
          </g>
        ))}

        <g className="v2e-pulse">
          <ellipse cx={TIP.x} cy="47.2" rx="14" ry="2.6" fill={url("pool")} />
          <path d="M14 47.3 H34" stroke="#e6fbff" strokeWidth="0.25" opacity="0.7" />
        </g>
        <path d={closed(RIDGE_FRONT)} fill={url("rock-front")} />
        <path d={`M${RIDGE_FRONT}`} stroke={url("rim")} strokeOpacity="0.5" strokeWidth="0.3" strokeLinejoin="round" />

        {[-1.5, 49.5].map((x) => (
          <g key={x}>
            <circle cx={x} cy="4" r="7" fill={url("magenta")} />
            <path transform={`translate(${x} 4)`} d={SPARKLE} fill="#ffffff" opacity="0.8" />
          </g>
        ))}

        {BOLTS.map((bolt) => (
          <g
            key={bolt.main}
            className="v2e-bolt"
            style={{ animationDuration: bolt.duration, animationDelay: bolt.delay }}
            filter={url("glow")}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path d={bolt.main} stroke="#f0faff" strokeWidth="0.55" />
            <path d={bolt.branch} stroke="#bfe6ff" strokeWidth="0.3" />
          </g>
        ))}
      </g>
    </svg>
  );
}
