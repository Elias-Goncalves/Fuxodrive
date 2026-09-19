-- Corrige alertas do linter de segurança do Supabase:
-- - search_path mutável em função de trigger
-- - função SECURITY DEFINER de trigger exposta para chamada via RPC pública

alter function public.set_updated_at() set search_path = public;

revoke execute on function public.handle_new_user() from anon, authenticated, public;
