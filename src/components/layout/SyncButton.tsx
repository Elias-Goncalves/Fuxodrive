"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type SyncState = "idle" | "syncing" | "success" | "error";

export function SyncButton() {
  const router = useRouter();
  const [state, setState] = useState<SyncState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSync() {
    setState("syncing");
    setMessage(null);

    try {
      const response = await fetch("/api/drive/sync", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setState("error");
        setMessage(data.error ?? "Falha ao sincronizar.");
        return;
      }

      setState("success");
      setMessage(
        `${data.filesAdded} adicionados, ${data.filesUpdated} atualizados de ${data.filesFound} encontrados.`
      );
      router.refresh();
    } catch {
      setState("error");
      setMessage("Falha de conexão ao sincronizar.");
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleSync}
        disabled={state === "syncing"}
        aria-label="Sincronizar biblioteca do Google Drive"
        className={cn(
          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60",
          state === "error"
            ? "border-status-error/30 bg-status-error/10 text-status-error hover:bg-status-error/20"
            : "border-status-success/30 bg-status-success/10 text-status-success hover:bg-status-success/20"
        )}
      >
        {state === "error" ? (
          <AlertTriangle size={14} strokeWidth={1.75} />
        ) : (
          <span className="relative flex h-2 w-2">
            {state !== "syncing" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-success opacity-75" />
            )}
            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-success" />
          </span>
        )}
        <RefreshCw
          size={14}
          strokeWidth={1.75}
          className={cn(state === "syncing" && "animate-spin")}
        />
        {state === "syncing" ? "Sincronizando…" : "Sincronizar"}
      </button>

      {message && (
        <div
          role="status"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-xs text-text-secondary shadow-xl"
        >
          {message}
        </div>
      )}
    </div>
  );
}
