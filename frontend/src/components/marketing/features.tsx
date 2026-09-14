import { ArrowUpDown, Clock3, LineChart, ShieldCheck, Timer, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: LineChart,
    title: "Futures trading",
    description:
      "Long or short with configurable leverage and margin, live PnL, and full order and position history.",
  },
  {
    icon: Timer,
    title: "Binary options",
    description:
      "Predict up or down with expiries from 1 minute to 24 hours and a transparent, fixed payout.",
  },
  {
    icon: ArrowUpDown,
    title: "$10,000 demo account",
    description:
      "Practice both futures and binary trading with virtual funds before risking real money.",
  },
  {
    icon: Wallet,
    title: "Wallet & transactions",
    description:
      "Deposit, withdraw, and track every transaction with a clear status and an auditable history.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "Hashed passwords, session-based authentication, and account activity logging on every account.",
  },
  {
    icon: Clock3,
    title: "24/7 support",
    description: "A dedicated support channel for urgent trading, wallet, or account issues.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Everything you need to trade</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          One account, two ways to trade, and the tools to manage both.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <feature.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
