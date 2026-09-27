"use client";

import { Card } from "@/components/ui/card";
import {
  Users, DollarSign, TrendingUp, TrendingDown,
  ShieldAlert, Clock, BarChart2, Activity,
  ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, AlertTriangle
} from "lucide-react";
import Link from "next/link";

const KPI_CARDS = [
  { label: "Total Users",       value: "1,284",    sub: "+12 today",    icon: Users,       color: "text-primary",  bg: "bg-primary/10" },
  { label: "Total Deposited",   value: "$2.4M",     sub: "+$18,400 today", icon: DollarSign, color: "text-success",  bg: "bg-success/10" },
  { label: "Total Withdrawn",   value: "$1.1M",     sub: "+$8,200 today",  icon: ArrowUpRight, color: "text-warning", bg: "bg-warning/10" },
  { label: "Active Positions",  value: "342",       sub: "Across all pairs", icon: BarChart2,  color: "text-fuchsia-400", bg: "bg-fuchsia-400/10" },
  { label: "Platform Revenue",  value: "$48,230",   sub: "+$1,200 today",  icon: TrendingUp,  color: "text-success",  bg: "bg-success/10" },
];

const PENDING = [
  { label: "Pending Withdrawals", value: 14, href: "/admin/wallet/withdrawals", color: "text-warning", icon: Clock },
  { label: "Unverified KYC",     value: 38, href: "/admin/users",              color: "text-primary", icon: ShieldAlert },
  { label: "Open Disputes (P2P)",value: 3,  href: "/admin/p2p",                color: "text-danger",  icon: AlertTriangle },
];

const RECENT_USERS = [
  { name: "Rafiq Ahmed",     email: "rafiq@example.com",   kyc: "verified",   role: "user",  joined: "2024-09-21" },
  { name: "Tahmina Begum",   email: "tahmina@example.com", kyc: "pending",    role: "user",  joined: "2024-09-21" },
  { name: "Karim Hossain",   email: "karim@example.com",   kyc: "unverified", role: "user",  joined: "2024-09-20" },
  { name: "Sadia Islam",     email: "sadia@example.com",   kyc: "verified",   role: "user",  joined: "2024-09-20" },
  { name: "Arif Chowdhury",  email: "arif@example.com",    kyc: "rejected",   role: "user",  joined: "2024-09-19" },
];

const RECENT_ACTIVITY = [
  { user: "Rafiq Ahmed",   action: "Deposited $500 USDT",             time: "2 min ago",  type: "deposit" },
  { user: "Admin",         action: "Approved withdrawal #TX-2291",    time: "15 min ago", type: "admin" },
  { user: "Tahmina Begum", action: "Opened Long BTC-USDT (10x, $200)",time: "22 min ago", type: "trade" },
  { user: "Karim Hossain", action: "Submitted KYC documents",         time: "40 min ago", type: "kyc" },
  { user: "Sadia Islam",   action: "Withdrawal request $250 USDT",    time: "1 hr ago",   type: "withdrawal" },
];

const KYC_BADGE: Record<string, string> = {
  verified:   "bg-success/10 text-success border-success/20",
  pending:    "bg-warning/10 text-warning border-warning/20",
  unverified: "bg-secondary/50 text-muted-foreground border-border",
  rejected:   "bg-danger/10 text-danger border-danger/20",
};

const ACTIVITY_DOT: Record<string, string> = {
  deposit:    "bg-success",
  withdrawal: "bg-warning",
  trade:      "bg-primary",
  kyc:        "bg-fuchsia-400",
  admin:      "bg-secondary",
};

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back. Here&apos;s what&apos;s happening on Void2Empire.</p>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary border border-border px-3 py-1.5 rounded-full">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {KPI_CARDS.map((card) => (
          <Card key={card.label} className="p-5 bg-card border-border flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
              <p className={`text-xs mt-1 font-medium ${card.color}`}>{card.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {PENDING.map(({ label, value, href, color, icon: Icon }) => (
          <Link href={href} key={label}>
            <Card className="p-5 bg-card border-border flex items-center justify-between hover:border-primary/50 transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">{value} <span className={`${color}`}>pending</span></p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <Card className="overflow-hidden bg-card border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">Recent Signups</h2>
            <Link href="/admin/users" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-border">
            {RECENT_USERS.map((user) => (
              <div key={user.email} className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${KYC_BADGE[user.kyc]}`}>
                    {user.kyc}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">{user.joined}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="overflow-hidden bg-card border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">Recent Activity</h2>
            <Link href="/admin/activity-log" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-border">
            {RECENT_ACTIVITY.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div className="mt-1.5 relative">
                  <div className={`w-2 h-2 rounded-full ${ACTIVITY_DOT[item.type]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{item.user}</span>
                    <span className="text-muted-foreground"> — {item.action}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
