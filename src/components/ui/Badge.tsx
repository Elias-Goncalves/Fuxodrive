import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-accent-cyan backdrop-blur-md",
        className
      )}
      {...props}
    />
  );
}

export function QualityBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-accent-cyan/30 bg-accent-cyan/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-cyan">
      {label}
    </span>
  );
}
