import { markets } from "@/config/markets";
import { Card } from "@/components/ui/card";

const categoryLabels: Record<string, string> = {
  crypto: "Crypto",
  forex: "Forex",
  stocks: "Stocks",
  commodities: "Commodities",
};

export function MarketsShowcase() {
  return (
    <section id="markets" className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Markets to trade</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Forex, crypto, stocks, and commodities — all from the same dashboard.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map((asset) => (
          <Card key={asset.symbol} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{asset.symbol}</p>
              <p className="text-sm text-muted-foreground">{asset.name}</p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {categoryLabels[asset.category]}
            </span>
          </Card>
        ))}
      </div>
    </section>
  );
}
