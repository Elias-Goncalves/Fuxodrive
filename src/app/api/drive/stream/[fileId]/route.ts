import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Proxy de streaming autenticado para arquivos do Google Drive.
 *
 * Repassa o header `Range` do player de vídeo para a Drive API (`alt=media`),
 * permitindo seek/scrubbing e reprodução chunked sem carregar o arquivo
 * inteiro na memória do servidor. O access token do Google nunca é exposto
 * ao client — apenas a sessão Supabase (cookie HTTP-Only) autentica o pedido.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const providerToken = session.provider_token;
  if (!providerToken) {
    return NextResponse.json(
      { error: "Token do Google Drive indisponível. Faça login novamente." },
      { status: 403 }
    );
  }

  const range = request.headers.get("range");

  const driveResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${providerToken}`,
        ...(range ? { Range: range } : {}),
      },
    }
  );

  if (!driveResponse.ok && driveResponse.status !== 206) {
    return NextResponse.json(
      { error: "Falha ao obter o arquivo do Google Drive." },
      { status: driveResponse.status }
    );
  }

  const headers = new Headers();
  for (const key of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
  ]) {
    const value = driveResponse.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("cache-control", "private, max-age=0, no-cache");

  return new NextResponse(driveResponse.body, {
    status: driveResponse.status,
    headers,
  });
}
