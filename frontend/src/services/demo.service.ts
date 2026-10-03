// Demo Trading service — REQ-045..051, client clarification v20 Q43.
//
// Demo mode is the futures UX running on virtual funds. Orders placed here are
// a throwaway layout sandbox: the real demo ledger lives in the `demo`
// PostgreSQL schema (Sec 14 isolation) and no backend for it exists yet, so
// nothing in this file may touch a real balance, and nothing here simulates a
// fill price, mark price, PnL or liquidation — those are the server's job
// (REQ-049 simulated liquidation is demo-schema work).
//
// All money values are decimal STRINGS (Sec46 rule #40).

export type DemoOrderStatus = "open" | "filled" | "cancelled";

export interface DemoOrder {
  id: string;
  pair: string;
  side: "long" | "short";
  type: "market" | "limit";
  margin: string;
  leverage: number;
  price: string | null;
  stopLoss: string | null;
  takeProfit: string | null;
  status: DemoOrderStatus;
  createdAt: string;
}

export interface PlaceDemoOrderInput {
  pair: string;
  side: "long" | "short";
  type: "market" | "limit";
  margin: string;
  leverage: number;
  price?: string;
  stopLoss?: string;
  takeProfit?: string;
}

let MOCK_DEMO_ORDERS: DemoOrder[] = [];
let demoOrderCounter = 0;

export async function placeDemoOrder(input: PlaceDemoOrderInput): Promise<DemoOrder> {
  // TODO(backend): POST /demo/futures/orders — the server books the demo fill.
  const order: DemoOrder = {
    id: `DEMO-${++demoOrderCounter}`,
    pair: input.pair,
    side: input.side,
    type: input.type,
    margin: input.margin,
    leverage: input.leverage,
    price: input.type === "limit" ? input.price ?? null : null,
    stopLoss: input.stopLoss || null,
    takeProfit: input.takeProfit || null,
    // A market order shows as filled because demo mirrors live UX; the amount
    // it filled at is not known here, so the order carries no fill price.
    status: input.type === "limit" ? "open" : "filled",
    createdAt: new Date().toISOString(),
  };
  MOCK_DEMO_ORDERS = [order, ...MOCK_DEMO_ORDERS];
  return order;
}

/** Open and booked orders alike — REQ-050 wants demo history visible too. */
export async function fetchDemoOrders(): Promise<DemoOrder[]> {
  // TODO(backend): GET /demo/futures/orders
  return MOCK_DEMO_ORDERS;
}

export async function cancelDemoOrder(id: string): Promise<void> {
  // TODO(backend): DELETE /demo/futures/orders/{id}
  MOCK_DEMO_ORDERS = MOCK_DEMO_ORDERS.map((o) =>
    o.id === id ? { ...o, status: "cancelled" as const } : o
  );
}

/** Q43: the user can reset their own demo account; the server owns the ledger. */
export async function clearDemoOrders(): Promise<void> {
  // TODO(backend): POST /demo/reset
  MOCK_DEMO_ORDERS = [];
}
