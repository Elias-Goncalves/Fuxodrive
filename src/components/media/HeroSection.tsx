import Image from "next/image";
import { Info, Play, Star } from "lucide-react";
import type { Media } from "@/types/media";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRuntime } from "@/lib/utils";

export function HeroSection({ media }: { media: Media }) {
  return (
    <section className="relative h-[55vh] w-full md:h-[75vh]">
      {media.backdropPath && (
        <Image
          src={media.backdropPath}
          alt=""
          fill
          priority
          className="object-cover"
        />
      )}

      {/* Fusão vertical: elimina o corte seco com o conteúdo abaixo */}
      <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/60 to-transparent" />
      {/* Fusão horizontal (desktop): garante legibilidade dos textos à esquerda */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-canvas via-canvas/80 to-transparent md:block" />

      <div className="relative flex h-full max-w-[1920px] flex-col justify-end gap-4 px-4 pb-8 md:mx-auto md:justify-end md:gap-5 md:px-14 md:pb-16">
        <Badge>Em Destaque</Badge>

        <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl lg:tracking-tighter">
          {media.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-text-secondary md:text-sm">
          {media.voteAverage != null && (
            <span className="flex items-center gap-1 text-amber-400">
              <Star size={14} fill="currentColor" strokeWidth={0} />
              {media.voteAverage.toFixed(1)}
            </span>
          )}
          {media.releaseYear && <span>{media.releaseYear}</span>}
          {media.runtimeMinutes && <span>{formatRuntime(media.runtimeMinutes)}</span>}
          {media.genres.slice(0, 3).map((genre) => (
            <span key={genre}>{genre}</span>
          ))}
        </div>

        {media.overview && (
          <p className="line-clamp-2 max-w-xl text-sm text-slate-300 md:line-clamp-3 md:text-base">
            {media.overview}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <Button variant="primary">
            <Play size={18} fill="currentColor" strokeWidth={0} />
            Assistir Agora
          </Button>
          <Button variant="glass">
            <Info size={18} strokeWidth={1.75} />
            Detalhes
          </Button>
        </div>
      </div>
    </section>
  );
}
