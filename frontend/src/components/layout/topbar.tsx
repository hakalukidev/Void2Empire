import { Logo } from "@/components/ui/logo";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <Logo size={24} />
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Demo: $10,000.00</span>
        <span>Live: $0.00</span>
      </div>
    </header>
  );
}
