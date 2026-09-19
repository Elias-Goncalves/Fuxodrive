"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Media } from "@/types/media";
import { MediaCard } from "./MediaCard";

interface MediaCarouselProps {
  title: string;
  items: Media[];
}

export function MediaCarousel({ title, items }: MediaCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scrollBy(direction: 1 | -1) {
    scrollerRef.current?.scrollBy({
      left: direction * scrollerRef.current.clientWidth * 0.9,
      behavior: "smooth",
    });
  }

  if (items.length === 0) return null;

  return (
    <section className="relative">
      <h2 className="mb-3 flex items-center gap-2 px-4 text-lg font-bold tracking-wide text-white md:px-10 md:text-xl lg:px-14">
        {title}
      </h2>

      <div className="group/carousel relative">
        <button
          aria-label="Anterior"
          onClick={() => scrollBy(-1)}
          className="absolute inset-y-0 left-0 z-10 hidden w-14 items-center justify-center bg-gradient-to-r from-canvas to-transparent opacity-0 transition-opacity group-hover/carousel:opacity-100 md:flex"
        >
          <ChevronLeft className="text-white" />
        </button>

        <div
          ref={scrollerRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 md:gap-4 md:px-10 lg:gap-5 lg:px-14"
        >
          {items.map((media) => (
            <div
              key={media.id}
              className="w-[30vw] shrink-0 snap-start sm:w-[22vw] md:w-[calc(25%-1rem)] lg:w-[calc(100%/6-1.05rem)] 2xl:w-[calc(100%/7-1.05rem)]"
            >
              <MediaCard media={media} />
            </div>
          ))}
        </div>

        <button
          aria-label="Próximo"
          onClick={() => scrollBy(1)}
          className="absolute inset-y-0 right-0 z-10 hidden w-14 items-center justify-center bg-gradient-to-l from-canvas to-transparent opacity-0 transition-opacity group-hover/carousel:opacity-100 md:flex"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>
    </section>
  );
}
