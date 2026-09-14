import type { Asset } from "@/types";

export const markets: Asset[] = [
  { symbol: "BTCUSDT", name: "Bitcoin", category: "crypto", price: 0, changePercent24h: 0 },
  { symbol: "ETHUSDT", name: "Ethereum", category: "crypto", price: 0, changePercent24h: 0 },
  { symbol: "EURUSD", name: "Euro / US Dollar", category: "forex", price: 0, changePercent24h: 0 },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", category: "forex", price: 0, changePercent24h: 0 },
  { symbol: "XAUUSD", name: "Gold", category: "commodities", price: 0, changePercent24h: 0 },
  { symbol: "AAPL", name: "Apple Inc.", category: "stocks", price: 0, changePercent24h: 0 },
];
