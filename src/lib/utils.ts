import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Remove tags de release comuns (resolução, codec, grupo, ano entre parênteses)
 * de nomes de arquivo do Drive antes de consultar o TMDB.
 * Ex: "The.Matrix.1999.1080p.BluRay.x264-GROUP.mkv" -> { title: "The Matrix", year: 1999 }
 */
export function sanitizeFilename(filename: string): {
  title: string;
  year: number | null;
} {
  const withoutExt = filename.replace(/\.[^/.]+$/, "");
  const normalized = withoutExt.replace(/[._]/g, " ");

  const yearMatch = normalized.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? Number(yearMatch[0]) : null;

  const RELEASE_TAGS =
    /\b(480p|720p|1080p|2160p|4k|hdr|webrip|web-dl|webdl|bluray|blu-ray|brrip|dvdrip|hdtv|x264|x265|h264|h265|hevc|aac|ac3|dts|remux|extended|proper|repack|dual|dublado|legendado)\b/gi;

  let title = normalized
    .split(/\b(19|20)\d{2}\b/)[0]
    .replace(RELEASE_TAGS, " ")
    .replace(/[\[\](){}]/g, " ")
    .replace(/-\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!title) {
    title = normalized.replace(RELEASE_TAGS, " ").trim();
  }

  return { title, year };
}

export function formatRuntime(minutes?: number | null): string {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
}

export function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

const NATIVE_VIDEO_CODECS = new Set(["h264", "avc", "avc1"]);
const NATIVE_AUDIO_CODECS = new Set(["aac", "mp4a"]);

/**
 * Verifica se o arquivo é reproduzível nativamente via HTML5 Media Source
 * Extensions sem necessidade de transcodificação (H.264/AAC em MP4).
 */
export function isNativelyPlayable(params: {
  container?: string | null;
  videoCodec?: string | null;
  audioCodec?: string | null;
}): boolean {
  const container = params.container?.toLowerCase();
  const videoCodec = params.videoCodec?.toLowerCase();
  const audioCodec = params.audioCodec?.toLowerCase();

  if (container !== "mp4" && container !== "webm") return false;
  if (videoCodec && !NATIVE_VIDEO_CODECS.has(videoCodec) && container !== "webm")
    return false;
  if (audioCodec && !NATIVE_AUDIO_CODECS.has(audioCodec) && container !== "webm")
    return false;

  return true;
}
