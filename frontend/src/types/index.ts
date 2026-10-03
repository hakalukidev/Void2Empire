// Shared contract shapes.
//
// Every money, quantity and price value is a DECIMAL STRING (Sec 9.2, Sec46
// rule #40) — the backend serialises shopspring/decimal as a string, and the
// frontend must never widen that to a float just to display it. Use
// @/lib/utils/decimal for arithmetic and clampDecimalPlaces for presentation.
//
// Non-money scalars stay numbers: leverage is an integer multiplier. Which asset
// may be traded in which product is @/config/markets, not a shape in this file.

export type AccountMode = "demo" | "live";

// KYC is two mandatory levels, not a yes/no flag (v20 Q37). "none" means the
// account has not been verified. The backend still stores `kyc_verified
// BOOLEAN`, so that column and the /auth DTO have to become a level before any
// real KYC data can reach this shape.
export type KycLevel = "none" | "level_1" | "level_2";

export interface User {
  id: string;
  fullName: string;
  email: string;
  country: string;
  phone: string;
  kycLevel: KycLevel;
  createdAt: string;
}

export interface Balance {
  mode: AccountMode;
  available: string;
  currency: string;
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
