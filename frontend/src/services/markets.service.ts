// Markets service layer.
// Prices/changes are decimal STRINGS (Sec46 rule #40) — never float.
// Shaped for the documented endpoint (Sec 18.2): GET /markets,
// GET /markets/gainers-losers. To connect the backend, replace the body with an
// apiClient call.
//
// Which markets appear here is decided by `config/markets.ts`, not by this file:
// the catalog is the only place that knows what the platform lists and which
// product each coin is allowed in. The figures come from the single illustrative
// sample set so a list row and the chart of the same coin never disagree.

import { marketsFor } from "@/config/markets";
import { sampleMarkets, type SampleMarket } from "@/config/sample-market-data";

export interface MarketRow {
  /** Routing key, e.g. `BTCUSDT` — the segment of /trade/<product>/<symbol>. */
  symbol: string;
  /** Display label, e.g. `BTC/USDT`. */
  pair: string;
  /** Last price as a decimal string, sourced from market data (DR-002). */
  price: string;
  changePct: string; // e.g. "+3.21%" / "-2.14%"
  up: boolean;
}

export interface GainersLosers {
  gainers: MarketRow[];
  losers: MarketRow[];
}

function toRow(market: SampleMarket): MarketRow {
  const up = market.changePercent24h >= 0;
  return {
    symbol: market.symbol,
    pair: market.pair,
    price: market.price.toFixed(market.precision),
    changePct: `${up ? "+" : ""}${market.changePercent24h.toFixed(2)}%`,
    up,
  };
}

// Futures is what these panels link to, so a coin with no futures rail must not
// show up in them — the brand coins are listed, but a coin the client kept out
// of a product cannot be opened in it.
const futuresMarkets = marketsFor("futures")
  .map((market) => sampleMarkets.find((row) => row.symbol === market.symbol))
  .filter((market): market is SampleMarket => market !== undefined);

const rankedByChange = [...futuresMarkets].sort(
  (a, b) => b.changePercent24h - a.changePercent24h
);

export async function fetchMarkets(): Promise<MarketRow[]> {
  // TODO(backend): GET /markets?product=futures
  return futuresMarkets.map(toRow);
}

export async function fetchGainersLosers(): Promise<GainersLosers> {
  // TODO(backend): GET /markets/gainers-losers
  return {
    gainers: rankedByChange.filter((market) => market.changePercent24h >= 0).map(toRow).slice(0, 4),
    losers: [...rankedByChange].reverse().filter((market) => market.changePercent24h < 0).map(toRow).slice(0, 4),
  };
}
