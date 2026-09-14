import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Logo } from "@/components/ui/logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4">
        <Logo size={24} />
        <span className="text-sm text-muted-foreground">Admin</span>
      </header>
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
