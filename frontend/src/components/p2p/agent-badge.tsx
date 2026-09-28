"use client";

import { AgentBadge } from "@/services/p2p.service";

interface AgentBadgeProps {
  badge: AgentBadge;
  size?: "sm" | "md";
}

export function AgentBadgeDisplay({ badge, size = "sm" }: AgentBadgeProps) {
  if (badge === "none") return null;

  const isPro = badge === "pro";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-bold border ${
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"
      } ${
        isPro
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-400/30"
          : "bg-yellow-500/15 text-yellow-800 dark:text-yellow-400 border-yellow-400/30"
      }`}
    >
      <span>{isPro ? "🟢" : "🟡"}</span>
      {isPro ? "LEVEL PRO" : "LEVEL 1"}
    </span>
  );
}
