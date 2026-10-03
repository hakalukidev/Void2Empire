"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  calculatePostFee,
  createPost,
  isPaymentWindowValid,
  PAYMENT_TIMER_MAX_MINUTES,
  PAYMENT_TIMER_MIN_MINUTES,
  POST_FEE_FREE_BELOW,
  POST_FEE_PERCENT,
  PostType,
} from "@/services/p2p.service";
import { formatDecimalString, isPositiveDecimal } from "@/lib/utils/decimal";
import { useLocaleStore } from "@/store/locale-store";
import { ArrowLeftRight, Info, Plus } from "lucide-react";

const PAYMENT_METHODS = ["bKash", "Nagad", "Rocket", "Bank Transfer", "DBBL", "Dutch Bangla"];
// Presets inside the confirmed 5–20 minute window (v20 Q33); any whole minute value in
// that window is accepted, so the window is also editable.
const PAYMENT_WINDOW_PRESETS = ["5", "10", "15", "20"];

export default function CreateP2PPostPage() {
  const { t } = useLocaleStore();
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>("sell");
  const [rate, setRate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [paymentWindow, setPaymentWindow] = useState("15");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amountsValid = isPositiveDecimal(rate) && isPositiveDecimal(minAmount) && isPositiveDecimal(maxAmount);
  const windowMinutes = Number(paymentWindow);
  const windowValid = isPaymentWindowValid(windowMinutes);
  const canSubmit = amountsValid && windowValid && selectedMethods.length > 0;
  const fee = calculatePostFee(maxAmount);

  const toggleMethod = (m: string) => {
    setSelectedMethods(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createPost({
        type: postType, rate, currency: "BDT",
        minAmount, maxAmount,
        paymentMethods: selectedMethods, paymentWindowMinutes: windowMinutes, notes,
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
        <h1 className="text-2xl font-bold tracking-tight">{t("p2p.create_title")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Post Type */}
        <Card className="p-5 bg-card border-border space-y-3">
          <h2 className="font-semibold">{t("p2p.post_type")}</h2>
          <div className="flex gap-2">
            {(["sell", "buy"] as PostType[]).map(pt => (
              <button type="button" key={pt} onClick={() => setPostType(pt)}
                className={`flex-1 py-3 rounded-lg font-bold text-sm border transition-colors ${
                  postType === pt
                    ? pt === "sell" ? "bg-success/15 text-success border-success/30" : "bg-danger/15 text-danger border-danger/30"
                    : "bg-secondary border-border text-muted-foreground"
                }`}>
                {pt === "sell" ? t("p2p.tab_sell") : t("p2p.tab_buy")}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground flex gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {postType === "sell" ? t("p2p.post_type_sell_hint") : t("p2p.post_type_buy_hint")}
          </p>
        </Card>

        {/* Pricing */}
        <Card className="p-5 bg-card border-border space-y-4">
          <h2 className="font-semibold">{t("p2p.pricing_limits")}</h2>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("p2p.your_rate")}</label>
            <Input type="number" inputMode="decimal" step="any" placeholder={t("p2p.rate_ph")} value={rate} onChange={e => setRate(e.target.value)} className="bg-secondary/30 mt-1.5" required />
            <p className="text-xs text-muted-foreground mt-1.5">{t("p2p.rate_note")}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("p2p.min_amount")}</label>
              <Input type="number" inputMode="decimal" step="any" placeholder={t("p2p.min_amount_ph")} value={minAmount} onChange={e => setMinAmount(e.target.value)} className="bg-secondary/30 mt-1.5" required />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("p2p.max_amount")}</label>
              <Input type="number" inputMode="decimal" step="any" placeholder={t("p2p.max_amount_ph")} value={maxAmount} onChange={e => setMaxAmount(e.target.value)} className="bg-secondary/30 mt-1.5" required />
            </div>
          </div>

          {/* Live fee preview */}
          {isPositiveDecimal(maxAmount) && (
            <div className={`flex justify-between items-center text-sm p-3 rounded-lg border ${fee !== "0" ? "bg-warning/5 border-warning/20" : "bg-secondary/30 border-border"}`}>
              <span className="text-muted-foreground">{t("p2p.post_fee")}</span>
              <span className={`font-mono font-bold ${fee !== "0" ? "text-warning" : "text-success"}`}>
                {fee !== "0" ? `$${fee}` : t("p2p.free")}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {t("p2p.post_fee_note_1")}{POST_FEE_PERCENT}%{t("p2p.post_fee_note_2")}${formatDecimalString(POST_FEE_FREE_BELOW, 0)}{t("p2p.post_fee_note_3")}
          </p>
        </Card>

        {/* Payment Methods */}
        <Card className="p-5 bg-card border-border space-y-3">
          <h2 className="font-semibold">{t("p2p.payment_methods")}</h2>
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
            <p className="text-xs text-danger">{t("p2p.select_method_required")}</p>
          )}
        </Card>

        {/* Payment Window */}
        <Card className="p-5 bg-card border-border space-y-3">
          <h2 className="font-semibold">{t("p2p.payment_window")}</h2>
          <div className="flex gap-2">
            {PAYMENT_WINDOW_PRESETS.map(w => (
              <button type="button" key={w} onClick={() => setPaymentWindow(w)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${paymentWindow === w ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary border-border text-muted-foreground"}`}>
                {w} {t("p2p.min_short")}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-muted-foreground">{t("p2p.custom")}</label>
            <Input
              type="number"
              min={PAYMENT_TIMER_MIN_MINUTES}
              max={PAYMENT_TIMER_MAX_MINUTES}
              step="1"
              value={paymentWindow}
              onChange={e => setPaymentWindow(e.target.value)}
              className="bg-secondary/30 max-w-[120px]"
            />
            <span className="text-xs text-muted-foreground">{t("p2p.minutes")}</span>
          </div>
          {!windowValid && (
            <p className="text-xs text-destructive">
              {t("p2p.window_invalid_before")} {PAYMENT_TIMER_MIN_MINUTES} {t("p2p.window_invalid_mid")} {PAYMENT_TIMER_MAX_MINUTES} {t("p2p.window_invalid_after")}
            </p>
          )}
        </Card>

        {/* Notes */}
        <Card className="p-5 bg-card border-border space-y-3">
          <h2 className="font-semibold">{t("p2p.terms_notes")} <span className="text-muted-foreground font-normal text-sm">{t("p2p.optional")}</span></h2>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder={t("p2p.notes_ph")}
            className="w-full p-3 bg-secondary/30 border border-border rounded-md text-sm min-h-[80px] resize-y focus:outline-none focus:ring-1 focus:ring-primary" />
        </Card>

        {/* Warning */}
        <div className="flex gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20 text-xs text-warning">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{t("p2p.edit_cooldown_note")}</p>
        </div>

        <Button type="submit" disabled={submitting || !canSubmit} className="w-full bg-primary text-primary-foreground font-bold py-3 gap-2">
          <Plus className="w-4 h-4" />
          {submitting ? t("p2p.publishing") : t("p2p.publish")}
        </Button>
      </form>
    </div>
  );
}
