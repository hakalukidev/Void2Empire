import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Mirrors passwordSchema in lib/validators/auth.ts and the backend's
// validatePasswordStrength, so every rule shown here is one that is enforced.
const rules = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const levels = [
  { label: "Too weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Weak", bar: "bg-destructive", text: "text-destructive" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Good", bar: "bg-brand-blue-400", text: "text-brand-blue-400" },
  { label: "Strong", bar: "bg-success", text: "text-success" },
];

export function PasswordStrength({ password }: { password: string }) {
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
        <span className={cn("w-14 text-right text-[11px] font-medium", level.text)}>
          {level.label}
        </span>
      </div>
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {rules.map((rule, i) => (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1 text-[11px] transition-colors",
              passed[i] ? "text-success" : "text-muted-foreground"
            )}
          >
            <Check className={cn("h-3 w-3", !passed[i] && "opacity-30")} />
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
