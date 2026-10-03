"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountdownTimer } from "@/components/p2p/countdown-timer";
import { OrderStatusStepper } from "@/components/p2p/order-status-stepper";
import { AgentBadgeDisplay } from "@/components/p2p/agent-badge";
import {
  createOrder,
  getPost,
  getOrder,
  markAsPaid,
  releaseUsdt,
  raiseDispute,
  cancelOrder,
  P2POrder,
  P2PPost,
} from "@/services/p2p.service";
import { compareDecimalStrings, formatDecimalString, isPositiveDecimal, multiplyDecimalStrings } from "@/lib/utils/decimal";
import { useLocaleStore } from "@/store/locale-store";
import { AlertTriangle, CheckCircle, MessageSquare, Send, ShieldAlert, X } from "lucide-react";

// MOCK: current logged-in user id
const CURRENT_USER_ID = "u1";

interface ChatMessage {
  sender: "buyer" | "seller" | "system";
  /** System messages store a message key so they follow the locale; typed messages store raw text. */
  text?: string;
  textKey?: string;
  time: string;
}

export default function OrderRoomPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { t } = useLocaleStore();
  const { orderId } = use(params);
  const [order, setOrder] = useState<P2POrder | null>(null);
  const [post, setPost] = useState<P2PPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "system", textKey: "p2p.msg_order_created", time: new Date().toLocaleTimeString() },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // The marketplace routes a post's id through this page, so an id with no order behind it
    // means "start buying from this post" (REQ-129).
    getOrder(orderId).then(existing => {
      if (existing) {
        setOrder(existing);
        setLoading(false);
        return;
      }
      return getPost(orderId).then(foundPost => {
        setPost(foundPost);
        setLoading(false);
      });
    });
  }, [orderId]);

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">{t("p2p.room_loading")}</div>;
  if (!order && post) return <BuyFromPost post={post} />;
  if (!order) return <div className="p-8 text-center text-danger">{t("p2p.room_not_found")}</div>;

  const isBuyer = order.buyerId === CURRENT_USER_ID;
  const payableDeadline = order.status === "pending" ? order.paymentExpiresAt : order.releaseExpiresAt;

  const handleMarkPaid = async () => {
    setSubmitting(true);
    const updated = await markAsPaid(order.id);
    setOrder(updated);
    setChatMessages(prev => [...prev, { sender: "buyer", textKey: "p2p.msg_payment_sent", time: new Date().toLocaleTimeString() }]);
    setSubmitting(false);
  };

  const handleRelease = async () => {
    setSubmitting(true);
    const updated = await releaseUsdt(order.id);
    setOrder(updated);
    setChatMessages(prev => [...prev, { sender: "system", textKey: "p2p.msg_usdt_released", time: new Date().toLocaleTimeString() }]);
    setSubmitting(false);
  };

  const handleCancel = async () => {
    if (!confirm(t("p2p.confirm_cancel"))) return;
    await cancelOrder(order.id);
    setOrder(prev => prev ? { ...prev, status: "cancelled" } : prev);
  };

  const handleDispute = async () => {
    if (!disputeReason.trim()) return;
    setSubmitting(true);
    await raiseDispute(order.id, disputeReason);
    setOrder(prev => prev ? { ...prev, status: "disputed", disputeReason } : prev);
    setShowDisputeModal(false);
    setChatMessages(prev => [...prev, { sender: "system", textKey: "p2p.msg_dispute_raised", time: new Date().toLocaleTimeString() }]);
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
            {t("p2p.order_room")} <span className="font-mono text-muted-foreground text-sm">#{order.id}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isBuyer ? t("p2p.room_buying") : t("p2p.room_selling")}{" "}
            <strong className="text-foreground">{order.usdtAmount} USDT</strong>
            {" · "}{t("p2p.rate_label")} {order.rate} {order.currency}/USDT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t("p2p.counterparty_label")}</span>
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
                {order.status === "pending"
                  ? (isBuyer ? t("p2p.time_to_pay") : t("p2p.waiting_buyer_payment"))
                  : t("p2p.waiting_seller_release")}
              </p>
              {/* DR-061: WA-3 requires the seller to release within a set time but never gives
                  the duration, so a paid order shows no countdown instead of an invented one. */}
              {payableDeadline ? (
                <div className="text-3xl">
                  <CountdownTimer expiresAt={payableDeadline} warningThresholdSeconds={300} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("p2p.no_release_deadline")}</p>
              )}
            </Card>
          )}

          {/* Order Summary */}
          <Card className="p-4 bg-card border-border space-y-3">
            <h2 className="font-semibold text-sm border-b border-border pb-2">{t("p2p.order_summary")}</h2>
            {[
              { labelKey: "p2p.usdt_amount", value: `${order.usdtAmount} USDT` },
              { labelKey: "history.col_rate", value: `${order.rate} ${order.currency}` },
              { labelKey: "p2p.col_total", value: `${formatDecimalString(order.totalFiat, 2)} ${order.currency}` },
              { labelKey: "p2p.payment_method_label", value: order.paymentMethod },
            ].map(row => (
              <div key={row.labelKey} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t(row.labelKey)}</span>
                <span className="font-semibold">{row.value}</span>
              </div>
            ))}
          </Card>

          {/* Payment Details (shown to buyer when pending) */}
          {isBuyer && order.status === "pending" && (
            <Card className="p-4 bg-success/5 border-success/20 space-y-2">
              <h2 className="font-semibold text-sm text-success">{t("p2p.payment_instructions")}</h2>
              <p className="text-xs text-muted-foreground">{t("p2p.send_exactly_before")} <strong className="text-foreground">{formatDecimalString(order.totalFiat, 2)} {order.currency}</strong> {t("p2p.send_exactly_after")}</p>
              <div className="p-2 bg-secondary rounded text-sm font-mono">01700-000000 ({order.paymentMethod})</div>
              <p className="text-xs text-warning">⚠️ {t("p2p.exact_amount_only")}</p>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {order.status === "pending" && isBuyer && (
              <>
                <Button onClick={handleMarkPaid} disabled={submitting} className="w-full bg-success hover:bg-success/90 text-success-fg font-bold gap-2">
                  <CheckCircle className="w-4 h-4" /> {t("p2p.i_have_paid")}
                </Button>
                <Button onClick={handleCancel} variant="secondary" className="w-full text-danger border-danger/20 hover:bg-danger/10 gap-2">
                  <X className="w-4 h-4" /> {t("p2p.cancel_order")}
                </Button>
              </>
            )}

            {order.status === "paid" && !isBuyer && (
              <>
                <Button onClick={handleRelease} disabled={submitting} className="w-full bg-success hover:bg-success/90 text-success-fg font-bold gap-2">
                  <CheckCircle className="w-4 h-4" /> {t("p2p.release_usdt")}
                </Button>
                {/* IMPORTANT: Seller CANNOT cancel once buyer marks paid — only dispute is allowed */}
                <Button onClick={() => setShowDisputeModal(true)} variant="secondary" className="w-full text-warning border-warning/20 hover:bg-warning/10 gap-2">
                  <ShieldAlert className="w-4 h-4" /> {t("p2p.raise_dispute")}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  {t("p2p.seller_dispute_hint")}
                </p>
              </>
            )}

            {order.status === "completed" && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20 text-success font-semibold">
                <CheckCircle className="w-5 h-5" /> {t("p2p.order_completed")}
              </div>
            )}

            {order.status === "disputed" && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg border border-warning/20 text-warning font-semibold">
                <AlertTriangle className="w-5 h-5" /> {t("p2p.dispute_under_review")}
              </div>
            )}
          </div>
        </div>

        {/* Right: Chat */}
        <Card className="lg:col-span-3 bg-card border-border flex flex-col" style={{ minHeight: 400, maxHeight: 520 }}>
          <div className="flex items-center gap-2 p-3 border-b border-border shrink-0">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">{t("p2p.order_chat")}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-secondary/10">
            {chatMessages.map((msg, i) => (
              msg.sender === "system" ? (
                <div key={i} className="text-center">
                  <span className="text-[11px] text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border">
                    {msg.textKey ? t(msg.textKey) : msg.text}
                  </span>
                </div>
              ) : (
                <div key={i} className={`flex ${msg.sender === (isBuyer ? "buyer" : "seller") ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.sender === (isBuyer ? "buyer" : "seller") ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                    <p>{msg.textKey ? t(msg.textKey) : msg.text}</p>
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
              placeholder={t("p2p.chat_ph")}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 bg-card border-border space-y-4">
            <div className="flex items-center gap-2 text-warning">
              <ShieldAlert className="w-5 h-5" />
              <h2 className="font-bold text-lg">{t("p2p.raise_dispute")}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("p2p.dispute_body")}
            </p>
            <textarea
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder={t("p2p.dispute_ph")}
              className="w-full p-3 bg-secondary/30 border border-border rounded-md text-sm min-h-[100px] resize-y focus:outline-none focus:ring-1 focus:ring-warning"
            />
            <div className="flex gap-3">
              <Button onClick={() => setShowDisputeModal(false)} variant="secondary" className="flex-1">{t("common.cancel")}</Button>
              <Button onClick={handleDispute} disabled={submitting || !disputeReason.trim()} className="flex-1 bg-warning text-black hover:bg-warning/90 font-bold">
                {submitting ? t("p2p.dispute_submitting") : t("p2p.dispute_submit")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

/**
 * Buying from a post (REQ-129): the buyer states an amount inside the post's own limits, and the
 * created order carries the seller's payment method and the post's payment window.
 */
function BuyFromPost({ post }: { post: P2PPost }) {
  const { t } = useLocaleStore();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(post.paymentMethods[0] ?? "");
  const [submitting, setSubmitting] = useState(false);

  const total = isPositiveDecimal(amount) ? multiplyDecimalStrings(amount, post.rate) : "0";
  const inRange =
    isPositiveDecimal(amount) &&
    compareDecimalStrings(amount, post.minAmount) >= 0 &&
    compareDecimalStrings(amount, post.maxAmount) <= 0;

  const onCreateOrder = async () => {
    if (!inRange || !paymentMethod || submitting) return;
    setSubmitting(true);
    try {
      const order = await createOrder(post, amount, paymentMethod);
      router.push(`/p2p/${order.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[700px] mx-auto space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">{t("p2p.buy_from_post")}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{post.creatorName}</span>
            <AgentBadgeDisplay badge={post.creatorBadge} />
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{post.rate} {post.currency}</p>
          <p className="text-xs text-muted-foreground">{t("p2p.per_usdt")}</p>
        </div>
      </div>

      {/* The rows below describe this sample post; no P2P backend exists yet. */}
      <Card className="p-4 bg-card border-border space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("p2p.post_limits")}</span>
          <span className="font-semibold">{post.minAmount}–{post.maxAmount} USDT</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("p2p.payment_window_label")}</span>
          <span className="font-semibold">{post.paymentWindowMinutes} {t("p2p.min_short")}</span>
        </div>
      </Card>

      <Card className="p-4 bg-card border-border space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("p2p.amount_usdt")}</label>
          <Input
            type="number"
            inputMode="decimal"
            step="any"
            min={post.minAmount}
            max={post.maxAmount}
            placeholder={`${t("p2p.e_g")} ${post.minAmount}`}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="bg-secondary/30 mt-1.5 font-mono"
          />
          {amount && !inRange && (
            <p className="text-xs text-destructive mt-1.5">
              {t("p2p.range_before")} {post.minAmount} {t("p2p.range_mid")} {post.maxAmount} {t("p2p.range_after")}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{t("p2p.payment_method_label")}</p>
          <div className="flex flex-wrap gap-2">
            {post.paymentMethods.map(m => (
              <button key={m} type="button" onClick={() => setPaymentMethod(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  paymentMethod === m ? "bg-primary/15 text-primary border-primary/30" : "bg-secondary border-border text-muted-foreground"
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-sm border-t border-border pt-3">
          <span className="text-muted-foreground">{t("p2p.you_pay")}</span>
          <span className="font-mono font-bold">{formatDecimalString(total, 2)} {post.currency}</span>
        </div>

        <Button onClick={onCreateOrder} disabled={!inRange || !paymentMethod || submitting} className="w-full font-bold py-3">
          {submitting ? t("p2p.creating_order") : t("p2p.create_order")}
        </Button>
      </Card>
    </div>
  );
}
