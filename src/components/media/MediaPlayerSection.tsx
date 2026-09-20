"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AlertTriangle } from "lucide-react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { DownloadButton } from "@/components/media/DownloadButton";
import { DeviceDownloadLink } from "@/components/media/DeviceDownloadLink";
import { getOfflinePlaybackUrl } from "@/hooks/useOfflineDownload";

interface MediaPlayerSectionProps {
  mediaId: string;
  fileId: string;
  fileName: string;
  title: string;
  posterPath: string | null;
  streamUrl: string;
}

export function MediaPlayerSection({
  mediaId,
  fileId,
  fileName,
  title,
  posterPath,
  streamUrl,
}: MediaPlayerSectionProps) {
  const [src, setSrc] = useState(streamUrl);
  const [playbackFailed, setPlaybackFailed] = useState(false);

  useEffect(() => {
    let offlineUrl: string | null = null;

    getOfflinePlaybackUrl(fileId).then((url) => {
      if (url) {
        offlineUrl = url;
        setSrc(url);
      }
    });

    return () => {
      if (offlineUrl) URL.revokeObjectURL(offlineUrl);
    };
  }, [fileId]);

  if (playbackFailed) {
    return (
      <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-xl bg-black text-center">
        {posterPath && (
          <Image
            src={posterPath}
            alt=""
            fill
            className="object-cover opacity-20"
          />
        )}
        <div className="relative flex flex-col items-center gap-3 px-6">
          <AlertTriangle size={28} className="text-status-warning" strokeWidth={1.75} />
          <p className="max-w-sm text-sm text-text-secondary">
            Este arquivo não é compatível com reprodução direta no navegador.
            Baixe para assistir com um player de vídeo do seu dispositivo
            (ex: VLC, MX Player).
          </p>
          <a
            href={streamUrl}
            download={fileName}
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black shadow-lg shadow-white/10 transition-all hover:scale-105 hover:bg-slate-200 active:scale-95"
          >
            Baixar para o dispositivo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <VideoPlayer
        src={src}
        poster={posterPath}
        onError={() => setPlaybackFailed(true)}
      />
      <div className="absolute right-3 top-3 flex gap-1 rounded-full bg-black/40 p-0.5 backdrop-blur-md">
        <DownloadButton
          mediaId={mediaId}
          fileId={fileId}
          title={title}
          posterPath={posterPath}
          streamUrl={streamUrl}
        />
        <DeviceDownloadLink streamUrl={streamUrl} fileName={fileName} />
      </div>
    </div>
  );
}
