import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, History } from "lucide-react";
import Link from "next/link";

export default function WalletPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
        <div className="flex gap-2">
          <Link href="/wallet/deposit">
             <Button variant="primary" className="gap-2"><ArrowDownToLine className="w-4 h-4"/> Deposit</Button>
          </Link>
          <Link href="/wallet/withdraw">
             <Button variant="secondary" className="gap-2"><ArrowUpFromLine className="w-4 h-4"/> Withdraw</Button>
          </Link>
        </div>
      </div>
      
      <Card className="p-8 flex flex-col items-center text-center max-w-md mx-auto mt-8 bg-card border-border">
         <p className="text-sm font-medium text-muted-foreground mb-2">Available Balance</p>
         <h2 className="text-5xl font-bold tracking-tighter mb-6">$0.00</h2>
         <div className="flex w-full justify-center gap-4 border-t border-border pt-6 mt-2">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Deposited</p>
              <p className="font-semibold">$0.00</p>
            </div>
            <div className="w-px bg-border"></div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Withdrawn</p>
              <p className="font-semibold">$0.00</p>
            </div>
         </div>
      </Card>

      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Transaction History</h2>
        </div>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Amount</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  No transactions found.
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
