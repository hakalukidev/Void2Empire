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
  clientOrderId: string;
}

// ─── STUB DATA ────────────────────────────────────────────────────────────────

const MOCK_TICKERS: Record<string, SpotTicker> = {
  BTCUSDT: { pair: "BTC/USDT", price: "104312.73", changePct: "-0.53%", up: false },
  ETHUSDT: { pair: "ETH/USDT", price: "2509.44", changePct: "-0.60%", up: false },
  SOLUSDT: { pair: "SOL/USDT", price: "168.42", changePct: "+5.31%", up: true },
  BNBUSDT: { pair: "BNB/USDT", price: "612.08", changePct: "+3.47%", up: true },
  XRPUSDT: { pair: "XRP/USDT", price: "0.5231", changePct: "+2.18%", up: true },
};

const MOCK_ORDERBOOK: Orderbook = {
  asks: [
    { price: "104320.10", amount: "0.412", total: "42979.88" },
    { price: "104316.55", amount: "1.204", total: "125597.10" },
    { price: "104313.90", amount: "0.087", total: "9075.31" },
  ],
  bids: [
    { price: "104312.73", amount: "0.633", total: "66030.06" },
    { price: "104308.20", amount: "0.951", total: "99197.10" },
    { price: "104301.05", amount: "2.140", total: "223204.21" },
  ],
};

const MOCK_TRADES: SpotTrade[] = [
  { id: "T-9001", price: "104312.73", amount: "0.021", side: "buy", time: "14:22:05" },
  { id: "T-9000", price: "104311.20", amount: "0.140", side: "sell", time: "14:21:58" },
  { id: "T-8999", price: "104313.44", amount: "0.008", side: "buy", time: "14:21:41" },
  { id: "T-8998", price: "104309.90", amount: "0.330", side: "sell", time: "14:21:12" },
];

let MOCK_OPEN_ORDERS: SpotOrder[] = [];
let orderCounter = 0;

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

export async function fetchSpotTicker(pair: string): Promise<SpotTicker | null> {
  // TODO(backend): GET /markets/{id}
  return MOCK_TICKERS[pair.toUpperCase()] ?? null;
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
