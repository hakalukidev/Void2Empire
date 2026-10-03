"use client";

import { Check } from "lucide-react";
import { useLocaleStore } from "@/store/locale-store";
import { cn } from "@/lib/utils/cn";

// Mirrors passwordSchema in lib/validators/auth.ts and the backend's
// validatePasswordStrength, so every rule shown here is one that is enforced.
const rules = [
  { key: "auth.rule_length", test: (p: string) => p.length >= 8 },
  { key: "auth.rule_upper", test: (p: string) => /[A-Z]/.test(p) },
  { key: "auth.rule_lower", test: (p: string) => /[a-z]/.test(p) },
  { key: "auth.rule_number", test: (p: string) => /[0-9]/.test(p) },
  { key: "auth.rule_symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const levels = [
  { key: "auth.strength_too_weak", bar: "bg-destructive", text: "text-destructive" },
  { key: "auth.strength_weak", bar: "bg-destructive", text: "text-destructive" },
  { key: "auth.strength_fair", bar: "bg-warning", text: "text-warning" },
  { key: "auth.strength_good", bar: "bg-brand-blue-400", text: "text-brand-blue-400" },
  { key: "auth.strength_strong", bar: "bg-success", text: "text-success" },
];

export function PasswordStrength({ password }: { password: string }) {
  const { t } = useLocaleStore();
  if (!password) return null;

  const passed = rules.map((rule) => rule.test(password));
  const score = passed.filter(Boolean).length; // 0..5
  const level = levels[Math.max(0, score - 1)];
  const filled = Math.max(1, score - 1); // 4 bars

  return (
    <div className="mt-2.5 space-y-2" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full bg-border transition-colors duration-300",
                i < filled && level.bar
              )}
            />
          ))}
        </div>
        <span className={cn("w-16 text-right text-[11px] font-medium", level.text)}>
          {t(level.key)}
        </span>
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {rules.map((rule, i) => (
          <li
            key={rule.key}
            className={cn(
              "flex items-center gap-1 text-[11px] transition-colors",
              passed[i] ? "text-success" : "text-muted-foreground"
            )}
          >
            <Check className={cn("h-3 w-3", !passed[i] && "opacity-30")} />
            {t(rule.key)}
          </li>
        ))}
      </ul>
    </div>
  );
}
