import {
  Banknote,
  Bitcoin,
  Diamond,
  Gem,
  Landmark,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

// No market-data feed exists yet — the contract is still open as DR-023, and
// `config/markets.ts` deliberately carries `price: 0` for every asset. So the
// figures below are invented for layout purposes. Anything rendering them has
// to show the `home.illustrative` badge, and none of it may flow into a
// calculation the server trusts: these are display-only numbers, not money
// values.
export const SAMPLE_MARKET_SYMBOL = "BTCUSDT";

export interface SampleMarket {
  /** Matches the symbol in `config/markets.ts` so the rails stay in step with the real catalog. */
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
  {
    symbol: "EURUSD",
    pair: "EUR/USD",
    name: "Euro / US Dollar",
    icon: Banknote,
    price: 1.0824,
    changePercent24h: -0.18,
    high24h: 1.0869,
    low24h: 1.0792,
    volume24h: 94_800_000,
    precision: 4,
  },
  {
    symbol: "GBPUSD",
    pair: "GBP/USD",
    name: "British Pound / US Dollar",
    icon: Landmark,
    price: 1.2691,
    changePercent24h: 0.12,
    high24h: 1.2738,
    low24h: 1.2654,
    volume24h: 71_200_000,
    precision: 4,
  },
  {
    symbol: "XAUUSD",
    pair: "XAU/USD",
    name: "Gold",
    icon: Gem,
    price: 2662.48,
    changePercent24h: 0.32,
    high24h: 2684.1,
    low24h: 2641.9,
    volume24h: 128_600_000,
    precision: 2,
  },
  {
    symbol: "AAPL",
    pair: "AAPL",
    name: "Apple Inc.",
    icon: TrendingUp,
    price: 228.4,
    changePercent24h: -0.27,
    high24h: 230.15,
    low24h: 226.8,
    volume24h: 42_300_000,
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
