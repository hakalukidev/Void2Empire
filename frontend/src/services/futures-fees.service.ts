// Futures Fee & Funding Fee Service Layer
// All functions return mock data. To connect backend:
// Replace each function body with a fetch() call.

export type FundingDirection = "long_pays_short" | "short_pays_long";

export interface FundingConfig {
  marketId: string;
  pair: string;
  fundingRate: number;       // e.g. 0.0001 = 0.01%
  fundingInterval: number;   // hours: 1, 4, 8, or custom
  fundingDirection: FundingDirection;
  nextSettlementAt: string;  // ISO timestamp
}

export interface FundingHistoryEntry {
  id: string;
  positionId: string;
  pair: string;
  side: "Long" | "Short";
  margin: number;
  fundingRate: number;
  fundingAmount: number;   // negative = paid, positive = received
  companyFee: number;
  direction: FundingDirection;
  settledAt: string;
}

export interface FeePreview {
  margin: number;
  entryFee: number;
  closingFee: number;
  totalFees: number;
}

export interface FundingStats {
  totalFundingCollected: number;
  companyFeeEarned: number;
  settlementsToday: number;
  activeMarketsWithFunding: number;
}

export interface AdminFundingSettlement {
  id: string;
  pair: string;
  direction: FundingDirection;
  totalLongPaid: number;
  totalShortPaid: number;
  companyFee: number;
  settledAt: string;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_FUNDING_CONFIGS: FundingConfig[] = [
  { marketId: "btc-usdt", pair: "BTC-USDT", fundingRate: 0.0001, fundingInterval: 8, fundingDirection: "long_pays_short", nextSettlementAt: new Date(Date.now() + 6.7 * 3600 * 1000).toISOString() },
  { marketId: "eth-usdt", pair: "ETH-USDT", fundingRate: 0.0001, fundingInterval: 4, fundingDirection: "long_pays_short", nextSettlementAt: new Date(Date.now() + 2.2 * 3600 * 1000).toISOString() },
  { marketId: "sol-usdt", pair: "SOL-USDT", fundingRate: 0.0002, fundingInterval: 4, fundingDirection: "short_pays_long", nextSettlementAt: new Date(Date.now() + 2.2 * 3600 * 1000).toISOString() },
  { marketId: "bnb-usdt", pair: "BNB-USDT", fundingRate: 0.0001, fundingInterval: 8, fundingDirection: "long_pays_short", nextSettlementAt: new Date(Date.now() + 6.7 * 3600 * 1000).toISOString() },
  { marketId: "xrp-usdt", pair: "XRP-USDT", fundingRate: 0.0003, fundingInterval: 1, fundingDirection: "long_pays_short", nextSettlementAt: new Date(Date.now() + 0.5 * 3600 * 1000).toISOString() },
];

const MOCK_USER_FUNDING_HISTORY: FundingHistoryEntry[] = [
  { id: "FND-001", positionId: "POS-101", pair: "BTC-USDT", side: "Long",  margin: 1000, fundingRate: 0.0001, fundingAmount: -0.10, companyFee: 0.002, direction: "long_pays_short", settledAt: "2024-09-23 08:00" },
  { id: "FND-002", positionId: "POS-101", pair: "BTC-USDT", side: "Long",  margin: 1000, fundingRate: 0.0001, fundingAmount: -0.10, companyFee: 0.002, direction: "long_pays_short", settledAt: "2024-09-23 00:00" },
  { id: "FND-003", positionId: "POS-099", pair: "ETH-USDT", side: "Short", margin: 500,  fundingRate: 0.0001, fundingAmount:  0.05, companyFee: 0.001, direction: "long_pays_short", settledAt: "2024-09-22 20:00" },
  { id: "FND-004", positionId: "POS-095", pair: "SOL-USDT", side: "Long",  margin: 200,  fundingRate: 0.0002, fundingAmount:  0.04, companyFee: 0.0008,direction: "short_pays_long",  settledAt: "2024-09-22 16:00" },
  { id: "FND-005", positionId: "POS-095", pair: "SOL-USDT", side: "Long",  margin: 200,  fundingRate: 0.0002, fundingAmount:  0.04, companyFee: 0.0008,direction: "short_pays_long",  settledAt: "2024-09-22 12:00" },
];

const MOCK_ADMIN_HISTORY: AdminFundingSettlement[] = [
  { id: "SET-001", pair: "BTC-USDT", direction: "long_pays_short", totalLongPaid: 45.20, totalShortPaid: 0,     companyFee: 0.904, settledAt: "2024-09-23 08:00" },
  { id: "SET-002", pair: "ETH-USDT", direction: "long_pays_short", totalLongPaid: 18.50, totalShortPaid: 0,     companyFee: 0.37,  settledAt: "2024-09-23 08:00" },
  { id: "SET-003", pair: "SOL-USDT", direction: "short_pays_long", totalLongPaid: 0,     totalShortPaid: 9.60,  companyFee: 0.192, settledAt: "2024-09-23 08:00" },
  { id: "SET-004", pair: "BTC-USDT", direction: "long_pays_short", totalLongPaid: 43.10, totalShortPaid: 0,     companyFee: 0.862, settledAt: "2024-09-23 00:00" },
];

const MOCK_STATS: FundingStats = {
  totalFundingCollected: 12450,
  companyFeeEarned: 249,
  settlementsToday: 24,
  activeMarketsWithFunding: 5,
};

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

/**
 * Pure client-side calculation — no API needed.
 * Entry Fee and Closing Fee are both 2% of margin.
 */
export function calculateFeePreview(margin: number): FeePreview {
  const entryFee = margin * 0.02;
  const closingFee = margin * 0.02;
  return { margin, entryFee, closingFee, totalFees: entryFee + closingFee };
}

/**
 * Funding Amount = Margin × Funding Rate
 * Company Fee = Funding Amount × 2%
 */
export function calculateFundingAmount(margin: number, fundingRate: number) {
  const fundingAmount = margin * fundingRate;
  const companyFee = fundingAmount * 0.02;
  return { fundingAmount, companyFee };
}

export async function getFundingConfig(pair: string): Promise<FundingConfig | null> {
  // TODO: return fetch(`/api/futures/funding-config/${pair}`).then(r => r.json());
  const key = pair.toLowerCase().replace("/", "-");
  return MOCK_FUNDING_CONFIGS.find(c => c.marketId === key) ?? null;
}

export async function getMyFundingHistory(): Promise<FundingHistoryEntry[]> {
  // TODO: return fetch('/api/futures/funding-history').then(r => r.json());
  return MOCK_USER_FUNDING_HISTORY;
}

// ─── ADMIN SERVICE FUNCTIONS ──────────────────────────────────────────────────

export async function getAllFundingConfigs(): Promise<FundingConfig[]> {
  // TODO: return fetch('/api/admin/funding/configs').then(r => r.json());
  return MOCK_FUNDING_CONFIGS;
}

export async function updateFundingConfig(marketId: string, updates: Partial<FundingConfig>): Promise<void> {
  // TODO: return fetch(`/api/admin/funding/configs/${marketId}`, { method: 'PATCH', body: JSON.stringify(updates) });
  const idx = MOCK_FUNDING_CONFIGS.findIndex(c => c.marketId === marketId);
  if (idx !== -1) Object.assign(MOCK_FUNDING_CONFIGS[idx], updates);
}

export async function getFundingStats(): Promise<FundingStats> {
  // TODO: return fetch('/api/admin/funding/stats').then(r => r.json());
  return MOCK_STATS;
}

export async function getAdminFundingHistory(): Promise<AdminFundingSettlement[]> {
  // TODO: return fetch('/api/admin/funding/history').then(r => r.json());
  return MOCK_ADMIN_HISTORY;
}
