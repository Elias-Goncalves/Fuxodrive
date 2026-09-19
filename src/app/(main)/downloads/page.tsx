"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HardDrive, Trash2 } from "lucide-react";
import {
  deleteDownloadByFileId,
  getDownloadRecords,
  isOfflineSupported,
  type DownloadRecord,
} from "@/hooks/useOfflineDownload";
import { formatFileSize } from "@/lib/utils";

export default function DownloadsPage() {
  const [records, setRecords] = useState<DownloadRecord[]>(getDownloadRecords);
  const [quota, setQuota] = useState<{ usage: number; total: number } | null>(
    null
  );
  const [supported] = useState(isOfflineSupported);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
      navigator.storage.estimate().then((estimate) => {
        setQuota({ usage: estimate.usage ?? 0, total: estimate.quota ?? 0 });
      });
    }
  }, []);

  async function handleRemove(fileId: string) {
    await deleteDownloadByFileId(fileId);
    setRecords(getDownloadRecords());
  }

  const usedByDownloads = records.reduce((sum, r) => sum + r.sizeBytes, 0);
  const usedPercent = quota?.total
    ? Math.min((quota.usage / quota.total) * 100, 100)
    : 0;

  return (
    <div className="px-4 py-6 md:px-10 lg:px-14">
      <h1 className="mb-6 text-2xl font-black tracking-tight text-white">
        Downloads
      </h1>

      {!supported && (
        <p className="mb-6 rounded-lg border border-status-warning/30 bg-status-warning/10 px-4 py-3 text-sm text-status-warning">
          Seu navegador não suporta downloads offline (é necessário suporte a
          Origin Private File System).
        </p>
      )}

      <div className="mb-8 rounded-xl border border-border-subtle bg-surface-1 p-4">
        <div className="mb-2 flex items-center justify-between text-sm text-text-secondary">
          <span className="flex items-center gap-2">
            <HardDrive size={16} strokeWidth={1.75} />
            Espaço utilizado offline
          </span>
          <span className="font-mono text-xs">
            {formatFileSize(usedByDownloads)}
            {quota?.total ? ` / ${formatFileSize(quota.total)}` : ""}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
            style={{ width: `${usedPercent}%` }}
          />
        </div>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Nenhum título disponível offline. Baixe filmes e episódios para
          assistir sem conexão.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {records.map((record) => (
            <div key={record.fileId} className="group relative">
              <Link
                href={`/media/${record.mediaId}`}
                className="block aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-2 ring-1 ring-white/10"
              >
                {record.posterPath ? (
                  <Image
                    src={record.posterPath}
                    alt={record.title}
                    fill
                    sizes="(max-width: 640px) 33vw, 16vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-text-secondary">
                    {record.title}
                  </div>
                )}
              </Link>
              <button
                onClick={() => handleRemove(record.fileId)}
                aria-label={`Remover ${record.title} dos downloads`}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 backdrop-blur-md transition-opacity hover:bg-status-error/80 group-hover:opacity-100"
              >
                <Trash2 size={14} strokeWidth={2} />
              </button>
              <p className="mt-1 truncate text-xs text-text-secondary">
                {formatFileSize(record.sizeBytes)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
