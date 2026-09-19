import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "glass" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-white hover:bg-slate-200 text-black shadow-lg shadow-white/10 hover:scale-105 active:scale-95",
  glass:
    "bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/10",
  ghost: "bg-transparent hover:bg-surface-3 text-text-primary",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center gap-2 rounded-xl px-6 py-3 font-bold transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
