import { cn } from "@/lib/utils";

export interface MatchScoreProps {
  /** 0–100 compatibility percentage. */
  value: number;
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Circular group-compatibility ring. Colour escalates with the score:
 * success green from 85, warning amber from 70, primary purple below.
 */
export function MatchScore({ value, size = 84, label, className }: MatchScoreProps) {
  const stroke = Math.max(4, Math.round(size / 16));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * circumference;

  const color =
    value >= 85
      ? "var(--color-success)"
      : value >= 70
        ? "var(--color-warning)"
        : "var(--color-primary)";

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-bold text-foreground"
          style={{ fontSize: Math.max(13, Math.round(size / 4.6)) }}
        >
          {value}%
        </span>
      </div>
      {label ? <span className="text-xs font-medium text-muted-foreground">{label}</span> : null}
    </div>
  );
}
