// Void2Empire P2P marketplace & Agent service — WA-3 (REQ-111..131) plus the v20 answers.
// All money values are decimal STRINGS (Sec46 rule #40) — never float.
// Returns mock data shaped for the documented endpoints; replace each body with an
// apiClient call to connect the backend.
//
// Confirmed by v20: the buyer payment timer is configurable between 5 and 20 minutes (Q33);
// the Agent Registration Fee is $1,000, one-time and non-refundable, and registration is
// completed by chatting with Support (Q31).
//
// Deliberately NOT modelled here: the fake-payment / refund / cancellation rule (WA-3 §13 is
// truncated mid-sentence — DR-064), agent tier revocation and downgrade (v20 Q36), the seller
// release duration (DR-061), and the Edit Fee base amount (DR-060).

import {
  compareDecimalStrings,
  divideDecimalStrings,
  isPositiveDecimal,
  multiplyDecimalByInteger,
  multiplyDecimalStrings,
} from "@/lib/utils/decimal";

/** Buyer payment window bounds, in minutes (v20 Q33). Any value inside the range is allowed. */
export const PAYMENT_TIMER_MIN_MINUTES = 5;
export const PAYMENT_TIMER_MAX_MINUTES = 20;

export function isPaymentWindowValid(minutes: number): boolean {
  return (
    Number.isInteger(minutes) &&
    minutes >= PAYMENT_TIMER_MIN_MINUTES &&
    minutes <= PAYMENT_TIMER_MAX_MINUTES
  );
}

/**
 * Agent registration fees. The Pro figure is confirmed twice (WA-3 §5 and v20 Q31, which adds
 * that it is one-time and non-refundable and that registration goes through Support chat).
 * The Level 1 figure comes from WA-3 §4 only — v20 named a single $1,000 fee without
 * separating the tiers, so $200 is carried as unconfirmed rather than as a settled price.
 */
export const AGENT_PRO_FEE = "1000";
export const AGENT_LEVEL_1_FEE = "200";

/** Post Fee (REQ-126): 0 below $100 of post amount, 0.01% at or above it. */
export const POST_FEE_RATE = "0.0001";
export const POST_FEE_FREE_BELOW = "100";
// The create-post copy quotes this instead of a typed percentage, so it cannot drift from POST_FEE_RATE.
export const POST_FEE_PERCENT = divideDecimalStrings(multiplyDecimalByInteger(POST_FEE_RATE, 100), "1");

export type AgentBadge = "none" | "level1" | "pro";
export type PostType = "buy" | "sell";
export type OrderStatus = "pending" | "paid" | "released" | "completed" | "cancelled" | "disputed";

export interface P2PPost {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorBadge: AgentBadge;
  type: PostType;
  rate: string; // free-form, set by the post creator (REQ-125)
  currency: string;
  minAmount: string;
  maxAmount: string;
  paymentMethods: string[];
  /** Buyer payment window chosen by the creator, within the 5–20 minute range (v20 Q33). */
  paymentWindowMinutes: number;
  completedTrades: number;
  status: "active" | "paused";
  createdAt: string;
  lastEditedAt: string | null;
  deletedAt: string | null;
}

export interface P2POrder {
  id: string;
  postId: string;
  buyerId: string;
  buyerName: string;
  buyerBadge: AgentBadge;
  sellerId: string;
  sellerName: string;
  sellerBadge: AgentBadge;
  type: PostType; // from buyer's perspective
  usdtAmount: string;
  rate: string;
  currency: string;
  totalFiat: string; // usdtAmount × rate
  paymentMethod: string;
  status: OrderStatus;
  paymentProofUrl: string | null;
  paymentExpiresAt: string; // ISO timestamp — countdown to this
  releaseExpiresAt: string | null; // ISO timestamp once buyer pays
  createdAt: string;
  disputeReason: string | null;
}

export interface AgentInfo {
  level: AgentBadge;
  completedTrades: number;
  accountAgeDays: number;
}

export interface CreatePostDto {
  type: PostType;
  rate: string;
  currency: string;
  minAmount: string;
  maxAmount: string;
  paymentMethods: string[];
  paymentWindowMinutes: number;
  notes?: string;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_POSTS: P2PPost[] = [
  {
    id: "post-1", creatorId: "u2", creatorName: "Rahim Pro", creatorBadge: "pro",
    type: "sell", rate: "120", currency: "BDT", minAmount: "10", maxAmount: "500",
    paymentMethods: ["bKash", "Nagad"], paymentWindowMinutes: 15, completedTrades: 342, status: "active",
    createdAt: "2024-09-23T08:00:00Z", lastEditedAt: null, deletedAt: null,
  },
  {
    id: "post-2", creatorId: "u3", creatorName: "Karim L1", creatorBadge: "level1",
    type: "sell", rate: "119", currency: "BDT", minAmount: "20", maxAmount: "200",
    paymentMethods: ["Bank Transfer"], paymentWindowMinutes: 20, completedTrades: 91, status: "active",
    createdAt: "2024-09-23T09:00:00Z", lastEditedAt: null, deletedAt: null,
  },
  {
    id: "post-3", creatorId: "u4", creatorName: "Sadia", creatorBadge: "none",
    type: "sell", rate: "121", currency: "BDT", minAmount: "5", maxAmount: "50",
    paymentMethods: ["Rocket"], paymentWindowMinutes: 10, completedTrades: 28, status: "active",
    createdAt: "2024-09-22T18:00:00Z", lastEditedAt: null, deletedAt: null,
  },
  {
    id: "post-4", creatorId: "u5", creatorName: "Nasrin Pro", creatorBadge: "pro",
    type: "buy", rate: "118", currency: "BDT", minAmount: "50", maxAmount: "1000",
    paymentMethods: ["bKash", "Bank Transfer"], paymentWindowMinutes: 5, completedTrades: 512, status: "active",
    createdAt: "2024-09-22T20:00:00Z", lastEditedAt: null, deletedAt: null,
  },
];

const MOCK_ORDERS: P2POrder[] = [
  {
    id: "ord-1", postId: "post-1", buyerId: "u1", buyerName: "You", buyerBadge: "none",
    sellerId: "u2", sellerName: "Rahim Pro", sellerBadge: "pro",
    type: "buy", usdtAmount: "50", rate: "120", currency: "BDT", totalFiat: "6000",
    paymentMethod: "bKash",
    status: "pending",
    paymentProofUrl: null,
    paymentExpiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    releaseExpiresAt: null,
    createdAt: new Date().toISOString(),
    disputeReason: null,
  },
  {
    id: "ord-2", postId: "post-3", buyerId: "u6", buyerName: "Jamal", buyerBadge: "none",
    sellerId: "u1", sellerName: "You", sellerBadge: "none",
    type: "sell", usdtAmount: "20", rate: "121", currency: "BDT", totalFiat: "2420",
    paymentMethod: "Rocket",
    status: "completed",
    paymentProofUrl: null,
    paymentExpiresAt: "2024-09-22T19:00:00Z",
    releaseExpiresAt: null,
    createdAt: "2024-09-22T18:30:00Z",
    disputeReason: null,
  },
];

// ─── SERVICE FUNCTIONS ────────────────────────────────────────────────────────

export async function getPosts(type: PostType): Promise<P2PPost[]> {
  // TODO: return fetch(`/api/p2p/posts?type=${type}`).then(r => r.json());
  return MOCK_POSTS.filter(p => p.type === type && p.status === "active");
}

export async function getMyPosts(): Promise<P2PPost[]> {
  // TODO: return fetch('/api/p2p/my-posts').then(r => r.json());
  return MOCK_POSTS.filter(p => p.creatorId === "u1"); // "u1" = current user mock
}

export async function getPost(postId: string): Promise<P2PPost | null> {
  // TODO: return fetch(`/api/p2p/posts/${postId}`).then(r => r.json());
  return MOCK_POSTS.find(p => p.id === postId) ?? null;
}

export async function createPost(data: CreatePostDto): Promise<P2PPost> {
  // TODO: return fetch('/api/p2p/posts', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json());
  const newPost: P2PPost = {
    id: `post-${Date.now()}`, creatorId: "u1", creatorName: "You", creatorBadge: "none",
    ...data, completedTrades: 0, status: "active",
    createdAt: new Date().toISOString(), lastEditedAt: null, deletedAt: null,
  };
  MOCK_POSTS.push(newPost);
  return newPost;
}

/**
 * Buying from a post creates an Order in `pending` (REQ-129). The buyer gets the payment window
 * the post creator chose (REQ-130, sized 5–20 minutes by v20 Q33); no release deadline is set,
 * because that duration is still undecided (DR-061).
 */
export async function createOrder(
  post: P2PPost,
  usdtAmount: string,
  paymentMethod: string
): Promise<P2POrder> {
  // TODO: return fetch('/api/p2p/orders', { method: 'POST', body: JSON.stringify({ post_id: post.id, usdt_amount, payment_method }) }).then(r => r.json());
  const order: P2POrder = {
    id: `ord-${Date.now()}`,
    postId: post.id,
    buyerId: "u1", buyerName: "You", buyerBadge: "none",
    sellerId: post.creatorId, sellerName: post.creatorName, sellerBadge: post.creatorBadge,
    type: "buy",
    usdtAmount,
    rate: post.rate,
    currency: post.currency,
    totalFiat: multiplyDecimalStrings(usdtAmount, post.rate),
    paymentMethod,
    status: "pending",
    paymentProofUrl: null,
    paymentExpiresAt: new Date(Date.now() + post.paymentWindowMinutes * 60 * 1000).toISOString(),
    releaseExpiresAt: null,
    createdAt: new Date().toISOString(),
    disputeReason: null,
  };
  MOCK_ORDERS.push(order);
  return order;
}

export async function getOrder(orderId: string): Promise<P2POrder | null> {
  // TODO: return fetch(`/api/p2p/orders/${orderId}`).then(r => r.json());
  return MOCK_ORDERS.find(o => o.id === orderId) ?? null;
}

export async function getMyOrders(): Promise<P2POrder[]> {
  // TODO: return fetch('/api/p2p/my-orders').then(r => r.json());
  return MOCK_ORDERS;
}

export async function markAsPaid(orderId: string): Promise<P2POrder> {
  // TODO: return fetch(`/api/p2p/orders/${orderId}/pay`, { method: 'POST' }).then(r => r.json());
  const order = MOCK_ORDERS.find(o => o.id === orderId)!;
  order.status = "paid";
  // DR-061: WA-3 §12 says the seller must release within a set time but never gives the
  // duration, so no release deadline is invented here and the room shows no countdown.
  order.releaseExpiresAt = null;
  return order;
}

export async function releaseUsdt(orderId: string): Promise<P2POrder> {
  // TODO: return fetch(`/api/p2p/orders/${orderId}/release`, { method: 'POST' }).then(r => r.json());
  const order = MOCK_ORDERS.find(o => o.id === orderId)!;
  order.status = "completed";
  return order;
}

export async function raiseDispute(orderId: string, reason: string): Promise<void> {
  // TODO: return fetch(`/api/p2p/orders/${orderId}/dispute`, { method: 'POST', body: JSON.stringify({ reason }) });
  const order = MOCK_ORDERS.find(o => o.id === orderId)!;
  order.status = "disputed";
  order.disputeReason = reason;
}

export async function cancelOrder(orderId: string): Promise<void> {
  // TODO: return fetch(`/api/p2p/orders/${orderId}/cancel`, { method: 'POST' });
  const order = MOCK_ORDERS.find(o => o.id === orderId)!;
  order.status = "cancelled";
}

export async function getAgentInfo(): Promise<AgentInfo> {
  // TODO: return fetch('/api/p2p/agent-info').then(r => r.json());
  return { level: "none", completedTrades: 12, accountAgeDays: 15 };
}

/**
 * Post Fee preview (REQ-126). Exact product, no rounding — the amount actually charged is
 * decided server-side, and the rounding rule for fees is still open.
 */
export function calculatePostFee(postAmount: string): string {
  if (!isPositiveDecimal(postAmount)) return "0";
  if (compareDecimalStrings(postAmount, POST_FEE_FREE_BELOW) < 0) return "0";
  return divideDecimalStrings(multiplyDecimalStrings(postAmount, POST_FEE_RATE), "1");
}
