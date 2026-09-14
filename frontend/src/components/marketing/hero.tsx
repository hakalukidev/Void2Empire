import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
      <span className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
        Futures &amp; Binary Options, in one platform
      </span>
      <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
        Trade the markets you know, your way
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
        Real-time charts, leveraged futures, and fixed-payout binary options across forex,
        crypto, stocks, and commodities. Practice risk-free with a $10,000 demo account before
        you trade live.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/register">
          <Button className="h-12 px-8 text-base">Create free account</Button>
        </Link>
        <Link href="/trade/demo">
          <Button variant="secondary" className="h-12 px-8 text-base">
            Try the demo
          </Button>
        </Link>
      </div>
    </section>
  );
}
