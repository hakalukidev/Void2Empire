/**
 * Pair strings arrive in three shapes across the app — `/trade/futures/BTCUSDT`
 * from the markets list, `BTC-USDT` from the demo tabs and `BTC/USDT` from the
 * catalog — and each page used to strip only one of them. That left the routing
 * key (`BTCUSDT`) and the display label (`BTC/USDT`) disagreeing, so a service
 * lookup built from the display form missed every real link.
 */

const QUOTE_SUFFIXES = ["USDT", "USD"];

export interface PairParts {
  /** Storage/routing key, e.g. `BTCUSDT`. Matches `config/markets.ts` symbols. */
  symbol: string;
  /** Human label, e.g. `BTC/USDT`. */
  display: string;
  base: string;
  quote: string;
}

export function parsePair(raw: string): PairParts {
  const upper = raw.trim().toUpperCase();
  const split = upper.includes("/") ? "/" : upper.includes("-") ? "-" : null;

  let base = upper;
  let quote = "";
  if (split) {
    const [head, tail] = upper.split(split);
    base = head ?? "";
    quote = tail ?? "";
  } else {
    const suffix = QUOTE_SUFFIXES.find((q) => upper.endsWith(q) && upper.length > q.length);
    if (suffix) {
      base = upper.slice(0, -suffix.length);
      quote = suffix;
    }
  }

  return {
    symbol: `${base}${quote}`,
    display: quote ? `${base}/${quote}` : base,
    base,
    quote,
  };
}
