"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";
import { useLocaleStore } from "@/store/locale-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api";

// Reasons the backend appends as /login?error= when Google sign-in fails
// (backend auth.googleFail), mapped to message keys so the toast follows the
// chosen locale.
const GOOGLE_ERROR_KEYS: Record<string, string> = {
  google_unavailable: "auth.google_unavailable",
  google_cancelled: "auth.google_cancelled",
  google_unverified: "auth.google_unverified",
  google_conflict: "auth.google_conflict",
  google_failed: "auth.google_failed",
};

/**
 * A full-page navigation, not an API call: the backend redirects the browser
 * to Google and back, then sets the session cookie itself.
 */
export function GoogleButton({ labelKey = "auth.google_login" }: { labelKey?: string }) {
  const { t } = useLocaleStore();
  const href = () => {
    const next = new URLSearchParams(window.location.search).get("next");
    return `${API_URL}/auth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  };

  return (
    <button
      type="button"
      onClick={() => window.location.assign(href())}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background text-sm font-semibold transition-colors hover:bg-accent"
    >
      <GoogleLogo />
      {t(labelKey)}
    </button>
  );
}

/** The "or" rule between the Google button and the email form. */
export function AuthDivider() {
  const { t } = useLocaleStore();
  return (
    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      {t("auth.or")}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/**
 * Shows the reason a Google sign-in bounced back to /login, once, then drops
 * it from the URL so a refresh does not repeat the message.
 */
export function useGoogleErrorToast() {
  const { t } = useLocaleStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("error");
    const errorKey = reason ? GOOGLE_ERROR_KEYS[reason] : undefined;
    if (!errorKey) return;
    toast.error(t(errorKey));
    params.delete("error");
    const query = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (query ? `?${query}` : ""));
  }, [t]);
}

// Google's "G" mark in its brand colours, as its sign-in branding guidelines require.
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
