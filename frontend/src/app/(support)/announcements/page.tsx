"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useLocaleStore } from "@/store/locale-store";
import { fetchAnnouncements, Announcement, AnnouncementType } from "@/services/content.service";
import { Megaphone, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

const TYPE_STYLES: Record<AnnouncementType, { badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  info:    { badge: "bg-primary/10 text-primary border-primary/20",   icon: Info },
  warning: { badge: "bg-warning/10 text-warning border-warning/20",   icon: AlertTriangle },
  success: { badge: "bg-success/10 text-success border-success/20",   icon: CheckCircle2 },
};

export default function AnnouncementsPage() {
  const { t } = useLocaleStore();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 min-h-[calc(100vh-4rem)] pt-6 sm:pt-12">
      <div className="flex items-center gap-3">
        <Megaphone className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("announcements.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("announcements.subtitle")}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">…</p>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center text-muted-foreground">
          {t("announcements.empty")}
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((a) => {
            const { badge, icon: Icon } = TYPE_STYLES[a.type] ?? TYPE_STYLES.info;
            return (
              <Card key={a.id} className="bg-card border-border p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${badge}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <h2 className="font-semibold">{a.title}</h2>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">{a.publishedAt}</time>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
