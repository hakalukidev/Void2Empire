export type AccountMode = "demo" | "live";

export interface User {
  id: string;
  fullName: string;
  email: string;
  country: string;
  phone: string;
  kycVerified: boolean;
  emailVerified: boolean;
  avatarUrl?: string;
  hasPassword: boolean;
  createdAt: string;
}

export interface Balance {
  mode: AccountMode;
  available: number;
  currency: string;
}

export interface Asset {
  symbol: string;
  name: string;
  category: "forex" | "crypto" | "stocks" | "commodities";
  price: number;
  changePercent24h: number;
}

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";

export interface FuturesOrder {
  id: string;
  pair: string;
  side: OrderSide;
  type: OrderType;
  leverage: number;
  margin: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  status: "open" | "filled" | "cancelled";
  mode: AccountMode;
  createdAt: string;
}

export type BinaryDirection = "up" | "down";

export interface BinaryTrade {
  id: string;
  pair: string;
  direction: BinaryDirection;
  stake: number;
  entryPrice: number;
  expiryAt: string;
  payoutPercent: number;
  status: "active" | "won" | "lost";
  mode: AccountMode;
  createdAt: string;
}

export type TransactionType = "deposit" | "withdrawal" | "internal_transfer";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  fee: number;
  status: TransactionStatus;
  createdAt: string;
}
