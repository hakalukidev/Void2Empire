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
