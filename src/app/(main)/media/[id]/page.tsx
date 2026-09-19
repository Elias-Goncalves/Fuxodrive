import { notFound } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getLibrary } from "@/lib/data/media";
import { MediaPlayerSection } from "@/components/media/MediaPlayerSection";
import { QualityBadge } from "@/components/ui/Badge";
import { formatFileSize, formatRuntime } from "@/lib/utils";
import { buildProxyStreamUrl } from "@/lib/drive/client";

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // A listagem geral usa o cache leve; aqui buscamos o registro completo.
  const library = await getLibrary();
  const media = library.find((item) => item.id === id);

  if (!media) {
    const { data } = await supabase.from("media").select("id").eq("id", id).maybeSingle();
    if (!data) notFound();
  }
  if (!media) notFound();

  const primaryFile = media.files[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-10 lg:px-0 lg:py-10">
      {primaryFile ? (
        <MediaPlayerSection
          mediaId={media.id}
          fileId={primaryFile.driveFileId}
          title={media.title}
          posterPath={media.posterPath}
          streamUrl={buildProxyStreamUrl(primaryFile.driveFileId)}
        />
      ) : (
        media.backdropPath && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
            <Image src={media.backdropPath} alt={media.title} fill className="object-cover" />
          </div>
        )
      )}

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:gap-8">
        <div className="flex-1">
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
            {media.title}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            {media.voteAverage != null && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star size={14} fill="currentColor" strokeWidth={0} />
                {media.voteAverage.toFixed(1)}
              </span>
            )}
            {media.releaseYear && <span>{media.releaseYear}</span>}
            {media.runtimeMinutes && <span>{formatRuntime(media.runtimeMinutes)}</span>}
            {primaryFile && !primaryFile.nativelyPlayable && (
              <span className="text-status-warning">
                Codec pode exigir suporte adicional do navegador
              </span>
            )}
          </div>

          {media.overview && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
              {media.overview}
            </p>
          )}

          {media.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {media.genres.map((genre) => (
                <QualityBadge key={genre} label={genre} />
              ))}
            </div>
          )}
        </div>

        {primaryFile && (
          <aside className="w-full shrink-0 rounded-xl border border-border-subtle bg-surface-1 p-4 text-xs text-text-secondary md:w-64">
            <h2 className="mb-2 text-sm font-semibold text-text-primary">
              Especificações do arquivo
            </h2>
            <dl className="space-y-1 font-mono">
              <div className="flex justify-between">
                <dt>Tamanho</dt>
                <dd>{formatFileSize(primaryFile.sizeBytes)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Container</dt>
                <dd>{primaryFile.container ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Vídeo</dt>
                <dd>{primaryFile.videoCodec ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Áudio</dt>
                <dd>{primaryFile.audioCodec ?? "—"}</dd>
              </div>
            </dl>
          </aside>
        )}
      </div>
    </div>
  );
}
