"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, ShieldCheck, ShieldAlert, TrendingUp, MoreHorizontal } from "lucide-react";

type UserStatus = "active" | "suspended" | "banned" | "pending_verification";
type KycStatus = "verified" | "unverified" | "pending" | "rejected";

interface AdminUser {
  id: string; name: string; email: string; country: string;
  status: UserStatus; kyc: KycStatus; tradingEnabled: boolean;
  balance: number; demoBalance: number; joined: string;
}

const MOCK_USERS: AdminUser[] = [
  { id: "U001", name: "Rafiq Ahmed",    email: "rafiq@example.com",    country: "BD", status: "active",    kyc: "verified",   tradingEnabled: true,  balance: 2400,  demoBalance: 10000, joined: "2024-09-01" },
  { id: "U002", name: "Tahmina Begum",  email: "tahmina@example.com",  country: "BD", status: "active",    kyc: "pending",    tradingEnabled: false, balance: 500,   demoBalance: 10000, joined: "2024-09-10" },
  { id: "U003", name: "Karim Hossain",  email: "karim@example.com",    country: "BD", status: "active",    kyc: "unverified", tradingEnabled: false, balance: 0,     demoBalance: 10000, joined: "2024-09-15" },
  { id: "U004", name: "Sadia Islam",    email: "sadia@example.com",    country: "BD", status: "active",    kyc: "verified",   tradingEnabled: true,  balance: 8200,  demoBalance: 10000, joined: "2024-09-18" },
  { id: "U005", name: "Arif Chowdhury", email: "arif@example.com",     country: "BD", status: "suspended", kyc: "rejected",   tradingEnabled: false, balance: 100,   demoBalance: 10000, joined: "2024-09-19" },
  { id: "U006", name: "Nasrin Akter",   email: "nasrin@example.com",   country: "BD", status: "active",    kyc: "verified",   tradingEnabled: true,  balance: 15000, demoBalance: 10000, joined: "2024-09-20" },
  { id: "U007", name: "Jamal Uddin",    email: "jamal@example.com",    country: "BD", status: "banned",    kyc: "rejected",   tradingEnabled: false, balance: 0,     demoBalance: 10000, joined: "2024-09-20" },
];

const STATUS_STYLE: Record<UserStatus, string> = {
  active:               "bg-success/10 text-success border-success/20",
  suspended:            "bg-warning/10 text-warning border-warning/20",
  banned:               "bg-danger/10 text-danger border-danger/20",
  pending_verification: "bg-primary/10 text-primary border-primary/20",
};

const KYC_STYLE: Record<KycStatus, string> = {
  verified:   "bg-success/10 text-success border-success/20",
  pending:    "bg-warning/10 text-warning border-warning/20",
  unverified: "bg-secondary/50 text-muted-foreground border-border",
  rejected:   "bg-danger/10 text-danger border-danger/20",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [kycFilter, setKycFilter] = useState<KycStatus | "all">("all");
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchKyc = kycFilter === "all" || u.kyc === kycFilter;
    return matchSearch && matchStatus && matchKyc;
  });

  const toggleTrading = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, tradingEnabled: !u.tradingEnabled } : u));
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        </div>
        <div className="text-sm text-muted-foreground bg-secondary border border-border px-3 py-1.5 rounded-full">
          {filtered.length} users
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-card border-border flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." className="pl-9 bg-secondary/30" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-md border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
          <option value="pending_verification">Pending Verification</option>
        </select>

        <select value={kycFilter} onChange={(e) => setKycFilter(e.target.value as any)}
          className="px-3 py-2 rounded-md border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="all">All KYC</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
          <option value="unverified">Unverified</option>
          <option value="rejected">Rejected</option>
        </select>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-medium">User</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">KYC</th>
                <th className="px-5 py-4 font-medium text-center">Trading</th>
                <th className="px-5 py-4 font-medium text-right">Live Balance</th>
                <th className="px-5 py-4 font-medium hidden lg:table-cell">Joined</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">No users found.</td></tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLE[user.status]}`}>
                      {user.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${KYC_STYLE[user.kyc]}`}>
                      {user.kyc === "verified" ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {user.kyc}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => toggleTrading(user.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${user.tradingEnabled ? "bg-success" : "bg-secondary border border-border"}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${user.tradingEnabled ? "translate-x-4" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-medium">
                    ${user.balance.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground hidden lg:table-cell">{user.joined}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" className="h-7 text-xs"
                        onClick={() => toggleStatus(user.id)}>
                        {user.status === "active" ? "Suspend" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
