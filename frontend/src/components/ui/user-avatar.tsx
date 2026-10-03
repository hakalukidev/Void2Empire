"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { User } from "@/types";

function initials(fullName: string) {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * The user's Google picture when there is one, their initials otherwise or
 * when the picture fails to load. A plain <img>, not next/image: the URL is on
 * Google's CDN, and no-referrer avoids the 403 it sometimes returns to
 * cross-site referrers.
 */
export function UserAvatar({ user, className }: { user: Pick<User, "fullName" | "avatarUrl">; className?: string }) {
  const [failed, setFailed] = useState(false);
  const base = "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 font-semibold text-primary";

  if (user.avatarUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn(base, "object-cover", className)}
      />
    );
  }
  return (
    <span className={cn(base, className)} aria-hidden="true">
      {initials(user.fullName)}
    </span>
  );
}
