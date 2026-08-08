import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  variant = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  variant?: "default" | "primary" | "warning" | "danger";
}) {
  const styles = {
    default: "card-surface",
    primary: "rounded-2xl border border-primary/20 bg-primary text-primary-foreground shadow-card",
    warning: "rounded-2xl border border-warning/30 bg-warning-soft text-warning-foreground",
    danger: "rounded-2xl border border-destructive/20 bg-danger-soft text-destructive",
  }[variant];

  return (
    <div className={cn(styles, "p-5 transition-transform duration-200 hover:-translate-y-0.5")}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <p
          className={cn(
            "min-w-0 text-sm",
            variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
            variant === "primary" ? "bg-white/20" : "bg-primary-soft text-primary-dark",
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
      {hint ? (
        <p
          className={cn(
            "mt-1 text-xs",
            variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
