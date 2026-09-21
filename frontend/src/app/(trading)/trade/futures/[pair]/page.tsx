"use client";

import { use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TradingChart } from "@/components/ui/trading-chart";

const mockChartData = [
  { time: "2024-01-01", value: 45000 },
  { time: "2024-01-02", value: 46000 },
  { time: "2024-01-03", value: 45500 },
  { time: "2024-01-04", value: 47000 },
  { time: "2024-01-05", value: 48000 },
];

interface PageProps {
  params: Promise<{ pair: string }>;
}

export default function TradeFuturesPairPage({ params }: PageProps) {
  // Use React.use() to unwrap the promise in client components
  const { pair } = use(params);

  return (
    <div className="flex flex-col lg:flex-row h-screen pt-16 bg-background">
      {/* Left Column: Pairs / Orderbook Placeholder */}
      <div className="w-full lg:w-[300px] border-r border-border p-4 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-lg font-bold">Orderbook</h2>
        <div className="flex-1 rounded-md bg-secondary/20 border border-border flex items-center justify-center text-muted-foreground text-sm">
           Orderbook Data
        </div>
      </div>

      {/* Center Column: Chart */}
      <div className="flex-1 flex flex-col border-r border-border">
        <div className="p-4 border-b border-border flex justify-between items-center bg-card">
           <div>
             <h1 className="text-2xl font-bold tracking-tight uppercase">{pair.replace('-', '/')}</h1>
             <p className="text-sm text-success font-medium">+2.45% (24h)</p>
           </div>
           <div className="text-right">
             <p className="text-sm text-muted-foreground">Mark Price</p>
             <p className="font-bold text-lg">48,000.00</p>
           </div>
        </div>
        <div className="flex-1 p-4">
           <TradingChart data={mockChartData} />
        </div>
      </div>

      {/* Right Column: Order Form */}
      <div className="w-full lg:w-[350px] p-4 bg-card flex flex-col gap-6 overflow-y-auto">
        <h2 className="text-lg font-bold">Place Order</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Order Type</label>
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1">Market</Button>
              <Button variant="ghost" className="flex-1 border border-border">Limit</Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Leverage</label>
            <Input type="range" min="1" max="100" defaultValue="10" className="w-full" />
            <div className="text-right text-xs text-muted-foreground mt-1">10x</div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Size (USDT)</label>
            <Input type="number" placeholder="0.00" />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
             <Button className="bg-success text-white hover:bg-success/90">Long</Button>
             <Button className="bg-destructive text-white hover:bg-destructive/90">Short</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
