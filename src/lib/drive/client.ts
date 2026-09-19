const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/x-matroska",
  "video/matroska",
  "video/avi",
  "video/mpeg",
]);

const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

const MAX_FOLDER_DEPTH = 6;

export interface DriveVideoFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  parents?: string[];
}

interface DriveEntry {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  parents?: string[];
}

async function listChildren(
  accessToken: string,
  folderId: string
): Promise<DriveEntry[]> {
  const entries: DriveEntry[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "nextPageToken, files(id, name, mimeType, size, parents)",
      pageSize: "1000",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(`${DRIVE_API_BASE}/files?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Falha ao listar arquivos do Drive (${response.status}): ${body.slice(0, 500)}`
      );
    }

    const data: { files: DriveEntry[]; nextPageToken?: string } =
      await response.json();
    entries.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return entries;
}

/**
 * Varre recursivamente uma pasta do Google Drive (e suas subpastas, até
 * MAX_FOLDER_DEPTH níveis) coletando os arquivos de vídeo compatíveis.
 * Muitas bibliotecas organizam cada filme em sua própria subpasta, então a
 * varredura não pode se limitar ao nível raiz.
 */
export async function listVideoFilesInFolder(
  accessToken: string,
  folderId: string,
  depth = 0
): Promise<DriveVideoFile[]> {
  const entries = await listChildren(accessToken, folderId);
  const files: DriveVideoFile[] = [];

  for (const entry of entries) {
    if (entry.mimeType === FOLDER_MIME_TYPE) {
      if (depth < MAX_FOLDER_DEPTH) {
        files.push(
          ...(await listVideoFilesInFolder(accessToken, entry.id, depth + 1))
        );
      }
      continue;
    }

    if (VIDEO_MIME_TYPES.has(entry.mimeType)) {
      files.push({
        id: entry.id,
        name: entry.name,
        mimeType: entry.mimeType,
        size: entry.size ?? "0",
        parents: entry.parents,
      });
    }
  }

  return files;
}

/**
 * Monta a URL de streaming autenticado do backend proxy para um arquivo do
 * Drive, repassando o header `Range` para permitir seek e reprodução chunked
 * sem estourar a cota da Drive API.
 */
export function buildProxyStreamUrl(fileId: string): string {
  return `/api/drive/stream/${fileId}`;
}
