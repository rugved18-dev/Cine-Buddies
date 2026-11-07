import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  showClose?: boolean;
}

export function Modal({ open, onOpenChange, title, description, children, className, showClose = true }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[85vh] overflow-y-auto scrollbar-subtle border-border bg-card p-6 sm:max-w-lg", className)}
      >
        {(title || description) && (
          <DialogHeader>
            {title ? <DialogTitle className="text-foreground">{title}</DialogTitle> : null}
            {description ? <DialogDescription className="text-muted-foreground">{description}</DialogDescription> : null}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}
