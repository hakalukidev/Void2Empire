"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { calculatePostFee, createPost, PostType } from "@/services/p2p.service";
import { ArrowLeftRight, Info, Plus, X } from "lucide-react";

const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "Bank Transfer", "DBBL", "Dutch Bangla"];
const PAYMENT_WINDOWS = [15, 30, 60];

export default function CreateP2PPostPage() {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>("sell");
  const [rate, setRate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [paymentWindow, setPaymentWindow] = useState(30);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const max = parseFloat(maxAmount) || 0;
  const fee = calculatePostFee(max);

  const toggleMethod = (m: string) => {
    setSelectedMethods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rate || !minAmount || !maxAmount || selectedMethods.length === 0) return;
    setSubmitting(true);
    try {
      await createPost({
        type: postType, rate: parseFloat(rate), currency: "BDT",
        minAmount: parseFloat(minAmount), maxAmount: parseFloat(maxAmount),
        paymentMethods: selectedMethods, paymentWindowMinutes: paymentWindow, notes,
      });
      router.push("/p2p");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[700px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <ArrowLeftRight className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Create P2P Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Post Type */}
        <Card className="p-5 bg-card border-border space-y-3">
          <h2 className="font-semibold">Post Type</h2>
          <div className="flex gap-2">
            {(["sell", "buy"] as PostType[]).map(t => (
              <button type="button" key={t} onClick={() => setPostType(t)}
                className={`flex-1 py-3 rounded-lg font-bold text-sm border transition-colors capitalize ${
                  postType === t
                    ? t === "sell" ? "bg-success/15 text-success border-success/30" : "bg-danger/15 text-danger border-danger/30"
                    : "bg-secondary border-border text-muted-foreground"
                }`}>
                {t === "sell" ? "Sell USDT" : "Buy USDT"}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground flex gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {postType === "sell" ? "You will sell USDT to buyers in the marketplace." : "You want to buy USDT from sellers."}
          </p>
        </Card>

        {/* Pricing */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h2 className="font-semibold">Pricing & Limits</h2>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Your Rate (BDT per 1 USDT)</label>
            <Input type="number" placeholder="e.g. 120" value={rate} onChange={e => setRate(e.target.value)} className="bg-secondary/30 mt-1.5" required />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Min Amount (USDT)</label>
              <Input type="number" placeholder="e.g. 10" value={minAmount} onChange={e => setMinAmount(e.target.value)} className="bg-secondary/30 mt-1.5" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max Amount (USDT)</label>
              <Input type="number" placeholder="e.g. 500" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="bg-secondary/30 mt-1.5" required />
            </div>
          </div>

          {/* Live fee preview */}
          {max > 0 && (
            <div className={`flex justify-between items-center text-sm p-3 rounded-lg border ${fee > 0 ? "bg-warning/5 border-warning/20" : "bg-secondary/30 border-border"}`}>
              <span className="text-muted-foreground">Post Creation Fee</span>
              <span className={`font-bold ${fee > 0 ? "text-warning" : "text-success"}`}>
                {fee > 0 ? `$${fee.toFixed(2)}` : "FREE"}
              </span>
            </div>
          )}
        </Card>

        {/* Payment Methods */}
        <Card className="p-5 bg-card border-border space-y-3">
          <h2 className="font-semibold">Payment Methods</h2>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map(m => (
              <button type="button" key={m} onClick={() => toggleMethod(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  selectedMethods.includes(m) ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}>
                {selectedMethods.includes(m) && <span className="mr-1">✓</span>}
                {m}
              </button>
            ))}
          </div>
          {selectedMethods.length === 0 && (
            <p className="text-xs text-danger">Select at least one payment method.</p>
          )}
        </Card>

        {/* Payment Window */}
        <Card className="p-5 bg-card border-border space-y-3">
          <h2 className="font-semibold">Buyer Payment Window</h2>
          <div className="flex gap-2">
            {PAYMENT_WINDOWS.map(w => (
              <button type="button" key={w} onClick={() => setPaymentWindow(w)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${paymentWindow === w ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary border-border text-muted-foreground"}`}>
                {w} min
              </button>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-5 bg-card border-border space-y-3">
          <h2 className="font-semibold">Terms / Notes <span className="text-muted-foreground font-normal text-sm">(optional)</span></h2>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Send exact amount. No partial payments."
            className="w-full p-3 bg-secondary/30 border border-border rounded-md text-sm min-h-[80px] resize-y focus:outline-none focus:ring-1 focus:ring-primary" />
        </Card>

        {/* Warning */}
        <div className="flex gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20 text-xs text-warning">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>After creating, you must wait 5 minutes before editing. After deleting a post, you must wait 5 minutes before creating a new one.</p>
        </div>

        <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground font-bold py-3 gap-2">
          <Plus className="w-4 h-4" />
          {submitting ? "Publishing..." : "Publish Post"}
        </Button>
      </form>
    </div>
  );
}
