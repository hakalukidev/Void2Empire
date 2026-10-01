"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  createChart,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import { ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";
import { SampleBadge } from "@/components/home/sample-badge";
import {
  SAMPLE_MARKET_SYMBOL,
  buildCandles,
  chartIntervals,
  formatPrice,
  formatVolume,
  movingAverage,
  sampleMarkets,
  type ChartInterval,
} from "@/config/sample-market-data";
import { useLocaleStore } from "@/store/locale-store";

const maPeriods = [7, 25, 99];

// Amber, blue and grey stay distinct from each other and from the card in both
// themes; a pale blue third line disappears on the white card in light mode.
const maColorVars = ["var(--warning)", "var(--brand-blue-400)", "var(--muted-foreground)"];

function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const num = Number.parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function MarketPanel() {
  const { t } = useLocaleStore();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [symbol, setSymbol] = useState(SAMPLE_MARKET_SYMBOL);
  const [interval, setInterval] = useState<ChartInterval>("1h");

  const market = sampleMarkets.find((row) => row.symbol === symbol) ?? sampleMarkets[0];
  const candles = useMemo(() => buildCandles(market, interval), [market, interval]);

  const series = useMemo(
    () => maPeriods.map((period) => ({ period, data: movingAverage(candles, period) })),
    [candles]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Read the active theme's tokens so the grid and wicks stay legible on the
    // card in both dark and light.
    const styles = getComputedStyle(container);
    const token = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    const gridColor = token("--border", "#1c2637");
    const textColor = token("--muted-foreground", "#94a3b8");
    const upColor = token("--success", "#0ecb81");
    const downColor = token("--danger", "#fb5c72");

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: withAlpha(gridColor, 0.5) },
        horzLines: { color: withAlpha(gridColor, 0.5) },
      },
      rightPriceScale: { borderColor: gridColor },
      timeScale: { borderColor: gridColor, timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: textColor }, horzLine: { color: textColor } },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor,
      downColor,
      wickUpColor: upColor,
      wickDownColor: downColor,
      borderVisible: false,
      // The header already states the price and its 24h direction; the series'
      // own last-price line and tag are coloured by the final candle, so they can
      // read red next to a green +1.80% change.
      priceLineVisible: false,
      lastValueVisible: false,
    });
    candleSeries.setData(
      candles.map((candle) => ({
        time: candle.time as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })) as CandlestickData[]
    );

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false,
    });
    // The volume scale shares the right edge with the price scale, so its own
    // axis labels would collide with the price ticks.
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 }, visible: false });
    volumeSeries.setData(
      candles.map((candle) => ({
        time: candle.time as UTCTimestamp,
        value: candle.volume,
        color:
          candle.close >= candle.open ? withAlpha(upColor, 0.35) : withAlpha(downColor, 0.35),
      })) as HistogramData[]
    );

    const maColors = [
      token("--warning", "#f5a524"),
      token("--brand-blue-400", "#78a5ff"),
      token("--muted-foreground", "#94a3b8"),
    ];
    series.forEach((entry, index) => {
      const line = chart.addSeries(LineSeries, {
        color: maColors[index],
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      line.setData(entry.data as LineData[]);
    });

    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [candles, series, resolvedTheme]);

  const up = market.changePercent24h >= 0;

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="relative">
          <select
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
            aria-label={t("home.chart_pair_label")}
            className="appearance-none rounded-lg bg-transparent pr-7 text-lg font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {sampleMarkets.map((row) => (
              <option key={row.symbol} value={row.symbol}>
                {row.pair}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>

        <p
          className={`font-mono text-lg font-bold tabular-nums ${up ? "text-success" : "text-danger"}`}
        >
          {formatPrice(market.price, market.precision)}
        </p>
        <p
          className={`rounded px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums ${
            up ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
          }`}
        >
          {up ? "+" : ""}
          {market.changePercent24h.toFixed(2)}%
        </p>

        <SampleBadge className="ml-auto" />

        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
          {[
            { label: t("home.chart_high"), value: formatPrice(market.high24h, market.precision) },
            { label: t("home.chart_low"), value: formatPrice(market.low24h, market.precision) },
            { label: t("home.chart_vol"), value: formatVolume(market.volume24h) },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="text-muted-foreground">{stat.label}</dt>
              <dd className="mt-0.5 font-mono font-semibold tabular-nums">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label={t("home.chart_interval_label")}
          className="flex items-center gap-1 rounded-lg border border-border bg-secondary p-1"
        >
          {chartIntervals.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setInterval(option)}
              aria-pressed={interval === option}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                interval === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium">
          {series.map((entry, index) => (
            <li key={entry.period} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="h-0.5 w-4 rounded-full"
                style={{ backgroundColor: maColorVars[index] }}
              />
              <span className="text-muted-foreground">MA {entry.period}</span>
              <span className="font-mono tabular-nums">
                {entry.data.length > 0
                  ? formatPrice(entry.data[entry.data.length - 1].value, market.precision)
                  : "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div ref={containerRef} className="mt-3 h-[340px] w-full" />
    </section>
  );
}
