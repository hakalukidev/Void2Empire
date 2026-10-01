"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocaleStore } from "@/store/locale-store";
import {
  submitListingApplication,
  fetchMyListingApplications,
  ListingApplication,
  ListingApplicationStatus,
} from "@/services/listings.service";
import toast from "react-hot-toast";
import { FilePlus2, Info } from "lucide-react";

const STATUS_STYLES: Record<ListingApplicationStatus, string> = {
  submitted: "bg-primary/10 text-primary border-primary/20",
  under_review: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  listed: "bg-success/10 text-success border-success/20",
  needs_info: "bg-warning/10 text-warning border-warning/20",
  rejected: "bg-danger/10 text-danger border-danger/20",
};

export default function ListingApplicationPage() {
  const { t } = useLocaleStore();
  const [coinName, setCoinName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [website, setWebsite] = useState("");
  const [explorer, setExplorer] = useState("");
  const [description, setDescription] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [applications, setApplications] = useState<ListingApplication[]>([]);

  useEffect(() => {
    fetchMyListingApplications().then(setApplications);
  }, []);

  const formValid = coinName.trim().length > 0 && symbol.trim().length > 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || submitting) return;
    if (!coinName.trim()) {
      toast.error(t("listing.name_required"));
      return;
    }
    if (!symbol.trim()) {
      toast.error(t("listing.symbol_required"));
      return;
    }
    setSubmitting(true);
    try {
      const created = await submitListingApplication({
        coinName: coinName.trim(),
        symbol: symbol.trim().toUpperCase(),
        website: website.trim() || undefined,
        explorer: explorer.trim() || undefined,
        description: description.trim(),
        documents,
      });
      setApplications((prev) => [created, ...prev]);
      setCoinName("");
      setSymbol("");
      setWebsite("");
      setExplorer("");
      setDescription("");
      setDocuments([]);
      toast.success(t("listing.submitted"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FilePlus2 className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("listing.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("listing.subtitle")}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{t("listing.rate_note")}</span>
      </div>

      <Card className="bg-card border-border p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("listing.coin_name")}</label>
              <Input value={coinName} onChange={(e) => setCoinName(e.target.value)} className="mt-1" placeholder="Bitcoin" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("listing.symbol")}</label>
              <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="mt-1 font-mono uppercase" placeholder="BTC" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("listing.website")}</label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1" placeholder="https://…" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("listing.explorer")}</label>
              <Input value={explorer} onChange={(e) => setExplorer(e.target.value)} className="mt-1" placeholder="https://…" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("listing.description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 min-h-[100px] rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring resize-y"
              placeholder="…"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">{t("listing.documents")}</label>
            <Input
              type="file"
              multiple
              onChange={(e) => setDocuments(Array.from(e.target.files ?? []))}
              className="mt-1 h-auto py-2 file:mr-3 file:rounded file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm"
            />
            {documents.length > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                {documents.map((d) => d.name).join(", ")}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={!formValid || submitting}>
            {t("listing.submit")}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">{t("listing.your_applications")}</h2>
        {applications.length === 0 ? (
          <Card className="bg-card border-border p-8 text-center text-sm text-muted-foreground">
            {t("listing.none")}
          </Card>
        ) : (
          applications.map((a) => (
            <Card key={a.id} className="bg-card border-border p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">{a.coinName} <span className="font-mono text-xs text-muted-foreground">({a.symbol})</span></p>
                <p className="text-xs text-muted-foreground">{t("listing.date")}: {a.createdAt}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize whitespace-nowrap ${STATUS_STYLES[a.status]}`}>
                {a.status.replace("_", " ")}
              </span>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{t("listing.review_note")}</span>
      </div>
    </div>
  );
}
