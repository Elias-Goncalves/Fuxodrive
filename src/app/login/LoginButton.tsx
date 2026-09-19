"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function LoginButton() {
  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Escopo restrito de leitura, conforme a regra de segurança do projeto.
        scopes: "https://www.googleapis.com/auth/drive.readonly",
        queryParams: { access_type: "offline", prompt: "consent" },
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
  }

  return (
    <Button variant="primary" onClick={signInWithGoogle}>
      Entrar com o Google
    </Button>
  );
}
