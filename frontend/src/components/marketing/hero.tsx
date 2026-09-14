import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeroGlobeLazy } from "@/components/marketing/hero-globe-lazy";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b0817] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.25),transparent_60%)]" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
        <div className="relative z-10 text-center md:text-left">
          <span className="text-sm font-medium text-white/50">
            Futures &amp; Binary Options, in one platform
          </span>
          <h1 className="mt-4 text-4xl font-extrabold uppercase leading-tight tracking-tight md:text-6xl">
            Trade the markets
            <br />
            <span className="bg-linear-to-r from-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Your way
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60 md:mx-0">
            Real-time charts, leveraged futures, and fixed-payout binary options across forex,
            crypto, stocks, and commodities. Practice risk-free with a $10,000 demo account before
            you trade live.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
            <Link href="/register">
              <Button variant="gradient" className="h-12 rounded-full px-8 text-base">
                Explore
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
        </div>

        <div className="relative z-10 flex justify-center">
          <HeroGlobeLazy />
        </div>
      </div>
    </section>
  );
}
