"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, LineSeries, type UTCTimestamp } from "lightweight-charts";

/** `time` is a UTC seconds value, or an ISO/business-day string. */
export interface ChartPoint {
  time: number | string;
  value: number;
}

interface TradingChartProps {
  data?: ChartPoint[];
  /**
   * Pair label for the series. No price feed is wired up yet, so a chart
   * given only a symbol renders the empty grid until one is.
   */
  symbol?: string;
}

export function TradingChart({ data, symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      width: container.clientWidth,
      height: container.clientHeight,
    });

    chart.timeScale().fitContent();

    const lineSeries = chart.addSeries(LineSeries, {
      color: "#3b82f6",
      lineWidth: 2,
      title: symbol ?? "",
    });

    if (data && data.length > 0) {
      lineSeries.setData(
        data.map((point) =>
          typeof point.time === "number"
            ? { ...point, time: point.time as UTCTimestamp }
            : point
        ) as Parameters<typeof lineSeries.setData>[0]
      );
    }

    // The container resizes with the layout (sidebar, rotation, stacked panels),
    // not only with the window, so observe it directly.
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      chart.applyOptions({ width, height });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [data, symbol]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[280px] sm:min-h-[360px] lg:min-h-[400px]" />;
}
