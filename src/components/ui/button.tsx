import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
          // Variants
          variant === "default" && "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/5",
          variant === "destructive" && "bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-950/70 hover:text-red-300",
          variant === "outline" && "border border-neutral-800 bg-neutral-950/20 text-neutral-200 hover:bg-neutral-900 hover:text-white hover:border-neutral-700",
          variant === "secondary" && "bg-neutral-900 border border-neutral-800 text-neutral-200 hover:bg-neutral-800 hover:text-white",
          variant === "ghost" && "text-neutral-400 hover:bg-neutral-900 hover:text-white",
          variant === "link" && "text-neutral-400 underline-offset-4 hover:underline hover:text-white",
          variant === "glow" && "relative bg-neutral-950 text-white border border-neutral-800 hover:border-violet-500/50 shadow-[0_0_15px_rgba(124,58,237,0.1)] hover:shadow-[0_0_20px_rgba(124,58,237,0.25)] transition-all",
          // Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 rounded-md px-3 text-xs",
          size === "lg" && "h-11 rounded-lg px-8 text-base",
          size === "icon" && "h-10 w-10",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
