import { WORLD_LAND_PATH } from "@/components/marketing/world-land-path";

const MAP_WIDTH = 520;
const TILE_X = 200 - MAP_WIDTH / 2; // centers the map tile on the globe

export function HeroGlobe() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-[420px]"
      aria-hidden="true"
    >
      <style>{`
        @keyframes v2e-globe-spin {
          from { transform: translateX(0); }
          to { transform: translateX(-${MAP_WIDTH}px); }
        }
        .v2e-globe-spin {
          animation: v2e-globe-spin 32s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .v2e-globe-spin {
            animation-duration: 240s;
          }
        }
      `}</style>

      <defs>
        <linearGradient id="globe-fill" x1="60" y1="60" x2="340" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-blue-300)" />
          <stop offset="0.5" stopColor="var(--brand-blue-500)" />
          <stop offset="1" stopColor="var(--brand-blue-700)" />
        </linearGradient>
        <radialGradient id="globe-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="var(--brand-blue-500)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--brand-blue-500)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="globe-shade" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--background)" stopOpacity="0.55" />
        </radialGradient>
        <clipPath id="globe-clip">
          <circle cx="200" cy="200" r="130" />
        </clipPath>
      </defs>

      <circle cx="200" cy="200" r="190" fill="url(#globe-glow)" />

      {/* network mesh */}
      <g stroke="var(--brand-blue-400)" strokeOpacity="0.35" strokeWidth="1">
        <path d="M30 90 L150 60 L260 120 L380 70" />
        <path d="M20 180 L140 200 L250 170 L370 210" />
        <path d="M40 300 L160 280 L270 320 L360 290" />
        <path d="M150 60 L140 200" />
        <path d="M260 120 L250 170" />
        <path d="M140 200 L160 280" />
        <path d="M250 170 L270 320" />
      </g>
      <g fill="var(--brand-blue-300)">
        <circle cx="30" cy="90" r="3" />
        <circle cx="150" cy="60" r="3" />
        <circle cx="260" cy="120" r="4" />
        <circle cx="380" cy="70" r="3" />
        <circle cx="20" cy="180" r="3" />
        <circle cx="140" cy="200" r="3" />
        <circle cx="250" cy="170" r="4" />
        <circle cx="370" cy="210" r="3" />
        <circle cx="40" cy="300" r="3" />
        <circle cx="160" cy="280" r="3" />
        <circle cx="270" cy="320" r="4" />
        <circle cx="360" cy="290" r="3" />
      </g>

      {/* globe: ocean base + spinning land band */}
      <circle cx="200" cy="200" r="130" fill="var(--card)" />
      <g clipPath="url(#globe-clip)">
        <g className="v2e-globe-spin">
          <path d={WORLD_LAND_PATH} fill="url(#globe-fill)" transform={`translate(${TILE_X},70)`} />
          <path
            d={WORLD_LAND_PATH}
            fill="url(#globe-fill)"
            transform={`translate(${TILE_X + MAP_WIDTH},70)`}
          />
        </g>
        <circle cx="200" cy="200" r="130" fill="url(#globe-shade)" />
      </g>

      {/* wireframe grid over the sphere */}
      <g stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" fill="none">
        <circle cx="200" cy="200" r="130" />
        <ellipse cx="200" cy="200" rx="55" ry="130" />
        <ellipse cx="200" cy="200" rx="105" ry="130" />
        <ellipse cx="200" cy="200" rx="130" ry="55" />
        <ellipse cx="200" cy="200" rx="130" ry="105" />
      </g>

      {/* orbit ring + satellite dots */}
      <circle
        cx="200"
        cy="200"
        r="175"
        stroke="var(--brand-blue-400)"
        strokeOpacity="0.25"
        strokeWidth="1"
        strokeDasharray="2 6"
      />
      <circle cx="200" cy="20" r="4" fill="var(--brand-blue-400)" />
      <circle cx="370" cy="140" r="3" fill="var(--brand-blue-600)" />
      <circle cx="60" cy="330" r="3" fill="var(--brand-blue-400)" />
    </svg>
  );
}
