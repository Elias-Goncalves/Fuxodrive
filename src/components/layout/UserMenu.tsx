"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, ChevronDown, HardDrive, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/supabase/google-auth";
import { cn } from "@/lib/utils";

interface UserProfile {
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  driveConnected: boolean;
}

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;

      const { data: row } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, drive_connected")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;
      setProfile({
        displayName: row?.display_name ?? user.user_metadata?.full_name ?? null,
        email: user.email ?? null,
        avatarUrl: row?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
        driveConnected: row?.drive_connected ?? false,
      });
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = (profile?.displayName ?? profile?.email ?? "?").charAt(0).toUpperCase();
  const avatarSize = compact ? 28 : 32;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Menu do perfil"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full transition-opacity hover:opacity-80"
      >
        {profile?.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt=""
            width={avatarSize}
            height={avatarSize}
            className="rounded-full"
          />
        ) : (
          <div
            style={{ width: avatarSize, height: avatarSize }}
            className="flex items-center justify-center rounded-full bg-surface-3 text-sm font-semibold text-text-primary"
          >
            {initial}
          </div>
        )}
        {!compact && (
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={cn("text-text-muted transition-transform", open && "rotate-180")}
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border-subtle bg-surface-1 shadow-2xl">
          <div className="border-b border-border-subtle px-4 py-3">
            <p className="truncate text-sm font-semibold text-text-primary">
              {profile?.displayName ?? "Minha conta"}
            </p>
            {profile?.email && (
              <p className="truncate text-xs text-text-muted">{profile.email}</p>
            )}
          </div>

          <div className="px-2 py-2">
            {profile?.driveConnected ? (
              <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-status-success">
                <Check size={16} strokeWidth={2} />
                Google Drive conectado
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-text-secondary transition-colors hover:bg-surface-3 hover:text-text-primary"
              >
                <HardDrive size={16} strokeWidth={1.75} />
                Conectar Google Drive
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-status-error transition-colors hover:bg-status-error/10"
            >
              <LogOut size={16} strokeWidth={1.75} />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
