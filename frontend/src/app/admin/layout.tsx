import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileNavButton } from "@/components/layout/mobile-drawer";
import { Logo } from "@/components/ui/logo";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-card px-3 sm:px-4">
        <MobileNavButton />
        <Logo size={24} />
        <span className="text-sm text-muted-foreground">Admin</span>
        <div className="ml-auto">
          <UserMenu />
        </div>
      </header>
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
