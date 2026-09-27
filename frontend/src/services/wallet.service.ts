// Wallet Service Layer
// All money values are decimal STRINGS — never float (Sec46 rule #40).
// Functions return stub data shaped for the documented endpoints (Sec 18.2).
// To connect backend: replace each body with an apiClient call.

import { apiClient } from "@/lib/api/client";
import type { TransactionStatus, TransactionType } from "@/types";

/**
 * Three-way wallet split (REQ-100 / REQ-106 / INV-25):
 * - available: spendable trading balance.
 * - funding:   Void2Empire Funding System balance (WA-1). RESTRICTED —
 *              can never be the source of a withdrawal, transfer, spot trade,
 *              binary trade, or P2P transaction (INV-25).
 * - profit:    segregated profit balance — fully usable and withdrawable (REQ-106).
 */
export interface WalletBalances {
  currency: string;
  available: string;
  funding: string;
  profit: string;
}

export interface WalletTotals {
  totalDeposited: string;
  totalWithdrawn: string;
}

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: string; // decimal string (rule #40)
  status: TransactionStatus;
  createdAt: string;
}

const EMPTY_BALANCES: WalletBalances = {
  currency: "USDT",
  available: "0.00",
  funding: "0.00",
  profit: "0.00",
};

const EMPTY_TOTALS: WalletTotals = {
  totalDeposited: "0.00",
  totalWithdrawn: "0.00",
};

export async function fetchWalletBalances(): Promise<WalletBalances> {
  // TODO(backend): const { data } = await apiClient.get<WalletBalances>("/wallet/balances"); return data;
  void apiClient;
  return EMPTY_BALANCES;
}

export async function fetchWalletTotals(): Promise<WalletTotals> {
  // TODO(backend): const { data } = await apiClient.get<WalletTotals>("/wallet/totals"); return data;
  return EMPTY_TOTALS;
}

export async function fetchRecentTransactions(limit = 5): Promise<WalletTransaction[]> {
  // TODO(backend): const { data } = await apiClient.get<WalletTransaction[]>(`/wallet/transactions?limit=${limit}`); return data;
  void limit;
  return [];
}

// ─── Full transaction history (REQ-057..060) ──────────────────────────────────
// Documented endpoints (Sec 18.2, line 1127):
//   GET /wallet/transactions
//   GET /wallet/transactions/{transaction_id}
// Fields mirror the `transactions` table (Sec 9.4, line 765). Status set is
// ASM-018 (Sec 10.6, line 901). `fee` is display-only — its semantics are
// undecided (DR-037), so it is never computed on the client.

export type TransactionRecordType =
  | "deposit"
  | "withdrawal"
  | "trade"
  | "fee"
  | "transfer"
  | "referral";

export type TransactionRecordStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "reversed";

export interface WalletTransactionRecord {
  transactionId: string; // public id, e.g. TXN-<ULID> (REQ-058)
  type: TransactionRecordType;
  amount: string; // decimal string (rule #40)
  fee: string; // decimal string — display only (DR-037)
  asset: string;
  status: TransactionRecordStatus;
  refType?: string;
  refId?: string;
  createdAt: string;
}

export async function fetchTransactions(): Promise<WalletTransactionRecord[]> {
  // TODO(backend): const { data } = await apiClient.get<WalletTransactionRecord[]>("/wallet/transactions"); return data;
  void apiClient;
  return [];
}

export async function fetchTransaction(
  transactionId: string
): Promise<WalletTransactionRecord | null> {
  // TODO(backend): const { data } = await apiClient.get<WalletTransactionRecord>(`/wallet/transactions/${transactionId}`); return data;
  void apiClient;
  void transactionId;
  return null;
}
