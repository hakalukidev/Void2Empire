// Shared contract shapes.
//
// Every money, quantity and price value is a DECIMAL STRING (Sec 9.2, Sec46
// rule #40) — the backend serialises shopspring/decimal as a string, and the
// frontend must never widen that to a float just to display it. Use
// @/lib/utils/decimal for arithmetic and clampDecimalPlaces for presentation.
//
// Non-money scalars stay numbers: leverage is an integer multiplier, and
// payoutPercent is a configured rate, not an amount.

export type AccountMode = "demo" | "live";

export interface User {
  id: string;
  fullName: string;
  email: string;
  country: string;
  phone: string;
  kycVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface Balance {
  mode: AccountMode;
  available: string;
  currency: string;
}

export interface Asset {
  symbol: string;
  name: string;
  category: "forex" | "crypto" | "stocks" | "commodities";
  price: string;
  changePercent24h: string;
}

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";

export interface FuturesOrder {
  id: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  leverage: number;
  margin: string;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  status: "open" | "filled" | "cancelled";
  mode: AccountMode;
  createdAt: string;
}

export type BinaryDirection = "up" | "down";

export interface BinaryTrade {
  id: string;
  pair: string;
  direction: BinaryDirection;
  stake: string;
  entryPrice: string;
  expiryAt: string;
  payoutPercent: string;
  status: "active" | "won" | "lost";
  mode: AccountMode;
  createdAt: string;
}

export type TransactionType = "deposit" | "withdrawal" | "internal_transfer";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  fee: string;
  status: TransactionStatus;
  createdAt: string;
}
