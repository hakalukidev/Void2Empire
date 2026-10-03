// Futures Positions Service Layer
// All money / quantity / price values are decimal STRINGS — never float
// (Sec 9.2, Sec46 rule #40). PnL, mark price and liquidation price are
// computed server-side; the frontend only displays and aggregates them.
// To connect backend: replace each body with an apiClient call.

import { apiClient } from "@/lib/api/client";

export interface FuturesPosition {
  id: string;
  pair: string;
  side: "Long" | "Short";
  leverage: number;
  entryPrice: string;
  markPrice: string;
  size: string;
  margin: string;
  pnl: string;
  pnlPct: string;
  liqPrice: string;
}

/** Account-level figures the backend derives (never computed on the client). */
export interface PositionsSummary {
  accountEquity: string;
}

const MOCK_POSITIONS: FuturesPosition[] = [
  {
    id: "POS-001", pair: "BTC-USDT", side: "Long", leverage: 10,
    entryPrice: "63000", markPrice: "65432", size: "0.1",
    margin: "630", pnl: "243.20", pnlPct: "3.86", liqPrice: "57200",
  },
  {
    id: "POS-002", pair: "ETH-USDT", side: "Short", leverage: 5,
    entryPrice: "3500", markPrice: "3456.78", size: "0.5",
    margin: "350", pnl: "21.60", pnlPct: "1.24", liqPrice: "3850",
  },
];

const MOCK_SUMMARY: PositionsSummary = { accountEquity: "10264.80" };

export async function fetchOpenPositions(): Promise<FuturesPosition[]> {
  // TODO(backend): const { data } = await apiClient.get<FuturesPosition[]>("/futures/positions"); return data;
  void apiClient;
  return MOCK_POSITIONS;
}

export async function fetchPositionsSummary(): Promise<PositionsSummary> {
  // TODO(backend): const { data } = await apiClient.get<PositionsSummary>("/futures/positions/summary"); return data;
  return MOCK_SUMMARY;
}

// ─── PENDING ORDERS ───────────────────────────────────────────────────────────
// The client clarification (v20 Q3) requires Market + Limit orders plus Stop
// Loss / Take Profit, and says a booked order must stay visible on the trading
// screen with its price. A limit order therefore has somewhere to wait; no
// futures backend exists yet, so these are in-memory layout samples shaped for
// POST /futures/orders. The matching engine and the fill price are server-side
// and DR-002/DR-023 blocked — nothing here simulates them.

export type FuturesOrderStatus = "open" | "filled" | "cancelled";

export interface FuturesOrder {
  id: string;
  pair: string;
  side: "long" | "short";
  type: "market" | "limit";
  margin: string;
  leverage: number;
  price: string | null; // limit price; null for a market order
  stopLoss: string | null;
  takeProfit: string | null;
  status: FuturesOrderStatus;
  createdAt: string;
}

export interface PlaceFuturesOrderInput {
  pair: string;
  side: "long" | "short";
  type: "market" | "limit";
  margin: string;
  leverage: number;
  price?: string;
  stopLoss?: string;
  takeProfit?: string;
  clientOrderId: string;
}

let MOCK_FUTURES_ORDERS: FuturesOrder[] = [];
let futuresOrderCounter = 0;

export async function placeFuturesOrder(input: PlaceFuturesOrderInput): Promise<FuturesOrder> {
  // TODO(backend): POST /futures/orders with an Idempotency-Key.
  const order: FuturesOrder = {
    id: `FUT-${++futuresOrderCounter}`,
    pair: input.pair,
    side: input.side,
    type: input.type,
    margin: input.margin,
    leverage: input.leverage,
    price: input.type === "limit" ? input.price ?? null : null,
    stopLoss: input.stopLoss || null,
    takeProfit: input.takeProfit || null,
    status: input.type === "limit" ? "open" : "filled",
    createdAt: new Date().toISOString(),
  };
  if (order.status === "open") MOCK_FUTURES_ORDERS = [order, ...MOCK_FUTURES_ORDERS];
  return order;
}

export async function fetchFuturesOpenOrders(): Promise<FuturesOrder[]> {
  // TODO(backend): GET /futures/orders?status=open
  return MOCK_FUTURES_ORDERS;
}

export async function cancelFuturesOrder(id: string): Promise<void> {
  // TODO(backend): DELETE /futures/orders/{id}
  MOCK_FUTURES_ORDERS = MOCK_FUTURES_ORDERS.filter((o) => o.id !== id);
}
