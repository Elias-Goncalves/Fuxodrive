export type MediaType = "movie" | "tv";
export type MediaStatus = "pending" | "ready" | "error";

export interface CastMember {
  name: string;
  character: string;
  profilePath: string | null;
}

export interface MediaFile {
  id: string;
  mediaId: string;
  driveFileId: string;
  fileName: string;
  sizeBytes: number | null;
  container: string | null;
  videoCodec: string | null;
  audioCodec: string | null;
  nativelyPlayable: boolean;
  seasonNumber: number | null;
  episodeNumber: number | null;
}

export interface Media {
  id: string;
  type: MediaType;
  status: MediaStatus;
  title: string;
  originalTitle: string | null;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: number | null;
  voteAverage: number | null;
  runtimeMinutes: number | null;
  genres: string[];
  castMembers: CastMember[];
  files: MediaFile[];
}

export interface WatchProgress {
  mediaId: string;
  positionSeconds: number;
  durationSeconds: number | null;
  completed: boolean;
  lastWatchedAt: string;
}

export interface DriveSyncLog {
  id: string;
  status: "running" | "success" | "partial" | "failed";
  foldersScanned: number;
  filesFound: number;
  filesAdded: number;
  filesUpdated: number;
  tmdbMatches: number;
  tmdbMisses: number;
  startedAt: string;
  finishedAt: string | null;
}
