# DriveStream

Central de streaming pessoal, estilo Plex/Apple TV+/Netflix, que lê filmes e
séries diretamente do Google Drive do usuário, enriquece os metadados via
TMDB e exibe um catálogo cinematográfico com reprodução in-browser e suporte
a download offline.

## Stack

- **Next.js (App Router)** — Server Components para dados, Route Handlers
  para as integrações de backend, Client Components para player e animações.
- **Tailwind CSS v4** — tokens de design (`src/app/globals.css`) definidos via
  `@theme`, seguindo o Design System "Deep Cinema Dark Mode".
- **Supabase** — Postgres (cache do catálogo) + Auth (OAuth do Google) com
  Row Level Security em todas as tabelas.
- **TMDB API** — enriquecimento de metadados (pôster, sinopse, elenco, nota).
- **framer-motion / lucide-react** — micro-interações e iconografia.

## Estrutura de pastas

```
src/
  app/
    (main)/              rotas autenticadas com Navbar/BottomNav
      page.tsx            Home (hero + carrosséis)
      filmes/              grade de filmes
      series/              grade de séries
      downloads/           gerenciador de downloads offline (PWA)
      media/[id]/          detalhes + player
    api/
      auth/callback/       troca do code OAuth por sessão Supabase
      drive/sync/          varredura do Drive + enriquecimento TMDB
      drive/stream/[id]/   proxy de streaming autenticado (Range requests)
      tmdb/search/         busca pontual no TMDB
    login/                 tela de login (Google OAuth)
    globals.css            tokens de design e utilitários
    layout.tsx              layout raiz (fontes, <html>/<body>)
  components/
    layout/                Logo, Navbar, BottomNav, MobileHeader
    media/                  HeroSection, MediaCard, MediaCarousel
    player/                 VideoPlayer (controles customizados)
    ui/                     Button, Badge
  hooks/
    useVideoPlayer.ts       estado e controles do <video>
  lib/
    supabase/               clients (browser/server)
    tmdb/                   client TMDB
    drive/                  client Google Drive
    data/                   funções de leitura do catálogo (Supabase)
    utils.ts                sanitização de nomes, formatação, cn()
  types/
    media.ts                tipos do domínio
supabase/
  migrations/0001_init.sql  schema + RLS completos
```

## Configuração

1. Copie `.env.example` para `.env.local` e preencha as chaves do Supabase e
   o token de leitura do TMDB.
2. Aplique a migration `supabase/migrations/0001_init.sql` no seu projeto
   Supabase (`supabase db push` ou via SQL Editor).
3. Configure o provedor Google no Supabase Auth com o escopo
   `https://www.googleapis.com/auth/drive.readonly`.
4. `npm install && npm run dev`.

## Regras de negócio principais

- O catálogo exibido na UI **nunca** consulta o Google Drive ou o TMDB
  diretamente — sempre lê do cache Supabase (`src/lib/data/media.ts`).
- A sincronização (`POST /api/drive/sync`) é disparada manualmente pelo botão
  "Sincronizar Biblioteca" e roda inteiramente no servidor.
- A reprodução usa um proxy autenticado (`/api/drive/stream/[fileId]`) que
  repassa o header `Range` para permitir seek sem estourar a cota da API do
  Drive; o access token do Google nunca chega ao client.
