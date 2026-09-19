const TMDB_API_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
}

interface TmdbSearchResponse {
  results: TmdbSearchResult[];
}

function tmdbHeaders() {
  const token = process.env.TMDB_API_READ_TOKEN;
  if (!token) {
    throw new Error("TMDB_API_READ_TOKEN não configurado.");
  }
  return {
    Authorization: `Bearer ${token}`,
    accept: "application/json",
  };
}

/**
 * Busca um título (filme ou série) no TMDB a partir do nome sanitizado do
 * arquivo do Drive. Usado pela rota de sincronização em background.
 */
export async function searchTmdbTitle(params: {
  title: string;
  year: number | null;
  type: "movie" | "tv";
}): Promise<TmdbSearchResult | null> {
  const endpoint = params.type === "movie" ? "search/movie" : "search/tv";
  const searchParams = new URLSearchParams({
    query: params.title,
    language: "pt-BR",
    include_adult: "false",
  });
  if (params.year) {
    searchParams.set(
      params.type === "movie" ? "year" : "first_air_date_year",
      String(params.year)
    );
  }

  const response = await fetch(
    `${TMDB_API_BASE}/${endpoint}?${searchParams.toString()}`,
    { headers: tmdbHeaders(), next: { revalidate: 60 * 60 * 24 } }
  );

  if (!response.ok) {
    throw new Error(`Falha ao consultar TMDB (${response.status})`);
  }

  const data: TmdbSearchResponse = await response.json();
  return data.results[0] ?? null;
}

export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w200" | "w342" | "w500" | "w780" | "original" = "w500"
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
