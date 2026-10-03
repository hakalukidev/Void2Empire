// Referral service layer — REQ-060..064.
// All money values are decimal STRINGS (Sec46 rule #40) — never float.
// To connect backend: replace each body with an apiClient call.
//
// The reward rule is the client's written answer in clarification v20 (Q39/Q40
// and the "Affiliate / Referral System" note):
//   * The reward is 0.01% of each DEPOSIT a referred user makes, credited to the
//     referrer's account.
//   * The relationship is PERMANENT — it never expires, so every later deposit
//     keeps paying.
//   * The basis is deposits, NOT a share of trading fees. The client corrected
//     that explicitly, which is why the wording "20% commission on all trading
//     fees" that this screen used to carry is gone.
//
// Still unanswered, and therefore not modelled here: multi-level referral
// structure, any reward cap, reversal when a deposit is reversed, payout
// restrictions, and the leaderboard ranking periods. This is single-level only.

import {
  divideDecimalStrings,
  multiplyDecimalByInteger,
  multiplyDecimalStrings,
} from "@/lib/utils/decimal";

/** 0.01% of the referred user's deposit (v20 Q39). */
export const REFERRAL_REWARD_RATE = "0.0001";

/**
 * The same rate written as a percent ("0.01"), for copy that has to quote it.
 * Dividing by 1 trims the trailing zeros a plain x100 leaves behind, and keeps
 * the figure exact if the rate is ever changed to something finer.
 */
export const REFERRAL_REWARD_PERCENT = divideDecimalStrings(
  multiplyDecimalByInteger(REFERRAL_REWARD_RATE, 100),
  "1",
);

/** Reward = deposit x rate, exactly (no float). */
export function calculateReferralReward(depositAmount: string): string {
  return multiplyDecimalStrings(depositAmount, REFERRAL_REWARD_RATE);
}

export interface ReferralSummary {
  totalReferrals: number;
  /** Sum of every reward credited so far, decimal string. */
  totalEarned: string;
  rewardRate: string;
}

export interface ReferralEarning {
  id: string;
  /** Pseudonym, not the account email: whether the leaderboard shows real names is unanswered. */
  referredUser: string;
  depositAmount: string;
  rewardAmount: string;
  creditedAt: string;
}

export interface ReferralLeaderboardRow {
  rank: number;
  name: string;
  initials: string;
  totalReferrals: number;
  totalEarned: string;
}

export async function fetchReferralLink(): Promise<string> {
  // TODO(backend): GET /referral/me — the code belongs to the signed-in user.
  // The production domain is the client's to supply [REQ-091], so this builds the link from
  // wherever the app is running and marks the code as a sample instead of claiming a live one.
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/register?ref=SAMPLE`;
}

export async function fetchReferralSummary(): Promise<ReferralSummary> {
  // TODO(backend): GET /referral/summary
  // No referral ledger exists yet, so this reports nothing rather than sample
  // money: a fake "total earned" on a real-money screen is not a layout detail.
  return { totalReferrals: 0, totalEarned: "0", rewardRate: REFERRAL_REWARD_RATE };
}

export async function fetchReferralEarnings(): Promise<ReferralEarning[]> {
  // TODO(backend): GET /referral/earnings
  return [];
}

// Layout samples for the referral ranking — the whole leaderboard screen is
// sample data today, so these stay consistent with it. They are never shown on
// the user's own earnings view.
const MOCK_REFERRAL_LEADERBOARD: ReferralLeaderboardRow[] = [
  { rank: 1, name: "CryptoKing", initials: "CK", totalReferrals: 42, totalEarned: "184.20" },
  { rank: 2, name: "NightTrader", initials: "NT", totalReferrals: 31, totalEarned: "121.75" },
  { rank: 3, name: "BullRunner", initials: "BR", totalReferrals: 24, totalEarned: "88.40" },
  { rank: 4, name: "AlphaWolf", initials: "AW", totalReferrals: 19, totalEarned: "61.05" },
  { rank: 5, name: "SatoshiProX", initials: "SP", totalReferrals: 12, totalEarned: "34.90" },
  { rank: 6, name: "DeFiHunter", initials: "DH", totalReferrals: 8, totalEarned: "19.25" },
];

export async function fetchReferralLeaderboard(): Promise<ReferralLeaderboardRow[]> {
  // TODO(backend): GET /leaderboard/referral
  return MOCK_REFERRAL_LEADERBOARD;
}
