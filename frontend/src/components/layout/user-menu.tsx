"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { logoutUser } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";

function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function UserMenu() {
  const { t } = useLocaleStore();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [pending, setPending] = useState(false);

  if (!user) return null;

  const onLogout = async () => {
    setPending(true);
    try {
      await logoutUser();
      setUser(null);
      // Full load, not router.replace: a soft navigation to /login would be
      // intercepted into the modal over the page we just logged out of, and
      // a reload also drops any per-user client state.
      window.location.replace("/login");
    } catch {
      toast.error("Could not log out");
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2 border-l border-border pl-2">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
        aria-hidden="true"
      >
        {initials(user.fullName)}
      </span>
      <div className="hidden min-w-0 max-w-40 flex-col leading-tight md:flex">
        <span className="truncate text-sm font-medium">{user.fullName}</span>
        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
      </div>
      <button
        type="button"
        onClick={onLogout}
        disabled={pending}
        aria-label={t("nav.logout")}
        title={t("nav.logout")}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
