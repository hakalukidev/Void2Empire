const steps = [
  {
    step: "01",
    title: "Create your account",
    description: "Sign up with your email and phone, then confirm both with the codes we send.",
  },
  {
    step: "02",
    title: "Practice or fund your wallet",
    description:
      "Start with $10,000 in demo funds, or deposit to your live wallet when you're ready.",
  },
  {
    step: "03",
    title: "Start trading",
    description: "Trade futures with leverage, or binary options with a payout shown before you trade.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step}>
              <span className="text-4xl font-bold text-primary/40">{item.step}</span>
              <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
