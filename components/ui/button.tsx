import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      default: "bg-violet-600 text-white hover:bg-violet-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-slate-700 bg-transparent hover:bg-slate-800",
      secondary: "bg-slate-800 text-white hover:bg-slate-700",
      ghost: "hover:bg-slate-800 hover:text-white",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          "px-4 py-2",
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
