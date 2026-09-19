const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/x-matroska",
]);

export interface DriveVideoFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  parents?: string[];
}

/**
 * Lista recursivamente os arquivos de vídeo compatíveis dentro de uma pasta
 * do Google Drive do usuário, usando o access token obtido via OAuth
 * (escopo `drive.readonly`). Chamado apenas em rotas de backend.
 */
export async function listVideoFilesInFolder(
  accessToken: string,
  folderId: string
): Promise<DriveVideoFile[]> {
  const files: DriveVideoFile[] = [];
  let pageToken: string | undefined;

  do {
    const query = encodeURIComponent(
      `'${folderId}' in parents and trashed = false`
    );
    const params = new URLSearchParams({
      q: query,
      fields: "nextPageToken, files(id, name, mimeType, size, parents)",
      pageSize: "1000",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(`${DRIVE_API_BASE}/files?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Falha ao listar arquivos do Drive (${response.status})`);
    }

    const data: { files: DriveVideoFile[]; nextPageToken?: string } =
      await response.json();

    for (const file of data.files) {
      if (VIDEO_MIME_TYPES.has(file.mimeType)) {
        files.push(file);
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

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
