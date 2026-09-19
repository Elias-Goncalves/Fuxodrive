import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para uso em Server Components, Route Handlers e Server
 * Actions. Os tokens de sessão do usuário trafegam via cookies HTTP-Only
 * (nunca no client-side) conforme a regra de segurança do projeto.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Chamado a partir de um Server Component sem permissão de escrita;
            // seguro ignorar quando há um middleware renovando a sessão.
          }
        },
      },
    }
  );
}
