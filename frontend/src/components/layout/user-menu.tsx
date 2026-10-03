"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { logoutUser } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { useLocaleStore } from "@/store/locale-store";
import { UserAvatar } from "@/components/ui/user-avatar";

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
      toast.error(t("auth.logout_failed"));
      setPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2 border-l border-border pl-2">
      <Link
        href="/profile"
        aria-label={t("nav.profile")}
        title={user.fullName}
        className="rounded-full ring-offset-background transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <UserAvatar user={user} className="h-8 w-8 text-xs" />
      </Link>
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
