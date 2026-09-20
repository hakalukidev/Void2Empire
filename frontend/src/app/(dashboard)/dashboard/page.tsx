import { Card } from "@/components/ui/card";
import { DollarSign, Activity, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex items-center p-6 gap-4 border-l-4 border-l-primary">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
            <h2 className="text-2xl font-bold">$0.00</h2>
          </div>
        </Card>
        
        <Card className="flex items-center p-6 gap-4 border-l-4 border-l-success">
          <div className="p-3 bg-success/10 rounded-full text-success">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Recent PnL</p>
            <h2 className="text-2xl font-bold text-success">+$0.00</h2>
          </div>
        </Card>
        
        <Card className="flex items-center p-6 gap-4 border-l-4 border-l-warning">
          <div className="p-3 bg-warning/10 rounded-full text-warning">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Trades</p>
            <h2 className="text-2xl font-bold">0</h2>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 h-[300px] flex flex-col items-center justify-center text-center">
           <h3 className="text-lg font-medium mb-2">Market Activity</h3>
           <p className="text-sm text-muted-foreground">Chart integration pending</p>
        </Card>
        <Card className="p-6 h-[300px] flex flex-col items-center justify-center text-center">
           <h3 className="text-lg font-medium mb-2">Recent Transactions</h3>
           <p className="text-sm text-muted-foreground">No recent transactions</p>
        </Card>
      </div>
    </div>
  );
}
