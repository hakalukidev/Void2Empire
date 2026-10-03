"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { LogoMark } from "@/components/ui/logo";
import { AuthModalProvider } from "@/components/auth/auth-context";
import { useLocaleStore } from "@/store/locale-store";
import { cn } from "@/lib/utils/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Shell for the intercepted /login and /register routes (app/@auth). It only
// ever opens on a client-side navigation, so closing is a history step back.
// The label is a message key, not text: these routes are rendered by server
// components, which cannot read the locale at navigation time.
export function AuthModal({
  labelKey,
  wide,
  children,
}: {
  labelKey: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useLocaleStore();
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => router.back(), [router]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    panelRef.current?.querySelector<HTMLInputElement>("input:not([type=hidden])")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      // Keep Tab inside the dialog.
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-[#03060c]/70 backdrop-blur-md animate-overlay-in"
        aria-hidden="true"
      />
      <div
        className="relative flex min-h-full items-center justify-center p-4 sm:p-6"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t(labelKey)}
          className={cn(
            "relative w-full rounded-2xl border border-border bg-card shadow-2xl shadow-black/50 animate-modal-in",
            wide ? "max-w-[480px]" : "max-w-[420px]"
          )}
        >
          {/* Hairline highlight and glow along the top edge. */}
          <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-linear-to-r from-transparent via-brand-blue-400 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-2xl bg-[radial-gradient(ellipse_at_top,rgba(76,141,255,0.16),transparent_70%)]" />

          <button
            type="button"
            onClick={close}
            aria-label={t("auth.close")}
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative px-6 pb-7 pt-8 sm:px-8">
            <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-blue-500/30 bg-brand-blue-500/10 shadow-inner shadow-brand-blue-500/10">
              <LogoMark size={24} />
            </span>
            <AuthModalProvider value={true}>{children}</AuthModalProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
