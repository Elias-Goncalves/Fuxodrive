import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-canvas/90 px-4 py-3 backdrop-blur-xl md:hidden">
      <Link href="/">
        <Logo compact />
      </Link>
      <div className="flex items-center gap-3">
        <button aria-label="Buscar" className="text-text-secondary">
          <Search size={20} strokeWidth={1.75} />
        </button>
        <UserMenu compact />
      </div>
    </header>
  );
}
