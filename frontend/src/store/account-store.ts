import { create } from "zustand";
import type { AccountMode } from "@/types";

interface AccountState {
  mode: AccountMode;
  demoBalance: number;
  liveBalance: number;
  setMode: (mode: AccountMode) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  mode: "demo",
  demoBalance: 10000,
  liveBalance: 0,
  setMode: (mode) => set({ mode }),
}));
