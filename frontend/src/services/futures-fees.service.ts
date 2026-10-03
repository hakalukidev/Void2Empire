// Futures Fee & Funding Service Layer — REQ-026..035.
// All money values are decimal STRINGS (Sec 9.2, Sec46 rule #40) — never float.
// To connect backend: replace each body with an apiClient call.
//
// Rates confirmed by the client clarification round (v14, Q10 + Q21):
//   Trading fee = 0.1% of the POST-LEVERAGE NOTIONAL, charged on open AND on close.
//                 Worked example given by the client: $10 margin x 10x = $100
//                 notional -> $0.10 per open/close transaction.
//   Funding fee = 2% of margin, company-activated at a 1h / 4h / 8h interval.
//                 It is a separate charge, not the trading fee.
//
// The previous version of this file charged 2% of MARGIN as the open/close fee,
// which overstated a $10 x 10x open by 4x and conflated the funding rate with
// the trade fee.
//
// NOTE: the server is authoritative for the charged amounts. These functions are
// previews only; rounding to the ledger's precision is DR-047 and stays server-side.

import {
  addDecimalStrings,
  divideDecimalStrings,
  multiplyDecimalByInteger,
  multiplyDecimalStrings,
} from "@/lib/utils/decimal";
import { marketsFor } from "@/config/markets";
import { parsePair } from "@/lib/utils/pair";

/** 0.1% of notional, per side of the trade (v14 Q10/Q21). */
export const TRADING_FEE_RATE = "0.001";

/**
 * The same rate as a percent figure for copy and screens, derived rather than
 * typed again, so a rate change can never leave the wording behind. Dividing by
 * "1" trims the trailing zeros a plain x100 leaves.
 */
export const TRADING_FEE_PERCENT = divideDecimalStrings(
  multiplyDecimalByInteger(TRADING_FEE_RATE, 100),
  "1",
);

/** 2% of margin, applied when the company settles funding (v14 Q10). */
export const FUNDING_RATE = "0.02";

export type FundingDirection = "long_pays_short" | "short_pays_long";

export interface FundingConfig {
  marketId: string;
  pair: string;
  /** Decimal fraction of margin, e.g. "0.02" = 2%. */
  fundingRate: string;
  /** Hours between settlements. Admin activates one of 1 / 4 / 8 (v14 Q10). */
  fundingIntervalHours: number;
  /**
   * Derived from the side imbalance, not fixed per market: the side carrying
   * more exposure pays the other side (v14 Q10). Computed server-side.
   */
  fundingDirection: FundingDirection;
  nextSettlementAt: string; // ISO timestamp
}

export interface FeePreview {
  margin: string;
  /** margin x leverage — the amount the fee is charged against. */
  notional: string;
  entryFee: string;
  closingFee: string;
  totalFees: string;
}

export interface FundingHistoryEntry {
  id: string;
  positionId: string;
  pair: string;
  side: "Long" | "Short";
  margin: string;
  fundingRate: string;
  /** Negative = paid, positive = received. */
  fundingAmount: string;
  settledAt: string;
}

export interface FundingStats {
  totalFundingCollected: string;
  settlementsToday: number;
  activeMarketsWithFunding: number;
}

export interface AdminFundingSettlement {
  id: string;
  pair: string;
  direction: FundingDirection;
  totalLongPaid: string;
  totalShortPaid: string;
  settledAt: string;
}

// ─── CALCULATIONS ─────────────────────────────────────────────────────────────

/** Notional = margin x leverage, exactly (no float). */
export function calculateNotional(margin: string, leverage: number): string {
  return multiplyDecimalByInteger(margin, leverage);
}

/**
 * Open + close fee preview for a leveraged position. Both fees are 0.1% of the
 * notional, so a 10x position pays ten times the fee the same margin would pay
 * un-leveraged — that is the client's stated rule, not an accident.
 */
export function calculateFeePreview(margin: string, leverage: number): FeePreview {
  const notional = calculateNotional(margin, leverage);
  const entryFee = multiplyDecimalStrings(notional, TRADING_FEE_RATE);
  const closingFee = entryFee;
  return {
    margin,
    notional,
    entryFee,
    closingFee,
    totalFees: addDecimalStrings(entryFee, closingFee),
  };
}

/** Funding Amount = margin x funding rate. Returns a decimal string. */
export function calculateFundingAmount(margin: string, fundingRate: string): string {
  return multiplyDecimalStrings(margin, fundingRate);
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// No futures backend exists yet, so these rows are layout samples. They must
// never be treated as quotes or as a charged amount.
//
// One config per market the catalog gives a futures rail to — the previous list
// carried SOL/BNB/XRP, coins the client never said the platform launches, so the
// admin screen offered to configure funding for markets that do not exist.
// Interval and direction are cycled here purely so the sample table is not six
// identical rows; the real values are the operator's setting (v14 Q10) and the
// server's imbalance calculation.
const SAMPLE_INTERVALS = [8, 4, 1];

const MOCK_FUNDING_CONFIGS: FundingConfig[] = marketsFor("futures").map((market, index): FundingConfig => {
  const intervalHours = SAMPLE_INTERVALS[index % SAMPLE_INTERVALS.length];
  return {
    marketId: market.symbol,
    pair: market.pair,
    fundingRate: FUNDING_RATE,
    fundingIntervalHours: intervalHours,
    fundingDirection: index % 3 === 1 ? "short_pays_long" : "long_pays_short",
    nextSettlementAt: new Date(Date.now() + intervalHours * 3_600_000 * 0.7).toISOString(),
  };
});

const MOCK_USER_FUNDING_HISTORY: FundingHistoryEntry[] = [
  { id: "FND-001", positionId: "POS-101", pair: "BTC/USDT", side: "Long", margin: "1000", fundingRate: FUNDING_RATE, fundingAmount: "-20.00", settledAt: "2024-09-23 08:00" },
  { id: "FND-002", positionId: "POS-101", pair: "BTC/USDT", side: "Long", margin: "1000", fundingRate: FUNDING_RATE, fundingAmount: "-20.00", settledAt: "2024-09-23 00:00" },
  { id: "FND-003", positionId: "POS-099", pair: "ETH/USDT", side: "Short", margin: "500", fundingRate: FUNDING_RATE, fundingAmount: "10.00", settledAt: "2024-09-22 20:00" },
  { id: "FND-004", positionId: "POS-095", pair: "V2E/USDT", side: "Long", margin: "200", fundingRate: FUNDING_RATE, fundingAmount: "4.00", settledAt: "2024-09-22 16:00" },
];

const MOCK_ADMIN_HISTORY: AdminFundingSettlement[] = [
  { id: "SET-001", pair: "BTC/USDT", direction: "long_pays_short", totalLongPaid: "45.20", totalShortPaid: "0", settledAt: "2024-09-23 08:00" },
  { id: "SET-002", pair: "ETH/USDT", direction: "long_pays_short", totalLongPaid: "18.50", totalShortPaid: "0", settledAt: "2024-09-23 08:00" },
  { id: "SET-003", pair: "V2E/USDT", direction: "short_pays_long", totalLongPaid: "0", totalShortPaid: "9.60", settledAt: "2024-09-23 08:00" },
  { id: "SET-004", pair: "BTC/USDT", direction: "long_pays_short", totalLongPaid: "43.10", totalShortPaid: "0", settledAt: "2024-09-23 00:00" },
];

const MOCK_STATS: FundingStats = {
  totalFundingCollected: "12450",
  settlementsToday: 24,
  activeMarketsWithFunding: MOCK_FUNDING_CONFIGS.length,
};

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

/** Accepts any of the pair spellings the app routes with — `BTCUSDT`, `BTC-USDT`, `BTC/USDT`. */
export async function getFundingConfig(pair: string): Promise<FundingConfig | null> {
  // TODO(backend): GET /futures/funding-config/{market_id}
  const { symbol } = parsePair(pair);
  return MOCK_FUNDING_CONFIGS.find((c) => c.marketId === symbol) ?? null;
}

export async function getMyFundingHistory(): Promise<FundingHistoryEntry[]> {
  // TODO(backend): GET /futures/funding-history
  return MOCK_USER_FUNDING_HISTORY;
}

// ─── ADMIN SERVICE FUNCTIONS ──────────────────────────────────────────────────

export async function getAllFundingConfigs(): Promise<FundingConfig[]> {
  // TODO(backend): GET /admin/funding/configs
  return MOCK_FUNDING_CONFIGS;
}

export async function updateFundingConfig(
  marketId: string,
  updates: Partial<FundingConfig>
): Promise<void> {
  // TODO(backend): PATCH /admin/funding/configs/{marketId}
  const idx = MOCK_FUNDING_CONFIGS.findIndex((c) => c.marketId === marketId);
  if (idx !== -1) Object.assign(MOCK_FUNDING_CONFIGS[idx], updates);
}

export async function getFundingStats(): Promise<FundingStats> {
  // TODO(backend): GET /admin/funding/stats
  return MOCK_STATS;
}

export async function getAdminFundingHistory(): Promise<AdminFundingSettlement[]> {
  // TODO(backend): GET /admin/funding/history
  return MOCK_ADMIN_HISTORY;
}
