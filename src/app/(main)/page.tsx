import { HeroSection } from "@/components/media/HeroSection";
import { MediaCarousel } from "@/components/media/MediaCarousel";
import { getContinueWatching, getFeaturedMedia, getLibrary } from "@/lib/data/media";

export default async function HomePage() {
  const [featured, library, continueWatching] = await Promise.all([
    getFeaturedMedia(),
    getLibrary(),
    getContinueWatching(),
  ]);

  const movies = library.filter((item) => item.type === "movie");
  const series = library.filter((item) => item.type === "tv");

  return (
    <div className="flex flex-col gap-8 md:gap-12">
      {featured ? (
        <HeroSection media={featured} />
      ) : (
        <EmptyLibraryHero />
      )}

      <div className="flex flex-col gap-8 md:gap-10">
        <MediaCarousel title="Continuar Assistindo" items={continueWatching} />
        <MediaCarousel title="Filmes" items={movies} />
        <MediaCarousel title="Séries" items={series} />
      </div>
    </div>
  );
}

function EmptyLibraryHero() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-black tracking-tight text-white">
        Sua biblioteca está vazia
      </h1>
      <p className="text-sm text-text-secondary">
        Conecte sua conta do Google Drive e clique em{" "}
        <span className="font-semibold text-text-primary">
          &quot;Sincronizar Biblioteca&quot;
        </span>{" "}
        para importar seus filmes e séries.
      </p>
    </section>
  );
}
