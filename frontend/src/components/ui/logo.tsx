import { cn } from "@/lib/utils/cn";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number;
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
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
        <linearGradient id="void2empire-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#void2empire-gradient)" />
      <circle cx="35.5" cy="10.5" r="4" stroke="white" strokeOpacity="0.9" strokeWidth="2" />
      <rect x="9" y="28" width="6" height="10" rx="1.5" fill="white" fillOpacity="0.75" />
      <rect x="21" y="20" width="6" height="18" rx="1.5" fill="white" fillOpacity="0.9" />
      <rect x="33" y="14" width="6" height="24" rx="1.5" fill="white" />
    </svg>
  );
}

export function Logo({ className, iconOnly = false, size = 32 }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {!iconOnly && (
        <span className="text-lg font-bold tracking-tight">
          Void<span className="text-primary">2</span>Empire
        </span>
      )}
    </span>
  );
}
