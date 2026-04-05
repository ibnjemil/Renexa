import { cn } from "@/lib/utils";

interface VelocityBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function VelocityBadge({ score, size = "md" }: VelocityBadgeProps) {
  const level = score >= 80 ? "high" : score >= 50 ? "mid" : "low";

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "font-display font-bold rounded-sm tracking-wider",
          sizeClasses[size],
          level === "high" && "bg-velocity-high/15 text-velocity-high",
          level === "mid" && "bg-velocity-mid/15 text-velocity-mid",
          level === "low" && "bg-velocity-low/15 text-velocity-low"
        )}
      >
        V:{score}
      </span>
    </div>
  );
}
