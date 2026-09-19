import { useCallback, useRef, useState } from "react";

export interface DownloadRecord {
  mediaId: string;
  fileId: string;
  title: string;
  posterPath: string | null;
  sizeBytes: number;
  downloadedAt: string;
}

const INDEX_KEY = "drivestream:downloads";

function readIndex(): DownloadRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(INDEX_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeIndex(records: DownloadRecord[]) {
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(records));
}

export function getDownloadRecords(): DownloadRecord[] {
  return readIndex();
}

export function isOfflineSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "storage" in navigator &&
    "getDirectory" in navigator.storage
  );
}

async function getOpfsRoot(): Promise<FileSystemDirectoryHandle> {
  return navigator.storage.getDirectory();
}

export async function deleteDownloadByFileId(fileId: string) {
  try {
    const root = await getOpfsRoot();
    await root.removeEntry(fileId);
  } catch {
    // arquivo já não existe localmente — seguro ignorar
  }
  writeIndex(readIndex().filter((record) => record.fileId !== fileId));
}

export async function getOfflinePlaybackUrl(
  fileId: string
): Promise<string | null> {
  if (!isOfflineSupported()) return null;
  try {
    const root = await getOpfsRoot();
    const handle = await root.getFileHandle(fileId);
    const file = await handle.getFile();
    return URL.createObjectURL(file);
  } catch {
    return null;
  }
}

type DownloadStatus = "idle" | "downloading" | "downloaded" | "error";

interface UseOfflineDownloadParams {
  mediaId: string;
  fileId: string;
  title: string;
  posterPath: string | null;
  streamUrl: string;
}

export function useOfflineDownload({
  mediaId,
  fileId,
  title,
  posterPath,
  streamUrl,
}: UseOfflineDownloadParams) {
  const [status, setStatus] = useState<DownloadStatus>(() =>
    readIndex().some((item) => item.fileId === fileId) ? "downloaded" : "idle"
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startDownload = useCallback(async () => {
    if (!isOfflineSupported()) {
      setError("Seu navegador não suporta armazenamento offline.");
      setStatus("error");
      return;
    }

    setStatus("downloading");
    setProgress(0);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(streamUrl, { signal: controller.signal });
      if (!response.ok || !response.body) {
        throw new Error("Falha ao baixar o arquivo.");
      }

      const totalBytes = Number(response.headers.get("content-length") ?? 0);
      const root = await getOpfsRoot();
      const fileHandle = await root.getFileHandle(fileId, { create: true });
      const writable = await fileHandle.createWritable();

      const reader = response.body.getReader();
      let receivedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        await writable.write(value);
        receivedBytes += value.byteLength;
        if (totalBytes > 0) {
          setProgress(Math.round((receivedBytes / totalBytes) * 100));
        }
      }

      await writable.close();

      const records = readIndex().filter((item) => item.fileId !== fileId);
      records.push({
        mediaId,
        fileId,
        title,
        posterPath,
        sizeBytes: receivedBytes,
        downloadedAt: new Date().toISOString(),
      });
      writeIndex(records);

      setStatus("downloaded");
      setProgress(100);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setStatus("idle");
        return;
      }
      setError(
        err instanceof Error ? err.message : "Falha ao baixar o arquivo."
      );
      setStatus("error");
      await deleteDownloadByFileId(fileId);
    } finally {
      abortRef.current = null;
    }
  }, [fileId, mediaId, posterPath, streamUrl, title]);

  const cancelDownload = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const removeDownload = useCallback(async () => {
    await deleteDownloadByFileId(fileId);
    setStatus("idle");
    setProgress(0);
  }, [fileId]);

  return {
    status,
    progress,
    error,
    startDownload,
    cancelDownload,
    removeDownload,
  };
}
