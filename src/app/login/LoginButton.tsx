"use client";

import { signInWithGoogle } from "@/lib/supabase/google-auth";
import { Button } from "@/components/ui/Button";

export function LoginButton() {
  return (
    <Button variant="primary" onClick={() => signInWithGoogle()}>
      Entrar com o Google
    </Button>
  );
}
