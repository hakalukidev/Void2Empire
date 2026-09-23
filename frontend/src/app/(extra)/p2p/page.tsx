"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AgentBadgeDisplay } from "@/components/p2p/agent-badge";
import { getPosts, P2PPost, PostType } from "@/services/p2p.service";
import { ArrowLeftRight, Plus, Search, Shield, Star } from "lucide-react";

export default function P2PMarketplacePage() {
  const [tab, setTab] = useState<PostType>("sell"); // "sell" = user wants to buy USDT → sees sell posts
  const [posts, setPosts] = useState<P2PPost[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPosts(tab).then(data => { setPosts(data); setLoading(false); });
  }, [tab]);

  // Mock user info — replace with real auth store
  const mockUser = { completedTrades: 12, accountAgeDays: 15 };
  const canCreatePost = mockUser.completedTrades >= 20 && mockUser.accountAgeDays >= 30;

  const filtered = posts.filter(p =>
    p.creatorName.toLowerCase().includes(search.toLowerCase()) ||
    p.paymentMethods.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">P2P Marketplace</h1>
            <p className="text-sm text-muted-foreground">Buy & Sell USDT with other users</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/p2p/orders">
            <Button variant="secondary" size="sm" className="h-9 text-xs border-border">My Orders</Button>
          </Link>
          <Link href="/p2p/agent">
            <Button variant="secondary" size="sm" className="h-9 text-xs border-border">
              <Shield className="w-3.5 h-3.5 mr-1.5" /> Agent
            </Button>
          </Link>
          {canCreatePost ? (
            <Link href="/p2p/create">
              <Button size="sm" className="h-9 text-xs bg-primary text-primary-foreground gap-1.5">
                <Plus className="w-4 h-4" /> Create Post
              </Button>
            </Link>
          ) : (
            <div className="relative group">
              <Button size="sm" disabled className="h-9 text-xs opacity-50 gap-1.5">
                <Plus className="w-4 h-4" /> Create Post
              </Button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-56 p-2 rounded-md bg-popover border border-border text-xs text-muted-foreground z-50 shadow-lg">
                Requires 1 month account age and 20+ completed P2P transactions.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/30 border border-border rounded-lg w-fit">
        <button onClick={() => setTab("sell")}
          className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${tab === "sell" ? "bg-success/15 text-success border border-success/20" : "text-muted-foreground hover:text-foreground"}`}>
          Buy USDT
        </button>
        <button onClick={() => setTab("buy")}
          className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${tab === "buy" ? "bg-danger/15 text-danger border border-danger/20" : "text-muted-foreground hover:text-foreground"}`}>
          Sell USDT
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by seller or payment method..." className="pl-9 bg-secondary/30" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Post List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-28 animate-pulse bg-secondary/30 border-border" />
          ))
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">No posts found.</div>
        ) : filtered.map(post => (
          <PostCard key={post.id} post={post} isBuying={tab === "sell"} />
        ))}
      </div>
    </div>
  );
}

function PostCard({ post, isBuying }: { post: P2PPost; isBuying: boolean }) {
  return (
    <Card className="p-4 md:p-5 bg-card border-border hover:border-primary/30 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Creator info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
            {post.creatorName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{post.creatorName}</span>
              <AgentBadgeDisplay badge={post.creatorBadge} />
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span>{post.completedTrades} completed</span>
            </div>
          </div>
        </div>

        {/* Rate & limits */}
        <div className="flex flex-col items-start md:items-center gap-1">
          <div className="text-xl font-bold">
            1 USDT = <span className="text-primary">{post.rate} {post.currency}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Limit: {post.minAmount}–{post.maxAmount} USDT
          </div>
        </div>

        {/* Payment & action */}
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="flex flex-wrap gap-1.5">
            {post.paymentMethods.map(m => (
              <span key={m} className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary border border-border">{m}</span>
            ))}
          </div>
          <Link href={`/p2p/${post.id}`}>
            <Button size="sm" className={`h-8 text-xs px-5 font-bold ${isBuying ? "bg-success hover:bg-success/90 text-white" : "bg-danger hover:bg-danger/90 text-white"}`}>
              {isBuying ? "Buy" : "Sell"}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
