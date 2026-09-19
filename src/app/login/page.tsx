import { Logo } from "@/components/layout/Logo";
import { LoginButton } from "./LoginButton";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 bg-canvas px-4">
      <Logo />
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Sua central de streaming pessoal
        </h1>
        <p className="max-w-sm text-sm text-text-secondary">
          Conecte-se com o Google para acessar os filmes e séries salvos no
          seu Drive.
        </p>
      </div>
      <LoginButton />
    </div>
  );
}
