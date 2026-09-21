import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EaPromoCard() {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-fuchsia-500/20 bg-linear-to-br from-[#180b28] to-[#050b06] p-6">
      <div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-indigo-500">
          <Sparkles className="h-5 w-5 text-white" />
        </span>
        <h3 className="mt-4 text-lg font-semibold text-white">
          Trade more with Void2Empire EA&apos;s
        </h3>
        <p className="mt-2 text-sm text-white/50">
          Automated strategies across futures and binary options, built on the same engine.
        </p>
      </div>
      <Link href="/#ea-plans" className="mt-6">
        <Button variant="gradient" className="w-full rounded-full">
          Explore plans
        </Button>
      </Link>
    </div>
  );
}
