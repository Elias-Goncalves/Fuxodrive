-- =============================================================================
-- DriveStream — Esquema inicial do Supabase (PostgreSQL)
-- Tabelas: profiles, categories, media, media_categories, media_files,
--          watch_history, favorites, drive_sync_logs
-- Todas as tabelas possuem Row Level Security (RLS) habilitado.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- profiles: espelha auth.users, guarda preferências e cotas de uso
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  drive_root_folder_id text,          -- ID da pasta raiz do Google Drive escaneada
  drive_connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil do usuário e configuração da conexão com o Google Drive.';

-- -----------------------------------------------------------------------------
-- categories: gêneros / coleções exibidas como carrosséis
-- -----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tmdb_genre_id integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- media: catálogo enriquecido via TMDB (cache principal consultado pelo app)
-- -----------------------------------------------------------------------------
create type public.media_type as enum ('movie', 'tv');
create type public.media_status as enum ('pending', 'ready', 'error');

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  type public.media_type not null default 'movie',
  status public.media_status not null default 'pending',

  -- Metadados sanitizados do nome de arquivo original
  raw_filename text not null,
  sanitized_title text not null,
  release_year integer,

  -- Metadados enriquecidos via TMDB
  tmdb_id integer,
  title text,
  original_title text,
  overview text,
  poster_path text,
  backdrop_path text,
  vote_average numeric(3, 1),
  runtime_minutes integer,
  genres text[] not null default '{}',
  cast_members jsonb not null default '[]'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (owner_id, raw_filename)
);

create index if not exists media_owner_id_idx on public.media (owner_id);
create index if not exists media_tmdb_id_idx on public.media (tmdb_id);
create index if not exists media_status_idx on public.media (status);

-- -----------------------------------------------------------------------------
-- media_categories: relação N:N entre media e categories
-- -----------------------------------------------------------------------------
create table if not exists public.media_categories (
  media_id uuid not null references public.media (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  primary key (media_id, category_id)
);

-- -----------------------------------------------------------------------------
-- media_files: mapeamento do arquivo físico no Google Drive (1:N com media,
-- permite múltiplas qualidades/episódios para o mesmo título)
-- -----------------------------------------------------------------------------
create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,

  drive_file_id text not null,
  drive_parent_folder_id text,
  file_name text not null,
  mime_type text,
  size_bytes bigint,

  -- Detecção de compatibilidade nativa (HTML5 Media Source Extensions)
  container text,               -- mp4, mkv, webm...
  video_codec text,              -- h264, hevc, vp9...
  audio_codec text,              -- aac, ac3, opus...
  natively_playable boolean not null default false,

  season_number integer,        -- apenas para type = 'tv'
  episode_number integer,       -- apenas para type = 'tv'

  created_at timestamptz not null default now(),

  unique (drive_file_id)
);

create index if not exists media_files_media_id_idx on public.media_files (media_id);
create index if not exists media_files_owner_id_idx on public.media_files (owner_id);

-- -----------------------------------------------------------------------------
-- watch_history: progresso de reprodução por usuário/arquivo
-- -----------------------------------------------------------------------------
create table if not exists public.watch_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  media_id uuid not null references public.media (id) on delete cascade,
  media_file_id uuid references public.media_files (id) on delete set null,

  position_seconds integer not null default 0,
  duration_seconds integer,
  completed boolean not null default false,

  last_watched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),

  unique (user_id, media_id, media_file_id)
);

create index if not exists watch_history_user_id_idx on public.watch_history (user_id);
create index if not exists watch_history_last_watched_idx on public.watch_history (user_id, last_watched_at desc);

-- -----------------------------------------------------------------------------
-- favorites: "Minha Lista"
-- -----------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  media_id uuid not null references public.media (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, media_id)
);

-- -----------------------------------------------------------------------------
-- drive_sync_logs: histórico de varreduras do Google Drive + enriquecimento TMDB
-- -----------------------------------------------------------------------------
create type public.sync_status as enum ('running', 'success', 'partial', 'failed');

create table if not exists public.drive_sync_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  status public.sync_status not null default 'running',

  folders_scanned integer not null default 0,
  files_found integer not null default 0,
  files_added integer not null default 0,
  files_updated integer not null default 0,
  tmdb_matches integer not null default 0,
  tmdb_misses integer not null default 0,
  errors jsonb not null default '[]'::jsonb,

  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists drive_sync_logs_owner_id_idx on public.drive_sync_logs (owner_id, started_at desc);

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.media enable row level security;
alter table public.media_categories enable row level security;
alter table public.media_files enable row level security;
alter table public.watch_history enable row level security;
alter table public.favorites enable row level security;
alter table public.drive_sync_logs enable row level security;

-- profiles: cada usuário só lê/edita o próprio perfil
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- categories: catálogo global, leitura pública para usuários autenticados
create policy "categories_select_authenticated" on public.categories
  for select using (auth.role() = 'authenticated');

-- media: apenas o dono enxerga e gerencia seu catálogo pessoal
create policy "media_select_own" on public.media
  for select using (auth.uid() = owner_id);
create policy "media_insert_own" on public.media
  for insert with check (auth.uid() = owner_id);
create policy "media_update_own" on public.media
  for update using (auth.uid() = owner_id);
create policy "media_delete_own" on public.media
  for delete using (auth.uid() = owner_id);

-- media_categories: segue a posse do registro de media relacionado
create policy "media_categories_select_own" on public.media_categories
  for select using (
    exists (
      select 1 from public.media m
      where m.id = media_categories.media_id and m.owner_id = auth.uid()
    )
  );
create policy "media_categories_modify_own" on public.media_categories
  for all using (
    exists (
      select 1 from public.media m
      where m.id = media_categories.media_id and m.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.media m
      where m.id = media_categories.media_id and m.owner_id = auth.uid()
    )
  );

-- media_files: apenas o dono
create policy "media_files_select_own" on public.media_files
  for select using (auth.uid() = owner_id);
create policy "media_files_modify_own" on public.media_files
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- watch_history: apenas o próprio usuário
create policy "watch_history_select_own" on public.watch_history
  for select using (auth.uid() = user_id);
create policy "watch_history_modify_own" on public.watch_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- favorites: apenas o próprio usuário
create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites_modify_own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- drive_sync_logs: apenas o próprio usuário
create policy "drive_sync_logs_select_own" on public.drive_sync_logs
  for select using (auth.uid() = owner_id);
create policy "drive_sync_logs_modify_own" on public.drive_sync_logs
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- =============================================================================
-- Trigger: mantém profiles em sincronia com novos usuários do auth.users
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- Trigger genérico de updated_at
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.media;
create trigger set_updated_at before update on public.media
  for each row execute function public.set_updated_at();
