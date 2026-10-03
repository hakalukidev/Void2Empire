// Spot trading service layer — REQ-012..025.
// All money values are decimal STRINGS (Sec46 rule #40) — never float.
// Shaped for the documented endpoints (Sec 18.2):
//   POST   /spot/orders {market_id, side, type, quantity, price?, client_order_id}
//   DELETE /spot/orders/{id}
//   GET    /spot/orders?status=
//   GET    /spot/trades
//   GET    /markets/{id}
// To connect the backend, replace each body with an apiClient call.
// NOTE: dynamic price computation is DR-002 blocked — prices come from the
// service, they are never derived client-side.

import type { OrderSide, OrderType } from "@/types";
import { buildCloseSeries, sampleMarkets } from "@/config/sample-market-data";

export interface ChartSeriesPoint {
  time: number;
  value: number;
}

export interface SpotTicker {
  pair: string;
  price: string;
  changePct: string;
  up: boolean;
}

export interface OrderbookLevel {
  price: string;
  amount: string;
  total: string;
}

export interface Orderbook {
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}

export interface SpotTrade {
  id: string;
  price: string;
  amount: string;
  side: OrderSide;
  time: string;
}

export type SpotOrderStatus = "open" | "filled" | "partially_filled" | "cancelled";

export interface SpotOrder {
  id: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  price: string | null; // null for market orders
  /**
   * Optional trigger levels (v20 Step 5 Q3). The server watches these and closes
   * the position; nothing here simulates that.
   */
  stopLoss: string | null;
  takeProfit: string | null;
  filled: string;
  status: SpotOrderStatus;
  createdAt: string;
}

export interface PlaceSpotOrderInput {
  pair: string;
  side: OrderSide;
  type: OrderType;
  quantity: string;
  price?: string; // required for limit orders
  stopLoss?: string;
  takeProfit?: string;
  clientOrderId: string;
}

// ─── STUB DATA ────────────────────────────────────────────────────────────────
// Illustrative layout data, not quotes. The tickers and the chart series both come
// from `config/sample-market-data`, so a page can never show a header price that
// disagrees with its own chart, and a pair with no sample row returns null instead
// of a figure invented here. Every market the catalog gives a spot rail to has a
// sample row. The order book and trade prints below are BTC-shaped sample depth
// served for every pair until a real market-data source exists (DR-002/DR-023).

const MOCK_TICKERS: Record<string, SpotTicker> = {};

for (const market of sampleMarkets) {
  const up = market.changePercent24h >= 0;
  MOCK_TICKERS[market.symbol] = {
    pair: market.pair,
    price: market.price.toFixed(market.precision),
    changePct: `${up ? "+" : ""}${market.changePercent24h.toFixed(2)}%`,
    up,
  };
}

const MOCK_ORDERBOOK: Orderbook = {
  asks: [
    { price: "63212.30", amount: "0.412", total: "26043.47" },
    { price: "63209.80", amount: "1.204", total: "76104.60" },
    { price: "63207.10", amount: "0.087", total: "5501.02" },
  ],
  bids: [
    { price: "63204.50", amount: "0.633", total: "40008.45" },
    { price: "63201.20", amount: "0.951", total: "60104.34" },
    { price: "63196.80", amount: "2.140", total: "135241.15" },
  ],
};

const MOCK_TRADES: SpotTrade[] = [
  { id: "T-9001", price: "63204.50", amount: "0.021", side: "buy", time: "14:22:05" },
  { id: "T-9000", price: "63203.10", amount: "0.140", side: "sell", time: "14:21:58" },
  { id: "T-8999", price: "63205.40", amount: "0.008", side: "buy", time: "14:21:41" },
  { id: "T-8998", price: "63201.90", amount: "0.330", side: "sell", time: "14:21:12" },
];

let MOCK_OPEN_ORDERS: SpotOrder[] = [];
let orderCounter = 0;

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

export async function fetchSpotTicker(pair: string): Promise<SpotTicker | null> {
  // TODO(backend): GET /markets/{id}
  return MOCK_TICKERS[pair.toUpperCase()] ?? null;
}

/** Closing series for the page chart; undefined means "no sample row for this pair". */
export async function fetchMarketSeries(pair: string): Promise<ChartSeriesPoint[] | undefined> {
  // TODO(backend): GET /markets/{id}/candles
  const market = sampleMarkets.find((row) => row.symbol === pair.toUpperCase());
  return market ? buildCloseSeries(market) : undefined;
}

export async function fetchOrderbook(_pair: string): Promise<Orderbook> {
  // TODO(backend): GET /markets/{id}/orderbook
  return MOCK_ORDERBOOK;
}

export async function fetchRecentTrades(_pair: string): Promise<SpotTrade[]> {
  // TODO(backend): GET /spot/trades?market_id=
  return MOCK_TRADES;
}

export async function fetchOpenOrders(): Promise<SpotOrder[]> {
  // TODO(backend): GET /spot/orders?status=open
  return MOCK_OPEN_ORDERS;
}

export async function placeSpotOrder(input: PlaceSpotOrderInput): Promise<SpotOrder> {
  // TODO(backend): POST /spot/orders with an Idempotency-Key.
  const order: SpotOrder = {
    id: `SPOT-${++orderCounter}`,
    pair: input.pair,
    side: input.side,
    type: input.type,
    quantity: input.quantity,
    price: input.type === "limit" ? input.price ?? null : null,
    stopLoss: input.stopLoss || null,
    takeProfit: input.takeProfit || null,
    filled: input.type === "market" ? input.quantity : "0",
    status: input.type === "market" ? "filled" : "open",
    createdAt: new Date().toISOString(),
  };
  if (order.status === "open") MOCK_OPEN_ORDERS = [order, ...MOCK_OPEN_ORDERS];
  return order;
}

export async function cancelSpotOrder(id: string): Promise<void> {
  // TODO(backend): DELETE /spot/orders/{id}
  MOCK_OPEN_ORDERS = MOCK_OPEN_ORDERS.filter((o) => o.id !== id);
}
