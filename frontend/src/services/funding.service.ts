// Void2Empire Funding System (WA-1) service layer — REQ-097..109.
// All money values are decimal STRINGS (Sec46 rule #40) — never float.
// Returns stub data shaped for the documented endpoints (Sec 18.2, line 1139):
//   GET  /funding/ratios
//   POST /funding/quote            { paid_amount }
//   POST /funding/purchases        { paid_amount }
//   GET  /funding/purchases        (list) / {id}
//   POST /funding/purchases/{id}/close
//   GET  /funding/purchases/{id}/milestones
// To connect the backend, replace each body with an apiClient call.

import { multiplyDecimalByInteger, divideDecimalByInteger } from "@/lib/utils/decimal";

export interface FundingPreset {
  paid: string; // wallet currency the user pays
  funding: string; // restricted Funding Balance granted (paid × ratio)
}

/**
 * Fixed trading leverage inside the Funding System (v20 Q24): 20×, and the user
 * cannot change it. This is NOT the purchase `ratio` below — 10× is how much
 * Funding Balance a paid amount buys (REQ-098/099); 20× is how the resulting
 * balance is leveraged once futures trades are opened with it. Every other rule
 * for funding-based trades (margin, fee, liquidation) is still undecided (DR-053).
 */
export const FUNDING_TRADING_LEVERAGE = 20;

export interface FundingRatioConfig {
  /** Asset the paid amount is debited in. The wallet base currency is still open (v20 Q14). */
  currency: string;
  /**
   * Asset the Funding Balance itself is denominated in. v20 (Step 9) confirms the
   * Funding System uses VUSDT and nothing else, so this is never the same field as
   * `currency` — the paid side and the granted side can differ.
   */
  fundingAsset: string;
  ratio: number; // basic ratio is 10× (REQ-098) — a multiplier, not money
  presets: FundingPreset[]; // 50→500, 100→1000, 150→1500 (REQ-098/109)
  minAmount: string; // admin-configured bounds (funding_ratios); no client-stated limits
  maxAmount: string;
}

/**
 * Admin-configurable, versioned milestone table (funding_milestones).
 * Only the two settled data points are seeded (REQ-103). The formula beyond
 * 600% is DR-051 blocked — do NOT generalize; render exactly what the table holds.
 */
export interface FundingMilestone {
  profitPct: number; // e.g. 300, 600
  rewardMultiplier: number; // e.g. 1, 2 (× the funding amount)
}

export type FundingPurchaseStatus = "active" | "closed_by_user" | "closed_loss_threshold";

export interface FundingPurchase {
  id: string;
  paidAmount: string;
  fundingAmount: string;
  ratioUsed: number;
  currentLoss: string; // running loss against the position
  maxLossThreshold: string; // 50% of fundingAmount (REQ-102)
  highestMilestonePct: number | null; // highest milestone reached so far
  eligibleReward: string; // reward for the highest milestone (paid only on user close, REQ-105)
  status: FundingPurchaseStatus;
}

// ─── STUB DATA ────────────────────────────────────────────────────────────────

const DEFAULT_RATIO_CONFIG: FundingRatioConfig = {
  currency: "USDT",
  fundingAsset: "VUSDT",
  ratio: 10,
  presets: [
    { paid: "50", funding: "500" },
    { paid: "100", funding: "1000" },
    { paid: "150", funding: "1500" },
  ],
  minAmount: "10",
  maxAmount: "10000",
};

const DEFAULT_MILESTONES: FundingMilestone[] = [
  { profitPct: 300, rewardMultiplier: 1 },
  { profitPct: 600, rewardMultiplier: 2 },
];

let MOCK_ACTIVE_PURCHASE: FundingPurchase | null = null;
let mockCounter = 0;

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

export async function fetchFundingRatios(): Promise<FundingRatioConfig> {
  // TODO(backend): GET /funding/ratios
  return DEFAULT_RATIO_CONFIG;
}

export async function fetchFundingMilestones(): Promise<FundingMilestone[]> {
  // TODO(backend): GET /funding/purchases/{id}/milestones (or admin milestone table)
  return DEFAULT_MILESTONES;
}

/** Live 10× preview (REQ-099). Pure client-side; the authoritative quote is POST /funding/quote. */
export function quoteFunding(paidAmount: string, ratio: number): string {
  return multiplyDecimalByInteger(paidAmount, ratio);
}

export async function fetchActiveFundingPurchase(): Promise<FundingPurchase | null> {
  // TODO(backend): GET /funding/purchases?status=active
  return MOCK_ACTIVE_PURCHASE;
}

export async function purchaseFunding(paidAmount: string, ratio: number): Promise<FundingPurchase> {
  // TODO(backend): POST /funding/purchases { paid_amount } with an Idempotency-Key.
  const fundingAmount = multiplyDecimalByInteger(paidAmount, ratio);
  const purchase: FundingPurchase = {
    id: `FP-${++mockCounter}`,
    paidAmount,
    fundingAmount,
    ratioUsed: ratio,
    currentLoss: "0",
    maxLossThreshold: divideDecimalByInteger(fundingAmount, 2), // 50% (REQ-102)
    highestMilestonePct: null,
    eligibleReward: "0",
    status: "active",
  };
  MOCK_ACTIVE_PURCHASE = purchase;
  return purchase;
}

/** User-initiated close → reward credited to Profit Balance (REQ-105/106). */
export async function closeFundingPurchase(id: string): Promise<{ profitCredited: string }> {
  // TODO(backend): POST /funding/purchases/{id}/close
  const credited = MOCK_ACTIVE_PURCHASE?.id === id ? MOCK_ACTIVE_PURCHASE.eligibleReward : "0";
  if (MOCK_ACTIVE_PURCHASE?.id === id) {
    MOCK_ACTIVE_PURCHASE = { ...MOCK_ACTIVE_PURCHASE, status: "closed_by_user" };
    MOCK_ACTIVE_PURCHASE = null;
  }
  return { profitCredited: credited };
}

// ─── ADMIN (funding.manage) ───────────────────────────────────────────────────
// Admin edits the ratio/presets/bounds and the versioned milestone table.
// The milestone formula beyond the seeded points is DR-051 blocked — the admin
// table is the source of truth; nothing here generalizes a formula.

let adminConfig: FundingRatioConfig = { ...DEFAULT_RATIO_CONFIG, presets: [...DEFAULT_RATIO_CONFIG.presets] };
let adminMilestones: FundingMilestone[] = [...DEFAULT_MILESTONES];

export async function fetchAdminFundingConfig(): Promise<FundingRatioConfig> {
  // TODO(backend): GET /admin/funding/ratios
  return adminConfig;
}

export async function saveAdminFundingConfig(next: FundingRatioConfig): Promise<void> {
  // TODO(backend): PUT /admin/funding/ratios (creates a new versioned row)
  adminConfig = next;
}

export async function fetchAdminMilestones(): Promise<FundingMilestone[]> {
  // TODO(backend): GET /admin/funding/milestones
  return adminMilestones;
}

export async function saveAdminMilestones(next: FundingMilestone[]): Promise<void> {
  // TODO(backend): PUT /admin/funding/milestones (versioned, effective-dated)
  adminMilestones = next;
}

