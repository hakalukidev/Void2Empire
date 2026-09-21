"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Search, MessageSquare, Send } from "lucide-react";

type TicketStatus = "open" | "in_progress" | "resolved";

const MOCK_TICKETS = [
  { id: "T-101", user: "Rafiq Ahmed", category: "Deposit Issue", status: "open" as TicketStatus, date: "2024-09-21 10:00", messages: [{ sender: "user", text: "My USDT deposit hasn't arrived yet." }] },
  { id: "T-102", user: "Sadia Islam", category: "KYC Verification", status: "in_progress" as TicketStatus, date: "2024-09-20 15:30", messages: [{ sender: "user", text: "Please review my ID." }, { sender: "admin", text: "We need a clearer photo." }] },
  { id: "T-103", user: "Karim Hossain", category: "General Support", status: "resolved" as TicketStatus, date: "2024-09-19 09:15", messages: [{ sender: "user", text: "How do I use futures?" }, { sender: "admin", text: "Check our FAQ section." }] },
];

const STATUS_STYLE: Record<TicketStatus, string> = {
  open: "bg-warning/10 text-warning border-warning/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  resolved: "bg-success/10 text-success border-success/20",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [activeTicket, setActiveTicket] = useState(MOCK_TICKETS[0]);
  const [replyText, setReplyText] = useState("");

  const handleReply = () => {
    if (!replyText.trim()) return;
    const updated = { ...activeTicket, messages: [...activeTicket.messages, { sender: "admin", text: replyText }] };
    setActiveTicket(updated);
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setReplyText("");
  };

  const markResolved = () => {
    const updated = { ...activeTicket, status: "resolved" as TicketStatus };
    setActiveTicket(updated);
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center gap-3 shrink-0">
        <Ticket className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Ticket List */}
        <Card className="lg:col-span-1 bg-card border-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input placeholder="Search tickets..." className="w-full pl-9 pr-3 py-2 bg-secondary/30 rounded-md border border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {tickets.map(t => (
              <button key={t.id} onClick={() => setActiveTicket(t)}
                className={`w-full text-left p-3 rounded-lg transition-colors border ${activeTicket.id === t.id ? "bg-secondary/50 border-border" : "border-transparent hover:bg-secondary/20"}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">{t.user}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider border ${STATUS_STYLE[t.status]}`}>{t.status.replace("_", " ")}</span>
                </div>
                <div className="text-xs text-foreground font-medium mb-1">{t.category}</div>
                <div className="text-xs text-muted-foreground truncate">{t.messages[t.messages.length - 1].text}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Ticket Thread */}
        <Card className="lg:col-span-2 bg-card border-border flex flex-col overflow-hidden">
          {activeTicket ? (
            <>
              <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
                <div>
                  <h2 className="font-bold text-lg">{activeTicket.category} <span className="text-muted-foreground text-sm font-mono ml-2">#{activeTicket.id}</span></h2>
                  <p className="text-sm text-muted-foreground">User: {activeTicket.user}</p>
                </div>
                {activeTicket.status !== "resolved" && (
                  <Button variant="outline" size="sm" className="h-8 text-xs text-success border-success/30 hover:bg-success/10" onClick={markResolved}>
                    Mark Resolved
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/10">
                {activeTicket.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 text-sm ${m.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-border shrink-0 bg-card">
                <div className="flex gap-2">
                  <textarea 
                    value={replyText} onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..." 
                    className="flex-1 h-10 min-h-[40px] max-h-[120px] p-2 bg-secondary/30 rounded-md border border-border text-sm resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button onClick={handleReply} className="h-10 px-4 bg-primary text-primary-foreground gap-2 shrink-0">
                    <Send className="w-4 h-4" /> Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
              <p>Select a ticket to view thread</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
