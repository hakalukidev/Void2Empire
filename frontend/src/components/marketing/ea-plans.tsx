import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Futures Pro EA",
    firstMonth: "300",
    monthly: "99",
    features: ["Crypto futures", "Forex futures", "Commodity futures"],
    monthlyReturn: "17%",
  },
  {
    name: "Binary Signals Elite",
    firstMonth: "199",
    monthly: "99",
    features: ["Forex majors", "Crypto pairs", "Stock indices"],
    monthlyReturn: "9%",
  },
];

export function EaPlans() {
  return (
    <section id="ea-plans" className="border-t border-white/10 bg-[#0b0817] px-4 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          Void<span className="text-fuchsia-400">2</span>Empire EA&apos;s
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-white/60">
          Automated strategies that trade the markets for you, built on the same engine that
          powers your dashboard.
        </p>

        <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl border border-fuchsia-500/30 bg-white/5 p-8 shadow-lg shadow-fuchsia-500/10"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-indigo-500">
                <Crown className="h-6 w-6 text-white" />
              </span>
              <h3 className="mt-4 text-xl font-bold text-fuchsia-300">{plan.name}</h3>

              <p className="mt-4">
                <span className="text-3xl font-extrabold">${plan.firstMonth}</span>{" "}
                <span className="text-sm text-white/50">/ 1st Month</span>
              </p>
              <p className="mt-1">
                <span className="text-2xl font-extrabold">${plan.monthly}</span>{" "}
                <span className="text-sm text-white/50">/ Month</span>
              </p>

              <hr className="mt-6 border-white/10" />

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="h-4 w-4 shrink-0 text-fuchsia-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-sm font-medium text-fuchsia-300">
                Average monthly return: {plan.monthlyReturn}
              </p>

              <hr className="mt-6 border-white/10" />

              <Link href="/register" className="mt-6 block">
                <Button variant="gradient" className="w-full rounded-full">
                  Explore
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
