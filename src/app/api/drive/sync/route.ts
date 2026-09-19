import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listVideoFilesInFolder } from "@/lib/drive/client";
import { searchTmdbTitle, tmdbImageUrl } from "@/lib/tmdb/client";
import { sanitizeFilename, isNativelyPlayable } from "@/lib/utils";

/**
 * Rota de sincronização manual ("Sincronizar Biblioteca"):
 * 1. Varre as pastas configuradas no Google Drive do usuário.
 * 2. Sanitiza nomes de arquivo e busca metadados no TMDB.
 * 3. Persiste/atualiza o cache em `media` e `media_files` no Supabase.
 *
 * Nunca é chamada a partir do carregamento do catálogo — apenas por ação
 * explícita do usuário ou por rotina agendada em background.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const providerToken = session.provider_token;
  const userId = session.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("drive_root_folder_id")
    .eq("id", userId)
    .single();

  if (!providerToken || !profile?.drive_root_folder_id) {
    return NextResponse.json(
      { error: "Conta do Google Drive não configurada." },
      { status: 400 }
    );
  }

  const { data: log } = await supabase
    .from("drive_sync_logs")
    .insert({ owner_id: userId, status: "running" })
    .select()
    .single();

  let filesAdded = 0;
  let filesUpdated = 0;
  let tmdbMatches = 0;
  let tmdbMisses = 0;
  const errors: string[] = [];

  try {
    const driveFiles = await listVideoFilesInFolder(
      providerToken,
      profile.drive_root_folder_id
    );

    for (const file of driveFiles) {
      try {
        const { title, year } = sanitizeFilename(file.name);
        const tmdbResult = await searchTmdbTitle({
          title,
          year,
          type: "movie",
        });

        if (tmdbResult) tmdbMatches++;
        else tmdbMisses++;

        const { data: existingMedia } = await supabase
          .from("media")
          .select("id")
          .eq("owner_id", userId)
          .eq("raw_filename", file.name)
          .maybeSingle();

        const mediaPayload = {
          owner_id: userId,
          type: "movie" as const,
          status: (tmdbResult ? "ready" : "error") as "ready" | "error",
          raw_filename: file.name,
          sanitized_title: title,
          release_year: year,
          tmdb_id: tmdbResult?.id ?? null,
          title: tmdbResult?.title ?? title,
          original_title: tmdbResult?.original_title ?? null,
          overview: tmdbResult?.overview ?? null,
          poster_path: tmdbImageUrl(tmdbResult?.poster_path),
          backdrop_path: tmdbImageUrl(tmdbResult?.backdrop_path, "original"),
          vote_average: tmdbResult?.vote_average ?? null,
        };

        const { data: mediaRow, error: upsertError } = await supabase
          .from("media")
          .upsert(
            { ...mediaPayload, id: existingMedia?.id },
            { onConflict: "owner_id,raw_filename" }
          )
          .select("id")
          .single();

        if (upsertError || !mediaRow) {
          errors.push(`${file.name}: ${upsertError?.message}`);
          continue;
        }

        if (existingMedia) filesUpdated++;
        else filesAdded++;

        await supabase.from("media_files").upsert(
          {
            media_id: mediaRow.id,
            owner_id: userId,
            drive_file_id: file.id,
            drive_parent_folder_id: profile.drive_root_folder_id,
            file_name: file.name,
            mime_type: file.mimeType,
            size_bytes: file.size ? Number(file.size) : null,
            container: file.name.split(".").pop()?.toLowerCase() ?? null,
            natively_playable: isNativelyPlayable({
              container: file.name.split(".").pop(),
            }),
          },
          { onConflict: "drive_file_id" }
        );
      } catch (fileError) {
        errors.push(
          `${file.name}: ${
            fileError instanceof Error ? fileError.message : "erro desconhecido"
          }`
        );
      }
    }

    await supabase
      .from("drive_sync_logs")
      .update({
        status: errors.length === 0 ? "success" : "partial",
        folders_scanned: 1,
        files_found: driveFiles.length,
        files_added: filesAdded,
        files_updated: filesUpdated,
        tmdb_matches: tmdbMatches,
        tmdb_misses: tmdbMisses,
        errors,
        finished_at: new Date().toISOString(),
      })
      .eq("id", log?.id);

    return NextResponse.json({
      filesFound: driveFiles.length,
      filesAdded,
      filesUpdated,
      tmdbMatches,
      tmdbMisses,
      errors,
    });
  } catch (syncError) {
    await supabase
      .from("drive_sync_logs")
      .update({
        status: "failed",
        errors: [
          syncError instanceof Error ? syncError.message : "erro desconhecido",
        ],
        finished_at: new Date().toISOString(),
      })
      .eq("id", log?.id);

    return NextResponse.json(
      { error: "Falha na sincronização com o Google Drive." },
      { status: 500 }
    );
  }
}
