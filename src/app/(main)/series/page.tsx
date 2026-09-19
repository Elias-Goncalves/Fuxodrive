import { MediaCard } from "@/components/media/MediaCard";
import { getLibrary } from "@/lib/data/media";

export default async function SeriesPage() {
  const series = await getLibrary("tv");

  return (
    <div className="px-4 py-6 md:px-10 lg:px-14">
      <h1 className="mb-6 text-2xl font-black tracking-tight text-white">Séries</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {series.map((media) => (
          <MediaCard key={media.id} media={media} />
        ))}
      </div>
      {series.length === 0 && (
        <p className="text-sm text-text-secondary">
          Nenhuma série encontrada. Sincronize sua biblioteca do Google Drive.
        </p>
      )}
    </div>
  );
}
