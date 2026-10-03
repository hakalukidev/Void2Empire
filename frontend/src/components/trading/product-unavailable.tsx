import Link from "next/link";
import { Ban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { findMarket, type TradingProduct } from "@/config/markets";
import { useLocaleStore } from "@/store/locale-store";

// One message for every route that opens a market the catalog refuses. Which
// product each coin belongs to is a client decision (v20 Step 7/8/9), not
// something a page may guess: the brand coins are Spot and Futures only, the
// Funding asset is traded nowhere, and the five "Binance Trading" coins have no
// rails at all yet. The caller checks `supportsProduct` and returns this instead
// of the trade screen.
export function ProductUnavailable({
  product,
  symbol,
  pair,
}: {
  product: TradingProduct;
  symbol: string;
  pair: string;
}) {
  const { t } = useLocaleStore();
  const alternatives = (findMarket(symbol)?.products ?? []).filter((p) => p !== product);
  // Funding is a product with its own screen, not a trading route.
  const hrefFor = (target: TradingProduct) =>
    target === "funding" ? "/funding" : `/trade/${target}/${symbol}`;

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md border-border bg-card p-6 text-center">
        <Ban className="mx-auto h-8 w-8 text-muted-foreground" />
        <h1 className="mt-3 text-lg font-bold">
          {pair} <span className="text-muted-foreground">· {t(`nav.${product}`)}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("trade.not_listed")}</p>

        {alternatives.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("trade.available_in")}
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {alternatives.map((alternative) => (
                <Link
                  key={alternative}
                  href={hrefFor(alternative)}
                  className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm font-semibold hover:bg-secondary/70"
                >
                  {t(`nav.${alternative}`)}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">{t("trade.no_rails")}</p>
        )}

        <Link
          href="/markets"
          className="mt-5 inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {t("home.view_all_markets")}
        </Link>
      </Card>
    </div>
  );
}
