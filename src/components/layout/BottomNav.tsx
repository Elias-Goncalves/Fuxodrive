"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Film, Tv, DownloadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/filmes", label: "Filmes", icon: Film },
  { href: "/series", label: "Séries", icon: Tv },
  { href: "/downloads", label: "Downloads", icon: DownloadCloud },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/5 bg-surface-1/95 backdrop-blur-xl pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden"
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              <Icon
                size={22}
                strokeWidth={1.75}
                className={cn(
                  "transition-colors",
                  active ? "text-accent-primary" : "text-text-muted"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-text-primary" : "text-text-muted"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
