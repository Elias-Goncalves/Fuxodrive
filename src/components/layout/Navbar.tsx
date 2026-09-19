"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";
import { SyncButton } from "./SyncButton";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/filmes", label: "Filmes" },
  { href: "/series", label: "Séries" },
  { href: "/continuar", label: "Continuar Assistindo" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-white/5 bg-canvas/80 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 max-w-[1920px] items-center gap-8 px-10 lg:px-14">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium text-text-secondary transition-colors hover:text-text-primary",
                pathname === link.href && "text-text-primary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <button
            aria-label="Buscar (Ctrl+K)"
            className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-border-focus hover:text-text-secondary"
          >
            <Search size={16} strokeWidth={1.75} />
            <span className="hidden lg:inline">Buscar</span>
            <kbd className="hidden rounded border border-border-subtle bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] lg:inline">
              ⌘K
            </kbd>
          </button>

          <SyncButton />

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
