import { cn } from "@/lib/utils";

/**
 * Isotipo: triângulo arredondado com gradiente cyan -> indigo -> purple,
 * silhueta vazada de um botão "play" no centro negativo.
 */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ds-gradient" x1="2" y1="28" x2="30" y2="4">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <mask id="ds-play-mask">
          <rect width="32" height="32" fill="white" />
          <path d="M13 11.5L21 16L13 20.5V11.5Z" fill="black" rx="1" />
        </mask>
      </defs>
      <path
        d="M16 3L28.5 25H3.5L16 3Z"
        fill="url(#ds-gradient)"
        mask="url(#ds-play-mask)"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={compact ? 24 : 32} />
      {!compact && (
        <span className="font-display text-xl font-black tracking-[-0.03em]">
          <span className="font-semibold text-white">Drive</span>
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Stream
          </span>
        </span>
      )}
    </div>
  );
}
