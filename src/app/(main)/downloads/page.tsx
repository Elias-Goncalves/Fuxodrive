import { HardDrive } from "lucide-react";

export default function DownloadsPage() {
  // TODO: ler o uso real de espaço via Origin Private File System (OPFS)
  // no client (hook useOfflineDownload) e listar mídias baixadas.
  const usedBytes = 0;
  const quotaBytes = 1;
  const usedPercent = Math.min((usedBytes / quotaBytes) * 100, 100);

  return (
    <div className="px-4 py-6 md:px-10 lg:px-14">
      <h1 className="mb-6 text-2xl font-black tracking-tight text-white">
        Downloads
      </h1>

      <div className="mb-8 rounded-xl border border-border-subtle bg-surface-1 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm text-text-secondary">
          <HardDrive size={16} strokeWidth={1.75} />
          Espaço utilizado offline
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500"
            style={{ width: `${usedPercent}%` }}
          />
        </div>
      </div>

      <p className="text-sm text-text-secondary">
        Nenhum título disponível offline. Baixe filmes e episódios para
        assistir sem conexão.
      </p>
    </div>
  );
}
