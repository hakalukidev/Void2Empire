// Binary Trading service layer — REQ-040..044 and client clarification v20.
// All money values are decimal STRINGS (Sec46 rule #40).
//
// Confirmed by the client (v20 Q10/Q12/Q13):
//   Stake bounds  — minimum $1, maximum $1,000 per trade.
//   Expiries      — 15s, 30s, 1m, 5m, 30m, 1h; the list is admin-configurable.
//   Payout        — a fixed percentage of the stake, in the BAND 80 / 82 / 85 /
//                   87 / 90 %. Which rate applies to which market is set by the
//                   admin and that mapping was not given, so nothing here picks
//                   a single "the" rate for a trade preview.
//   Cancel        — a user may cancel their own trade before the cut-off.
//   Cut-off       — no new trade in the last 1 second before an expiry.
//   One direction — a user holds Long OR Short on a coin, never both at once.
//   Settlement    — expiry price above/below entry decides win or loss by
//                   direction; an EQUAL price returns the stake in full
//                   (neither win nor loss). The price source (platform-computed
//                   vs external feed) is still unanswered.
//
// The server owns the expiry price, the win/loss decision and the credit. This
// file never settles a trade — it books, lists and cancels.

import { addDecimalStrings, compareDecimalStrings, multiplyDecimalStrings } from "@/lib/utils/decimal";

export const BINARY_MIN_STAKE = "1";
export const BINARY_MAX_STAKE = "1000";
/** No new trade once the pair's open trade is inside this window (v20 Q13). */
export const BINARY_CUTOFF_SECONDS = 1;

/** The confirmed payout band, as decimal fractions of the stake. */
export const BINARY_PAYOUT_RATES = ["0.80", "0.82", "0.85", "0.87", "0.90"];
export const MIN_PAYOUT_RATE = BINARY_PAYOUT_RATES[0];
export const MAX_PAYOUT_RATE = BINARY_PAYOUT_RATES[BINARY_PAYOUT_RATES.length - 1];

export interface BinaryExpiry {
  label: string;
  seconds: number;
}

// Admin-configurable list; these are the six options the client named, and the
// admin screen toggles which of them are offered.
export const DEFAULT_BINARY_EXPIRIES: BinaryExpiry[] = [
  { label: "15s", seconds: 15 },
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "5m", seconds: 300 },
  { label: "30m", seconds: 1800 },
  { label: "1h", seconds: 3600 },
];

export type BinaryDirection = "up" | "down";
export type BinaryTradeStatus = "open" | "won" | "lost" | "refunded" | "cancelled";

export interface BinaryTrade {
  id: string;
  pair: string;
  direction: BinaryDirection;
  stake: string;
  /** Null until the admin's per-market rate is known for this trade. */
  payoutRate: string | null;
  expirySeconds: number;
  openedAt: string;
  settlesAt: string;
  status: BinaryTradeStatus;
}

export class BinaryTradeRejected extends Error {}

let MOCK_BINARY_TRADES: BinaryTrade[] = [];
let binaryTradeCounter = 0;

export function stakeWithinBounds(stake: string): boolean {
  return (
    compareDecimalStrings(stake, BINARY_MIN_STAKE) >= 0 &&
    compareDecimalStrings(stake, BINARY_MAX_STAKE) <= 0
  );
}

/** Payout band preview: stake x the lowest and highest confirmed rate. */
export function calculatePayoutRange(stake: string): {
  profitLow: string;
  profitHigh: string;
  payoutLow: string;
  payoutHigh: string;
} {
  const profitLow = multiplyDecimalStrings(stake, MIN_PAYOUT_RATE);
  const profitHigh = multiplyDecimalStrings(stake, MAX_PAYOUT_RATE);
  return {
    profitLow,
    profitHigh,
    payoutLow: addDecimalStrings(stake, profitLow),
    payoutHigh: addDecimalStrings(stake, profitHigh),
  };
}

export async function getBinaryExpiries(): Promise<BinaryExpiry[]> {
  // TODO(backend): GET /binary/expiries
  return DEFAULT_BINARY_EXPIRIES;
}

export async function fetchBinaryTrades(): Promise<BinaryTrade[]> {
  // TODO(backend): GET /binary/trades
  return MOCK_BINARY_TRADES;
}

export async function placeBinaryTrade(input: {
  pair: string;
  direction: BinaryDirection;
  stake: string;
  expirySeconds: number;
}): Promise<BinaryTrade> {
  // TODO(backend): POST /binary/trades with an Idempotency-Key.
  if (!stakeWithinBounds(input.stake)) {
    throw new BinaryTradeRejected(`Stake must be between ${BINARY_MIN_STAKE} and ${BINARY_MAX_STAKE}.`);
  }

  const openOnPair = MOCK_BINARY_TRADES.filter(
    (trade) => trade.pair === input.pair && trade.status === "open"
  );

  // v20 Q13: one direction per coin — an opposite open position is rejected.
  if (openOnPair.some((trade) => trade.direction !== input.direction)) {
    throw new BinaryTradeRejected("You already hold the opposite direction on this coin.");
  }

  // v20 Q13: no new trade inside the final second before an expiry settles.
  const cutoff = Date.now() + BINARY_CUTOFF_SECONDS * 1000;
  if (openOnPair.some((trade) => new Date(trade.settlesAt).getTime() <= cutoff)) {
    throw new BinaryTradeRejected("This coin settles in under a second; new trades are closed.");
  }

  const now = new Date();
  const trade: BinaryTrade = {
    id: `BIN-${++binaryTradeCounter}`,
    pair: input.pair,
    direction: input.direction,
    stake: input.stake,
    payoutRate: null,
    expirySeconds: input.expirySeconds,
    openedAt: now.toISOString(),
    settlesAt: new Date(now.getTime() + input.expirySeconds * 1000).toISOString(),
    status: "open",
  };
  MOCK_BINARY_TRADES = [trade, ...MOCK_BINARY_TRADES];
  return trade;
}

export async function cancelBinaryTrade(id: string): Promise<void> {
  // TODO(backend): DELETE /binary/trades/{id} — only while open and outside the cut-off.
  MOCK_BINARY_TRADES = MOCK_BINARY_TRADES.map((trade) =>
    trade.id === id ? { ...trade, status: "cancelled" as const } : trade
  );
}
