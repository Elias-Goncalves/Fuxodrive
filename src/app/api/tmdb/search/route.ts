import { NextRequest, NextResponse } from "next/server";
import { searchTmdbTitle } from "@/lib/tmdb/client";

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  const year = request.nextUrl.searchParams.get("year");
  const type = request.nextUrl.searchParams.get("type") === "tv" ? "tv" : "movie";

  if (!title) {
    return NextResponse.json({ error: "Parâmetro 'title' é obrigatório." }, { status: 400 });
  }

  try {
    const result = await searchTmdbTitle({
      title,
      year: year ? Number(year) : null,
      type,
    });
    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "Falha ao consultar o TMDB." }, { status: 502 });
  }
}
