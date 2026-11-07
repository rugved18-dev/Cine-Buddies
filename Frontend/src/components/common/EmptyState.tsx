import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon size={26} strokeWidth={1.8} />
      </span>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
