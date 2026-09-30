import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const points = [
  "Long or short with configurable leverage and margin",
  "Binary options with the potential payout shown before you trade",
  "$10,000 in demo funds — virtual funds, no real money",
  "Order, position and transaction history you can review",
];

// The frame depicts a dark trading terminal, so it carries its own palette instead of
// following the page theme - a themed laptop goes white-on-white in light mode.
const shell = "#111827";
const edge = "#1e293b";
const screen = "#0b0f19";
const rail = "#334155";
const bull = "#10b981";
const bear = "#ef4444";
const accent = "#4c8dff";

type Candle = { x: number; wickTop: number; wickBottom: number; bodyTop: number; bodyHeight: number };

const candles: Candle[] = [
  { x: 68, wickTop: 60, wickBottom: 110, bodyTop: 72, bodyHeight: 26 },
  { x: 90, wickTop: 52, wickBottom: 100, bodyTop: 62, bodyHeight: 24 },
  { x: 112, wickTop: 66, wickBottom: 118, bodyTop: 78, bodyHeight: 26 },
  { x: 134, wickTop: 48, wickBottom: 96, bodyTop: 58, bodyHeight: 24 },
  { x: 156, wickTop: 40, wickBottom: 84, bodyTop: 50, bodyHeight: 22 },
  { x: 178, wickTop: 54, wickBottom: 98, bodyTop: 64, bodyHeight: 22 },
  { x: 200, wickTop: 34, wickBottom: 78, bodyTop: 44, bodyHeight: 22 },
  { x: 222, wickTop: 28, wickBottom: 68, bodyTop: 36, bodyHeight: 22 },
  { x: 244, wickTop: 42, wickBottom: 82, bodyTop: 52, bodyHeight: 20 },
  { x: 266, wickTop: 24, wickBottom: 66, bodyTop: 32, bodyHeight: 22 },
];

function candleColor(i: number) {
  return i % 3 !== 2 ? bull : bear;
}

function DeviceFrame() {
  return (
    <svg
      viewBox="0 0 380 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-[440px]"
      role="img"
      aria-label="Illustrative drawing of a trading interface on a laptop and a phone"
    >
      <rect x="20" y="10" width="280" height="182" rx="10" fill={shell} stroke={edge} />
      <rect x="32" y="26" width="22" height="150" rx="4" fill={edge} />
      <g fill={accent} fillOpacity="0.5">
        <circle cx="43" cy="40" r="3" />
        <circle cx="43" cy="54" r="3" />
        <circle cx="43" cy="68" r="3" />
      </g>
      <rect x="62" y="26" width="226" height="150" rx="4" fill={screen} />
      <g stroke={edge} strokeWidth="1">
        <line x1="62" y1="62" x2="288" y2="62" />
        <line x1="62" y1="98" x2="288" y2="98" />
        <line x1="62" y1="128" x2="288" y2="128" />
      </g>
      {candles.map((candle, i) => {
        const color = candleColor(i);
        const volume = ((i * 7) % 11) + 6;
        return (
          <g key={candle.x}>
            <line
              x1={candle.x + 5}
              y1={candle.wickTop}
              x2={candle.x + 5}
              y2={candle.wickBottom}
              stroke={color}
              strokeWidth="1"
            />
            <rect
              x={candle.x}
              y={candle.bodyTop}
              width="10"
              height={candle.bodyHeight}
              rx="1.5"
              fill={color}
            />
            <rect
              x={candle.x}
              y={168 - volume}
              width="10"
              height={volume}
              rx="1"
              fill={color}
              fillOpacity="0.45"
            />
          </g>
        );
      })}
      <path d="M4 196 H316 L300 214 H20 Z" fill={edge} stroke={shell} />

      <rect x="252" y="120" width="104" height="150" rx="14" fill={shell} stroke={edge} />
      <rect x="264" y="136" width="80" height="118" rx="6" fill={screen} />
      <rect x="272" y="144" width="40" height="6" rx="3" fill={rail} />
      <rect x="306" y="144" width="30" height="6" rx="3" fill={accent} fillOpacity="0.5" />
      {candles.slice(0, 6).map((candle, i) => (
        <rect
          key={candle.x}
          x={272 + i * 12}
          y={162 + (candle.bodyTop - 24) * 0.55}
          width="8"
          height={Math.max(10, candle.bodyHeight * 0.7)}
          rx="1"
          fill={candleColor(i)}
        />
      ))}
      <rect x="272" y="232" width="64" height="6" rx="3" fill={edge} />
      <rect x="272" y="244" width="44" height="6" rx="3" fill={edge} />
      <rect x="292" y="258" width="24" height="4" rx="2" fill={rail} />
    </svg>
  );
}

export function PlatformShowcase() {
  return (
    <section className="night border-y border-white/10 bg-[var(--brand-night)] py-20 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
        <div className="flex justify-center">
          <DeviceFrame />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-blue-400">
            Powerful trading platform
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            Trade smarter, not harder
          </h2>
          <p className="mt-4 text-white/60">
            Futures and binary options sit in one dashboard, so you can check the margin, leverage
            and payout for a position before you place it.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue-400" />
                <span className="text-white/65">{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link href="/trade/demo">
              <Button variant="gradient" className="h-11 rounded-full px-7">
                Try the demo
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl px-4 text-center text-xs text-white/60">
        Interface shown for illustration only — it is not a live trading screen.
      </p>
    </section>
  );
}
