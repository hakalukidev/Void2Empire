import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground">
        <h2 className="text-3xl font-bold tracking-tight">Ready to start trading?</h2>
        <p className="mx-auto mt-3 max-w-xl opacity-90">
          Create your account in a minute and get $10,000 in demo funds instantly.
        </p>
        <div className="mt-8">
          <Link href="/register">
            <Button variant="secondary" className="h-12 px-8 text-base">
              Create free account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
