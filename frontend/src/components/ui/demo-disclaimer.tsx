"use client";

import { AlertTriangle } from "lucide-react";
import { useLocaleStore } from "@/store/locale-store";

export function DemoDisclaimer({ className }: { className?: string }) {
  const { t } = useLocaleStore();
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-lg border border-warning/40 bg-warning/15 px-4 py-2 text-center text-sm font-semibold text-warning ${className ?? ""}`}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span dir="auto">{t("demo.disclaimer")}</span>
    </div>
  );
}
