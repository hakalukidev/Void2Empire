// P2P Service Layer
// All functions currently return mock data.
// To connect backend: replace each function body with a fetch() call.
// Example: return fetch('/api/p2p/posts').then(r => r.json())

export type AgentBadge = "none" | "level1" | "pro";
export type PostType = "buy" | "sell";
export type OrderStatus = "pending" | "paid" | "released" | "completed" | "cancelled" | "disputed";

export interface P2PPost {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorBadge: AgentBadge;
  type: PostType;
  rate: number;
  currency: string;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
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
  usdtAmount: number;
  rate: number;
  currency: string;
  totalFiat: number;
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
  rate: number;
  currency: string;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  paymentWindowMinutes: number;
  notes?: string;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_POSTS: P2PPost[] = [
  {
    id: "post-1", creatorId: "u2", creatorName: "Rahim Pro", creatorBadge: "pro",
    type: "sell", rate: 120, currency: "BDT", minAmount: 10, maxAmount: 500,
    paymentMethods: ["bKash", "Nagad"], completedTrades: 342, status: "active",
    createdAt: "2024-09-23T08:00:00Z", lastEditedAt: null, deletedAt: null,
  },
  {
    id: "post-2", creatorId: "u3", creatorName: "Karim L1", creatorBadge: "level1",
    type: "sell", rate: 119, currency: "BDT", minAmount: 20, maxAmount: 200,
    paymentMethods: ["Bank Transfer"], completedTrades: 91, status: "active",
    createdAt: "2024-09-23T09:00:00Z", lastEditedAt: null, deletedAt: null,
  },
  {
    id: "post-3", creatorId: "u4", creatorName: "Sadia", creatorBadge: "none",
    type: "sell", rate: 121, currency: "BDT", minAmount: 5, maxAmount: 50,
    paymentMethods: ["Rocket"], completedTrades: 28, status: "active",
    createdAt: "2024-09-22T18:00:00Z", lastEditedAt: null, deletedAt: null,
  },
  {
    id: "post-4", creatorId: "u5", creatorName: "Nasrin Pro", creatorBadge: "pro",
    type: "buy", rate: 118, currency: "BDT", minAmount: 50, maxAmount: 1000,
    paymentMethods: ["bKash", "Bank Transfer"], completedTrades: 512, status: "active",
    createdAt: "2024-09-22T20:00:00Z", lastEditedAt: null, deletedAt: null,
  },
];

const MOCK_ORDERS: P2POrder[] = [
  {
    id: "ord-1", postId: "post-1", buyerId: "u1", buyerName: "You", buyerBadge: "none",
    sellerId: "u2", sellerName: "Rahim Pro", sellerBadge: "pro",
    type: "buy", usdtAmount: 50, rate: 120, currency: "BDT", totalFiat: 6000,
    paymentMethod: "bKash",
    status: "pending",
    paymentProofUrl: null,
    paymentExpiresAt: new Date(Date.now() + 29 * 60 * 1000).toISOString(),
    releaseExpiresAt: null,
    createdAt: new Date().toISOString(),
    disputeReason: null,
  },
  {
    id: "ord-2", postId: "post-3", buyerId: "u6", buyerName: "Jamal", buyerBadge: "none",
    sellerId: "u1", sellerName: "You", sellerBadge: "none",
    type: "sell", usdtAmount: 20, rate: 121, currency: "BDT", totalFiat: 2420,
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
  order.releaseExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
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

export async function applyForAgent(level: "level1" | "pro"): Promise<void> {
  // TODO: return fetch('/api/p2p/agent/apply', { method: 'POST', body: JSON.stringify({ level }) });
  console.log("Applied for agent:", level);
}

export function calculatePostFee(usdtAmount: number): number {
  if (usdtAmount < 100) return 0;
  return Math.floor(usdtAmount / 100) * 0.01;
}
