import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="relative overflow-hidden rounded-2xl border border-brand-gold-500/25 bg-[var(--brand-night)] px-6 py-16 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.18),transparent_65%)]" />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight">Ready to start trading?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Create your account and get $10,000 in demo funds — virtual funds, no real money.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button variant="gradient" className="h-12 rounded-full px-8 text-base">
                Create free account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
