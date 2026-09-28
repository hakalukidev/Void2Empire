import { ArrowUpDown, Clock3, LineChart, ShieldCheck, Timer, Wallet } from "lucide-react";

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
      "Predict UP or DOWN over an expiry you choose, with the potential payout shown before you trade.",
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
    title: "Support tickets",
    description: "Open a ticket for trading, wallet, or account issues and follow it to resolution.",
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

      <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-gold-500/40 bg-brand-gold-500/10 text-primary">
              <feature.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
