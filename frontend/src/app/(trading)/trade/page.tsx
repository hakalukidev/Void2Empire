"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocaleStore } from "@/store/locale-store";
import { Coins, LineChart, ArrowUpDown, FlaskConical, ChevronRight } from "lucide-react";

interface Venue {
  href: string;
  labelKey: string;
  descKey: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}

const VENUES: Venue[] = [
  { href: "/trade/spot/BTCUSDT",   labelKey: "nav.spot",    descKey: "trade.launcher.spot_desc",    icon: Coins,          accent: "text-success" },
  { href: "/trade/futures/BTCUSDT", labelKey: "nav.futures", descKey: "trade.launcher.futures_desc", icon: LineChart,      accent: "text-primary" },
  { href: "/trade/binary/BTCUSDT",  labelKey: "nav.binary",  descKey: "trade.launcher.binary_desc",  icon: ArrowUpDown,    accent: "text-warning" },
  { href: "/trade/demo",            labelKey: "nav.demo",    descKey: "trade.launcher.demo_desc",    icon: FlaskConical,   accent: "text-muted-foreground" },
];

export default function TradePage() {
  const { t } = useLocaleStore();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("trade.launcher.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("trade.launcher.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VENUES.map(({ href, labelKey, descKey, icon: Icon, accent }) => (
          <Card key={href} className="flex flex-col gap-3 bg-card border-border p-5">
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/50 border border-border ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold">{t(labelKey)}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">{t(descKey)}</p>
            </div>
            <Link href={href} className="mt-auto">
              <Button size="sm" variant="secondary" className="w-full">
                {t("trade.launcher.launch")}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
