"use client";

import { AlertTriangle, Download, Trash2, X } from "lucide-react";
import { useOfflineDownload } from "@/hooks/useOfflineDownload";
import { cn } from "@/lib/utils";

const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface DownloadButtonProps {
  mediaId: string;
  fileId: string;
  title: string;
  posterPath: string | null;
  streamUrl: string;
}

export function DownloadButton({
  mediaId,
  fileId,
  title,
  posterPath,
  streamUrl,
}: DownloadButtonProps) {
  const { status, progress, error, startDownload, cancelDownload, removeDownload } =
    useOfflineDownload({ mediaId, fileId, title, posterPath, streamUrl });

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  if (status === "downloading") {
    return (
      <button
        onClick={cancelDownload}
        aria-label={`Cancelar download (${progress}%)`}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:text-text-primary"
      >
        <svg width={36} height={36} className="absolute -rotate-90">
          <circle
            cx={18}
            cy={18}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-surface-3"
          />
          <circle
            cx={18}
            cy={18}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-accent-primary transition-[stroke-dashoffset] duration-200"
          />
        </svg>
        <X size={14} strokeWidth={2} />
      </button>
    );
  }

  if (status === "downloaded") {
    return (
      <button
        onClick={removeDownload}
        aria-label="Remover download offline"
        title="Disponível offline no app — toque para remover"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-status-success/10 text-status-success active:bg-status-error/10 active:text-status-error"
      >
        <Trash2 size={16} strokeWidth={2} />
      </button>
    );
  }

  return (
    <button
      onClick={startDownload}
      aria-label="Baixar para assistir offline"
      title={error ?? "Baixar para assistir offline"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-3 hover:text-text-primary",
        status === "error" && "text-status-error"
      )}
    >
      {status === "error" ? (
        <AlertTriangle size={16} strokeWidth={1.75} />
      ) : (
        <Download size={16} strokeWidth={1.75} />
      )}
    </button>
  );
}
