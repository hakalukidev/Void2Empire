"use client";

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const authInputClass =
  "auth-input h-11 w-full rounded-lg border border-input bg-background/60 text-sm text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 hover:border-muted-foreground/40 focus:border-primary focus:ring-4 focus:ring-primary/15";

export function AuthHeader({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  // Rendered right of the label, e.g. a "Forgot password?" link.
  aside?: ReactNode;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, aside, children }: FieldProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-foreground/90">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

interface IconInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  // Replaces the icon slot, e.g. a country flag.
  leading?: ReactNode;
  trailing?: ReactNode;
  invalid?: boolean;
}

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(
  ({ icon: Icon, leading, trailing, invalid, className, id, ...props }, ref) => {
    const hasLeading = !!(Icon || leading);
    return (
      <div className="group relative">
        {hasLeading && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted-foreground transition-colors group-focus-within:text-primary">
            {leading ?? (Icon && <Icon className="h-4 w-4" />)}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${id}-error` : undefined}
          className={cn(
            authInputClass,
            hasLeading ? "pl-10" : "pl-3.5",
            trailing ? "pr-11" : "pr-3.5",
            invalid && "border-destructive focus:border-destructive focus:ring-destructive/15",
            className
          )}
          {...props}
        />
        {trailing && <span className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</span>}
      </div>
    );
  }
);
IconInput.displayName = "IconInput";

type PasswordInputProps = Omit<IconInputProps, "type" | "trailing">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <IconInput
      ref={ref}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
});
PasswordInput.displayName = "PasswordInput";

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-linear-to-r from-[var(--cta-from)] to-[var(--cta-to)] text-sm font-semibold text-[var(--cta-fg)] shadow-lg shadow-brand-blue-500/25 transition-[opacity,transform,box-shadow] hover:shadow-brand-blue-500/40 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
    >
      {pending && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
