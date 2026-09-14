export function HeroGlobe() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-[420px]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="globe-fill" x1="60" y1="60" x2="340" y2="340" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f0abfc" />
          <stop offset="0.5" stopColor="#c084fc" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <radialGradient id="globe-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="200" r="190" fill="url(#globe-glow)" />

      {/* network mesh */}
      <g stroke="#a78bfa" strokeOpacity="0.35" strokeWidth="1">
        <path d="M30 90 L150 60 L260 120 L380 70" />
        <path d="M20 180 L140 200 L250 170 L370 210" />
        <path d="M40 300 L160 280 L270 320 L360 290" />
        <path d="M150 60 L140 200" />
        <path d="M260 120 L250 170" />
        <path d="M140 200 L160 280" />
        <path d="M250 170 L270 320" />
      </g>
      <g fill="#e9d5ff">
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

      {/* globe */}
      <circle cx="200" cy="200" r="130" fill="url(#globe-fill)" fillOpacity="0.85" />
      <g stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" fill="none">
        <ellipse cx="200" cy="200" rx="130" ry="130" />
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
        stroke="#c4b5fd"
        strokeOpacity="0.25"
        strokeWidth="1"
        strokeDasharray="2 6"
      />
      <circle cx="200" cy="20" r="4" fill="#f0abfc" />
      <circle cx="370" cy="140" r="3" fill="#818cf8" />
      <circle cx="60" cy="330" r="3" fill="#f0abfc" />
    </svg>
  );
}
