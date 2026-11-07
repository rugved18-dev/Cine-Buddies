import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/common/Button";

export interface RoomCodeCardProps {
  code: string;
  roomName: string;
}

/** Highlighted invitation-code card with copy-to-clipboard. */
export function RoomCodeCard({ code, roomName }: RoomCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/private mode); the code stays visible.
    }
  };

  return (
    <div className="rounded-2xl border border-primary/40 bg-card p-6 text-center glow-primary">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Invitation code</p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <span className="font-mono text-4xl font-bold tracking-[0.3em] text-lavender sm:text-5xl">{code}</span>
        <Button variant="outline" size="icon" onClick={copy} aria-label="Copy invitation code">
          {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
        </Button>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Share this code so friends can join “{roomName}” from the Join Room screen.
      </p>
    </div>
  );
}
