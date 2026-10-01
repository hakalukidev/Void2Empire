import { create } from "zustand";

// Open state for the off-canvas sidebar shown below the md breakpoint.
interface NavState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
