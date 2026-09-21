import Link from "next/link";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketsTopbar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-[#050b06] px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70">
          <User className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Trader</p>
          <p className="text-xs text-white/40">@your_handle</p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
          <div>
            <p className="text-xs text-white/40">Demo</p>
            <p className="text-sm font-semibold text-white">$10,000.00</p>
          </div>
          <span className="flex items-center gap-0.5 text-xs font-semibold text-lime-400">
            <ArrowUp /> 20%
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
          <div>
            <p className="text-xs text-white/40">Live</p>
            <p className="text-sm font-semibold text-white">$0.00</p>
          </div>
          <span className="flex items-center gap-0.5 text-xs font-semibold text-rose-400">
            <ArrowDown /> 5%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Search"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white"
        >
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-lime-400" />
        </button>
        <Link href="/wallet/deposit">
          <Button className="rounded-full bg-lime-400 px-6 font-semibold text-black hover:opacity-90">
            Deposit
          </Button>
        </Link>
      </div>
    </header>
  );
}

function ArrowUp() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1 9L9 1M9 1H3M9 1V7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1 1L9 9M9 9H3M9 9V3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
