// Market catalog — the coins the platform lists and, critically, WHICH PRODUCT
// each one is allowed in. Nothing here carries a price: there is no market-data
// source until DR-023 is decided, so the figures the UI renders live in
// `config/sample-market-data` and are labelled illustrative wherever they show.
//
// Confirmed by client clarification v20:
//   Step 7 Q5  — the four brand coins are Spot + Futures only. They are NOT in
//                Binary Trading and NOT used by the Void2Empire Funding System.
//                (This supersedes the earlier Step 6 wording.)
//   Step 9 Q22 — the Funding System uses VUSDT and nothing else.
//   Step 8 Q5  — five further coins join "Binance Trading"; the audio named no
//                other market for them, and the spec never defines that product,
//                so they are recorded here with no rails wired.
//
// Still open: Question 4 (which pairs the platform launches with, and whether
// every quote currency is USDT). The majors below are the examples that question
// itself used, carried forward because the existing screens trade on them — they
// are marked provisional so nobody reads them as a confirmed launch list.

export type TradingProduct = "spot" | "futures" | "binary" | "funding";

export type MarketGroup =
  /** The platform's own coins: Spot and Futures, nothing else. */
  | "platform"
  /** Funding System asset — held and granted, never traded. */
  | "funding_asset"
  /** The five coins the client placed in the undefined "Binance Trading" group. */
  | "binance_group"
  /** Majors carried from the spec's examples until Q4 is answered. */
  | "provisional_major";

export interface ListedMarket {
  /** Routing/storage key, e.g. `BTCUSDT`. */
  symbol: string;
  /** Display label, e.g. `BTC/USDT`. */
  pair: string;
  name: string;
  group: MarketGroup;
  products: TradingProduct[];
}

const TRADEABLE_MAJORS: TradingProduct[] = ["spot", "futures", "binary"];

export const listedMarkets: ListedMarket[] = [
  // The four brand coins — explicitly excluded from Binary and from Funding.
  { symbol: "V2EUSDT", pair: "V2E/USDT", name: "Void2Empire", group: "platform", products: ["spot", "futures"] },
  { symbol: "INFUSDT", pair: "INF/USDT", name: "Infinity", group: "platform", products: ["spot", "futures"] },
  { symbol: "RIVERUSDT", pair: "RIVER/USDT", name: "River", group: "platform", products: ["spot", "futures"] },
  { symbol: "ONIONUSDT", pair: "ONION/USDT", name: "Onion", group: "platform", products: ["spot", "futures"] },

  // Funding System asset (v20 Step 9): granted, held and spent inside Funding
  // only — it is not a trading pair, so it carries no product rails.
  { symbol: "VUSDT", pair: "VUSDT", name: "Void2Empire USDT", group: "funding_asset", products: ["funding"] },

  // Named by the client but with no defined market yet — listed, not wired.
  { symbol: "EMBERUSDT", pair: "EMBER/USDT", name: "Ember", group: "binance_group", products: [] },
  { symbol: "MIRAGEUSDT", pair: "MIRAGE/USDT", name: "Mirage", group: "binance_group", products: [] },
  { symbol: "HAVENUSDT", pair: "HAVEN/USDT", name: "Haven", group: "binance_group", products: [] },
  { symbol: "VELVETUSDT", pair: "VELVET/USDT", name: "Velvet", group: "binance_group", products: [] },
  { symbol: "CINDERUSDT", pair: "CINDER/USDT", name: "Cinder", group: "binance_group", products: [] },

  // Provisional until Q4 answers the launch list.
  { symbol: "BTCUSDT", pair: "BTC/USDT", name: "Bitcoin", group: "provisional_major", products: TRADEABLE_MAJORS },
  { symbol: "ETHUSDT", pair: "ETH/USDT", name: "Ethereum", group: "provisional_major", products: TRADEABLE_MAJORS },
];

export function findMarket(symbol: string): ListedMarket | undefined {
  return listedMarkets.find((m) => m.symbol === symbol.toUpperCase());
}

/**
 * The single place that answers "can this coin be traded here?". The client
 * excluded the brand coins from Binary, so a Binary route opened on one of them
 * has to be refused rather than silently showing a chart.
 */
export function supportsProduct(symbol: string, product: TradingProduct): boolean {
  return findMarket(symbol)?.products.includes(product) ?? false;
}

export function marketsFor(product: TradingProduct): ListedMarket[] {
  return listedMarkets.filter((m) => m.products.includes(product));
}
