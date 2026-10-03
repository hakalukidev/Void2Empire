import {
  Bitcoin,
  Diamond,
  Orbit,
  Rocket,
  Sprout,
  Waves,
  type LucideIcon,
} from "lucide-react";

// No market-data feed exists yet — the contract is still open as DR-023, and
// `config/markets.ts` deliberately carries no price for any asset. So the
// figures below are invented for layout purposes. Anything rendering them has
// to show the `home.illustrative` badge, and none of it may flow into a
// calculation the server trusts: these are display-only numbers, not money
// values.
//
// One row per market that actually has rails, and only for the markets the home
// panels can link to: the rows below all carry `spot` in `config/markets.ts`,
// because MarketRow and QuickTrade link straight into /trade/spot/<symbol>.
// The five "Binance Trading" coins and the Funding asset have no rails yet, so
// they get no sample row rather than a card that leads to a dead page.
export const SAMPLE_MARKET_SYMBOL = "BTCUSDT";

export interface SampleMarket {
  /** Must equal a `ListedMarket.symbol` in `config/markets.ts`. */
  symbol: string;
  pair: string;
  name: string;
  icon: LucideIcon;
  price: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  precision: number;
}

export const sampleMarkets: SampleMarket[] = [
  {
    // The platform's own coins (v20 Step 7). Spot + Futures only — the client
    // kept them out of Binary, so no Binary card may point at these symbols.
    symbol: "V2EUSDT",
    pair: "V2E/USDT",
    name: "Void2Empire",
    icon: Rocket,
    price: 4.82,
    changePercent24h: 6.42,
    high24h: 5.04,
    low24h: 4.41,
    volume24h: 18_600_000,
    precision: 2,
  },
  {
    symbol: "INFUSDT",
    pair: "INF/USDT",
    name: "Infinity",
    icon: Orbit,
    price: 0.6142,
    changePercent24h: -2.18,
    high24h: 0.6401,
    low24h: 0.5988,
    volume24h: 7_240_000,
    precision: 4,
  },
  {
    symbol: "RIVERUSDT",
    pair: "RIVER/USDT",
    name: "River",
    icon: Waves,
    price: 18.94,
    changePercent24h: 1.24,
    high24h: 19.62,
    low24h: 18.35,
    volume24h: 11_050_000,
    precision: 2,
  },
  {
    symbol: "ONIONUSDT",
    pair: "ONION/USDT",
    name: "Onion",
    icon: Sprout,
    price: 2.3175,
    changePercent24h: -0.86,
    high24h: 2.3844,
    low24h: 2.2791,
    volume24h: 4_380_000,
    precision: 4,
  },
  {
    symbol: "BTCUSDT",
    pair: "BTC/USDT",
    name: "Bitcoin",
    icon: Bitcoin,
    price: 63204.5,
    changePercent24h: 1.8,
    high24h: 64180.2,
    low24h: 61955.4,
    volume24h: 1_284_000_000,
    precision: 2,
  },
  {
    symbol: "ETHUSDT",
    pair: "ETH/USDT",
    name: "Ethereum",
    icon: Diamond,
    price: 3142.6,
    changePercent24h: 0.6,
    high24h: 3188.4,
    low24h: 3096.75,
    volume24h: 612_400_000,
    precision: 2,
  },
];

export function formatPrice(value: number, precision: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  return value.toLocaleString("en-US");
}

export type ChartInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1D";

export const chartIntervals: ChartInterval[] = ["1m", "5m", "15m", "1h", "4h", "1D"];

const intervalSeconds: Record<ChartInterval, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1D": 86400,
};

// Fixed epoch so the server render and the client render agree on every bar.
const seriesStart = 1735689600;

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SampleCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const candleCache = new Map<string, SampleCandle[]>();

/**
 * A deterministic random walk that ends on the market's illustrative price, so
 * the candles, the header stat and the moving averages never disagree.
 */
export function buildCandles(
  market: SampleMarket,
  interval: ChartInterval,
  count = 140
): SampleCandle[] {
  const key = `${market.symbol}:${interval}:${count}`;
  const cached = candleCache.get(key);
  if (cached) return cached;

  const step = intervalSeconds[interval];
  const drift = market.changePercent24h / 100;
  const barsPerDay = 86400 / step;
  const rand = mulberry32(hashSeed(key));

  // Walk backwards from the close so the final bar lands exactly on `price`.
  const closes: number[] = new Array(count);
  closes[count - 1] = market.price;
  for (let i = count - 2; i >= 0; i--) {
    const perBarDrift = drift / barsPerDay;
    const noise = (rand() - 0.5) * 0.012;
    const previous = closes[i + 1] / (1 + perBarDrift + noise);
    closes[i] = previous;
  }

  const candles: SampleCandle[] = closes.map((close, i) => {
    const open = i === 0 ? close * (1 - drift / count) : closes[i - 1];
    const spread = Math.max(close * 0.004, Math.abs(close - open));
    const high = Math.max(open, close) + spread * rand();
    const low = Math.min(open, close) - spread * rand();
    return {
      time: seriesStart + i * step,
      open,
      high,
      low,
      close,
      volume: (market.volume24h / barsPerDay) * (0.55 + rand() * 0.9),
    };
  });

  candleCache.set(key, candles);
  return candles;
}

export function movingAverage(candles: SampleCandle[], period: number): { time: number; value: number }[] {
  const out: { time: number; value: number }[] = [];
  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) sum -= candles[i - period].close;
    if (i >= period - 1) out.push({ time: candles[i].time, value: sum / period });
  }
  return out;
}

/** Last 32 closes, normalised — the little line inside the Quick Trade cards. */
export function buildSparkline(market: SampleMarket): number[] {
  const candles = buildCandles(market, "1h", 32);
  return candles.map((candle) => candle.close);
}

/**
 * The closing line for a trade page's chart. Pages must not hardcode their own
 * candle arrays: two sources of illustrative prices that disagree with the
 * header of the same page is worse than one that is clearly labelled.
 */
export function buildCloseSeries(market: SampleMarket, interval: ChartInterval = "1h") {
  return buildCandles(market, interval).map((candle) => ({ time: candle.time, value: candle.close }));
}
