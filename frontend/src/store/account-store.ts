import { create } from "zustand";
import type { AccountMode } from "@/types";

interface AccountState {
  mode: AccountMode;
  // Balances are decimal strings (Sec46 rule #40). This store only selects the
  // display mode; it is never authoritative for money (Sec46 rule #8), so the
  // demo figure below is virtual funds and the live figure is a placeholder
  // until the wallet service serves the real balance.
  demoBalance: string;
  liveBalance: string;
  setMode: (mode: AccountMode) => void;
  resetDemoBalance: () => void;
}

/**
 * $10,000 is the confirmed demo starting balance, and the client confirms the
 * user may reset it themselves (v20 Q43). The demo ledger itself is server-side
 * (`demo` schema, Sec 14), so this only restores the displayed figure.
 */
export const DEMO_STARTING_BALANCE = "10000";

export const useAccountStore = create<AccountState>((set) => ({
  mode: "demo",
  demoBalance: DEMO_STARTING_BALANCE,
  liveBalance: "0",
  setMode: (mode) => set({ mode }),
  resetDemoBalance: () => set({ demoBalance: DEMO_STARTING_BALANCE }),
}));
