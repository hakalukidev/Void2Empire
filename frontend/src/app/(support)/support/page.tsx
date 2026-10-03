"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Headphones, LifeBuoy, MessageSquare, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import { useLocaleStore } from "@/store/locale-store";
import { useAuthStore } from "@/store/auth-store";
import { submitSupportTicket } from "@/services/support.service";

// No response time is advertised here: ticket categories and SLA are still open (DR-044),
// and live chat is not part of this build — tickets are the documented channel (REQ-070).
export default function SupportPage() {
  const { t } = useLocaleStore();

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8 min-h-[calc(100vh-4rem)] pt-6 sm:pt-12">
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Headphones className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("support.title")}</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">{t("support.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="p-6 bg-card border-border flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-primary">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg">{t("support.ticket_title")}</h3>
          <p className="text-sm text-muted-foreground">{t("support.ticket_desc")}</p>
          <a href="#support-ticket" className="w-full mt-auto">
            <Button variant="outline" className="w-full">{t("support.ticket_cta")}</Button>
          </a>
        </Card>

        <Card className="p-6 bg-card border-border flex flex-col items-center text-center space-y-4 hover:border-primary/50 transition-colors">
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg">{t("support.faq_title")}</h3>
          <p className="text-sm text-muted-foreground">{t("support.faq_desc")}</p>
          <Link href="/faq" className="w-full mt-auto">
            <Button variant="outline" className="w-full">{t("support.faq_cta")}</Button>
          </Link>
        </Card>
      </div>

      <div id="support-ticket">
        <Suspense fallback={null}>
          <TicketForm />
        </Suspense>
      </div>
    </div>
  );
}

function TicketForm() {
  const { t } = useLocaleStore();
  const user = useAuthStore(s => s.user);
  // Other screens hand off to Support with a subject already in mind (e.g. the P2P
  // Company Direct buy flow), so the query param prefills the field.
  const subjectParam = useSearchParams()?.get("subject") ?? "";
  const [subject, setSubject] = useState(subjectParam);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!subject.trim()) { toast.error(t("support.subject_required")); return; }
    if (!message.trim()) { toast.error(t("support.message_required")); return; }
    setSubmitting(true);
    try {
      await submitSupportTicket({ subject: subject.trim(), message: message.trim() });
      toast.success(t("support.submitted"));
      setSubject("");
      setMessage("");
    } catch {
      toast.error(t("support.submit_failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-8 bg-secondary/20 border-border max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6 text-center">{t("support.form_title")}</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {user && (
          <div className="flex items-center gap-2 text-sm p-3 bg-card border border-border rounded-md">
            <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{t("support.requested_by")}</span>
            <span className="font-medium truncate">{user.fullName} · {user.email}</span>
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="ticket-subject" className="text-sm font-medium text-muted-foreground">{t("support.subject")}</label>
          <Input
            id="ticket-subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder={t("support.subject_ph")}
            className="bg-card"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="ticket-message" className="text-sm font-medium text-muted-foreground">{t("support.message")}</label>
          <textarea
            id="ticket-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full min-h-[150px] p-3 rounded-md bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            placeholder={t("support.message_ph")}
          />
        </div>
        <Button type="submit" className="w-full h-12 font-bold text-base mt-4" disabled={submitting}>
          {submitting ? t("support.submitting") : t("support.submit")}
        </Button>
        <p className="text-xs text-center text-muted-foreground">{t("support.stub_note")}</p>
      </form>
    </Card>
  );
}
