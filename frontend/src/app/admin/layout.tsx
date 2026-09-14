import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center border-b border-border bg-card px-4">
        <span className="text-sm font-semibold">BinaryTrade Pro — Admin</span>
      </header>
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
