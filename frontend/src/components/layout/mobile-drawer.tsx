"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useNavStore } from "@/store/nav-store";
import { useLocaleStore } from "@/store/locale-store";

export function MobileNavButton() {
  const toggle = useNavStore((state) => state.toggle);
  const { t } = useLocaleStore();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("common.open_menu")}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

// Slide-in panel that hosts the sidebar's nav below md, where the aside is hidden.
export function MobileDrawer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const open = useNavStore((state) => state.open);
  const setOpen = useNavStore((state) => state.setOpen);
  const { t } = useLocaleStore();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card shadow-xl transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
          <Logo size={24} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("common.close_menu")}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
