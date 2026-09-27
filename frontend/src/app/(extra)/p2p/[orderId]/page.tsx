"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/p2p/countdown-timer";
import { OrderStatusStepper } from "@/components/p2p/order-status-stepper";
import { AgentBadgeDisplay } from "@/components/p2p/agent-badge";
import { getOrder, markAsPaid, releaseUsdt, raiseDispute, cancelOrder, P2POrder } from "@/services/p2p.service";
import { AlertTriangle, CheckCircle, MessageSquare, Send, ShieldAlert, X } from "lucide-react";

// MOCK: current logged-in user id
const CURRENT_USER_ID = "u1";

interface ChatMessage {
  sender: "buyer" | "seller" | "system";
  text: string;
  time: string;
}

export default function OrderRoomPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<P2POrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "system", text: "Order created. Please complete payment within the time limit.", time: new Date().toLocaleTimeString() },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getOrder(orderId).then(data => { setOrder(data); setLoading(false); });
  }, [orderId]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading order room...</div>;
  if (!order) return <div className="p-8 text-center text-danger">Order not found.</div>;

  const isBuyer = order.buyerId === CURRENT_USER_ID;

  const handleMarkPaid = async () => {
    setSubmitting(true);
    const updated = await markAsPaid(order.id);
    setOrder(updated);
    setChatMessages(prev => [...prev, { sender: "buyer", text: "Payment sent! Please verify and release USDT.", time: new Date().toLocaleTimeString() }]);
    setSubmitting(false);
  };

  const handleRelease = async () => {
    setSubmitting(true);
    const updated = await releaseUsdt(order.id);
    setOrder(updated);
    setChatMessages(prev => [...prev, { sender: "system", text: "USDT has been released. Order completed!", time: new Date().toLocaleTimeString() }]);
    setSubmitting(false);
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    await cancelOrder(order.id);
    setOrder(prev => prev ? { ...prev, status: "cancelled" } : prev);
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) return;
    setSubmitting(true);
    await raiseDispute(order.id, disputeReason);
    setOrder(prev => prev ? { ...prev, status: "disputed", disputeReason } : prev);
    setShowDisputeModal(false);
    setChatMessages(prev => [...prev, { sender: "system", text: "⚠️ Dispute raised. Admin has been notified.", time: new Date().toLocaleTimeString() }]);
    setSubmitting(false);
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: isBuyer ? "buyer" : "seller", text: chatInput, time: new Date().toLocaleTimeString() }]);
    setChatInput("");
  };

  const counterpartyName = isBuyer ? order.sellerName : order.buyerName;
  const counterpartyBadge = isBuyer ? order.sellerBadge : order.buyerBadge;

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Order Room <span className="font-mono text-muted-foreground text-sm">#{order.id}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isBuyer ? "Buying" : "Selling"} <strong className="text-foreground">{order.usdtAmount} USDT</strong> at {order.rate} {order.currency}/USDT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Counterparty:</span>
          <span className="font-semibold text-sm">{counterpartyName}</span>
          <AgentBadgeDisplay badge={counterpartyBadge} />
        </div>
      </div>

      {/* Status Stepper */}
      <Card className="p-5 bg-card border-border overflow-x-auto">
        <OrderStatusStepper status={order.status} />
      </Card>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left: Order Actions */}
        <div className="lg:col-span-2 space-y-4">

          {/* Payment Timer */}
          {(order.status === "pending" || order.status === "paid") && (
            <Card className="p-4 bg-card border-border">
              <p className="text-xs text-muted-foreground mb-1">
                {order.status === "pending" ? (isBuyer ? "Time to pay" : "Waiting for buyer payment") : "Time to release USDT"}
              </p>
              <div className="text-3xl">
                <CountdownTimer
                  expiresAt={order.status === "pending" ? order.paymentExpiresAt : order.releaseExpiresAt!}
                  warningThresholdSeconds={300}
                />
              </div>
            </Card>
          )}

          {/* Order Summary */}
          <Card className="p-4 bg-card border-border space-y-3">
            <h2 className="font-semibold text-sm border-b border-border pb-2">Order Summary</h2>
            {[
              ["USDT Amount", `${order.usdtAmount} USDT`],
              ["Rate", `${order.rate} ${order.currency}`],
              ["Total", `${order.totalFiat.toLocaleString()} ${order.currency}`],
              ["Payment Method", order.paymentMethod],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </Card>

          {/* Payment Details (shown to buyer when pending) */}
          {isBuyer && order.status === "pending" && (
            <Card className="p-4 bg-success/5 border-success/20 space-y-2">
              <h2 className="font-semibold text-sm text-success">Payment Instructions</h2>
              <p className="text-xs text-muted-foreground">Send exactly <strong className="text-foreground">{order.totalFiat.toLocaleString()} {order.currency}</strong> to:</p>
              <div className="p-2 bg-secondary rounded text-sm font-mono">01700-000000 ({order.paymentMethod})</div>
              <p className="text-xs text-warning">⚠️ Send exact amount only. Do NOT send remarks.</p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {order.status === "pending" && isBuyer && (
              <>
                <Button onClick={handleMarkPaid} disabled={submitting} className="w-full bg-success hover:bg-success/90 text-white font-bold gap-2">
                  <CheckCircle className="w-4 h-4" /> I Have Paid
                </Button>
                <Button onClick={handleCancel} variant="secondary" className="w-full text-danger border-danger/20 hover:bg-danger/10 gap-2">
                  <X className="w-4 h-4" /> Cancel Order
                </Button>
              </>
            )}

            {order.status === "paid" && !isBuyer && (
              <>
                <Button onClick={handleRelease} disabled={submitting} className="w-full bg-success hover:bg-success/90 text-white font-bold gap-2">
                  <CheckCircle className="w-4 h-4" /> Release USDT
                </Button>
                {/* IMPORTANT: Seller CANNOT cancel once buyer marks paid — only dispute is allowed */}
                <Button onClick={() => setShowDisputeModal(true)} variant="secondary" className="w-full text-warning border-warning/20 hover:bg-warning/10 gap-2">
                  <ShieldAlert className="w-4 h-4" /> Raise Dispute
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Payment looks fake? Raise a dispute. You cannot cancel once buyer has marked as paid.
                </p>
              </>
            )}

            {order.status === "completed" && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20 text-success font-semibold">
                <CheckCircle className="w-5 h-5" /> Order Completed Successfully
              </div>
            )}

            {order.status === "disputed" && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20 text-warning font-semibold">
                <AlertTriangle className="w-5 h-5" /> Dispute Under Review
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <Card className="lg:col-span-3 bg-card border-border flex flex-col" style={{ minHeight: 400, maxHeight: 520 }}>
          <div className="flex items-center gap-2 p-3 border-b border-border shrink-0">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">Order Chat</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-secondary/10">
            {chatMessages.map((msg, i) => (
              msg.sender === "system" ? (
                <div key={i} className="text-center">
                  <span className="text-[11px] text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">{msg.text}</span>
                </div>
              ) : (
                <div key={i} className={`flex ${msg.sender === (isBuyer ? "buyer" : "seller") ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.sender === (isBuyer ? "buyer" : "seller") ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                    <p>{msg.text}</p>
                    <p className="text-[10px] opacity-60 mt-0.5 text-right">{msg.time}</p>
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="p-3 border-t border-border flex gap-2 shrink-0">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-secondary/30 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={order.status === "completed" || order.status === "cancelled"}
            />
            <Button onClick={sendChat} size="sm" className="h-9 px-3 bg-primary" disabled={order.status === "completed" || order.status === "cancelled"}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 bg-card border-border space-y-4">
            <div className="flex items-center gap-2 text-warning">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="font-bold text-lg">Raise Dispute</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Raising a dispute will notify Admin. Please provide a clear reason. This action cannot be undone.
            </p>
            <textarea
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="Describe the issue in detail (e.g. Payment screenshot appears fake, amount doesn't match...)"
              className="w-full p-3 bg-secondary/30 border border-border rounded-md text-sm min-h-[100px] resize-y focus:outline-none focus:ring-1 focus:ring-warning"
            />
            <div className="flex gap-3">
              <Button onClick={() => setShowDisputeModal(false)} variant="secondary" className="flex-1">Cancel</Button>
              <Button onClick={handleDispute} disabled={submitting || !disputeReason.trim()} className="flex-1 bg-warning text-black hover:bg-warning/90 font-bold">
                {submitting ? "Submitting..." : "Submit Dispute"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
