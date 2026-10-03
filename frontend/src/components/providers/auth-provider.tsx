"use client";

import { useEffect } from "react";
import { isAxiosError } from "axios";
import { fetchCurrentUser, logoutUser } from "@/lib/api/auth";
import { isProtectedPath, loginPathFor } from "@/lib/auth/routes";
import { useAuthStore } from "@/store/auth-store";

// Restores the session on page load. The auth cookie is httpOnly, so the only
// way for the client to know who is logged in is to ask the backend.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;

    fetchCurrentUser()
      .then((user) => {
        // A login/logout that finished first already set the real state.
        if (cancelled || useAuthStore.getState().status !== "loading") return;
        useAuthStore.getState().setUser(user);
      })
      .catch(async (error) => {
        if (cancelled || useAuthStore.getState().status !== "loading") return;
        useAuthStore.getState().setUser(null);

        // proxy.ts let us in because the cookie looked unexpired, but the
        // backend rejected it (revoked session, bad signature, unverified
        // email, deleted user). Clear it, or proxy and /login would bounce
        // between each other.
        const status = isAxiosError(error) ? error.response?.status : undefined;
        const rejected = status === 401 || status === 403;
        const path = window.location.pathname;
        if (rejected && isProtectedPath(path)) {
          await logoutUser().catch(() => {});
          // Full load so /login renders as a page, not the intercepted modal
          // over the protected page.
          window.location.replace(loginPathFor(path));
        }
      });

    return () => {
      cancelled = true;
    };
    // Once per full page load; client-side navigations keep the store.
  }, []);

  return <>{children}</>;
}
