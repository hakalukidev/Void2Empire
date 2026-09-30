import { useId } from "react";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
  tagline?: string;
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-accent`} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--brand-blue-300)" />
          <stop offset="0.55" stopColor="var(--brand-blue-500)" />
          <stop offset="1" stopColor="var(--brand-blue-600)" />
        </linearGradient>
        {/* Slicing the V's right arm into three prongs is what makes it read as an E. */}
        <mask id={`${id}-notch`}>
          <rect width="48" height="48" fill="white" />
          <rect x="24" y="13" width="24" height="4.5" fill="black" />
          <rect x="24" y="23" width="24" height="4.5" fill="black" />
        </mask>
      </defs>
      <path
        d="M4 6 H13 L24 31 L35 6 H44 L28 42 H20 Z"
        fill={`url(#${id}-accent)`}
        mask={`url(#${id}-notch)`}
      />
    </svg>
  );
}

export function Logo({ className, iconOnly = false, size = 32, tagline }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {!iconOnly && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight">
            Void
            <span className="bg-linear-to-r from-brand-blue-300 to-brand-blue-500 bg-clip-text text-transparent">
              2Empire
            </span>
          </span>
          {tagline && (
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
