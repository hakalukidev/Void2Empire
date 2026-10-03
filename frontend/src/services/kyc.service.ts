// KYC service layer — clarification v20 Q37.
// Money values are decimal STRINGS (Sec46 rule #40).
// To connect backend: replace each body with an apiClient call.
//
// What the client wrote down (v20 Q37):
//   * KYC is MANDATORY.
//   * There are exactly TWO levels.
//   * Level 1 "Normal Verification" — a basic identity document (NID card,
//     driving licence, passport, etc.); maximum $50,000 withdrawal PER DAY.
//   * Level 2 "Bank/Address Verification" — bank statement for the last 3 months
//     plus an address-verification document (current bill or bank statement);
//     after that full verification up to $2,000,000 USDT withdrawal/transfer.
//
// What it did NOT answer, and this module deliberately does not invent:
//   * the per-feature unlock matrix (deposit / withdrawal / spot / futures /
//     binary / P2P) — the client said it was not discussed (also `DR-018`);
//   * the cap that applies to an account with no verification at all;
//   * which KYC/AML provider checks the documents (`KYC_PROVIDER` is optional
//     until DR-018, and Sec 20 makes the provider a client-supplied service).

import type { KycLevel } from "@/types";

export interface KycLevelRule {
  level: Exclude<KycLevel, "none">;
  /** Display cap in USDT, decimal string. */
  cap: string;
  /** Level 1 is explicitly per day; the Level 2 answer did not restate a period. */
  capPeriod: "day" | "unstated";
  titleKey: string;
  docsKey: string;
}

const LEVEL_1: KycLevelRule = {
  level: "level_1",
  cap: "50000",
  capPeriod: "day",
  titleKey: "kyc.level_1",
  docsKey: "kyc.level_1_docs",
};

const LEVEL_2: KycLevelRule = {
  level: "level_2",
  cap: "2000000",
  capPeriod: "unstated",
  titleKey: "kyc.level_2",
  docsKey: "kyc.level_2_docs",
};

/** Both confirmed levels, in the order the UI should list them. */
export const KYC_LEVEL_RULES: KycLevelRule[] = [LEVEL_1, LEVEL_2];

/** Short labels for the admin tables, which are not translated yet. */
export const KYC_LEVEL_LABEL: Record<KycLevel, string> = {
  none: "Unverified",
  level_1: "Level 1",
  level_2: "Level 2",
};

/**
 * The confirmed rule for a level, or null when no cap was confirmed for it. An
 * unverified account has no stated number — the client only said verification
 * is mandatory — so the UI shows "not confirmed" instead of an invented limit.
 */
export function kycRuleForLevel(level: KycLevel): KycLevelRule | null {
  return KYC_LEVEL_RULES.find((rule) => rule.level === level) ?? null;
}

export interface MyKyc {
  level: KycLevel;
}

export async function fetchMyKyc(): Promise<MyKyc> {
  // TODO(backend): GET /kyc/me once a verification provider is decided.
  return { level: "none" };
}
