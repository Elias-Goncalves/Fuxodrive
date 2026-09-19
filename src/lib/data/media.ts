import { createClient } from "@/lib/supabase/server";
import type { CastMember, Media, MediaFile } from "@/types/media";

interface MediaRow {
  id: string;
  type: "movie" | "tv";
  status: "pending" | "ready" | "error";
  title: string | null;
  sanitized_title: string;
  original_title: string | null;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_year: number | null;
  vote_average: number | null;
  runtime_minutes: number | null;
  genres: string[] | null;
  cast_members: CastMember[] | null;
  media_files: MediaFileRow[] | null;
}

interface MediaFileRow {
  id: string;
  media_id: string;
  drive_file_id: string;
  file_name: string;
  size_bytes: number | null;
  container: string | null;
  video_codec: string | null;
  audio_codec: string | null;
  natively_playable: boolean;
  season_number: number | null;
  episode_number: number | null;
}

function mapMediaRow(row: MediaRow): Media {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    title: row.title ?? row.sanitized_title,
    originalTitle: row.original_title,
    overview: row.overview,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    releaseYear: row.release_year,
    voteAverage: row.vote_average,
    runtimeMinutes: row.runtime_minutes,
    genres: row.genres ?? [],
    castMembers: row.cast_members ?? [],
    files: (row.media_files ?? []).map(
      (file): MediaFile => ({
        id: file.id,
        mediaId: file.media_id,
        driveFileId: file.drive_file_id,
        fileName: file.file_name,
        sizeBytes: file.size_bytes,
        container: file.container,
        videoCodec: file.video_codec,
        audioCodec: file.audio_codec,
        nativelyPlayable: file.natively_playable,
        seasonNumber: file.season_number,
        episodeNumber: file.episode_number,
      })
    ),
  };
}

const MEDIA_SELECT = `
  id, type, status, title, sanitized_title, original_title, overview,
  poster_path, backdrop_path, release_year, vote_average, runtime_minutes,
  genres, cast_members,
  media_files ( id, media_id, drive_file_id, file_name, size_bytes, container, video_codec, audio_codec, natively_playable, season_number, episode_number )
`;

/** Catálogo completo do usuário autenticado, exclusivamente a partir do cache Supabase. */
export async function getLibrary(type?: "movie" | "tv"): Promise<Media[]> {
  const supabase = await createClient();
  let query = supabase
    .from("media")
    .select(MEDIA_SELECT)
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as unknown as MediaRow[]).map(mapMediaRow);
}

export async function getFeaturedMedia(): Promise<Media | null> {
  const library = await getLibrary();
  return library[0] ?? null;
}

export async function getContinueWatching(): Promise<Media[]> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("watch_history")
    .select(`media:media_id ( ${MEDIA_SELECT} )`)
    .eq("user_id", session.user.id)
    .eq("completed", false)
    .order("last_watched_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return (data as unknown as { media: MediaRow }[])
    .filter((row) => row.media)
    .map((row) => mapMediaRow(row.media));
}
