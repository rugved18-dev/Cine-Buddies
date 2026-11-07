import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: ReactNode;
}

export function Input({ label, error, hint, iconLeft, className, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {iconLeft ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {iconLeft}
          </span>
        ) : null}
        <input
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            "h-11 w-full rounded-lg border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/70",
            "transition-colors focus:outline-none focus:ring-2 focus:ring-ring/70 focus:border-primary/60",
            iconLeft && "pl-11",
            error && "border-destructive/70 focus:ring-destructive/50",
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
