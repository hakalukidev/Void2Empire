// Payments Service Layer — deposits & withdrawals.
// All money values are decimal STRINGS — never float (Sec 9.2, Sec46 rule #40).
// Stubs are shaped for the documented endpoints (Sec 18.2, Sec 21, Sec 5 #8).
// To connect backend: replace each body with an apiClient call.
//
// Compliance notes baked into these stubs:
//  - Deposit credit is webhook-authoritative; a frontend "success" redirect
//    NEVER credits funds (Sec 21). The payment provider is not decided
//    (DR-024 / DR-045) and withdrawal rails are undecided (DR-017), so no
//    provider is invented here.
//  - INV-25: `funding` balance can never be a withdrawal source. The withdraw
//    input only accepts "available" | "profit" as the source account kind.

import { apiClient } from "@/lib/api/client";

// ─── Deposits ─────────────────────────────────────────────────────────────────

export type DepositStatus = "pending" | "completed" | "failed";

export interface CreateDepositInput {
  asset: string;
  amount: string; // decimal string
}

export interface DepositIntent {
  depositId: string;
  /** Provider checkout URL. Empty until a payment provider is configured (DR-024/045). */
  paymentUrl: string;
}

export interface Deposit {
  id: string;
  asset: string;
  amount: string; // decimal string
  status: DepositStatus;
  createdAt: string;
}

export async function createDeposit(input: CreateDepositInput): Promise<DepositIntent> {
  // TODO(backend): const { data } = await apiClient.post<DepositIntent>("/deposits", input, { headers: { "Idempotency-Key": crypto.randomUUID() } }); return data;
  void apiClient;
  void input;
  return {
    depositId: `DEP-${Date.now()}`,
    paymentUrl: "", // no provider configured yet (DR-024/045)
  };
}

export async function getDeposit(id: string): Promise<Deposit> {
  // TODO(backend): const { data } = await apiClient.get<Deposit>(`/deposits/${id}`); return data;
  void apiClient;
  return { id, asset: "USDT", amount: "0.00", status: "pending", createdAt: new Date().toISOString() };
}

// ─── Withdrawals ──────────────────────────────────────────────────────────────

export type WithdrawalStatus = "pending" | "completed" | "rejected" | "failed";

/** INV-25: funding balance is structurally excluded — it is not a valid source. */
export type WithdrawalSource = "available" | "profit";

export interface WithdrawalDestination {
  network: string;
  address: string;
}

export interface CreateWithdrawalInput {
  asset: string;
  amount: string; // decimal string
  source: WithdrawalSource;
  destination: WithdrawalDestination;
  /** Step-up auth (Sec 26): password re-entry to authorize the withdrawal. */
  password: string;
}

export interface Withdrawal {
  id: string;
  asset: string;
  amount: string; // decimal string
  source: WithdrawalSource;
  status: WithdrawalStatus;
  createdAt: string;
}

export async function requestWithdrawal(input: CreateWithdrawalInput): Promise<Withdrawal> {
  // TODO(backend): const { data } = await apiClient.post<Withdrawal>("/withdrawals", input, { headers: { "Idempotency-Key": crypto.randomUUID() } }); return data;
  void apiClient;
  return {
    id: `WD-${Date.now()}`,
    asset: input.asset,
    amount: input.amount,
    source: input.source,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export async function cancelWithdrawal(id: string): Promise<void> {
  // TODO(backend): await apiClient.post(`/withdrawals/${id}/cancel`);
  void apiClient;
  void id;
}
