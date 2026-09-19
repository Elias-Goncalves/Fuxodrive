"use client";

import { useEffect, useState } from "react";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { DownloadButton } from "@/components/media/DownloadButton";
import { getOfflinePlaybackUrl } from "@/hooks/useOfflineDownload";

interface MediaPlayerSectionProps {
  mediaId: string;
  fileId: string;
  title: string;
  posterPath: string | null;
  streamUrl: string;
}

export function MediaPlayerSection({
  mediaId,
  fileId,
  title,
  posterPath,
  streamUrl,
}: MediaPlayerSectionProps) {
  const [src, setSrc] = useState(streamUrl);

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

  return (
    <div className="relative">
      <VideoPlayer src={src} poster={posterPath} />
      <div className="absolute right-3 top-3">
        <DownloadButton
          mediaId={mediaId}
          fileId={fileId}
          title={title}
          posterPath={posterPath}
          streamUrl={streamUrl}
        />
      </div>
    </div>
  );
}
