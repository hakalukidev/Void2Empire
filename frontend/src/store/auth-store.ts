import { create } from "zustand";
import type { User } from "@/types";

// "loading" until AuthProvider has asked the backend (/auth/me) who we are.
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user, status: user ? "authenticated" : "unauthenticated" }),
}));
