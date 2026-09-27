import Link from "next/link";
import { ArrowRight, ArrowUpDown, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroGlobeLazy } from "@/components/marketing/hero-globe-lazy";

const assurances = [
  {
    icon: ShieldCheck,
    title: "Verified accounts",
    description: "Email and phone confirmation",
  },
  {
    icon: ArrowUpDown,
    title: "Two ways to trade",
    description: "Futures and binary options",
  },
  {
    icon: Wallet,
    title: "$10,000 demo",
    description: "Virtual funds, no real money",
  },
];

export function Hero() {
  return (
    <section className="night relative overflow-hidden bg-[var(--brand-night)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.18),transparent_60%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
        <div className="relative z-10 text-center md:text-left">
          <span className="text-sm font-medium uppercase tracking-[0.3em] text-brand-gold-400/80">
            Trade · Grow · Rule
          </span>
          <h1 className="mt-5 text-4xl font-extrabold uppercase leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            <span className="block bg-linear-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Trade the markets
            </span>
            <span className="block bg-linear-to-r from-brand-gold-300 via-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent">
              your way
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60 md:mx-0">
            Chart-based spot, futures and binary trading. Practise on a $10,000 demo account —
            virtual funds, no real money — before you trade live.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
            <Link href="/register">
              <Button variant="gradient" className="h-12 rounded-full px-8 text-base">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/trade/demo">
              <Button
                variant="ghost"
                className="h-12 rounded-full border border-white/20 px-8 text-base text-white hover:bg-white/10"
              >
                Try the demo
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
            {assurances.map((item) => (
              <div key={item.title} className="flex items-start gap-3 md:justify-start">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold-500/40 bg-brand-gold-500/10 text-brand-gold-400">
                  <item.icon className="h-4 w-4" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-white/45">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex justify-center">
          <HeroGlobeLazy />
        </div>
      </div>
    </section>
  );
}
