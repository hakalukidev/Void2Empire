// Markets service layer.
// Prices/changes are decimal STRINGS (Sec46 rule #40) — never float.
// Shaped for the documented endpoint (Sec 18.2): GET /markets/gainers-losers.
// To connect the backend, replace the body with an apiClient call.

export interface MarketMover {
  symbol: string;
  pair: string;
  price: string;
  changePct: string; // e.g. "+3.21%" / "-2.14%"
  up: boolean;
}

export interface GainersLosers {
  gainers: MarketMover[];
  losers: MarketMover[];
}

const MOCK: GainersLosers = {
  gainers: [
    { symbol: "SOL/USDT", pair: "SOLUSDT", price: "168.42", changePct: "+5.31%", up: true },
    { symbol: "BNB/USDT", pair: "BNBUSDT", price: "612.08", changePct: "+3.47%", up: true },
    { symbol: "XRP/USDT", pair: "XRPUSDT", price: "0.5231", changePct: "+2.18%", up: true },
    { symbol: "ADA/USDT", pair: "ADAUSDT", price: "0.4442", changePct: "+1.92%", up: true },
  ],
  losers: [
    { symbol: "ETH/USDT", pair: "ETHUSDT", price: "2509.44", changePct: "-0.60%", up: false },
    { symbol: "BTC/USDT", pair: "BTCUSDT", price: "104312.73", changePct: "-0.53%", up: false },
    { symbol: "DOGE/USDT", pair: "DOGEUSDT", price: "0.1184", changePct: "-1.15%", up: false },
    { symbol: "AVAX/USDT", pair: "AVAXUSDT", price: "24.31", changePct: "-2.74%", up: false },
  ],
};

export async function fetchGainersLosers(): Promise<GainersLosers> {
  // TODO(backend): GET /markets/gainers-losers
  return MOCK;
}

// ─── Public market list (Sec 3.A: "public market list") ───────────────────────

export interface MarketRow {
  symbol: string;
  pair: string;
  /** Last price as a decimal string, sourced from market data (DR-002). */
  price: string;
  change: string; // absolute 24h change, decimal string
  changePct: string; // e.g. "+0.33%" / "-0.53%"
  up: boolean;
}

const MOCK_MARKETS: MarketRow[] = [
  { symbol: "BTC/USDT", pair: "BTCUSDT", price: "104312.73", change: "-557.34", changePct: "-0.53%", up: false },
  { symbol: "ETH/USDT", pair: "ETHUSDT", price: "2509.44", change: "-15.23", changePct: "-0.60%", up: false },
  { symbol: "SOL/USDT", pair: "SOLUSDT", price: "168.42", change: "+8.49", changePct: "+5.31%", up: true },
  { symbol: "BNB/USDT", pair: "BNBUSDT", price: "612.08", change: "+20.47", changePct: "+3.47%", up: true },
  { symbol: "XRP/USDT", pair: "XRPUSDT", price: "0.5231", change: "+0.0111", changePct: "+2.18%", up: true },
];

export async function fetchMarkets(): Promise<MarketRow[]> {
  // TODO(backend): GET /markets
  return MOCK_MARKETS;
}
