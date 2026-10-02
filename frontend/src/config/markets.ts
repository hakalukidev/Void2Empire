import type { Asset } from "@/types";

// NOTE: no page reads this list yet, and its forex / stock / commodity rows are
// not covered by the client's confirmed answer (v14: spot and futures on the
// platform's own coins). Prices are 0 because there is no market-data source
// until DR-023 is decided — see @/config/sample-market-data for the
// illustrative figures the UI actually renders.
export const markets: Asset[] = [
  { symbol: "BTCUSDT", name: "Bitcoin", category: "crypto", price: "0", changePercent24h: "0" },
  { symbol: "ETHUSDT", name: "Ethereum", category: "crypto", price: "0", changePercent24h: "0" },
  { symbol: "EURUSD", name: "Euro / US Dollar", category: "forex", price: "0", changePercent24h: "0" },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", category: "forex", price: "0", changePercent24h: "0" },
  { symbol: "XAUUSD", name: "Gold", category: "commodities", price: "0", changePercent24h: "0" },
  { symbol: "AAPL", name: "Apple Inc.", category: "stocks", price: "0", changePercent24h: "0" },
];
