import { createClient } from "@/lib/supabase/client";

/**
 * Inicia (ou renova) o login com Google via Supabase Auth, sempre pedindo
 * consentimento explícito para o escopo de leitura do Drive — usado tanto no
 * login inicial quanto para reconectar o Google Drive a partir do app.
 */
export async function signInWithGoogle(next: string = "/") {
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      scopes: "https://www.googleapis.com/auth/drive.readonly",
      queryParams: { access_type: "offline", prompt: "consent" },
      redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
}
