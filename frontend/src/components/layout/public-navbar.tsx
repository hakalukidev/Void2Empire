"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

const navLinks = [
  { href: "/markets", label: "Markets" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
];

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b0817]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/">
          <Logo className="text-white" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login">
            <Button variant="gradient" className="rounded-full px-6">
              Login
            </Button>
          </Link>
          <button
            type="button"
            aria-label="Notifications"
            className="relative text-white/70 transition-colors hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-fuchsia-500 text-[9px] font-bold text-white">
              1
            </span>
          </button>
          <Link href="/register" aria-label="Account" className="text-white/70 transition-colors hover:text-white">
            <User className="h-5 w-5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          className="text-white md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-white/60 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="gradient" className="w-full rounded-full">
                Login
              </Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button variant="secondary" className="w-full">
                Create account
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
