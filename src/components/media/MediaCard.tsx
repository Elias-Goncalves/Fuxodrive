import Image from "next/image";
import Link from "next/link";
import { Play, Plus } from "lucide-react";
import type { Media } from "@/types/media";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  media: Media;
  progressPercent?: number;
}

export function MediaCard({ media, progressPercent }: MediaCardProps) {
  return (
    <Link
      href={`/media/${media.id}`}
      className={cn(
        "group relative block aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-2",
        "ring-1 ring-white/10 transition-all duration-300 ease-out",
        "hover:z-20 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 hover:ring-white/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      )}
    >
      {media.posterPath ? (
        <Image
          src={media.posterPath}
          alt={media.title}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 16vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface-3 p-3 text-center text-sm font-semibold text-text-secondary">
          {media.title}
        </div>
      )}

      <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 opacity-0 transition-all duration-200 group-hover:bg-black/50 group-hover:opacity-100">
        <div className="flex justify-end">
          <button
            aria-label="Adicionar à lista"
            className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md hover:bg-black/70"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="flex justify-center pb-2">
          <span className="flex h-11 w-11 animate-pulse items-center justify-center rounded-full bg-white/90 text-black">
            <Play size={20} fill="currentColor" strokeWidth={0} />
          </span>
        </div>
      </div>

      {progressPercent !== undefined && progressPercent > 0 && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
          <div
            className="h-full bg-accent-primary"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      )}
    </Link>
  );
}

export function MediaCardSkeleton() {
  return (
    <div className="aspect-[2/3] w-full animate-pulse rounded-xl bg-surface-2" />
  );
}
