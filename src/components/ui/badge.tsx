import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "purple";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Variants
        variant === "default" && "border-transparent bg-white text-neutral-900 shadow",
        variant === "secondary" && "border-transparent bg-neutral-900 text-neutral-200",
        variant === "outline" && "border-neutral-800 text-neutral-300",
        variant === "success" && "border-emerald-950 bg-emerald-950/40 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]",
        variant === "warning" && "border-amber-950 bg-amber-950/40 text-amber-400",
        variant === "purple" && "border-violet-900/50 bg-violet-950/30 text-violet-400 shadow-[0_0_10px_rgba(124,58,237,0.05)]",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
