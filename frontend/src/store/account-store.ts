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
}

export const useAccountStore = create<AccountState>((set) => ({
  mode: "demo",
  demoBalance: "10000",
  liveBalance: "0",
  setMode: (mode) => set({ mode }),
}));
